import { successResponse } from '@/lib/api-response';

// For now, logout is handled client-side by removing the token
// In future, we can implement token blacklisting if needed
export async function POST() {
    // Optional: Add token to blacklist in Redis/Database
    // For MVP, client-side token removal is sufficient

    return successResponse(null, 'Logout berhasil');
}
