import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
    const options = {
        maxSizeMB: 0.2, // Max 200KB
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: 'image/webp'
    };

    try {
        const compressedFile = await imageCompression(file, options);
        // Create a new File object to ensure name/type are preserved/updated correctly if needed
        // browser-image-compression returns a Blob/File, but let's be safe with naming
        return new File([compressedFile], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
            type: 'image/webp',
            lastModified: Date.now(),
        });
    } catch (error) {
        console.error("Compression error:", error);
        throw new Error("Gagal mengompresi gambar");
    }
}
