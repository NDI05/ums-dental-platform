import { createClient } from '@supabase/supabase-js';

// We use process.env directly here or use our type-safe env. 
// However, using the env import might crash build time if envs aren't present in build environment.
// For safety in Next.js edge/serverless, we'll access process.env inside functions or use optional chaining if needed, 
// but for the 'hardening' phase we want to ensure keys exist.
// Let's rely on standard process.env for the client initialization to avoid build-time validation crashes if vars are missing during CI build (unless intended).

const getSupabaseClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        // During build time, these might be missing if using static generation for some pages
        // or if envs are not loaded. We throw only when actually used.
        throw new Error('Supabase URL and Service Key are required');
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    });
};

const BUCKET_NAME = 'comics'; // Define your bucket name

/**
 * Uploads a file to Supabase Storage.
 * @param file - The file to upload (File object)
 * @param path - Optional folder path (e.g., 'covers', 'pages')
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(file: File, folder: string = 'uploads'): Promise<string> {
    const supabase = getSupabaseClient();
    try {
        const timestamp = Date.now();
        // Sanitize filename: remove special chars, spaces
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${folder}/${timestamp}-${cleanName}`;

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type // Ensure correct content type (e.g. image/webp)
            });

        if (error) {
            console.error('[Storage] Upload error:', error);
            throw new Error(`Upload failed: ${error.message}`);
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('[Storage] Upload Exception:', error);
        throw error;
    }
}

/**
 * Deletes a file from Supabase Storage.
 * @param fileUrl - The public URL of the file
 */
export async function deleteFile(fileUrl: string) {
    if (!fileUrl) return;

    try {
        // Extract path from URL
        // URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
        const url = new URL(fileUrl);
        const pathParts = url.pathname.split(`/public/${BUCKET_NAME}/`);

        if (pathParts.length < 2) {
            console.warn('[Storage] Invalid Supabase Storage URL:', fileUrl);
            return;
        }

        const filePath = decodeURIComponent(pathParts[1]);

        const supabase = getSupabaseClient();
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (error) {
            console.error('[Storage] Delete error:', error);
            // Don't throw to prevent blocking main flow, but log error
        } else {
            console.log(`[Storage] Deleted file: ${filePath}`);
        }

    } catch (error) {
        console.warn(`[Storage] Failed to delete file ${fileUrl}:`, error);
    }
}
