'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Added for mock ID usage if needed
import { ArrowLeft, Save, Youtube, MonitorPlay, AlertCircle, Plus, X, Loader2, Trash } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useState, useEffect } from 'react';

import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';

export default function EditVideoPage() {
    const router = useRouter();
    const params = useParams();
    const { accessToken } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const videoId = params.id as string;

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('draft');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [keyPoints, setKeyPoints] = useState<string[]>(['']);

    // Helper to get YouTube ID for preview
    const getYoutubeId = (url: string) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeId = getYoutubeId(youtubeUrl);

    useEffect(() => {
        if (accessToken && videoId) {
            fetchVideoDetails();
        }
    }, [accessToken, videoId]);

    const fetchVideoDetails = async () => {
        setIsFetching(true);
        try {
            const res = await fetch(`/api/videos/${videoId}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await res.json();

            if (data.success && data.data) {
                const video = data.data;
                setTitle(video.title);
                setDescription(video.description || '');
                setCategory(video.category || '');
                setStatus(video.isPublished ? 'published' : 'draft');
                setYoutubeUrl(video.youtubeId ? `https://youtube.com/watch?v=${video.youtubeId}` : '');
                setKeyPoints(video.keyPoints && video.keyPoints.length > 0 ? video.keyPoints : ['']);
            } else {
                alert('Gagal mengambil detail video');
                router.push('/admin/videos');
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            alert('Terjadi kesalahan saat mengambil data');
        } finally {
            setIsFetching(false);
        }
    };

    const handleKeyPointChange = (index: number, value: string) => {
        const newPoints = [...keyPoints];
        newPoints[index] = value;
        setKeyPoints(newPoints);
    };

    const addKeyPoint = () => {
        setKeyPoints([...keyPoints, '']);
    };

    const removeKeyPoint = (index: number) => {
        const newPoints = keyPoints.filter((_, i) => i !== index);
        setKeyPoints(newPoints);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!youtubeId) return alert('URL YouTube tidak valid');
        if (!title) return alert('Judul harus diisi');

        setIsLoading(true);

        try {
            // Filter empty key points
            const cleanKeyPoints = keyPoints.filter(k => k.trim() !== '');

            const payload = {
                title,
                description,
                category,
                youtubeUrl,
                keyPoints: cleanKeyPoints,
                isPublished: status === 'published',
            };

            const res = await fetch(`/api/videos/${videoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Gagal mengupdate video');
            }

            alert('Video berhasil diupdate!');
            router.push('/admin/videos');

        } catch (error: any) {
            console.error('Update Error:', error);
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-[var(--primary-500)] animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/videos" className="p-2 rounded-xl bg-white border border-[var(--gray-200)] text-[var(--gray-600)] hover:bg-[var(--gray-50)] shadow-sm transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--gray-800)]">Edit Video</h1>
                    <p className="text-sm text-[var(--gray-500)]">Perbarui detail video pembelajaran.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Section 1: Basic Info */}
                        <Card variant="white" className="p-6 md:p-8 space-y-6 border border-white/60 shadow-[var(--shadow-soft-md)]">
                            <h2 className="text-lg font-bold text-[var(--gray-800)] flex items-center gap-2">
                                <MonitorPlay className="w-5 h-5 text-[var(--primary-500)]" />
                                Informasi Utama
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-[var(--gray-700)] mb-2">Judul Video</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--gray-50)] border border-[var(--gray-200)] focus:ring-4 focus:ring-[var(--primary-100)] focus:border-[var(--primary-500)] outline-none transition-all"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[var(--gray-700)] mb-2">Deskripsi</label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--gray-50)] border border-[var(--gray-200)] focus:ring-4 focus:ring-[var(--primary-100)] focus:border-[var(--primary-500)] outline-none transition-all resize-none"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-[var(--gray-700)] mb-2">Kategori</label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-[var(--gray-50)] border border-[var(--gray-200)] focus:ring-4 focus:ring-[var(--primary-100)] focus:border-[var(--primary-500)] outline-none transition-all cursor-pointer"
                                        >
                                            <option value="">Pilih Kategori...</option>
                                            <option value="tutorial">Tutorial / Praktek</option>
                                            <option value="edukasi">Edukasi / Teori</option>
                                            <option value="tips">Tips & Trik</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-[var(--gray-700)] mb-2">Status</label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-[var(--gray-50)] border border-[var(--gray-200)] focus:ring-4 focus:ring-[var(--primary-100)] focus:border-[var(--primary-500)] outline-none transition-all cursor-pointer"
                                        >
                                            <option value="draft">Draft (Disimpan)</option>
                                            <option value="published">Published (Terbit)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Section 2: Key Points */}
                        <Card variant="white" className="p-6 md:p-8 space-y-6 border border-white/60 shadow-[var(--shadow-soft-md)]">
                            <h2 className="text-lg font-bold text-[var(--gray-800)] flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-[var(--accent-500)]" />
                                Poin Penting (Key Takeaways)
                            </h2>

                            <div className="space-y-3">
                                {keyPoints.map((point, i) => (
                                    <div key={i} className="flex gap-3 group/item">
                                        <div className="flex-none w-8 h-8 rounded-full bg-[var(--accent-100)] text-[var(--accent-600)] flex items-center justify-center font-bold text-sm border border-[var(--accent-200)]">
                                            {i + 1}
                                        </div>
                                        <input
                                            type="text"
                                            className="flex-1 px-4 py-2 rounded-xl bg-[var(--gray-50)] border border-[var(--gray-200)] focus:outline-none focus:border-[var(--accent-400)] transition-all"
                                            value={point}
                                            onChange={(e) => handleKeyPointChange(i, e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeKeyPoint(i)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <Button type="button" variant="secondary" size="sm" onClick={addKeyPoint} className="mt-2">
                                    <Plus className="w-4 h-4 mr-2" /> Tambah Poin
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: YouTube & Preview */}
                    <div className="space-y-6">
                        <Card variant="blue" className="p-6 space-y-4">
                            <h2 className="text-lg font-bold text-[var(--primary-700)] flex items-center gap-2">
                                <Youtube className="w-6 h-6 text-red-500" />
                                Sumber Konten
                            </h2>
                            <div>
                                <label className="block text-sm font-bold text-[var(--primary-700)] mb-2">YouTube URL</label>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl bg-white border border-[var(--primary-200)] focus:ring-4 focus:ring-[var(--primary-100)] focus:border-[var(--primary-500)] outline-none transition-all placeholder:text-[var(--primary-300)]"
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                    />
                                    <p className="text-xs text-[var(--primary-500)]">*Thumbnail akan otomatis diambil dari YouTube.</p>
                                </div>
                            </div>

                            {/* Preview Thumbnail */}
                            <div className="aspect-video w-full rounded-2xl bg-[var(--primary-100)]/50 border-2 border-dashed border-[var(--primary-200)] flex items-center justify-center overflow-hidden relative group">
                                {youtubeId ? (
                                    <img
                                        src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <p className="text-sm text-[var(--primary-400)] font-medium">Preview akan muncul di sini</p>
                                )}
                            </div>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 sticky top-6">
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full shadow-lg shadow-blue-500/20"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                                {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                            <Link href="/admin/videos" className="w-full">
                                <Button type="button" variant="secondary" size="lg" className="w-full">
                                    Batal
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
