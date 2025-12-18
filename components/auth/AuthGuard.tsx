'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';

interface AuthGuardProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, accessToken, logout, setAuth } = useAuthStore();
    const [authorized, setAuthorized] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            // 1. If we have a token in store, validate it
            if (accessToken && user) {
                try {
                    const payload = JSON.parse(atob(accessToken.split('.')[1]));
                    const isExpired = payload.exp * 1000 < Date.now();

                    if (isExpired) {
                        console.log('Token expired, logging out...');
                        logout();
                        router.push('/login');
                        return;
                    }

                    // Role check
                    if (allowedRoles && allowedRoles.length > 0) {
                        if (!allowedRoles.includes(user.role)) {
                            console.log(`User role ${user.role} not authorized for ${pathname}`);
                            if (user.role === 'STUDENT') {
                                router.push('/dashboard');
                            } else {
                                router.push('/admin/dashboard');
                            }
                            return;
                        }
                    }

                    setAuthorized(true);
                    setIsChecking(false);
                    return;
                } catch (e) {
                    console.error('Invalid token format', e);
                    logout();
                    // Fallthrough to server check (just in case cookie is valid)
                }
            }

            // 2. Session Recovery: Token missing in store? Check server session (Cookie)
            try {
                const res = await fetch('/api/auth/me', {
                    headers: { 'Content-Type': 'application/json' },
                    // defaults to credentials: include if same-origin, but explicit is safer
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data.user) {
                        console.log('Session recovered via Cookie!');
                        // Hydrate store
                        setAuth(data.data.user, data.data.accessToken);
                        // Re-run this effect will essentially happen or we can just authorize here
                        // For simplicity, let's authorize

                        // Check Role (Server recovered user)
                        if (allowedRoles && allowedRoles.length > 0) {
                            if (!allowedRoles.includes(data.data.user.role)) {
                                if (data.data.user.role === 'STUDENT') {
                                    router.push('/dashboard');
                                } else {
                                    router.push('/admin/dashboard');
                                }
                                return;
                            }
                        }

                        setAuthorized(true);
                        setIsChecking(false);
                        return;
                    }
                }
            } catch (error) {
                console.error('Session recovery failed', error);
            }

            // 3. Final Fail
            console.log('No session found. Redirecting to login.');
            // Only redirect if we are truly not authorized
            logout();
            router.push('/login');
        };

        checkAuth();
    }, [accessToken, user, allowedRoles, router, logout, pathname, setAuth]);

    if (isChecking) {
        // Replace with a nice Loading Spinner component
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!authorized) return null;

    return <>{children}</>;
}
