import { NextRequest } from 'next/server';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const resolvedParams = await params;
    const videoId = resolvedParams.id;

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

        // 1. Record the View (Upsert to update timestamp if re-watched)
        // ... (view recording logic stays same)

        const view = await prisma.videoView.upsert({
            where: {
                userId_videoId: {
                    userId,
                    videoId
                }
            },
            create: {
                userId,
                videoId,
                completed: true,
                watchedAt: new Date()
            },
            update: {
                watchedAt: new Date(),
                completed: true
            }
        });

        // 2. Award Points (Daily Limit per Content)
        // Check if point transaction exists FOR THIS CONTENT, TODAY
        const existingPoint = await prisma.pointTransaction.findFirst({
            where: {
                userId,
                activityType: 'VIDEO_WATCHED',
                referenceId: videoId,
                createdAt: {
                    gte: today
                }
            }
        });

        let pointsAwarded = 0;

        if (!existingPoint) {
            const points = 50; // Base points for video
            await prisma.$transaction([
                prisma.pointTransaction.create({
                    data: {
                        userId,
                        activityType: 'VIDEO_WATCHED',
                        pointsEarned: points,
                        referenceId: videoId,
                        referenceType: 'video',
                        description: 'Menonton Video Edukasi'
                    }
                }),
                prisma.user.update({
                    where: { id: userId },
                    data: { totalPoints: { increment: points } }
                })
            ]);
            pointsAwarded = points;
        }

        return successResponse({
            viewId: view.id,
            pointsAwarded
        }, 'View recorded');

    } catch (error) {
        console.error('Video tracking error:', error);
        return serverErrorResponse('Gagal mencatat view');
    }
}
