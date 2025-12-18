import { useAuthStore } from './store/auth';

interface ApiFetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

export async function apiFetch(url: string, options: ApiFetchOptions = {}) {
    const { accessToken, logout } = useAuthStore.getState();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            // Token expired or invalid
            logout(); // Clear state

            // Redirect to login if not already there
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
                window.location.href = '/login';
            }

            throw new Error('Session expired');
        }

        return response;
    } catch (error) {
        throw error;
    }
}
