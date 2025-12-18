import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { unauthorizedResponse, errorResponse, successResponse, forbiddenResponse } from '@/lib/api-response';
import prisma from '@/lib/prisma';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;

        // 1. Auth Check (Host Only)
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) return unauthorizedResponse();
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (!decoded) return unauthorizedResponse();

        // 2. Find Session
        const session = await prisma.quizSession.findUnique({
            where: { code },
            select: { id: true, hostId: true, status: true }
        });

        if (!session) return errorResponse('Sesi tidak ditemukan', 'NOT_FOUND', null, 404);

        // 3. Verify Host
        if (session.hostId !== decoded.userId) {
            return forbiddenResponse('Hanya host yang bisa memulai sesi');
        }

        // 4. Update Status
        if (session.status === 'ACTIVE') {
            return successResponse(session, 'Sesi sudah berjalan');
        }

        const updatedSession = await prisma.quizSession.update({
            where: { id: session.id },
            data: { status: 'ACTIVE' }
        });

        return successResponse(updatedSession, 'Sesi dimulai');

    } catch (error: any) {
        return errorResponse('Gagal memulai sesi', 'INTERNAL_SERVER_ERROR', error.message, 500);
    }
}
