import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
    (config) => {
        // We'll read from localStorage closer to the usage or use a state manager like Zustand
        // ideally, we check for a token in localStorage
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors (e.g. 401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Optional: Global error handling (e.g. redirect to login on 401)
        if (error.response && error.response.status === 401) {
            // Only redirect if we are not already on login/register pages
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
                // Clear token and redirect (optional)
                // localStorage.removeItem('accessToken');
                // window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
