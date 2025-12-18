import { NextRequest } from 'next/server';
import { successResponse, unauthorizedResponse, forbiddenResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-response';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
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

        // Fetch Attempt
        const attempt = await prisma.quizAttempt.findUnique({
            where: { id: resolvedParams.id },
        });

        if (!attempt) return notFoundResponse('Attempt not found');
        if (attempt.userId !== decoded.userId) return forbiddenResponse('Bukan attempt milik anda');

        // Calculate Final Score based on stored answers
        const answers = (attempt.answers as any[]) || [];
        const totalQuestions = attempt.totalQuestions; // Should be set at start

        // Count correct answers from the stored JSON
        const correctAnswers = answers.filter((a: any) => a.isCorrect).length;

        const score = Math.round((correctAnswers / totalQuestions) * 100);
        const basePoints = 50;
        const bonusPoints = correctAnswers * 10;
        const pointsEarned = basePoints + bonusPoints;

        // Transaction to finalize and award points
        await prisma.$transaction(async (tx) => {
            // Update Attempt
            await tx.quizAttempt.update({
                where: { id: resolvedParams.id },
                data: {
                    correctAnswers,
                    score,
                    pointsEarned,
                    completedAt: new Date(), // Mark finished now
                }
            });

            // Award Points (Idempotency check: check if already awarded? 
            // The logic assumes finish is called once. 
            // Realistically we should check if points were already given.)

            // Check if transaction already exists for this reference
            const existingTx = await tx.pointTransaction.findFirst({
                where: { referenceId: attempt.id, referenceType: 'quiz' }
            });

            if (!existingTx) {
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

                await tx.user.update({
                    where: { id: decoded.userId },
                    data: { totalPoints: { increment: pointsEarned } },
                });
            }
        });

        // Get full/rich results with explanations to show to user now (Reward)
        // We need to fetch quiz details again for explanations
        const quizIds = answers.map((a: any) => a.quizId);
        const quizzes = await prisma.quiz.findMany({ where: { id: { in: quizIds } } });
        const quizMap = new Map(quizzes.map(q => [q.id, q]));

        const richAnswers = answers.map((a: any) => ({
            ...a,
            explanation: quizMap.get(a.quizId)?.explanation
        }));

        return successResponse({
            score,
            pointsEarned,
            correctAnswers,
            totalQuestions,
            answers: richAnswers
        }, 'Kuis selesai!');

    } catch (error) {
        console.error('Finish Attempt Error:', error);
        return serverErrorResponse('Gagal menyelesaikan kuis');
    }
}
