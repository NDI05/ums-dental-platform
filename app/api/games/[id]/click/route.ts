import { NextRequest } from 'next/server';
import { successResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const resolvedParams = await params;

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

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user || user.role !== 'STUDENT') {
            return forbiddenResponse('Hanya student yang bisa play game');
        }

        // Check if game exists
        const game = await prisma.miniGame.findUnique({
            where: { id: resolvedParams.id },
        });

        if (!game) {
            return notFoundResponse('Game');
        }

        // Track game click
        const gameClick = await prisma.$transaction(async (tx) => {
            // Create click record
            const click = await tx.gameClick.create({
                data: {
                    userId: decoded.userId,
                    gameId: resolvedParams.id,
                },
            });

            // Increment game click count
            await tx.miniGame.update({
                where: { id: resolvedParams.id },
                data: { clickCount: { increment: 1 } },
            });

            // Award small points for playing (5 points, not too much to prevent gaming)
            await tx.pointTransaction.create({
                data: {
                    userId: decoded.userId,
                    activityType: 'GAME_PLAYED',
                    pointsEarned: 5,
                    referenceId: resolvedParams.id,
                    referenceType: 'game',
                    description: `Bermain game: ${game.title}`,
                },
            });

            await tx.user.update({
                where: { id: decoded.userId },
                data: { totalPoints: { increment: 5 } },
            });

            return click;
        });

        return successResponse(
            { gameClick, pointsEarned: 5 },
            'Game dibuka! +5 poin!'
        );
    } catch (error) {
        console.error('Track game click error:', error);
        return serverErrorResponse('Terjadi kesalahan saat tracking game');
    }
}
