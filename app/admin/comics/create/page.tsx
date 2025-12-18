'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen, UploadCloud, FileImage, Plus, X, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';

export default function CreateComicPage() {
    const router = useRouter();
    const { accessToken } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Edukasi');
    const [status, setStatus] = useState('true'); // 'true' = published, 'false' = draft

    // File State
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [pageFiles, setPageFiles] = useState<File[]>([]);
    const [pagePreviews, setPagePreviews] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Helpers
    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handlePagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setPageFiles(prev => [...prev, ...newFiles]);

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removePage = (index: number) => {
        setPageFiles(prev => prev.filter((_, i) => i !== index));
        setPagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const uploadFile = async (file: File, type: 'cover' | 'comic'): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        return data.data.url;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!coverFile) return alert('Mohon upload cover komik');
        if (pageFiles.length === 0) return alert('Mohon upload minimal 1 halaman komik');

        setIsLoading(true);
        setUploadProgress('Mengupload Cover...');

        try {
            // 1. Upload Cover
            const coverUrl = await uploadFile(coverFile, 'cover');

            // 2. Upload Pages (Parallel)
            setUploadProgress(`Mengupload ${pageFiles.length} Halaman...`);
            const pageUrls = await Promise.all(
                pageFiles.map(file => uploadFile(file, 'comic'))
            );

            // 3. Create Comic
            setUploadProgress('Menyimpan Data Komik...');

            const payload = {
                title,
                description,
                category,
                coverImageUrl: coverUrl,
                pointReward: 20,
                // Map pages to object structure required by schema
                pages: pageUrls.map((url, index) => ({
                    pageNumber: index + 1,
                    imageUrl: url
                })),
                // Note: isPublished is handled separately or defaulted in schema?
                // The schema doesn't seem to take isPublished directly in create, 
                // but let's send what we can. 
                // Wait, Looking at API route POST: `isPublished: false` is hardcoded in `create`.
                // We might need to update it immediately if user wants it published.
            };

            const res = await fetch('/api/comics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Gagal membuat komik');
            }

            const newComic = await res.json();

            // 4. Update status if user selected "Published"
            // The CREATE API might default to draft.
            // If we want to publish, lets check if we should hit update immediately or if API allows it.
            // Current API route POST forces `isPublished: false`. 
            // So we need to call PUT /api/comics/[id] if status is 'true'.

            if (status === 'true' && newComic.data?.id) {
                await fetch(`/api/comics/${newComic.data.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ isPublished: true })
                });
            }

            setUploadProgress('Selesai!');
            alert('Komik berhasil dibuat!');
            router.push('/admin/comics');

        } catch (error: any) {
            console.error('Submit error:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
            setUploadProgress('');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/comics">
                    <Button variant="secondary" size="sm" className="rounded-xl border-white/60 bg-white/40 backdrop-blur-md hover:bg-white/60">
                        <ArrowLeft className="w-5 h-5 mr-1" />
                        Kembali
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--gray-800)] flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-[var(--primary-600)]" />
                        Upload Komik Baru
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Cover & Files */}
                <div className="lg:col-span-1 space-y-6">
                    <Card variant="white" className="p-6 border border-white/60 shadow-sm">
                        <label className="block text-sm font-bold text-[var(--gray-700)] mb-2">Cover Komik</label>
                        <div className="relative aspect-[3/4] w-full rounded-2xl bg-[var(--gray-50)] border-2 border-dashed border-[var(--gray-300)] hover:border-[var(--primary-400)] hover:bg-[var(--primary-50)] transition-all cursor-pointer flex flex-col items-center justify-center p-4 text-center group overflow-hidden">
                            {coverPreview ? (
                                <img src={coverPreview} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[var(--gray-400)] mb-3 group-hover:scale-110 transition-transform">
                                        <FileImage className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-bold text-[var(--gray-600)]">Upload Cover</p>
                                    <p className="text-xs text-[var(--gray-400)] mt-1">PNG, JPG (Max 2MB)</p>
                                </>
                            )}
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept="image/*"
                                onChange={handleCoverChange}
                            />
                        </div>
                    </Card>
                </div>

                {/* Right Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card variant="white" className="p-6 border border-white/60 shadow-sm relative overflow-hidden">
                        <div className="space-y-6">
                            <Input
                                label="Judul Komik"
                                placeholder="Contoh: Petualangan Gigi Sehat"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-[var(--gray-700)] mb-2">Kategori</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--gray-50)] border border-[var(--gray-200)] focus:ring-2 focus:ring-[var(--primary-300)] focus:border-[var(--primary-400)] outline-none transition-all"
                                    >
                                        <option value="Edukasi">Edukasi</option>
                                        <option value="Cerita Seru">Cerita Seru</option>
                                        <option value="Sains">Sains</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[var(--gray-700)] mb-2">Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--gray-50)] border border-[var(--gray-200)] focus:ring-2 focus:ring-[var(--primary-300)] focus:border-[var(--primary-400)] outline-none transition-all"
                                    >
                                        <option value="false">Draft (Disembunyikan)</option>
                                        <option value="true">Published (Tampil)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[var(--gray-700)] mb-2">Deskripsi Singkat</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--gray-50)] border border-[var(--gray-200)] focus:ring-2 focus:ring-[var(--primary-300)] focus:border-[var(--primary-400)] outline-none transition-all min-h-[100px]"
                                    placeholder="Ceritakan sedikit tentang isi komik ini..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            {/* Pages Upload Placeholder */}
                            <div>
                                <label className="block text-sm font-bold text-[var(--gray-700)] mb-2">Halaman Komik ({pageFiles.length} Halaman)</label>

                                {/* Image Preview Grid */}
                                {pagePreviews.length > 0 && (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                                        {pagePreviews.map((src, idx) => (
                                            <div key={idx} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-[var(--gray-200)] group">
                                                <img src={src} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removePage(idx)}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-1">
                                                    Hal {idx + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div
                                    className="border border-[var(--gray-200)] rounded-xl p-4 bg-[var(--gray-50)] cursor-pointer hover:bg-[var(--primary-50)] hover:border-[var(--primary-300)] transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <UploadCloud className="w-10 h-10 text-[var(--gray-400)] mb-2" />
                                        <p className="text-sm font-bold text-[var(--gray-600)]">Tambah Halaman</p>
                                        <p className="text-xs text-[var(--gray-400)] mb-4">Klik untuk pilih gambar (Bisa lebih dari satu)</p>
                                        <Button variant="secondary" size="sm" type="button" className="pointer-events-none">
                                            Pilih File
                                        </Button>
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handlePagesChange}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-between">
                                {isLoading && <span className="text-sm text-[var(--primary-600)] font-medium animate-pulse">{uploadProgress}</span>}
                                <div className="flex gap-3 ml-auto">
                                    <Link href="/admin/comics">
                                        <Button variant="ghost" type="button" disabled={isLoading}>Batal</Button>
                                    </Link>
                                    <Button variant="primary" type="submit" disabled={isLoading}>
                                        {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan</> : 'Simpan Komik'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </form>
        </div>
    );
}
