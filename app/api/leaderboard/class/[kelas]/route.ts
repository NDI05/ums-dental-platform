import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, validationErrorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';
import { paginationSchema } from '@/lib/validations';
import prisma from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ kelas: string }> }
) {
    try {
        const { searchParams } = new URL(request.url);

        const queryParams = {
            page: searchParams.get('page') || '1',
            limit: searchParams.get('limit') || '10',
        };

        try {
            const { page, limit } = paginationSchema.parse(queryParams);
            const skip = (page - 1) * limit;

            const resolvedParams = await params;
            const kelas = decodeURIComponent(resolvedParams.kelas);

            // Get top users in this class
            const [classUsers, total] = await Promise.all([
                prisma.user.findMany({
                    where: {
                        role: 'STUDENT',
                        kelas,
                    },
                    skip,
                    take: limit,
                    orderBy: { totalPoints: 'desc' },
                    select: {
                        id: true,
                        username: true,
                        kelas: true,
                        avatarUrl: true,
                        totalPoints: true,
                    },
                }),
                prisma.user.count({
                    where: {
                        role: 'STUDENT',
                        kelas,
                    },
                }),
            ]);

            if (total === 0) {
                return notFoundResponse(`Kelas ${kelas}`);
            }

            const leaderboard = classUsers.map((user, index) => ({
                rank: skip + index + 1,
                ...user,
            }));

            return successResponse(
                {
                    kelas,
                    data: leaderboard,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                    },
                },
                `Berhasil mengambil leaderboard kelas ${kelas}`
            );
        } catch (error) {
            if (error instanceof z.ZodError) {
                return validationErrorResponse(error.format());
            }
            throw error;
        }
    } catch (error) {
        console.error('Get class leaderboard error:', error);
        return serverErrorResponse('Terjadi kesalahan saat mengambil leaderboard kelas');
    }
}
