import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { unauthorizedResponse, errorResponse, successResponse, forbiddenResponse } from '@/lib/api-response';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateCategorySchema = z.object({
    name: z.string().min(1, "Nama kategori wajib diisi"),
    description: z.string().optional()
});

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return unauthorizedResponse('Token tidak ditemukan');
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (!decoded) return unauthorizedResponse('Token tidak valid');

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || user.role === 'STUDENT') {
            return forbiddenResponse('Akses ditolak');
        }

        const body = await req.json();
        const validatedData = updateCategorySchema.parse(body);

        // Check duplicate name (excluding self)
        const duplicate = await prisma.quizCategory.findFirst({
            where: {
                name: validatedData.name,
                id: { not: id }
            }
        });

        if (duplicate) {
            return errorResponse('Nama kategori sudah digunakan', 'DUPLICATE_ENTRY', null, 400);
        }

        const updatedCategory = await prisma.quizCategory.update({
            where: { id },
            data: validatedData
        });

        return successResponse(updatedCategory, 'Kategori berhasil diperbarui');
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return errorResponse((error as any).errors[0].message, 'VALIDATION_ERROR', (error as any).errors, 400);
        }
        return errorResponse(error.message || 'Gagal update kategori', 'INTERNAL_SERVER_ERROR', error, 500);
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) return unauthorizedResponse();

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (!decoded) return unauthorizedResponse();

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || user.role === 'STUDENT') return forbiddenResponse();

        // Check if usage exists
        const usageCount = await prisma.quiz.count({ where: { categoryId: id } });
        if (usageCount > 0) {
            return errorResponse(`Kategori ini digunakan oleh ${usageCount} soal. Hapus soal atau pindahkan kategori terlebih dahulu.`, 'CONSTRAINT_VIOLATION', null, 400);
        }

        await prisma.quizCategory.delete({ where: { id } });

        return successResponse(null, 'Kategori berhasil dihapus');
    } catch (error) {
        return errorResponse('Gagal menghapus kategori', 'INTERNAL_SERVER_ERROR', error, 500);
    }
}
