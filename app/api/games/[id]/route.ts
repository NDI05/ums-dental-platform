import { NextRequest } from 'next/server';
import { z } from 'zod';
import { notFoundResponse, successResponse, unauthorizedResponse, validationErrorResponse, forbiddenResponse, serverErrorResponse } from '@/lib/api-response';
import { verifyToken } from '@/lib/auth';
import { updateGameSchema } from '@/lib/validations';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/games/:id - Get game detail
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const resolvedParams = await params;
    try {
        const game = await prisma.miniGame.findUnique({
            where: { id: resolvedParams.id },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        if (!game) {
            return notFoundResponse('Game');
        }

        return successResponse(game, 'Detail game berhasil diambil');
    } catch (error) {
        console.error('Get game detail error:', error);
        return serverErrorResponse('Terjadi kesalahan saat mengambil detail game');
    }
}

// PUT /api/games/:id - Update game (Admin)
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

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            return unauthorizedResponse('User tidak ditemukan');
        }

        if (user.role !== 'SUPER_ADMIN' && user.role !== 'CONTENT_MANAGER' && user.role !== 'TEACHER') {
            return forbiddenResponse('Hanya admin/content manager/guru yang dapat mengupdate game');
        }

        const existingGame = await prisma.miniGame.findUnique({ where: { id: resolvedParams.id } });
        if (!existingGame) {
            return notFoundResponse('Game');
        }

        // if (user.role === 'CONTENT_MANAGER' && existingGame.createdById !== user.id) {
        //     return forbiddenResponse('Anda hanya dapat mengupdate game yang Anda buat');
        // }

        const body = await request.json();
        const validatedData = updateGameSchema.parse(body);

        // Filter only valid database fields
        const updateData: Prisma.MiniGameUpdateInput = {};
        if (validatedData.title !== undefined) updateData.title = validatedData.title;
        if (validatedData.description !== undefined) updateData.description = validatedData.description;
        if (validatedData.thumbnailUrl !== undefined) updateData.thumbnailUrl = validatedData.thumbnailUrl;
        if (validatedData.gameUrl !== undefined) updateData.gameUrl = validatedData.gameUrl;
        if (validatedData.difficulty !== undefined) updateData.difficulty = validatedData.difficulty;
        if (validatedData.sortOrder !== undefined) updateData.sortOrder = validatedData.sortOrder;
        if (validatedData.isPublished !== undefined) updateData.isPublished = validatedData.isPublished;

        const game = await prisma.miniGame.update({
            where: { id: resolvedParams.id },
            data: updateData,
            include: { createdBy: { select: { id: true, username: true } } },
        });

        return successResponse(game, 'Game berhasil diupdate');
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationErrorResponse(error.format());
        }
        console.error('Update game error:', error);
        return serverErrorResponse('Terjadi kesalahan saat mengupdate game');
    }
}

// DELETE /api/games/:id - Delete game (Admin)
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

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            return unauthorizedResponse('User tidak ditemukan');
        }

        if (user.role !== 'SUPER_ADMIN' && user.role !== 'CONTENT_MANAGER' && user.role !== 'TEACHER') {
            return forbiddenResponse('Hanya admin/content manager/guru yang dapat menghapus game');
        }

        const existingGame = await prisma.miniGame.findUnique({ where: { id: resolvedParams.id } });
        if (!existingGame) {
            return notFoundResponse('Game');
        }

        // if (user.role === 'CONTENT_MANAGER' && existingGame.createdById !== user.id) {
        //     return forbiddenResponse('Anda hanya dapat menghapus game yang Anda buat');
        // }

        await prisma.miniGame.delete({ where: { id: resolvedParams.id } });

        return successResponse({ id: resolvedParams.id }, 'Game berhasil dihapus');
    } catch (error) {
        console.error('Delete game error:', error);
        return serverErrorResponse('Terjadi kesalahan saat menghapus game');
    }
}
