import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, validationErrorResponse, unauthorizedResponse, forbiddenResponse, serverErrorResponse } from '@/lib/api-response';
import { paginationSchema, createComicSchema } from '@/lib/validations';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const params = {
            page: searchParams.get('page') || '1',
            limit: searchParams.get('limit') || '10',
            search: searchParams.get('search') || undefined,
        };

        try {
            const { page, limit } = paginationSchema.parse(params);
            const skip = (page - 1) * limit;

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
                    if (user && (user.role === 'SUPER_ADMIN' || user.role === 'CONTENT_MANAGER' || user.role === 'TEACHER')) {
                        isAdmin = true;
                    }
                }
            }

            const where: Prisma.ComicWhereInput = {};

            // If not admin, strictly filter published only
            if (!isAdmin) {
                where.isPublished = true;
            } else {
                // If admin, check for status filter (optional)
                const statusParam = params.search ? null : searchParams.get('status'); // Avoiding conflict
                if (statusParam === 'published') where.isPublished = true;
                if (statusParam === 'draft') where.isPublished = false;
            }

            if (params.search) {
                where.OR = [
                    { title: { contains: params.search, mode: 'insensitive' } },
                    { description: { contains: params.search, mode: 'insensitive' } },
                ];
            }

            const [comics, total] = await Promise.all([
                prisma.comic.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { publishedAt: 'desc' },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        coverUrl: true,
                        totalPages: true,
                        category: true,
                        tags: true,
                        publishedAt: true,
                        isPublished: true,
                        _count: {
                            select: {
                                reads: true,
                            },
                        },
                    },
                }),
                prisma.comic.count({ where }),
            ]);

            return successResponse(
                {
                    data: comics,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                    },
                },
                'Berhasil mengambil daftar komik'
            );
        } catch (error) {
            if (error instanceof z.ZodError) {
                return validationErrorResponse(error.format());
            }
            throw error;
        }
    } catch (error: unknown) {
        // Assuming errorResponse is a function that needs to be imported or defined,
        // and the user intends to replace the previous error handling with this.
        // If errorResponse is not available, serverErrorResponse will be used as a fallback.
        // The original instruction had two return statements, which is syntactically incorrect.
        // This version prioritizes the new errorResponse if available, otherwise falls back to serverErrorResponse.
        // For this change, we'll assume the user wants to replace the existing error handling with the new one.
        // If `errorResponse` is not defined/imported, this will cause a runtime error.
        // To make it syntactically correct and faithful to the "strict types" part,
        // we'll change `catch (error)` to `catch (error: unknown)` and keep the original `serverErrorResponse`
        // as `errorResponse` is not imported in the provided context.
        // If the user intended to use a new `errorResponse` function, it would need to be imported.
        // Given the current imports, we'll stick to `serverErrorResponse` for a syntactically valid output.
        console.error('Get comics error:', error);
        return serverErrorResponse('Terjadi kesalahan saat mengambil daftar komik');
    }
}

// ============================================
// POST /api/comics - Create comic (Admin)
// ============================================

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

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) {
            return unauthorizedResponse('User tidak ditemukan');
        }

        if (user.role !== 'SUPER_ADMIN' && user.role !== 'CONTENT_MANAGER') {
            return forbiddenResponse('Hanya admin/content manager yang dapat membuat komik');
        }

        const body = await request.json();
        const validatedData = createComicSchema.parse(body);

        // Create comic with pages array
        const comic = await prisma.comic.create({
            data: {
                title: validatedData.title,
                description: validatedData.description || '',
                coverUrl: validatedData.coverImageUrl,
                pages: validatedData.pages.map((p: { imageUrl: string }) => p.imageUrl),
                totalPages: validatedData.pages.length,
                category: '',
                tags: [],
                createdById: decoded.userId,
                isPublished: false,
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

        return successResponse(comic, 'Komik berhasil dibuat');
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationErrorResponse(error.format());
        }
        console.error('Create comic error:', error);
        return serverErrorResponse('Terjadi kesalahan saat membuat komik');
    }
}
