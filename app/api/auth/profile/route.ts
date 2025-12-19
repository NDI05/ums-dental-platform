import { NextRequest, connection } from 'next/server';
import { z } from 'zod';
import { successResponse, unauthorizedResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api-response';
import { verifyToken } from '@/lib/auth';
import { updateProfileSchema } from '@/lib/validations';
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
            return unauthorizedResponse('Token tidak valid atau expired');
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                kelas: true,
                avatarUrl: true,
                totalPoints: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return unauthorizedResponse('User tidak ditemukan');
        }

        return successResponse(user, 'Profile berhasil diambil');
    } catch (error) {
        console.error('Get profile error:', error);
        return serverErrorResponse('Terjadi kesalahan saat mengambil profile');
    }
}


export async function PUT(request: NextRequest) {
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

        const body = await request.json();

        // Validate input
        const validatedData = updateProfileSchema.parse(body);

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: decoded.userId },
            data: validatedData,
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                kelas: true,
                avatarUrl: true,
                totalPoints: true,
                updatedAt: true,
            },
        });

        return successResponse(updatedUser, 'Profile berhasil diupdate');
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationErrorResponse(error.format());
        }
        console.error('Update profile error:', error);
        return serverErrorResponse('Terjadi kesalahan saat update profile');
    }
}
