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
    const { user, accessToken, logout } = useAuthStore();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // 1. Check if token exists
        if (!accessToken || !user) {
            router.push('/auth/login');
            return;
        }

        // 2. Check token expiry (Basic JWT check)
        try {
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            const isExpired = payload.exp * 1000 < Date.now();

            if (isExpired) {
                console.log('Token expired, logging out...');
                logout();
                router.push('/auth/login');
                return;
            }
        } catch (e) {
            console.error('Invalid token format', e);
            logout();
            router.push('/auth/login');
            return;
        }

        // 3. Check Role
        if (allowedRoles && allowedRoles.length > 0) {
            if (!allowedRoles.includes(user.role)) {
                console.log(`User role ${user.role} not authorized for ${pathname}`);
                // Redirect based on role or to 403
                if (user.role === 'STUDENT') {
                    router.push('/dashboard');
                } else {
                    router.push('/admin/dashboard');
                }
                return;
            }
        }

        setAuthorized(true);
    }, [accessToken, user, allowedRoles, router, logout, pathname]);

    if (!authorized) {
        // Show nothing or a loading spinner while checking
        return null;
    }

    return <>{children}</>;
}
