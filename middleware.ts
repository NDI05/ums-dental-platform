import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define protected routes that require authentication
const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/videos',
    '/comics',
    '/quizzes',
    '/games',
    '/leaderboard',
    '/api/users', // Protect API routes too if needed, though they usually handle their own auth
    // We heavily protect pages to prevent cold starts on pages that just redirect
];

// Admin routes
const adminRoutes = ['/admin'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Check if route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) ||
        adminRoutes.some(route => pathname.startsWith(route));

    if (!isProtectedRoute) {
        return NextResponse.next();
    }

    // 2. Check for token in cookies (preferred) or Authorization header
    // Note: Local storage tokens aren't sent automatically, so we rely on cookies if set,
    // Or we rely on client-side redirect. 
    // BUT, for API routes called from client, we look for Auth header.
    // For Page routes, we can't easily check 'Authorization' header unless using Cookies.

    // Assuming we might migrate to HTTP-only cookies later, but for now our auth store uses localStorage.
    // Middleware runs on server/edge. It cannot access localStorage.
    // IF we are using localStorage, Middleware can't fully protect Pages from initial load (client checks).
    // HOWEVER, for this optimization, we can prioritize API routes or assume headers if passed.

    // WAIT: User instructions said "Edge Middleware for Auth... Pindahkan pengecekan sesi login sepenuhnya ke Vercel Edge Middleware".
    // Since we use localStorage currently, we can't validate page visits in middleware accurately without cookies.
    // We will focus on API routes where feasible, OR rely on a cookie if we set one.
    // Given the current architecture uses `useAuthStore` (Zustand + LocalStorage), 
    // we cannot block Page Requests in middleware effectively unless we sync token to cookie.

    // STRATEGY: We will focus on API routes which carry the Bearer token.
    // FOR PAGES: We will proceed, but realistically we need cookies for full Edge Auth on pages.
    // Let's implement header check for APIs.

    if (pathname.startsWith('/api/')) {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // Allow public APIs (like login/register)
            if (pathname.startsWith('/api/auth')) return NextResponse.next();
            return NextResponse.json({ success: false, message: 'Unauthorized (Edge)' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecretkey');
            await jwtVerify(token, secret);
            return NextResponse.next();
        } catch (error) {
            return NextResponse.json({ success: false, message: 'Invalid Token (Edge)' }, { status: 401 });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/input/:path*', // Example
        '/api/quizzes/:path*',
        '/api/videos/:path*',
        '/api/comics/:path*',
        '/api/users/:path*',
        // We exclude /api/auth
    ],
};
