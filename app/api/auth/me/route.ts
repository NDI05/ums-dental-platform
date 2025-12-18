import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // Use the helper to get token from Cookie or Header
        const token = getTokenFromRequest(request);

        if (!token) {
            return NextResponse.json({ success: false, message: 'No session' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        // Fetch fresh user data (optional, but good for role sync)
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                role: true,
                username: true,
                avatarUrl: true,
            }
        });

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            data: {
                user,
                accessToken: token, // Echo back token if needed for local store (or just confirm validity)
            }
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
