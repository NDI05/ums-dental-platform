import { NextRequest } from 'next/server';
import { successResponse, serverErrorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // Auth Check
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return unauthorizedResponse('Token tidak ditemukan');
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (!decoded) {
            return unauthorizedResponse('Token tidak valid atau expired');
        }

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'CONTENT_MANAGER')) {
            return forbiddenResponse('Akses ditolak');
        }

        // Date 7 days ago (Start of day)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        // Parallel Fetching
        const [
            totalUsers,
            totalComics,
            totalVideos,
            totalQuizAttempts,
            recentUsers,
            activityLogs,
            quizAnswersRaw
        ] = await Promise.all([
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.comic.count({ where: { isPublished: true } }),
            prisma.video.count({ where: { isPublished: true } }),
            prisma.quizAttempt.count(),
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                where: { role: 'STUDENT' },
                select: { id: true, username: true, createdAt: true, avatarUrl: true }
            }),
            prisma.pointTransaction.findMany({
                where: { createdAt: { gte: sevenDaysAgo } },
                select: { userId: true, createdAt: true }
            }),
            prisma.quizAttemptAnswer.findMany({
                include: { quiz: { select: { category: true } } }
            })
        ]);

        // Process Weekly Activity (Last 7 Days)
        const weeklyActivityData = Array(7).fill(0).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i)); // 6 days ago to today
            const dateStr = d.toISOString().split('T')[0];
            return {
                date: dateStr,
                day: d.toLocaleDateString('id-ID', { weekday: 'short' }),
                count: 0
            };
        });

        const activityMap = new Map<string, Set<string>>();
        activityLogs.forEach(log => {
            const dateStr = log.createdAt.toISOString().split('T')[0];
            if (!activityMap.has(dateStr)) activityMap.set(dateStr, new Set());
            activityMap.get(dateStr)?.add(log.userId);
        });

        const weeklyActivity = weeklyActivityData.map(item => ({
            day: item.day,
            count: activityMap.get(item.date)?.size || 0
        }));

        // Process Quiz Performance
        const categoryStats = new Map<string, { correct: number, total: number }>();
        quizAnswersRaw.forEach(ans => {
            const cat = ans.quiz.category || 'Umum';
            if (!categoryStats.has(cat)) categoryStats.set(cat, { correct: 0, total: 0 });
            const stat = categoryStats.get(cat)!;
            stat.total++;
            if (ans.isCorrect) stat.correct++;
        });

        const quizPerformance = Array.from(categoryStats.entries()).map(([category, stat]) => ({
            category,
            score: Math.round((stat.correct / stat.total) * 100),
            // Assign color based on score or random
            color: stat.correct / stat.total > 0.8 ? 'bg-green-500' : stat.correct / stat.total > 0.5 ? 'bg-blue-500' : 'bg-red-500'
        }));

        // If no quiz data, provide defaults or empty
        if (quizPerformance.length === 0) {
            // Optional: keep empty or mock for structure
        }

        const stats = {
            totalUsers,
            totalComics,
            totalVideos,
            totalQuizzes: totalQuizAttempts,
            recentActivity: recentUsers.map(u => ({
                user: u.username,
                action: 'mendaftar akun baru',
                target: '',
                time: u.createdAt.toISOString(),
                avatar: u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`
            })),
            weeklyActivity,
            quizPerformance
        };

        return successResponse(stats, 'Dashboard stats retrieved');

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        return serverErrorResponse('Gagal mengambil data dashboard');
    }
}
