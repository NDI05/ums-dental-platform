import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, validationErrorResponse, unauthorizedResponse, forbiddenResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        try {
            const token = getTokenFromRequest(request);

            if (!token) {
                return unauthorizedResponse('Token tidak ditemukan');
            }
            const decoded = verifyToken(token);

            if (!decoded) {
                return unauthorizedResponse('Token tidak valid atau expired');
            }

            // Only Admin or Content Manager can list users
            if (decoded.role !== 'SUPER_ADMIN' && decoded.role !== 'CONTENT_MANAGER') {
                return forbiddenResponse('Anda tidak memiliki akses');
            }

            const { searchParams } = new URL(request.url);

            const params = {
                page: searchParams.get('page') || '1',
                limit: searchParams.get('limit') || '10',
                search: searchParams.get('search') || undefined,
                role: searchParams.get('role') || undefined,
                kelas: searchParams.get('kelas') || undefined, // Keep kelas for now, as it's used in where clause
            };

            try {
                const validated = z.object({
                    page: z.coerce.number().min(1).default(1),
                    limit: z.coerce.number().min(1).max(100).default(10),
                    role: z.enum(['SUPER_ADMIN', 'CONTENT_MANAGER', 'STUDENT']).optional(),
                    kelas: z.string().optional(),
                    search: z.string().optional(),
                }).parse(params);

                const { page, limit, role, kelas, search } = validated;
                const skip = (page - 1) * limit;

                // Build where clause
                const where: Prisma.UserWhereInput = {};

                if (role) {
                    where.role = role;
                }

                if (kelas) {
                    where.kelas = kelas;
                }

                if (search) {
                    where.OR = [
                        { username: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                    ];
                }

                const [users, total] = await Promise.all([
                    prisma.user.findMany({
                        where,
                        skip,
                        take: limit,
                        orderBy: { createdAt: 'desc' },
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            role: true,
                            kelas: true,
                            avatarUrl: true,
                            totalPoints: true,
                            createdAt: true,
                            _count: {
                                select: {
                                    videoViews: true,
                                    quizAttempts: true
                                }
                            }
                        },
                    }),
                    prisma.user.count({ where }),
                ]);

                return successResponse(
                    {
                        data: users,
                        pagination: {
                            page,
                            limit,
                            total,
                            totalPages: Math.ceil(total / limit),
                        },
                    },
                    'Berhasil mengambil daftar user'
                );
            } catch (error) {
                if (error instanceof z.ZodError) {
                    return validationErrorResponse(error.format());
                }
                return unauthorizedResponse('Token tidak valid');
            }
        } catch (error: unknown) {
            return errorResponse(
                error instanceof Error ? error.message : 'Internal Server Error',
                'INTERNAL_SERVER_ERROR',
                error
            );
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
            if (!decoded) {
                return unauthorizedResponse('Token tidak valid atau expired');
            }

            if (decoded.role !== 'SUPER_ADMIN' && decoded.role !== 'CONTENT_MANAGER') {
                return forbiddenResponse('Anda tidak memiliki akses');
            }

            const body = await request.json();
            const { createUserSchema } = await import('@/lib/validations');
            const { hashPassword } = await import('@/lib/auth'); // Import dynamically or ensure it's imported at top

            const validatedData = createUserSchema.parse(body);

            // Check duplicates
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: validatedData.email },
                        { username: validatedData.username },
                    ],
                },
            });

            if (existingUser) {
                return validationErrorResponse({
                    email: existingUser.email === validatedData.email ? { _errors: ['Email sudah terdaftar'] } : undefined,
                    username: existingUser.username === validatedData.username ? { _errors: ['Username sudah digunakan'] } : undefined,
                });
            }

            const hashedPassword = await hashPassword(validatedData.password);

            const user = await prisma.user.create({
                data: {
                    username: validatedData.username,
                    email: validatedData.email,
                    password: hashedPassword,
                    kelas: validatedData.kelas,
                    role: validatedData.role,
                    totalPoints: 0,
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    kelas: true,
                    createdAt: true,
                },
            });

            return successResponse(user, 'User berhasil dibuat', 201);

        } catch (error) {
            if (error instanceof z.ZodError) {
                return validationErrorResponse(error.format());
            }
            console.error('Create User Error:', error);
            return serverErrorResponse('Gagal membuat user');
        }
    }
