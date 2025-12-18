import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-response';
import prisma from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;

        // Find session by code
        const session = await prisma.quizSession.findUnique({
            where: { code },
            include: {
                participants: {
                    select: {
                        id: true,
                        username: true,
                        score: true,
                        status: true,
                        user: {
                            select: { avatarUrl: true }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!session) {
            return errorResponse('Sesi tidak ditemukan', 'NOT_FOUND', null, 404);
        }

        return successResponse({
            status: session.status,
            participants: session.participants.map(p => ({
                id: p.id,
                username: p.username,
                score: p.score,
                status: p.status,
                avatarUrl: p.user.avatarUrl
            })),
            totalParticipants: session.participants.length
        });

    } catch (error: any) {
        console.error('Get Participants Error:', error);
        return errorResponse('Gagal memuat peserta', 'INTERNAL_SERVER_ERROR', error.message, 500);
    }
}
