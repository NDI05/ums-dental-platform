import { z } from 'zod';

const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url(),

    // Auth (JWT)
    JWT_SECRET: z.string().min(1),
    JWT_REFRESH_SECRET: z.string().min(1),

    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1), // Required for server-side admin ops (storage delete, etc)
});

export const env = envSchema.parse(process.env);
