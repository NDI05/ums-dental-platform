import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    username: string;
    email: string;
    role: 'STUDENT' | 'CONTENT_MANAGER' | 'SUPER_ADMIN';
    totalPoints: number;
    avatarUrl?: string;
    kelas?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    login: (user: User, accessToken: string) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            login: (user, accessToken) => {
                // Also set localStorage for axios interceptor immediately if needed, 
                // though persist middleware handles it asynchronously usually.
                // We'll rely on persist middleware or manual setting in login component.
                if (typeof window !== 'undefined') {
                    localStorage.setItem('accessToken', accessToken);
                }
                set({ user, accessToken, isAuthenticated: true });
            },
            logout: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken');
                }
                set({ user: null, accessToken: null, isAuthenticated: false });
            },
            updateUser: (updates) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null,
                })),
        }),
        {
            name: 'auth-storage', // name of the item in the storage (must be unique)
        }
    )
);
