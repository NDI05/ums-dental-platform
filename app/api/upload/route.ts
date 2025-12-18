import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/storage';
import { errorResponse, successResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string || 'general'; // 'comic', 'cover', 'avatar', 'general'

        if (!file) {
            return errorResponse('No file uploaded', 'VALIDATION_ERROR', null, 400);
        }

        // Validate basic file type if needed (though client compresses)
        if (!file.type.startsWith('image/')) {
            return errorResponse('Only image files are allowed', 'VALIDATION_ERROR', null, 400);
        }

        // Use 'type' as folder name in storage
        const folder = type === 'cover' ? 'covers' : type === 'comic' ? 'pages' : 'misc';

        // Upload to Supabase Storage
        const publicUrl = await uploadFile(file, folder);

        return successResponse({
            url: publicUrl,
            filename: file.name,
            size: file.size,
            type: file.type
        }, 'Upload successful');

    } catch (error: any) {
        console.error('Upload API Error:', error);
        return errorResponse(error.message || 'Upload failed', 'INTERNAL_SERVER_ERROR', null, 500);
    }
}
