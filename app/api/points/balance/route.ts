import { NextRequest, connection } from 'next/server';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    await connection();
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return unauthorizedResponse('Token tidak ditemukan');
        }

        const token = authHeader.substring(7);

        const decoded = verifyToken(token);

        if (!decoded) {
            return unauthorizedResponse('Token tidak valid atau expired');
        }

        // Get user's current point balance
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                username: true,
                totalPoints: true,
            },
        });

        if (!user) {
            return unauthorizedResponse('User tidak ditemukan');
        }

        return successResponse(
            {
                userId: user.id,
                username: user.username,
                totalPoints: user.totalPoints,
            },
            'Berhasil mengambil point balance'
        );
    } catch (error) {
        console.error('Get points balance error:', error);
        return serverErrorResponse('Terjadi kesalahan saat mengambil point balance');
    }
}
