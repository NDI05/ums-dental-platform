import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/api-response';
import prisma from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;

        // 1. Auth Check
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
        let userId = null;
        if (token) {
            const decoded = verifyToken(token);
            if (decoded) userId = decoded.userId;
        }

        if (!userId) {
            return errorResponse('Unauthorized', 'UNAUTHORIZED', null, 401);
        }

        // 2. Find Session
        const session = await prisma.quizSession.findUnique({
            where: { code },
            include: {
                questions: {
                    orderBy: { order: 'asc' },
                    include: {
                        quiz: {
                            select: {
                                id: true,
                                question: true,
                                answer: true, // Should we expose this? No! Security risk.
                                // Wait, simple comparison needs answer or server-side check.
                                // For secure quiz, never send answer to client. Client sends answer to server.
                                // However, for immediate feedback ("Correct!"), server responds with result.
                                // So we only select 'question' here.
                            }
                        }
                    }
                }
            }
        });

        if (!session) return errorResponse('Sesi tidak ditemukan', 'NOT_FOUND', null, 404);

        if (session.status === 'WAITING') {
            return errorResponse('Sesi belum dimulai', 'SESSION_WAITING', null, 400);
        }

        // 3. Format Questions (Hide Answer)
        const questions = session.questions.map(q => ({
            id: q.quizId, // Use quizId or sessionQuestionId? Let's use quizId for checking.
            order: q.order,
            text: q.quiz.question,
            // We need multiple choices? 
            // The current `Quiz` model only has `question` (Text) and `answer` (Boolean - True/False).
            // Ah, the schema says: `question` String, `answer` Boolean.
            // So these are TRUE/FALSE questions!
            type: 'BOOLEAN'
        }));

        return successResponse({
            sessionId: session.id,
            title: session.title,
            questions: questions,
            timerPerQuestion: session.timerPerQuestion
        });

    } catch (error: any) {
        return errorResponse('Gagal memuat soal', 'INTERNAL_SERVER_ERROR', error.message, 500);
    }
}
