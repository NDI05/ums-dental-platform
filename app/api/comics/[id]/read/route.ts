import { NextRequest } from 'next/server';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const resolvedParams = await params;
    const comicId = resolvedParams.id;

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

        // 1. Record the Read
        // schema: @@unique([userId, comicId])
        // Upsert to update startedAt/completedAt
        const read = await prisma.comicRead.upsert({
            where: {
                userId_comicId: {
                    userId,
                    comicId
                }
            },
            create: {
                userId,
                comicId,
                completed: true,
                startedAt: new Date(),
                completedAt: new Date()
            },
            update: {
                startedAt: new Date(),
                completed: true,
                completedAt: new Date()
            }
        });

        // 2. Award Points (Daily Limit per Content)
        const existingPoint = await prisma.pointTransaction.findFirst({
            where: {
                userId,
                activityType: 'COMIC_READ',
                referenceId: comicId,
                createdAt: {
                    gte: today
                }
            }
        });

        let pointsAwarded = 0;

        if (!existingPoint) {
            const points = 30; // Base points for comic
            await prisma.$transaction([
                prisma.pointTransaction.create({
                    data: {
                        userId,
                        activityType: 'COMIC_READ',
                        pointsEarned: points,
                        referenceId: comicId,
                        referenceType: 'comic',
                        description: 'Membaca Komik'
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
            readId: read.id,
            pointsAwarded
        }, 'Comic read recorded');

    } catch (error) {
        console.error('Comic tracking error:', error);
        return serverErrorResponse('Gagal mencatat baca komik');
    }
}
