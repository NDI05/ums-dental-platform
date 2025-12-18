import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse, serverErrorResponse, validationErrorResponse } from '@/lib/api-response';
import { verifyToken, hashPassword } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { updateUserSchema } from '@/lib/validations';

// ============================================
// GET /api/users/:id - Get User Detail
// ============================================

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        // Check permissions: admin or self
        const requestingUser = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!requestingUser) {
            return unauthorizedResponse('User tidak ditemukan');
        }

        const resolvedParams = await params;

        const canAccess =
            requestingUser.role === 'SUPER_ADMIN' ||
            requestingUser.role === 'CONTENT_MANAGER' ||
            requestingUser.id === resolvedParams.id;

        if (!canAccess) {
            return forbiddenResponse('Anda tidak memiliki akses');
        }

        // Get user details
        const user = await prisma.user.findUnique({
            where: { id: resolvedParams.id },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                kelas: true,
                avatarUrl: true,
                totalPoints: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        videoViews: true,
                        quizAttempts: true,
                        comicReads: true,
                        gameClicks: true,
                    },
                },
            },
        });

        if (!user) {
            return notFoundResponse('User');
        }

        // Calculate Ranking (Students only)
        let ranking = 0;
        if (user.role === 'STUDENT') {
            const betterUsersCount = await prisma.user.count({
                where: {
                    role: 'STUDENT',
                    totalPoints: {
                        gt: user.totalPoints
                    }
                }
            });
            ranking = betterUsersCount + 1;
        }

        return successResponse({ ...user, ranking }, 'Berhasil mengambil detail user');
    } catch (error) {
        console.error('Get user detail error:', error);
        return serverErrorResponse('Terjadi kesalahan saat mengambil detail user');
    }
}

// ============================================
// PUT /api/users/:id - Update User
// ============================================

export async function PUT(
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

        if (decoded.role !== 'SUPER_ADMIN' && decoded.role !== 'CONTENT_MANAGER') {
            return forbiddenResponse('Anda tidak memiliki akses');
        }

        const body = await request.json();
        const validatedData = updateUserSchema.parse(body);

        // Find existing user
        const existingUser = await prisma.user.findUnique({ where: { id: resolvedParams.id } });
        if (!existingUser) return notFoundResponse('User');

        const updateData: any = { ...validatedData };
        if (updateData.password) {
            updateData.password = await hashPassword(updateData.password);
        } else {
            delete updateData.password;
        }

        const updatedUser = await prisma.user.update({
            where: { id: resolvedParams.id },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                kelas: true,
                avatarUrl: true,
                updatedAt: true,
            }
        });

        return successResponse(updatedUser, 'User berhasil diupdate');

    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationErrorResponse(error.format());
        }
        console.error('Update User Error:', error);
        return serverErrorResponse('Gagal mengupdate user');
    }
}

// ============================================
// DELETE /api/users/:id - Delete User
// ============================================

export async function DELETE(
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

        if (decoded.role !== 'SUPER_ADMIN' && decoded.role !== 'CONTENT_MANAGER') {
            return forbiddenResponse('Anda tidak memiliki akses');
        }

        const existingUser = await prisma.user.findUnique({ where: { id: resolvedParams.id } });
        if (!existingUser) return notFoundResponse('User');

        if (existingUser.id === decoded.userId) {
            return forbiddenResponse('Anda tidak dapat menghapus akun sendiri');
        }

        await prisma.user.delete({ where: { id: resolvedParams.id } });

        return successResponse({ id: resolvedParams.id }, 'User berhasil dihapus');

    } catch (error) {
        console.error('Delete User Error:', error);
        return serverErrorResponse('Gagal menghapus user');
    }
}
