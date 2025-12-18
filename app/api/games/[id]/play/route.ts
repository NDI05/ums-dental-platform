import { NextRequest } from 'next/server';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const resolvedParams = await params;
    const gameId = resolvedParams.id;

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

        // 1. Record the Click
        const click = await prisma.gameClick.create({
            data: {
                userId,
                gameId,
            }
        });

        // 2. Award Points (Daily Limit per Content)
        // Check if previously played THIS game TODAY
        const existingPoint = await prisma.pointTransaction.findFirst({
            where: {
                userId,
                activityType: 'GAME_PLAYED',
                referenceId: gameId,
                createdAt: {
                    gte: today
                }
            }
        });

        let pointsAwarded = 0;

        if (!existingPoint) {
            const points = 20; // Base points for game
            await prisma.$transaction([
                prisma.pointTransaction.create({
                    data: {
                        userId,
                        activityType: 'GAME_PLAYED',
                        pointsEarned: points,
                        referenceId: gameId,
                        referenceType: 'game',
                        description: 'Bermain Game Edukasi'
                    }
                }),
                prisma.user.update({
                    where: { id: userId },
                    data: { totalPoints: { increment: points } }
                }),
                prisma.miniGame.update({
                    where: { id: gameId },
                    data: { clickCount: { increment: 1 } }
                })
            ]);
            pointsAwarded = points;
        } else {
            // Just update view count
            await prisma.miniGame.update({
                where: { id: gameId },
                data: { clickCount: { increment: 1 } }
            });
        }

        return successResponse({
            clickId: click.id,
            pointsAwarded
        }, 'Game play recorded');

    } catch (error) {
        console.error('Game tracking error:', error);
        return serverErrorResponse('Gagal mencatat aktivitas game');
    }
}
