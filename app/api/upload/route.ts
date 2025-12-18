import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string || 'general'; // 'comic', 'cover', 'avatar', 'general'

        if (!file) {
            return NextResponse.json(
                { success: false, message: 'No file uploaded' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const filename = `${uuidv4()}-${file.name.replace(/\s/g, '-')}`;

        // Determine subdirectory based on type or date
        const date = new Date();
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');

        // Structure: public/uploads/year/month/filename
        // This keeps things organized
        const relativeDir = `uploads/${year}/${month}`;
        const uploadDir = path.join(process.cwd(), 'public', relativeDir);

        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });

        // Write file
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        // Return public URL
        const publicUrl = `/${relativeDir}/${filename}`;

        return NextResponse.json({
            success: true,
            data: {
                url: publicUrl,
                filename: filename,
                originalName: file.name,
                size: file.size,
                type: file.type
            }
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, message: 'Upload failed', error: String(error) },
            { status: 500 }
        );
    }
}
