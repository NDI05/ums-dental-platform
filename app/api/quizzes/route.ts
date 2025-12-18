import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, validationErrorResponse, unauthorizedResponse, forbiddenResponse, serverErrorResponse } from '@/lib/api-response';
import { quizFilterSchema, createQuizQuestionSchema } from '@/lib/validations';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        let decoded = null;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            decoded = verifyToken(token);
        }

        const { searchParams } = new URL(request.url);

        const params = {
            page: searchParams.get('page') || '1',
            limit: searchParams.get('limit') || '10',
            sortBy: searchParams.get('sortBy') || 'createdAt',
            order: searchParams.get('order') || 'desc',
            difficulty: searchParams.get('difficulty') || undefined,
            search: searchParams.get('search') || undefined,
        };

        try {
            const validated = quizFilterSchema.parse(params);

            const { page, limit, sortBy, order, difficulty, search } = validated;
            const skip = (page - 1) * limit;

            // Build where clause
            const where: Prisma.QuizWhereInput = {
                isActive: true,
            };

            if (difficulty) {
                where.difficulty = difficulty;
            }

            if (search) {
                where.OR = [
                    { question: { contains: search, mode: 'insensitive' } },
                    { explanation: { contains: search, mode: 'insensitive' } },
                ];
            }

            // Get quizzes with pagination
            const [quizzes, total] = await Promise.all([
                prisma.quiz.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { [sortBy as keyof Prisma.QuizOrderByWithRelationInput]: order },
                    select: {
                        id: true,
                        question: true,
                        category: true,
                        difficulty: true,
                        createdAt: true,
                        answer: true, // Exposed for immediate feedback (Client-side validation)
                        explanation: true, // Educational feedback
                        // Wait, the schema in seed.ts was simpler. Let's check what fields are available.
                        // Based on previous file view, only simple fields. I will stick to what's verified.
                    },
                }),
                prisma.quiz.count({ where }),
            ]);

            return successResponse(
                {
                    data: quizzes,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                    },
                },
                'Berhasil mengambil daftar kuis'
            );
        } catch (error) {
            if (error instanceof z.ZodError) {
                return validationErrorResponse(error.format());
            }
            throw error;
        }
    } catch (error: unknown) {
        console.error('Get quizzes error:', error);
        return serverErrorResponse('Terjadi kesalahan saat mengambil daftar kuis');
    }
}

// ============================================
// POST /api/quizzes - Create quiz question (Admin)
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
            return forbiddenResponse('Hanya admin/content manager yang dapat membuat soal kuis');
        }

        const body = await request.json();
        const validatedData = createQuizQuestionSchema.parse(body);

        const quiz = await prisma.quiz.create({
            data: {
                question: validatedData.question,
                answer: validatedData.answer,
                explanation: validatedData.explanation || '',
                category: validatedData.category,
                difficulty: validatedData.difficulty,
                createdById: decoded.userId,
                isActive: true,
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

        return successResponse(quiz, 'Soal kuis berhasil dibuat');
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationErrorResponse(error.format());
        }
        console.error('Create quiz error:', error);
        return serverErrorResponse('Terjadi kesalahan saat membuat soal kuis');
    }
}
