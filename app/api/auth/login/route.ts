import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { z } from 'zod';

// Validation schema
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate request body
        const validatedData = loginSchema.parse(body);

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Email atau password salah',
                    },
                },
                { status: 401 }
            );
        }

        // Check if user is blocked
        if (user.isBlocked) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'FORBIDDEN',
                        message: 'Akun Anda telah diblokir',
                    },
                },
                { status: 403 }
            );
        }

        // Verify password
        const isPasswordValid = await comparePassword(validatedData.password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Email atau password salah',
                    },
                },
                { status: 401 }
            );
        }

        // Generate tokens
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = generateRefreshToken({ userId: user.id });

        // Return user data without password
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;

        // Create response with user data
        const response = NextResponse.json({
            success: true,
            data: {
                user: userWithoutPassword,
                tokens: {
                    accessToken,
                    refreshToken,
                },
            },
        });

        // Set HTTP-only cookie for Edge Middleware
        response.cookies.set({
            name: 'token',
            value: accessToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return response;
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

        console.error('Login error:', error);
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
