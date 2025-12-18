import { NextRequest } from 'next/server';
import { z } from 'zod';
import { notFoundResponse, successResponse, unauthorizedResponse, validationErrorResponse, forbiddenResponse, serverErrorResponse } from '@/lib/api-response';
import { verifyToken } from '@/lib/auth';
import { updateVideoSchema } from '@/lib/validations';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const resolvedParams = await params;

    try {
        const video = await prisma.video.findUnique({
            where: { id: resolvedParams.id },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                _count: {
                    select: {
                        views: true,
                    },
                },
            },
        });

        if (!video) {
            return notFoundResponse('Video');
        }

        // Check if user has claimed points today (if logged in)
        let hasClaimedToday = false;
        const authHeader = request.headers.get('authorization');

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = verifyToken(token);

            if (decoded) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const existingPoint = await prisma.pointTransaction.findFirst({
                    where: {
                        userId: decoded.userId,
                        activityType: 'VIDEO_WATCHED',
                        referenceId: video.id,
                        createdAt: {
                            gte: today
                        }
                    }
                });

                if (existingPoint) {
                    hasClaimedToday = true;
                }
            }
        }

        return successResponse({ ...video, hasClaimedToday }, 'Berhasil mengambil detail video');
    } catch (error) {
        console.error('Get video detail error:', error);
        return serverErrorResponse('Terjadi kesalahan saat mengambil detail video');
    }
}

// ============================================
// PUT /api/videos/:id - Update video (Admin)
// ============================================

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const resolvedParams = await params;

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
            return forbiddenResponse('Hanya admin/content manager yang dapat mengupdate video');
        }

        // Check if video exists
        const existingVideo = await prisma.video.findUnique({
            where: { id: resolvedParams.id },
        });

        if (!existingVideo) {
            return notFoundResponse('Video');
        }

        // Check ownership (CM can only update their own videos, admin can update any)
        if (user.role === 'CONTENT_MANAGER' && existingVideo.createdById !== user.id) {
            return forbiddenResponse('Anda hanya dapat mengupdate video yang  Anda buat');
        }

        const body = await request.json();

        // Validate input
        const validatedData = updateVideoSchema.parse(body);

        // Update video
        // Update video
        const updateData: Prisma.VideoUpdateInput = {};

        if (validatedData.title !== undefined) updateData.title = validatedData.title;
        if (validatedData.description !== undefined) updateData.description = validatedData.description;
        if (validatedData.thumbnailUrl !== undefined) updateData.thumbnailUrl = validatedData.thumbnailUrl;
        if (validatedData.category !== undefined) updateData.category = validatedData.category;
        if (validatedData.keyPoints !== undefined) updateData.keyPoints = validatedData.keyPoints;
        if (validatedData.isPublished !== undefined) updateData.isPublished = validatedData.isPublished;

        // Handle YouTube URL update
        if (validatedData.youtubeUrl) {
            const youtubeId = extractYouTubeId(validatedData.youtubeUrl);
            if (!youtubeId) {
                return validationErrorResponse({ youtubeUrl: { _errors: ['URL YouTube tidak valid'] } });
            }
            updateData.youtubeId = youtubeId;
        }

        const video = await prisma.video.update({
            where: { id: resolvedParams.id },
            data: updateData,
            include: {
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        return successResponse(video, 'Video berhasil diupdate');
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationErrorResponse(error.format());
        }
        console.error('Update video error:', error);
        return serverErrorResponse('Terjadi kesalahan saat mengupdate video');
    }
}

// ============================================
// DELETE /api/videos/:id - Delete video (Admin)
// ============================================

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const resolvedParams = await params;

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
            return forbiddenResponse('Hanya admin/content manager yang dapat menghapus video');
        }

        // Check if video exists
        const existingVideo = await prisma.video.findUnique({
            where: { id: resolvedParams.id },
        });

        if (!existingVideo) {
            return notFoundResponse('Video');
        }

        // Check ownership (CM can only delete their own videos, admin can delete any)
        if (user.role === 'CONTENT_MANAGER' && existingVideo.createdById !== user.id) {
            return forbiddenResponse('Anda hanya dapat menghapus video yang Anda buat');
        }

        // Delete video (cascade will delete related VideoViews)
        await prisma.video.delete({
            where: { id: resolvedParams.id },
        });

        return successResponse(
            { id: resolvedParams.id },
            'Video berhasil dihapus'
        );
    } catch (error) {
        console.error('Delete video error:', error);
        return serverErrorResponse('Terjadi kesalahan saat menghapus video');
    }
}

// Helper function
function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
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
