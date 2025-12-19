import { NextRequest, connection } from 'next/server';
import { successResponse, serverErrorResponse } from '@/lib/api-response';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    await connection();

    // SWR Optimization: Revalidate every 1 minute, allow stale for 1 hour
    const headers = {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=3600'
    };

    try {
        // Fetch top 50 users by points
        // In a real app we might cache this or restrict it more.
        const users = await prisma.user.findMany({
            where: {
                role: 'STUDENT', // Only students in leaderboard
            },
            take: 10, // Optimized for Free Tier (Top 10 only)
            orderBy: {
                totalPoints: 'desc',
            },
            select: {
                id: true,
                username: true,
                totalPoints: true,
                avatarUrl: true,
                kelas: true,
            },
        });

        // Map to leaderboard format
        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            id: user.id,
            name: user.username,
            xp: user.totalPoints,
            avatar: user.avatarUrl || (index % 2 === 0 ? '/images/mascot-boy.png' : '/images/mascot-girl.png'), // Fallback if no avatar
            kelas: user.kelas
        }));

        return successResponse(leaderboard, 'Leaderboard data fetched successfully', 200, headers);
    } catch (error) {
        console.error('Leaderboard Fetch Error:', error);
        return serverErrorResponse('Gagal mengambil data leaderboard');
    }
}
