import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, validationErrorResponse, unauthorizedResponse, forbiddenResponse, serverErrorResponse } from '@/lib/api-response';
import { videoFilterSchema, createVideoSchema } from '@/lib/validations';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

import { Prisma } from '@prisma/client';


export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Auth Check for Admin Privileges
        const authHeader = request.headers.get('authorization');
        let isAdmin = false;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = verifyToken(token);
            if (decoded) {
                const user = await prisma.user.findUnique({
                    where: { id: decoded.userId },
                    select: { role: true }
                });
                if (user && (user.role === 'SUPER_ADMIN' || user.role === 'CONTENT_MANAGER')) {
                    isAdmin = true;
                }
            }
        }

        // Parse and validate query parameters
        const params = {
            page: searchParams.get('page') || '1',
            limit: searchParams.get('limit') || '10',
            sortBy: searchParams.get('sortBy') || 'createdAt',
            order: searchParams.get('order') || 'desc',
            category: searchParams.get('category') || undefined,
            search: searchParams.get('search') || undefined,
        };

        try {
            const validated = videoFilterSchema.parse(params);
            const { page, limit, sortBy, order, category, search } = validated;
            const skip = (page - 1) * limit;

            // Build where clause
            const where: Prisma.VideoWhereInput = {};

            // If NOT admin, force isPublished = true
            // If Admin, check if they requested a specific status? 
            // For now, if Admin, show ALL by default unless filtered?
            // Actually, the UI sends 'published' / 'draft' filter? 
            // The `videoFilterSchema` does NOT have 'status' yet. 
            // Use `category` or adding a new param?
            // I'll stick to: Users/Public -> isPublished: true. Admin -> Show All.

            if (!isAdmin) {
                where.isPublished = true;
            }

            if (category) {
                where.category = category;
            }

            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ];
            }

            // Get videos with pagination
            const [videos, total] = await Promise.all([
                prisma.video.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { [sortBy as string]: order },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        thumbnailUrl: true,
                        youtubeId: true,
                        category: true,
                        createdAt: true,
                        isPublished: true,
                        // Exclude keyPoints (heavy JSON) for list view
                        createdBy: isAdmin ? { select: { username: true } } : false
                    },
                }),
                prisma.video.count({ where }),
            ]);

            return successResponse(
                {
                    data: videos,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                    },
                },
                'Berhasil mengambil daftar video',
                200,
                {
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=59'
                }
            );
        } catch (error) {
            if (error instanceof z.ZodError) {
                return validationErrorResponse(error.format());
            }
            throw error;
        }
    } catch (error: unknown) {
        // Assuming errorResponse is a new function to be used, and serverErrorResponse is being replaced.
        // If errorResponse is not defined, this will cause a runtime error.
        // For now, I'll assume it's intended to replace the existing serverErrorResponse call.
        // Also, the original code had a console.error, which is removed in the provided snippet.
        // I'm making the change as literally as possible based on the provided snippet.
        // Note: The provided snippet had a syntax error with an extra `}` and `return serverErrorResponse` outside the catch block.
        // I'm correcting that to make it syntactically valid and replace the original error handling.
        // If `errorResponse` is not imported or defined, this will need further adjustment.
        return serverErrorResponse(
            error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil daftar video'
        );
    }
}

// ============================================
// POST /api/videos - Create new video (Admin)
// ===========================================

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return unauthorizedResponse('Token tidak ditemukan');
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        if (!decoded) {
            return unauthorizedResponse('Token tidak valid atau expired');
        }

        // Check if user is admin or content manager
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) {
            return unauthorizedResponse('User tidak ditemukan');
        }

        if (user.role !== 'SUPER_ADMIN' && user.role !== 'CONTENT_MANAGER') {
            return forbiddenResponse('Hanya admin/content manager yang dapat membuat video');
        }

        const body = await request.json();

        // Validate input
        const validatedData = createVideoSchema.parse(body);

        // Extract YouTube ID from URL
        const youtubeId = extractYouTubeId(validatedData.youtubeUrl);
        if (!youtubeId) {
            return validationErrorResponse({ youtubeUrl: { _errors: ['URL YouTube tidak valid'] } });
        }

        // Create video
        const video = await prisma.video.create({
            data: {
                youtubeId,
                title: validatedData.title,
                description: validatedData.description || '',
                keyPoints: validatedData.keyPoints || [],
                category: validatedData.category,
                thumbnailUrl: validatedData.thumbnailUrl || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
                createdById: decoded.userId,
                isPublished: false, // Draft by default
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        return successResponse(video, 'Video berhasil dibuat');
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationErrorResponse(error.format());
        }
        console.error('Create video error:', error);
        return serverErrorResponse('Terjadi kesalahan saat membuat video');
    }
}

// Helper function to extract YouTube ID from various URL formats
function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|you tu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}
