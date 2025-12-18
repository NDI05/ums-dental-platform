import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, unauthorizedResponse, validationErrorResponse, forbiddenResponse, serverErrorResponse } from '@/lib/api-response';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

const submitQuizSchema = z.object({
    answers: z.array(
        z.object({
            quizId: z.string(),
            answer: z.boolean(),
        })
    ).min(1, 'Minimal 1 jawaban diperlukan'),
});

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return unauthorizedResponse('Token tidak ditemukan');
        }

        const token = authHeader.substring(7);

        try {
            const decoded = verifyToken(token);

            if (!decoded) {
                return unauthorizedResponse('Token tidak valid atau expired');
            }

            const body = await request.json();

            // Only students can submit quiz attempts
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
            });

            if (!user) {
                return unauthorizedResponse('User tidak ditemukan');
            }

            if (user.role !== 'STUDENT') {
                return forbiddenResponse('Hanya student yang bisa mengikuti kuis');
            }

            // Validate input
            const { answers } = submitQuizSchema.parse(body);

            // Get all quiz questions
            const quizIds = answers.map((a) => a.quizId);
            const quizzes = await prisma.quiz.findMany({
                where: { id: { in: quizIds } },
            });

            if (quizzes.length !== answers.length) {
                return validationErrorResponse({ message: 'Beberapa quiz ID tidak valid' });
            }

            // Calculate score
            let correctAnswers = 0;
            const quizMap = new Map(quizzes.map((q) => [q.id, q]));
            const answerDetails = answers.map((answer) => {
                const quiz = quizMap.get(answer.quizId)!;
                const isCorrect = answer.answer === quiz.answer;
                if (isCorrect) correctAnswers++;

                return {
                    quizId: answer.quizId,
                    userAnswer: answer.answer,
                    correctAnswer: quiz.answer,
                    isCorrect,
                    explanation: quiz.explanation,
                };
            });

            const totalQuestions = answers.length;
            const score = Math.round((correctAnswers / totalQuestions) * 100);
            const basePoints = 50;
            const bonusPoints = correctAnswers * 10;
            const pointsEarned = basePoints + bonusPoints;

            // Create quiz attempt with transaction
            const quizAttempt = await prisma.$transaction(async (tx) => {
                // Create attempt record
                const attempt = await tx.quizAttempt.create({
                    data: {
                        userId: decoded.userId,
                        totalQuestions,
                        correctAnswers,
                        score,
                        pointsEarned,
                    },
                });

                // Create answer records
                await tx.quizAttemptAnswer.createMany({
                    data: answers.map((answer) => ({
                        attemptId: attempt.id,
                        quizId: answer.quizId,
                        userAnswer: answer.answer,  // Changed from 'answer' to 'userAnswer'
                        isCorrect: quizMap.get(answer.quizId)!.answer === answer.answer,
                    })),
                });

                // Award points
                await tx.pointTransaction.create({
                    data: {
                        userId: decoded.userId,
                        activityType: 'QUIZ_COMPLETED',
                        pointsEarned,
                        referenceId: attempt.id,
                        referenceType: 'quiz',
                        description: `Menyelesaikan kuis: ${correctAnswers}/${totalQuestions} benar`,
                    },
                });

                // Update user total points
                await tx.user.update({
                    where: { id: decoded.userId },
                    data: { totalPoints: { increment: pointsEarned } },
                });

                return attempt;
            });

            return successResponse(
                {
                    attemptId: quizAttempt.id,
                    totalQuestions,
                    correctAnswers,
                    score,
                    pointsEarned,
                    answers: answerDetails,
                },
                `Kuis selesai! Skor: ${score}%, +${pointsEarned} poin!`
            );
        } catch (error) {
            if (error instanceof z.ZodError) {
                return validationErrorResponse(error.format());
            }
            throw error;
        }
    } catch (error: any) {
        console.error('Submit quiz attempt error:', error);
        return serverErrorResponse('Terjadi kesalahan saat submit kuis: ' + (error.message || error));
    }
}
