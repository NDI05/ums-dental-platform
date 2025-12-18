import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/api-response';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const submitSchema = z.object({
    quizId: z.string(),
    answer: z.boolean(),
    timeLeft: z.number() // Used for scoring (more time left = more points)
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.substring(7);
        const decoded = verifyToken(token || '');
        if (!decoded) return errorResponse('Unauthorized', 'UNAUTHORIZED', null, 401);

        const body = await req.json();
        const { quizId, answer, timeLeft } = submitSchema.parse(body);

        // 1. Get Session & Quiz Correct Answer
        const session = await prisma.quizSession.findUnique({
            where: { code },
            include: {
                questions: { where: { quizId } } // Check if this quiz is in session
            }
        });

        if (!session) return errorResponse('Session not found', 'NOT_FOUND', null, 404);

        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId }
        });

        if (!quiz) return errorResponse('Quiz not found', 'NOT_FOUND', null, 404);

        // 2. Calculate Score
        const isCorrect = quiz.answer === answer;
        let points = 0;

        if (isCorrect) {
            // Speed Bonus: (TimeLeft / TotalTime) * 500 + Base 500
            // Max 1000 points per question
            const basePoints = 500;
            const timeRatio = Math.min(Math.max(timeLeft / session.timerPerQuestion, 0), 1);
            const speedBonus = Math.floor(timeRatio * 500);
            points = basePoints + speedBonus;
        }

        // 3. Update Participant Score
        // We use increment to handle race conditions if submitting multiple? No, user answers once per question.
        // Ideally we should record individual answers in `QuizSessionAnswer` table (not created yet).
        // For MVP, just update total `score` in Participant table.

        await prisma.quizSessionParticipant.updateMany({
            where: { sessionId: session.id, userId: decoded.userId },
            data: {
                score: { increment: points }
            }
        });

        return successResponse({
            isCorrect,
            pointsEarned: points,
            correctAnswer: quiz.answer,
            explanation: quiz.explanation
        });

    } catch (error: any) {
        return errorResponse('Submit error', 'INTERNAL_SERVER_ERROR', error.message, 500);
    }
}
