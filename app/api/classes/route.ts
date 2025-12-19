import { NextRequest, connection } from 'next/server';
import { successResponse, serverErrorResponse } from '@/lib/api-response';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    await connection();
    try {
        const { searchParams } = new URL(request.url);
        // We can simulate pagination if needed, but for classes list (distinct strings), 
        // we might just return all unique values.

        // Fetch distinct classes from User table
        const usersWithClasses = await prisma.user.findMany({
            where: {
                kelas: { not: null }
            },
            select: {
                kelas: true
            },
            distinct: ['kelas']
        });

        // Map to expected format (id = name for string-based classes)
        const classes = usersWithClasses
            .map(u => u.kelas)
            .filter(Boolean)
            .sort()
            .map((name, index) => ({
                id: name, // Use name as ID since it's just a string now
                name: name,
                createdAt: new Date(), // Mock date
                updatedAt: new Date()
            }));

        return successResponse(
            classes,
            'Berhasil mengambil daftar kelas',
            200,
            {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
            }
        );
    } catch (error) {
        console.error('Get classes error:', error);
        return serverErrorResponse('Terjadi kesalahan saat mengambil daftar kelas');
    }
}
