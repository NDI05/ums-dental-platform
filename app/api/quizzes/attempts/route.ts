import { NextRequest } from 'next/server';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

        // Get user's quiz attempts with details
        const attempts = await prisma.quizAttempt.findMany({
            where: { userId: decoded.userId },
            orderBy: { completedAt: 'desc' },
            take: 20, // Last 20 attempts
            select: {
                id: true,
                totalQuestions: true,
                correctAnswers: true,
                score: true,
                pointsEarned: true,
                completedAt: true,
            },
        });

        return successResponse(attempts, 'Berhasil mengambil riwayat kuis');
    } catch (error) {
        console.error('Get quiz attempts error:', error);
        return serverErrorResponse('Terjadi kesalahan saat mengambil riwayat kuis');
    }
}
