import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { unauthorizedResponse, errorResponse, successResponse } from '@/lib/api-response';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const joinSchema = z.object({
    code: z.string().min(1, "Kode sesi wajib diisi").toUpperCase()
});

export async function POST(req: NextRequest) {
    try {
        // 1. Auth Check
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) return unauthorizedResponse();
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (!decoded) return unauthorizedResponse();

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) return unauthorizedResponse();

        // 2. Validate Code
        const body = await req.json();
        const { code } = joinSchema.parse(body);

        // 3. Find Session
        const session = await prisma.quizSession.findUnique({
            where: { code }
        });

        if (!session) {
            return errorResponse('Sesi tidak ditemukan dengan kode tersebut', 'NOT_FOUND', null, 404);
        }

        if (session.status === 'COMPLETED') {
            return errorResponse('Sesi ini sudah berakhir', 'SESSION_ENDED', null, 400);
        }

        // 4. Register Participant (Upsert)
        // If already joined, just return success.
        const participant = await prisma.quizSessionParticipant.upsert({
            where: {
                sessionId_userId: {
                    sessionId: session.id,
                    userId: user.id
                }
            },
            update: {
                // If re-joining, maybe update status if needed?
                // For now keep as is.
            },
            create: {
                sessionId: session.id,
                userId: user.id,
                username: user.username,
                status: 'JOINED'
            }
        });

        return successResponse({
            sessionId: session.id,
            code: session.code,
            title: session.title,
            status: session.status,
            participantId: participant.id
        }, 'Berhasil bergabung ke sesi');

    } catch (error: any) {
        if (error instanceof z.ZodError) return errorResponse((error as any).errors[0].message, 'VALIDATION_ERROR', (error as any).errors, 400);
        return errorResponse('Gagal bergabung ke sesi', 'INTERNAL_SERVER_ERROR', error.message, 500);
    }
}
