'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen, UploadCloud, FileImage, Plus, Save, X, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { compressImage } from '@/lib/compression';

export default function EditComicPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const comicId = resolvedParams.id;

    const router = useRouter();
    const { accessToken } = useAuthStore();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Edukasi');
    const [status, setStatus] = useState('false'); // 'true' | 'false' string for select

    // File State
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    // Pages State
    const [currentPages, setCurrentPages] = useState<string[]>([]); // URLs of existing pages
    const [newPageFiles, setNewPageFiles] = useState<File[]>([]); // Newly selected files
    const [newPagePreviews, setNewPagePreviews] = useState<string[]>([]); // Previews of new files

    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Fetch Data
    useEffect(() => {
        const fetchComic = async () => {
            try {
                const res = await fetch(`/api/comics/${comicId}`);
                if (!res.ok) {
                    if (res.status === 404) {
                        alert('Komik tidak ditemukan');
                        router.push('/admin/comics');
                        return;
                    }
                    throw new Error('Gagal mengambil data komik');
                }
                const data = await res.json();
                const comic = data.data;

                setTitle(comic.title);
                setDescription(comic.description || '');
                setCategory(comic.category || 'Edukasi');
                setStatus(comic.isPublished ? 'true' : 'false');
                setCoverPreview(comic.coverUrl);

                if (comic.pages && Array.isArray(comic.pages)) {
                    setCurrentPages(comic.pages);
                }

            } catch (error) {
                console.error('Fetch error:', error);
                alert('Terjadi kesalahan saat memuat data');
            } finally {
                setIsLoading(false);
            }
        };

        if (comicId) {
            fetchComic();
        }
    }, [comicId, router]);

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
            setNewPageFiles(prev => [...prev, ...newFiles]);

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setNewPagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeCurrentPage = (index: number) => {
        setCurrentPages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewPage = (index: number) => {
        setNewPageFiles(prev => prev.filter((_, i) => i !== index));
        setNewPagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const uploadFile = async (file: File, type: 'cover' | 'comic'): Promise<string> => {
        try {
            const compressedFile = await compressImage(file);

            const formData = new FormData();
            formData.append('file', compressedFile);
            formData.append('type', type);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            return data.data.url;
        } catch (error) {
            console.error('Upload process error:', error);
            throw error;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setUploadProgress('Menyiapkan data...');

        try {
            let coverUrl = coverPreview;
            // 1. Upload New Cover if selected
            if (coverFile) {
                setUploadProgress('Mengupload Cover Baru...');
                coverUrl = await uploadFile(coverFile, 'cover');
            }

            // 2. Upload New Pages if selected
            const newPageUrls: string[] = [];
            if (newPageFiles.length > 0) {
                setUploadProgress(`Mengupload ${newPageFiles.length} Halaman Baru...`);
                // Parallel upload
                const uploaded = await Promise.all(newPageFiles.map(file => uploadFile(file, 'comic')));
                newPageUrls.push(...uploaded);
            }

            // Combine pages: Current Remaining Pages + New Pages
            const allPageUrls = [...currentPages, ...newPageUrls];

            if (allPageUrls.length === 0) {
                throw new Error('Komik harus memiliki minimal 1 halaman');
            }

            const pagesPayload = allPageUrls.map((url, index) => ({
                pageNumber: index + 1,
                imageUrl: url
            }));

            // 3. Update Comic
            setUploadProgress('Menyimpan Perubahan...');

            const payload = {
                title,
                description,
                category,
                coverImageUrl: coverUrl,
                pages: pagesPayload,
                isPublished: status === 'true',
            };

            const res = await fetch(`/api/comics/${comicId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Gagal update komik');
            }

            setIsSaving(false);
            setUploadProgress('');
            alert('Komik berhasil diupdate!');
            router.push('/admin/comics');

        } catch (error: any) {
            console.error('Update error:', error);
            alert(`Error: ${error.message}`);
            setIsSaving(false);
            return;
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-10 h-10 text-[var(--primary-600)] animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 font-fredoka">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
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
                            Edit Komik
                        </h1>
                    </div>
                </div>
                <Button variant="primary" onClick={handleSubmit} disabled={isSaving} className="shadow-lg shadow-blue-500/20">
                    {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                    {isSaving ? uploadProgress || 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Cover & Files */}
                <div className="lg:col-span-1 space-y-6">
                    <Card variant="white" className="p-6 border border-white/60 shadow-sm">
                        <label className="block text-sm font-bold text-[var(--gray-700)] mb-2">Cover Komik</label>
                        <div className="relative aspect-[3/4] w-full rounded-2xl bg-[var(--gray-50)] border-2 border-dashed border-[var(--gray-300)] hover:border-[var(--primary-400)] hover:bg-[var(--primary-50)] transition-all cursor-pointer flex flex-col items-center justify-center p-4 text-center group overflow-hidden">
                            {coverPreview ? (
                                <img src={coverPreview} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                                <div className="text-[var(--gray-400)]">No Cover</div>
                            )}

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="bg-white p-2 rounded-full">
                                    <FileImage className="w-6 h-6 text-[var(--gray-700)]" />
                                </div>
                            </div>

                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept="image/*"
                                onChange={handleCoverChange}
                            />
                        </div>
                        <p className="text-xs text-[var(--gray-500)] text-center mt-2">Klik untuk ganti cover</p>
                    </Card>
                </div>

                {/* Right Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card variant="white" className="p-6 border border-white/60 shadow-sm relative overflow-hidden">
                        <div className="space-y-6">
                            <Input
                                label="Judul Komik"
                                placeholder="Contoh: Petualangan Gigi Sehat"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-[var(--gray-700)] mb-2">Kategori</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--gray-50)] border border-[var(--gray-200)] focus:ring-2 focus:ring-[var(--primary-300)] focus:border-[var(--primary-400)] outline-none transition-all font-fredoka"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="Edukasi">Edukasi</option>
                                        <option value="Cerita Seru">Cerita Seru</option>
                                        <option value="Sains">Sains</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[var(--gray-700)] mb-2">Status</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--gray-50)] border border-[var(--gray-200)] focus:ring-2 focus:ring-[var(--primary-300)] focus:border-[var(--primary-400)] outline-none transition-all font-fredoka"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="false">Draft (Disembunyikan)</option>
                                        <option value="true">Published (Tampil)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[var(--gray-700)] mb-2">Deskripsi Singkat</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--gray-50)] border border-[var(--gray-200)] focus:ring-2 focus:ring-[var(--primary-300)] focus:border-[var(--primary-400)] outline-none transition-all min-h-[100px] font-fredoka"
                                    placeholder="Ceritakan sedikit tentang isi komik ini..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            {/* Pages Management */}
                            <div>
                                <label className="block text-sm font-bold text-[var(--gray-700)] mb-2">
                                    Halaman Komik ({currentPages.length + newPageFiles.length} Halaman)
                                </label>

                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
                                    {/* Existing Pages */}
                                    {currentPages.map((url, i) => (
                                        <div key={`curr-${i}`} className="relative aspect-[3/4] bg-gray-100 rounded-lg border border-gray-200 overflow-hidden group">
                                            <img src={url} className="w-full h-full object-cover" />
                                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    type="button"
                                                    onClick={() => removeCurrentPage(i)}
                                                    className="bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-1">
                                                Hal {i + 1}
                                            </div>
                                        </div>
                                    ))}

                                    {/* New Pages */}
                                    {newPagePreviews.map((url, i) => (
                                        <div key={`new-${i}`} className="relative aspect-[3/4] bg-green-50 rounded-lg border border-green-200 overflow-hidden group">
                                            <img src={url} className="w-full h-full object-cover" />
                                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewPage(i)}
                                                    className="bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 bg-green-600/80 text-white text-[10px] text-center py-1">
                                                New {i + 1}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add Button */}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-[3/4] bg-[var(--primary-50)] rounded-lg border-2 border-dashed border-[var(--primary-200)] flex flex-col items-center justify-center text-[var(--primary-500)] hover:bg-[var(--primary-100)] transition-colors hover:border-[var(--primary-300)]"
                                    >
                                        <Plus className="w-6 h-6 mb-1" />
                                        <span className="text-[10px] font-bold">Add</span>
                                    </button>
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
                    </Card>
                </div>
            </form>
        </div>
    );
}
