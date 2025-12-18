import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, unauthorizedResponse, forbiddenResponse, serverErrorResponse, validationErrorResponse, notFoundResponse } from '@/lib/api-response';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

const saveProgressSchema = z.object({
    quizId: z.string(),
    answer: z.boolean(),
});

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // attemptId
) {
    const resolvedParams = await params;
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) return unauthorizedResponse('Token tidak ditemukan');

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (!decoded) return unauthorizedResponse('Token tidak valid');

        const body = await request.json();
        const { quizId, answer } = saveProgressSchema.parse(body);

        // Fetch current attempt
        const attempt = await prisma.quizAttempt.findUnique({
            where: { id: resolvedParams.id },
        });

        if (!attempt) return notFoundResponse('Attempt not found');
        if (attempt.userId !== decoded.userId) return forbiddenResponse('Bukan attempt milik anda');

        // Check correctness (Server Side)
        const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
        if (!quiz) return notFoundResponse('Quiz not found');

        const isCorrect = quiz.answer === answer;

        // Update Answer in JSON
        let currentAnswers = (attempt.answers as any[]) || [];

        // Remove existing answer for this quizId if any
        currentAnswers = currentAnswers.filter((a: any) => a.quizId !== quizId);

        // Add new answer
        currentAnswers.push({
            quizId,
            userAnswer: answer,
            isCorrect,
            // We don't save explanation here to save space
        });

        // Update DB
        await prisma.quizAttempt.update({
            where: { id: resolvedParams.id },
            data: {
                answers: currentAnswers
            }
        });

        // Return correctness so client can double check if needed (though client already acts optimistically)
        // Also we don't return explanation if we want to be super lean, but maybe we do.
        return successResponse({ isCorrect }, 'Progress saved');

    } catch (error) {
        if (error instanceof z.ZodError) return validationErrorResponse(error.format());
        console.error('Save Progress Error:', error);
        return serverErrorResponse('Gagal menyimpan progress');
    }
}
