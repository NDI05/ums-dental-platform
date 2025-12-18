import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, unauthorizedResponse, validationErrorResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';
import { verifyToken, comparePassword, hashPassword } from '@/lib/auth';
import { changePasswordSchema } from '@/lib/validations';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
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
        const { currentPassword, newPassword } = changePasswordSchema.parse(body);

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) {
            return unauthorizedResponse('User tidak ditemukan');
        }

        // Verify current password
        const isPasswordValid = await comparePassword(currentPassword, user.password);

        if (!isPasswordValid) {
            return errorResponse('Password lama tidak sesuai', 'INVALID_PASSWORD', null, 400);
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update password
        await prisma.user.update({
            where: { id: decoded.userId },
            data: { password: hashedPassword },
        });

        return successResponse(null, 'Password berhasil diubah');
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationErrorResponse(error.format());
        }
        console.error('Change password error:', error);
        return serverErrorResponse('Terjadi kesalahan saat mengubah password');
    }
}
