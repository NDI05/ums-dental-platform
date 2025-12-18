import { z } from 'zod';

/**
 * Comprehensive Zod Validation Schemas
 * Centralized validation for all API endpoints
 */

// ============================================
// AUTH SCHEMAS
// ============================================

export const registerSchema = z.object({
    username: z.string().min(3, 'Username minimal 3 karakter').max(50, 'Username maksimal 50 karakter'),
    email: z.string().email('Format email tidak valid'),
    password: z
        .string()
        .min(6, 'Password minimal 6 karakter')
        .max(100, 'Password maksimal 100 karakter'),
    kelas: z.string().optional(),
});

export const loginSchema = z.object({
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(1, 'Password tidak boleh kosong'),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Password lama tidak boleh kosong'),
    newPassword: z.string().min(6, 'Password baru minimal 6 karakter').max(100),
});

export const updateProfileSchema = z.object({
    username: z.string().min(3).max(50).optional(),
    kelas: z.string().optional(),
    avatarUrl: z.string().url('Format URL avatar tidak valid').optional(),
});

// ============================================
// VIDEO SCHEMAS
// ============================================

export const createVideoSchema = z.object({
    title: z.string().min(1, 'Judul tidak boleh kosong').max(200),
    description: z.string().optional(),
    youtubeUrl: z.string().url('Format URL YouTube tidak valid'),
    duration: z.coerce.number().int().nonnegative().default(0),
    thumbnailUrl: z.string().url().optional(),
    category: z.string().optional(),
    pointReward: z.number().int().nonnegative('Poin reward minimal 0').default(10),
    keyPoints: z.array(z.string()).optional().default([]),
});

export const updateVideoSchema = createVideoSchema.partial().extend({
    isPublished: z.boolean().optional(),
});

// ============================================
// QUIZ SCHEMAS
// ============================================

export const createQuizQuestionSchema = z.object({
    question: z.string().min(1, 'Pertanyaan wajib diisi'),
    answer: z.boolean(),
    explanation: z.string().optional(),
    category: z.string().optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('EASY'),
    isActive: z.boolean().optional().default(true),
});

export const updateQuizQuestionSchema = createQuizQuestionSchema.partial();


export const submitQuizSchema = z.object({
    answers: z.array(
        z.object({
            questionId: z.string().uuid(),
            answer: z.boolean(),
        })
    ),
    timeSpent: z.number().int().nonnegative().optional(),
});

// ============================================
// COMIC SCHEMAS
// ============================================

export const createComicSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    author: z.string().optional(),
    coverImageUrl: z.string(),
    pointReward: z.number().int().nonnegative().default(20),
    pages: z.array(
        z.object({
            pageNumber: z.number().int().positive(),
            imageUrl: z.string(),
        })
    ),
    isPublished: z.boolean().optional().default(false),
});

export const updateComicSchema = createComicSchema.partial();

// ============================================
// GAME SCHEMAS
// ============================================

export const createGameSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    thumbnailUrl: z.string().url(),
    gameUrl: z.string().url(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    sortOrder: z.number().int().nonnegative().default(0),
    pointReward: z.number().int().nonnegative().default(5),
    hints: z.array(
        z.object({
            hintText: z.string(),
            unlockCost: z.number().int().nonnegative(),
        })
    ).optional().default([]),
    isPublished: z.boolean().optional().default(false),
});

export const updateGameSchema = createGameSchema.partial();

// ============================================
// USER MANAGEMENT SCHEMAS
// ============================================

export const createUserSchema = registerSchema.extend({
    role: z.enum(['STUDENT', 'CONTENT_MANAGER', 'SUPER_ADMIN', 'TEACHER']).default('STUDENT'),
});

export const updateUserSchema = z.object({
    username: z.string().min(3).max(50).optional(),
    email: z.string().email().optional(),
    kelas: z.string().optional(),
    role: z.enum(['STUDENT', 'CONTENT_MANAGER', 'SUPER_ADMIN', 'TEACHER']).optional(),
    password: z.string().min(6).optional(), // Allow password reset
});

export const blockUserSchema = z.object({
    blocked: z.boolean(),
    blockReason: z.string().optional(),
});

// ============================================
// PAGINATION & FILTERING
// ============================================

export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sortBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('desc'),
});

export const videoFilterSchema = paginationSchema.extend({
    category: z.string().optional(),
    search: z.string().optional(),
});

export const quizFilterSchema = paginationSchema.extend({
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    search: z.string().optional(),
});

export const userFilterSchema = paginationSchema.extend({
    role: z.enum(['STUDENT', 'CONTENT_MANAGER', 'SUPER_ADMIN', 'TEACHER']).optional(),
    kelas: z.string().optional(),
    search: z.string().optional(),
});

