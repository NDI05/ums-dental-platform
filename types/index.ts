export interface DecodedToken {
    id: string;
    username: string;
    role: string;
    iat: number;
    exp: number;
    [key: string]: unknown; // Safer than any
}

export interface User {
    id: string;
    username: string;
    role: 'STUDENT' | 'CONTENT_MANAGER' | 'SUPER_ADMIN';
    totalPoints: number;
    createdAt: Date;
    updatedAt: Date;
}
