import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, unauthorizedResponse, forbiddenResponse, serverErrorResponse, validationErrorResponse } from '@/lib/api-response';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

const startAttemptSchema = z.object({
    quizIds: z.array(z.string()).min(1, 'Minimal 1 soal diperlukan'),
});

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return unauthorizedResponse('Token tidak ditemukan');
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (!decoded) return unauthorizedResponse('Token tidak valid');

        const body = await request.json();
        const { quizIds } = startAttemptSchema.parse(body);

        // Verify User Role
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || user.role !== 'STUDENT') return forbiddenResponse('Hanya student yang bisa memulai kuis');

        // Create Attempt Record (Initial state)
        const attempt = await prisma.quizAttempt.create({
            data: {
                userId: decoded.userId,
                totalQuestions: quizIds.length,
                correctAnswers: 0,
                score: 0,
                pointsEarned: 0,
                answers: [], // Empty initially
                // We might want to store 'targetQuizIds' to validation later, but for now we trust the flow
                // Or we can store the quiz IDs in `answers` with null answers.
            }
        });

        // Initialize empty answers structure if we want to track progress accurately
        await prisma.quizAttempt.update({
            where: { id: attempt.id },
            data: {
                answers: quizIds.map(qid => ({ quizId: qid, userAnswer: null, isCorrect: false }))
            }
        });

        return successResponse({ attemptId: attempt.id }, 'Quiz attempt started');

    } catch (error) {
        if (error instanceof z.ZodError) return validationErrorResponse(error.format());
        console.error('Start Attempt Error:', error);
        return serverErrorResponse('Gagal memulai kuis');
    }
}
