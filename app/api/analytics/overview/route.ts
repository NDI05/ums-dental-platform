import { NextRequest } from 'next/server';
import { successResponse, unauthorizedResponse, forbiddenResponse, serverErrorResponse } from '@/lib/api-response';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return unauthorizedResponse('Token tidak ditemukan');
        }

        const token = authHeader.substring(7);

        try {
            const decoded = verifyToken(token);

            if (!decoded) {
                return unauthorizedResponse('Token tidak valid atau expired');
            }

            // Check if user is admin
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
            });

            if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'CONTENT_MANAGER')) {
                return forbiddenResponse('Hanya admin yang dapat mengakses analytics');
            }

            // Get overview statistics
            const [
                totalStudents,
                totalVideos,
                totalQuizzes,
                totalComics,
                totalGames,
                totalVideoViews,
                totalQuizAttempts,
                totalPointsAwarded,
            ] = await Promise.all([
                prisma.user.count({ where: { role: 'STUDENT' } }),
                prisma.video.count({ where: { isPublished: true } }),
                prisma.quiz.count({ where: { isActive: true } }),
                prisma.comic.count({ where: { isPublished: true } }),
                prisma.miniGame.count({ where: { isPublished: true } }),
                prisma.videoView.count(),
                prisma.quizAttempt.count(),
                prisma.pointTransaction.aggregate({
                    _sum: { pointsEarned: true },
                }),
            ]);

            // Get recent activity (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const recentActivity = await Promise.all([
                prisma.videoView.count({
                    where: { watchedAt: { gte: sevenDaysAgo } },
                }),
                prisma.quizAttempt.count({
                    where: { completedAt: { gte: sevenDaysAgo } },
                }),
                prisma.comicRead.count({
                    where: { startedAt: { gte: sevenDaysAgo } },
                }),
                prisma.gameClick.count({
                    where: { clickedAt: { gte: sevenDaysAgo } },
                }),
            ]);

            const overview = {
                users: {
                    totalStudents,
                },
                content: {
                    totalVideos,
                    totalQuizzes,
                    totalComics,
                    totalGames,
                },
                engagement: {
                    totalVideoViews,
                    totalQuizAttempts,
                    totalPointsAwarded: totalPointsAwarded._sum.pointsEarned || 0,
                },
                recentActivity: {
                    last7Days: {
                        videoViews: recentActivity[0],
                        quizAttempts: recentActivity[1],
                        comicReads: recentActivity[2],
                        gameClicks: recentActivity[3],
                    },
                },
            };

            return successResponse(overview, 'Berhasil mengambil analytics overview');
        } catch {
            return unauthorizedResponse('Token tidak valid');
        }
    } catch {
        // console.error('Analytics error:', error);
        return serverErrorResponse('Gagal memuat data analytics');
    }
}
