import { NextRequest } from 'next/server';
import { z } from 'zod';
import { notFoundResponse, successResponse, unauthorizedResponse, validationErrorResponse, forbiddenResponse, serverErrorResponse } from '@/lib/api-response';
import { verifyToken } from '@/lib/auth';
import { updateComicSchema } from '@/lib/validations';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { deleteFile } from '@/lib/storage';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const comic = await prisma.comic.findUnique({
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
                        reads: true,
                    },
                },
            },
        });

        if (!comic) {
            return notFoundResponse('Komik');
        }

        return successResponse(comic, 'Berhasil mengambil detail komik');
    } catch (error) {
        console.error('Get comic detail error:', error);
        return serverErrorResponse('Terjadi kesalahan saat mengambil detail komik');
    }
}

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

        if (user.role !== 'SUPER_ADMIN' && user.role !== 'CONTENT_MANAGER') {
            return forbiddenResponse('Hanya admin/content manager yang dapat mengupdate komik');
        }

        const existingComic = await prisma.comic.findUnique({ where: { id: resolvedParams.id } });
        if (!existingComic) {
            return notFoundResponse('Komik');
        }

        if (user.role === 'CONTENT_MANAGER' && existingComic.createdById !== user.id) {
            return forbiddenResponse('Anda hanya dapat mengupdate komik yang Anda buat');
        }

        const body = await request.json();
        const validatedData = updateComicSchema.parse(body);

        const updateData: Prisma.ComicUpdateInput = {};
        if (validatedData.title !== undefined) updateData.title = validatedData.title;
        if (validatedData.description !== undefined) updateData.description = validatedData.description;
        if (validatedData.coverImageUrl !== undefined) updateData.coverUrl = validatedData.coverImageUrl;
        if (validatedData.isPublished !== undefined) updateData.isPublished = validatedData.isPublished;
        if (validatedData.pages !== undefined) {
            updateData.pages = validatedData.pages.map((p: any) => p.imageUrl);
            updateData.totalPages = validatedData.pages.length;
        }

        const comic = await prisma.comic.update({
            where: { id: resolvedParams.id },
            data: updateData,
            include: { createdBy: { select: { id: true, username: true } } },
        });

        return successResponse(comic, 'Komik berhasil diupdate');
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationErrorResponse(error.format());
        }
        console.error('Update comic error:', error);
        return serverErrorResponse('Terjadi kesalahan saat mengupdate komik');
    }
}

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

        if (user.role !== 'SUPER_ADMIN' && user.role !== 'CONTENT_MANAGER') {
            return forbiddenResponse('Hanya admin/content manager yang dapat menghapus komik');
        }

        const existingComic = await prisma.comic.findUnique({ where: { id: resolvedParams.id } });
        if (!existingComic) {
            return notFoundResponse('Komik');
        }



        if (user.role === 'CONTENT_MANAGER' && existingComic.createdById !== user.id) {
            return forbiddenResponse('Anda hanya dapat menghapus komik yang Anda buat');
        }

        // Cleanup Files
        if (existingComic.coverUrl) {
            await deleteFile(existingComic.coverUrl);
        }
        if (existingComic.pages && existingComic.pages.length > 0) {
            await Promise.all(existingComic.pages.map(pageUrl => deleteFile(pageUrl)));
        }

        await prisma.comic.delete({ where: { id: resolvedParams.id } });

        return successResponse({ id: resolvedParams.id }, 'Komik berhasil dihapus');
    } catch (error) {
        console.error('Delete comic error:', error);
        return serverErrorResponse('Terjadi kesalahan saat menghapus komik');
    }
}
