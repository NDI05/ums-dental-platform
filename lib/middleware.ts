import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, TokenPayload } from '@/lib/auth';

export interface AuthenticatedRequest extends NextRequest {
    user?: TokenPayload;
}

export async function withAuth(
    request: NextRequest,
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
    allowedRoles?: string[]
): Promise<NextResponse> {
    try {
        // Extract token from Authorization header
        const authHeader = request.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Token tidak ditemukan',
                    },
                },
                { status: 401 }
            );
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify token
        const payload = verifyAccessToken(token);

        if (!payload) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Token tidak valid atau sudah kadaluarsa',
                    },
                },
                { status: 401 }
            );
        }

        // Check role authorization
        if (allowedRoles && !allowedRoles.includes(payload.role)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'FORBIDDEN',
                        message: 'Anda tidak memiliki akses ke resource ini',
                    },
                },
                { status: 403 }
            );
        }

        // Attach user to request
        const authRequest = request as AuthenticatedRequest;
        authRequest.user = payload;

        // Call the handler
        return await handler(authRequest);
    } catch (error) {
        console.error('Auth middleware error:', error);
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
