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
            return unauthorizedResponse('Token tidak valid');
        }

        const userId = decoded.userId;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch User and Today's Activities in parallel
        const [user, initialDailyLogin, videoViews, quizAttempts, gameClicks, comicReads] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, username: true, totalPoints: true, avatarUrl: true }
            }),
            prisma.pointTransaction.findFirst({
                where: { userId, activityType: 'DAILY_LOGIN', createdAt: { gte: today } }
            }),
            prisma.videoView.count({
                where: { userId, watchedAt: { gte: today } }
            }),
            prisma.quizAttempt.count({
                where: { userId, completedAt: { gte: today } }
            }),
            prisma.gameClick.count({
                where: { userId, clickedAt: { gte: today } }
            }),
            prisma.comicRead.count({
                where: { userId, startedAt: { gte: today } }
            })
        ]);

        if (!user) return unauthorizedResponse('User tidak ditemukan');

        let dailyLogin = initialDailyLogin;

        if (!dailyLogin) {
            // Auto-grant daily login points
            try {
                const points = 10;
                await prisma.$transaction(async (tx) => {
                    // Create transaction record
                    await tx.pointTransaction.create({
                        data: {
                            userId,
                            activityType: 'DAILY_LOGIN',
                            pointsEarned: points,
                            description: 'Login Harian'
                        }
                    });

                    // Update user points
                    await tx.user.update({
                        where: { id: userId },
                        data: { totalPoints: { increment: points } }
                    });
                });

                // Update local constraints to reflect the change
                // @ts-ignore - simplified for brevity, we just need it to be truthy and have basic fields if used later
                dailyLogin = { id: 'temp', userId, activityType: 'DAILY_LOGIN', pointsEarned: points, description: 'Login Harian', createdAt: new Date() };
                user.totalPoints += points;
            } catch (err) {
                console.error("Failed to grant daily login points", err);
            }
        }

        // Calculate Missions
        let completedMissions = 0;
        const totalMissions = 5;

        if (dailyLogin) completedMissions++; // Mission 1: Login
        if (videoViews > 0) completedMissions++; // Mission 2: Watch Video
        if (quizAttempts > 0) completedMissions++; // Mission 3: Do Quiz
        if (gameClicks > 0) completedMissions++; // Mission 4: Play Game
        if (comicReads > 0) completedMissions++; // Mission 5: Read Comic

        const missionDetails = [
            { id: 'login', label: 'Login Harian', isCompleted: !!dailyLogin },
            { id: 'video', label: 'Tonton 1 Video', isCompleted: videoViews > 0 },
            { id: 'quiz', label: 'Kerjakan 1 Kuis', isCompleted: quizAttempts > 0 },
            { id: 'comic', label: 'Baca 1 Komik', isCompleted: comicReads > 0 },
            { id: 'game', label: 'Main 1 Game', isCompleted: gameClicks > 0 }
        ];

        return successResponse({
            user: {
                name: user.username,
                avatar: user.avatarUrl,
                points: user.totalPoints,
            },
            missions: {
                completed: completedMissions,
                total: totalMissions,
                progress: Math.round((completedMissions / totalMissions) * 100),
                details: missionDetails
            }
        }, 'Dashboard data fetched');

    } catch (error) {
        console.error('Dashboard API Error:', error);
        return serverErrorResponse('Gagal memuat data dashboard');
    }
}
