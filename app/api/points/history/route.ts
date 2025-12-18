import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, unauthorizedResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api-response';
import { verifyToken } from '@/lib/auth';
import { paginationSchema } from '@/lib/validations';
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

        const { searchParams } = new URL(request.url);

        const params = {
            page: searchParams.get('page') || '1',
            limit: searchParams.get('limit') || '20',
        };

        const { page, limit } = paginationSchema.parse(params);
        const skip = (page - 1) * limit;

        const [transactions, total] = await Promise.all([
            prisma.pointTransaction.findMany({
                where: { userId: decoded.userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    activityType: true,
                    pointsEarned: true,
                    description: true,
                    referenceType: true,
                    createdAt: true,
                },
            }),
            prisma.pointTransaction.count({
                where: { userId: decoded.userId },
            }),
        ]);

        return successResponse(
            {
                data: transactions,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
            'Berhasil mengambil riwayat poin'
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationErrorResponse(error.format());
        }
        console.error('Get points history error:', error);
        return serverErrorResponse('Terjadi kesalahan saat mengambil riwayat poin');
    }
}
