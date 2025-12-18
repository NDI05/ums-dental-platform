import { NextRequest } from 'next/server';
import { z } from 'zod';
import { notFoundResponse, successResponse, unauthorizedResponse, validationErrorResponse, forbiddenResponse, serverErrorResponse } from '@/lib/api-response';
import { verifyToken } from '@/lib/auth';
import { updateQuizQuestionSchema } from '@/lib/validations';
import prisma from '@/lib/prisma';

// ============================================
// GET /api/quizzes/:id - Get quiz detail
// ============================================

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const resolvedParams = await params;
    try {
        const quiz = await prisma.quiz.findUnique({
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

        if (!quiz) {
            return notFoundResponse('Soal kuis');
        }

        return successResponse(quiz, 'Berhasil mengambil detail kuis');
    } catch (error) {
        console.error('Get quiz detail error:', error);
        return serverErrorResponse('Terjadi kesalahan saat mengambil detail kuis');
    }
}

// ============================================
// PUT /api/quizzes/:id - Update quiz (Admin)
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

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) {
            return unauthorizedResponse('User tidak ditemukan');
        }

        if (user.role !== 'SUPER_ADMIN' && user.role !== 'CONTENT_MANAGER' && user.role !== 'TEACHER') {
            return forbiddenResponse('Hanya admin/content manager/guru yang dapat mengupdate soal kuis');
        }

        const existingQuiz = await prisma.quiz.findUnique({
            where: { id: resolvedParams.id },
        });

        if (!existingQuiz) {
            return notFoundResponse('Soal kuis');
        }

        if (user.role === 'CONTENT_MANAGER' && existingQuiz.createdById !== user.id) {
            return forbiddenResponse('Anda hanya dapat mengupdate soal yang Anda buat');
        }

        const body = await request.json();
        const validatedData = updateQuizQuestionSchema.parse(body);

        const quiz = await prisma.quiz.update({
            where: { id: resolvedParams.id },
            data: validatedData,
            include: {
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        return successResponse(quiz, 'Soal kuis berhasil diupdate');
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationErrorResponse(error.format());
        }
        console.error('Update quiz error:', error);
        return serverErrorResponse('Terjadi kesalahan saat mengupdate soal kuis');
    }
}

// ============================================
// DELETE /api/quizzes/:id - Delete quiz (Admin)
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

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) {
            return unauthorizedResponse('User tidak ditemukan');
        }

        if (user.role !== 'SUPER_ADMIN' && user.role !== 'CONTENT_MANAGER' && user.role !== 'TEACHER') {
            return forbiddenResponse('Hanya admin/content manager/guru yang dapat menghapus soal kuis');
        }

        const existingQuiz = await prisma.quiz.findUnique({
            where: { id: resolvedParams.id },
        });

        if (!existingQuiz) {
            return notFoundResponse('Soal kuis');
        }

        if (user.role === 'CONTENT_MANAGER' && existingQuiz.createdById !== user.id) {
            return forbiddenResponse('Anda hanya dapat menghapus soal yang Anda buat');
        }



        await prisma.quiz.delete({
            where: { id: resolvedParams.id },
        });

        return successResponse(
            { id: resolvedParams.id },
            'Soal kuis berhasil dihapus'
        );
    } catch (error) {
        console.error('Delete quiz error:', error);
        return serverErrorResponse('Terjadi kesalahan saat menghapus soal kuis');
    }
}
