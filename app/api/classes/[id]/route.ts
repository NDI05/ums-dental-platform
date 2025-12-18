import { NextRequest } from 'next/server';
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return unauthorizedResponse('Token tidak ditemukan');
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        if (!decoded || (decoded.role !== 'SUPER_ADMIN' && decoded.role !== 'CONTENT_MANAGER' && decoded.role !== 'TEACHER')) {
            return forbiddenResponse('Anda tidak memiliki akses');
        }

        await prisma.schoolClass.delete({
            where: { id },
        });

        return successResponse(null, 'Kelas berhasil dihapus');
    } catch (error) {
        return serverErrorResponse('Gagal menghapus kelas');
    }
}
