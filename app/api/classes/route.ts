import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, validationErrorResponse, unauthorizedResponse, forbiddenResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Validation Schema
const createClassSchema = z.object({
    name: z.string().min(1, 'Nama kelas tidak boleh kosong'),
});

export async function GET(request: NextRequest) {
    try {
        // Optional: Public or Protected? 
        // Register page needs it public or generic. Let's make it public for simplicity or verify basic token?
        // User registration interacts with public API.
        // Let's assume public generic access IS needed for registration dropdown.
        // BUT usually we might want to restrict lists. 
        // However, for a registration form, fetching the list of classes is harmless.
        // I will allow public access if no token, OR verify token if present for admin features.
        // Actually, simple GET /api/classes should be public for the Register page.

        // Check if query param sort exists
        const classes = await prisma.schoolClass.findMany({
            orderBy: { name: 'asc' },
        });

        return successResponse(classes, 'Berhasil mengambil data kelas');
    } catch (error) {
        return serverErrorResponse('Gagal mengambil data kelas');
    }
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return unauthorizedResponse('Token tidak ditemukan');
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        if (!decoded || (decoded.role !== 'SUPER_ADMIN' && decoded.role !== 'CONTENT_MANAGER' && decoded.role !== 'TEACHER')) {
            return forbiddenResponse('Anda tidak memiliki akses');
        }

        const body = await request.json();
        const validatedData = createClassSchema.parse(body);

        const existingClass = await prisma.schoolClass.findUnique({
            where: { name: validatedData.name },
        });

        if (existingClass) {
            return validationErrorResponse({ name: { _errors: ['Kelas sudah ada'] } });
        }

        const newClass = await prisma.schoolClass.create({
            data: { name: validatedData.name },
        });

        return successResponse(newClass, 'Kelas berhasil dibuat', 201);
    } catch (error) {
        console.error('Error creating class:', error);
        if (error instanceof z.ZodError) {
            return validationErrorResponse(error.format());
        }
        return serverErrorResponse('Gagal membuat kelas');
    }
}
