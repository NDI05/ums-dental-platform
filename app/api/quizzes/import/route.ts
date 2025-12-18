import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { unauthorizedResponse, forbiddenResponse, successResponse, errorResponse } from '@/lib/api-response';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { z } from 'zod';

// Define Validation Schema for Row
const quizRowSchema = z.object({
    Question: z.string().min(5, "Pertanyaan terlalu pendek"),
    Category: z.string().optional().default('Umum'),
    Difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('EASY'),
    Answer: z.string().transform(val => String(val).toUpperCase() === 'TRUE'),
    Explanation: z.string().optional().default('')
});

export async function POST(request: NextRequest) {
    try {
        // 1. Auth Check
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return unauthorizedResponse('Token tidak ditemukan');
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (!decoded) {
            return unauthorizedResponse('Token tidak valid');
        }

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || !['TEACHER', 'SUPER_ADMIN', 'CONTENT_MANAGER'].includes(user.role)) {
            return forbiddenResponse('Hanya Guru/Admin yang bisa import soal');
        }

        // 2. Parse FormData
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return errorResponse('File tidak ditemukan', 'VALIDATION_ERROR', null, 400);
        }

        // 3. Read File Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 4. Parse Excel
        const wb = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(ws);

        if (rawData.length === 0) {
            return errorResponse('File Excel kosong', 'VALIDATION_ERROR', null, 400);
        }

        // Fetch all categories for lookup
        const allCategories = await prisma.quizCategory.findMany();
        const categoryMap = new Map(allCategories.map(c => [c.name.toLowerCase(), c.id]));

        // Find or create 'Umum' category as fallback
        let defaultCategoryId = categoryMap.get('umum');
        if (!defaultCategoryId) {
            const umum = await prisma.quizCategory.upsert({
                where: { name: 'Umum' },
                update: {},
                create: { name: 'Umum', description: 'Kategori Default' }
            });
            defaultCategoryId = umum.id;
        }

        // 5. Validate and Transform Data
        const validQuizzes = [];
        const errors = [];

        for (const [index, row] of rawData.entries()) {
            try {
                // Normalize keys
                const normalizedRow: any = {};
                Object.keys(row as any).forEach(key => {
                    normalizedRow[key.trim()] = (row as any)[key];
                });

                const parsed = quizRowSchema.parse({
                    Question: normalizedRow['Question'],
                    Category: normalizedRow['Category'],
                    Difficulty: normalizedRow['Difficulty'] ? normalizedRow['Difficulty'].toUpperCase() : 'EASY',
                    Answer: normalizedRow['Answer'],
                    Explanation: normalizedRow['Explanation']
                });

                // Match Category
                let categoryId = defaultCategoryId;
                let categoryName = 'Umum';

                if (parsed.Category) {
                    const matchedId = categoryMap.get(parsed.Category.trim().toLowerCase());
                    if (matchedId) {
                        categoryId = matchedId;
                        categoryName = parsed.Category.trim(); // Keep original casing
                    } else {
                        // Optional: Auto-create new category?
                        // For now, let's keep it robust and fallback to 'Umum' if strictly not found, 
                        // OR create it. Given user wants "Management", auto-creation might bypass management.
                        // But for import convenience, let's auto-create.
                        try {
                            const newCat = await prisma.quizCategory.create({
                                data: { name: parsed.Category.trim() }
                            });
                            categoryId = newCat.id;
                            categoryName = newCat.name; // Use new name
                            categoryMap.set(categoryName.toLowerCase(), categoryId); // Update cache
                        } catch (e) {
                            // If race condition or error, fallback
                        }
                    }
                }

                validQuizzes.push({
                    question: parsed.Question,
                    category: categoryName, // Keep string for now
                    categoryId: categoryId!, // Link Relation
                    difficulty: parsed.Difficulty,
                    answer: parsed.Answer,
                    explanation: parsed.Explanation,
                    createdById: user.id,
                    isActive: true
                });

            } catch (err: any) {
                errors.push(`Baris ${index + 2}: ${err.errors ? err.errors[0].message : err.message}`);
            }
        }

        if (validQuizzes.length === 0) {
            return errorResponse(`Gagal import. Semua baris bermasalah. ${errors.slice(0, 3).join(', ')}`, 'VALIDATION_ERROR', errors, 400);
        }

        // 6. Bulk Insert
        await prisma.quiz.createMany({
            data: validQuizzes
        });

        return successResponse({
            imported: validQuizzes.length,
            failed: errors.length,
            errors: errors.slice(0, 5) // Return first 5 errors only
        }, `Berhasil mengimport ${validQuizzes.length} soal.`);

    } catch (error: any) {
        console.error('Import Error:', error);
        return errorResponse(error.message || 'Gagal memproses file import', 'INTERNAL_SERVER_ERROR', error, 500);
    }
}
