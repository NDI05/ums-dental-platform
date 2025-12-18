import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { unauthorizedResponse, errorResponse, successResponse, forbiddenResponse } from '@/lib/api-response';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createSessionSchema = z.object({
    title: z.string().min(1, "Judul sesi wajib diisi"),
    categoryId: z.string().optional(), // If empty, pick from all? Or require? Let's make optional (General)
    totalQuestions: z.number().min(1).max(50).default(10),
    timerPerQuestion: z.number().min(10).max(300).default(30),
    isShuffled: z.boolean().default(true)
});

// Helper to generate 6-char code
function generateCode(length = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 to avoid confusion
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) return unauthorizedResponse();
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (!decoded) return unauthorizedResponse();

        const sessions = await prisma.quizSession.findMany({
            where: {
                hostId: decoded.userId
            },
            include: {
                _count: {
                    select: { participants: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return successResponse(sessions, 'Berhasil mengambil daftar sesi');
    } catch (error: any) {
        return errorResponse('Gagal mengambil daftar sesi', 'INTERNAL_SERVER_ERROR', error.message, 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        // 1. Auth Check
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) return unauthorizedResponse();
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (!decoded) return unauthorizedResponse();

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || user.role === 'STUDENT') return forbiddenResponse();

        // 2. Validate Body
        const body = await req.json();
        const { title, categoryId, totalQuestions, timerPerQuestion, isShuffled } = createSessionSchema.parse(body);

        // 3. Select Questions
        // Strategy: Get IDs first, then shuffle if needed, then slice
        const whereClause = categoryId ? { categoryId: categoryId, isActive: true } : { isActive: true };

        // Ensure we have enough questions
        const availableCount = await prisma.quiz.count({ where: whereClause });
        if (availableCount < totalQuestions) {
            return errorResponse(`Hanya tersedia ${availableCount} soal dalam kategori ini (diminta: ${totalQuestions})`, 'INSUFFICIENT_DATA', null, 400);
        }

        // Fetch IDs to randomize efficiently
        const allQuizIds = await prisma.quiz.findMany({
            where: whereClause,
            select: { id: true }
        });

        // Randomize
        const shuffledIds = allQuizIds.sort(() => 0.5 - Math.random());
        const selectedIds = shuffledIds.slice(0, totalQuestions);

        // 4. Generate Unique Code
        let code = generateCode();
        let isUnique = false;
        let retries = 0;

        while (!isUnique && retries < 5) {
            const existing = await prisma.quizSession.findUnique({ where: { code } });
            if (!existing) isUnique = true;
            else {
                code = generateCode();
                retries++;
            }
        }

        if (!isUnique) return errorResponse('Gagal membuat kode unik, coba lagi', 'INTERNAL_SERVER_ERROR', null, 500);

        // 5. Transaction: Create Session + Inserts Questions
        const session = await prisma.$transaction(async (tx) => {
            const newSession = await tx.quizSession.create({
                data: {
                    title,
                    code,
                    hostId: user.id,
                    timerPerQuestion,
                    isShuffled,
                    status: 'WAITING'
                }
            });

            // Bulk create session questions
            await tx.quizSessionQuestion.createMany({
                data: selectedIds.map((q, idx) => ({
                    sessionId: newSession.id,
                    quizId: q.id,
                    order: idx + 1
                }))
            });

            return newSession;
        });

        return successResponse(session, 'Sesi berhasil dibuat');

    } catch (error: any) {
        console.error('Create Session Error Breakdown:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: error.cause
        });

        if (error instanceof z.ZodError) return errorResponse(error.errors[0].message, 'VALIDATION_ERROR', error.errors, 400);
        return errorResponse('Gagal membuat sesi', 'INTERNAL_SERVER_ERROR', error, 500);
    }
}
