import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';

// Password Hashing
export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
}

// JWT Token Generation
export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(payload: { userId: string }): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

// JWT Token Verification
export function verifyAccessToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
        return null;
    }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
    } catch {
        return null;
    }
}

// Extract token from Authorization header
export function extractToken(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.replace('Bearer ', '');
}

/**
 * Helper to get token from Request (Header OR Cookie)
 * Useful for APIs that supported both Client-side (Bearer) and Server-Refreshed (Cookie) requests
 */
import { NextRequest } from 'next/server';

export function getTokenFromRequest(request: NextRequest): string | null {
    // 1. Check Header (Bearer)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.replace('Bearer ', '');
    }

    // 2. Check Cookie (HTTPOnly)
    const cookieToken = request.cookies.get('token')?.value;
    if (cookieToken) {
        return cookieToken;
    }

    return null;
}

// Alias for backwards compatibility and cleaner imports
export const verifyToken = verifyAccessToken;

