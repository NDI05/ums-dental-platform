import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { z } from 'zod';

// Validation schema
const registerSchema = z.object({
    username: z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().min(8),
    kelas: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate request body
        const validatedData = registerSchema.parse(body);

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: validatedData.email },
                    { username: validatedData.username },
                ],
            },
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'DUPLICATE_ERROR',
                        message: existingUser.email === validatedData.email
                            ? 'Email sudah terdaftar'
                            : 'Username sudah digunakan',
                    },
                },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(validatedData.password);

        // Create user
        const user = await prisma.user.create({
            data: {
                username: validatedData.username,
                email: validatedData.email,
                password: hashedPassword,
                kelas: validatedData.kelas,
                role: 'STUDENT',
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                kelas: true,
                totalPoints: true,
                avatarUrl: true,
                createdAt: true,
            },
        });

        // Generate tokens
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = generateRefreshToken({ userId: user.id });

        return NextResponse.json(
            {
                success: true,
                message: 'Registrasi berhasil',
                data: {
                    user,
                    tokens: {
                        accessToken,
                        refreshToken,
                    },
                },
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Data tidak valid',
                        details: error.format(),
                    },
                },
                { status: 400 }
            );
        }

        console.error('Register error:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Terjadi kesalahan server',
                },
            },
            { status: 500 }
        );
    }
}
