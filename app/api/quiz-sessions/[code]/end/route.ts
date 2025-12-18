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
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) return unauthorizedResponse();
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (!decoded) return unauthorizedResponse();

        const session = await prisma.quizSession.findUnique({
            where: { code },
            select: { id: true, hostId: true }
        });

        if (!session) return errorResponse('Sesi tidak ditemukan', 'NOT_FOUND', null, 404);

        if (session.hostId !== decoded.userId) return forbiddenResponse();

        const updated = await prisma.quizSession.update({
            where: { id: session.id },
            data: { status: 'COMPLETED' }
        });

        return successResponse(updated, 'Sesi diakhiri');

    } catch (error: any) {
        return errorResponse('Gagal mengakhiri sesi', 'INTERNAL_SERVER_ERROR', error.message, 500);
    }
}
