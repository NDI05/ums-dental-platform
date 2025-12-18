import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, validationErrorResponse, unauthorizedResponse, forbiddenResponse, serverErrorResponse, errorResponse } from '@/lib/api-response';
import { paginationSchema, createGameSchema } from '@/lib/validations';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const params = {
            page: searchParams.get('page') || '1',
            limit: searchParams.get('limit') || '10',
            difficulty: searchParams.get('difficulty') || undefined,
        };

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

        try {
            const { page, limit } = paginationSchema.parse(params);
            const skip = (page - 1) * limit;

            const where: Prisma.MiniGameWhereInput = {};

            // If not admin, strictly filter published only
            if (!isAdmin) {
                where.isPublished = true;
            } else {
                // Admin can filter by status if needed
                const statusParam = searchParams.get('status');
                if (statusParam === 'published') where.isPublished = true;
                if (statusParam === 'draft') where.isPublished = false;
            }

            if (params.difficulty && ['EASY', 'MEDIUM', 'HARD'].includes(params.difficulty)) {
                where.difficulty = params.difficulty as 'EASY' | 'MEDIUM' | 'HARD';
            }

            const [games, total] = await Promise.all([
                prisma.miniGame.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }],
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        thumbnailUrl: true,
                        gameUrl: true,
                        difficulty: true,
                        clickCount: true,
                        publishedAt: true,
                        isPublished: true,
                    },
                }),
                prisma.miniGame.count({ where }),
            ]);

            return successResponse(
                {
                    data: games,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                    },
                },
                'Berhasil mengambil daftar game'
            );
        } catch (error) {
            if (error instanceof z.ZodError) {
                return validationErrorResponse(error.format());
            }
            throw error;
        }
    } catch (error: unknown) {
        return errorResponse(
            error instanceof Error ? error.message : 'Internal Server Error',
            'INTERNAL_SERVER_ERROR',
            error
        );
    }
}

// ============================================
// POST /api/games - Create game (Admin)
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
            return forbiddenResponse('Hanya admin/content manager yang dapat membuat game');
        }

        const body = await request.json();
        const validatedData = createGameSchema.parse(body);

        const game = await prisma.miniGame.create({
            data: {
                title: validatedData.title,
                description: validatedData.description || '',
                thumbnailUrl: validatedData.thumbnailUrl,
                gameUrl: validatedData.gameUrl,
                difficulty: validatedData.difficulty,
                sortOrder: validatedData.sortOrder || 0,
                createdById: decoded.userId,
                isPublished: validatedData.isPublished ?? false,
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

        return successResponse(game, 'Game berhasil dibuat');
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationErrorResponse(error.format());
        }
        console.error('Create game error:', error);
        return serverErrorResponse('Terjadi kesalahan saat membuat game');
    }
}
