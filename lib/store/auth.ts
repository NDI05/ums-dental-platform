'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    role: string;
    username: string;
    avatarUrl?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            setAuth: (user, token) => set({ user, accessToken: token }),
            logout: async () => {
                try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                } catch (error) {
                    console.error('Logout failed', error);
                }
                set({ user: null, accessToken: null });
            },
            isAuthenticated: () => !!get().accessToken,
        }),
        {
            name: 'auth-storage',
        }
    )
);
