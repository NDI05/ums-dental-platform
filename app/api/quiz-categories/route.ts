import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { unauthorizedResponse, errorResponse, successResponse, forbiddenResponse } from '@/lib/api-response';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createCategorySchema = z.object({
    name: z.string().min(1, "Nama kategori wajib diisi"),
    description: z.string().optional()
});

export async function GET(req: NextRequest) {
    try {
        const categories = await prisma.quizCategory.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { quizzes: true }
                }
            }
        });

        return successResponse(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return errorResponse('Gagal mengambil data kategori', 'INTERNAL_SERVER_ERROR', error, 500);
    }
}

export async function POST(req: NextRequest) {
    try {
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
        const validatedData = createCategorySchema.parse(body);

        // Check duplicate
        const existing = await prisma.quizCategory.findUnique({
            where: { name: validatedData.name }
        });

        if (existing) {
            return errorResponse('Kategori dengan nama ini sudah ada', 'DUPLICATE_ENTRY', null, 400);
        }

        const newCategory = await prisma.quizCategory.create({
            data: {
                name: validatedData.name,
                description: validatedData.description
            }
        });

        return successResponse(newCategory, 'Kategori berhasil dibuat');

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return errorResponse(error.errors[0].message, 'VALIDATION_ERROR', error.errors, 400);
        }
        console.error('Category Create Error:', error);
        return errorResponse('Gagal membuat kategori', 'INTERNAL_SERVER_ERROR', error.message, 500);
    }
}
