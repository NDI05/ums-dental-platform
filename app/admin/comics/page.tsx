'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, BookOpen, Edit, Trash, Eye, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import DeleteModal from '@/components/admin/delete-modal';
import { useAuthStore } from '@/lib/store/auth';

interface Comic {
    id: string;
    title: string;
    category: string;
    totalPages: number;
    coverUrl: string;
    isPublished: boolean;
    _count: {
        reads: number;
    };
}

// Metadata removed

export default function ComicsManagementPage() {
    const { accessToken } = useAuthStore();
    const [comics, setComics] = useState<Comic[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedComicId, setSelectedComicId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchComics = async () => {
        try {
            const headers: HeadersInit = {};
            if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
            }

            const res = await fetch('/api/comics?limit=100', { headers }); // Fetch all for now
            const data = await res.json();
            if (data.success) {
                setComics(data.data.data); // data.data.data because of pagination wrapper
            }
        } catch (error) {
            console.error('Failed to fetch comics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (accessToken) {
            fetchComics();
        }
    }, [accessToken]);

    const handleDeleteClick = (id: string) => {
        setSelectedComicId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedComicId || !accessToken) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/comics/${selectedComicId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (res.ok) {
                setComics(prev => prev.filter(c => c.id !== selectedComicId));
                setIsDeleteModalOpen(false);
                setSelectedComicId(null);
            } else {
                alert('Gagal menghapus komik');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Terjadi kesalahan saat menghapus');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredComics = comics.filter(comic => {
        const matchesSearch = comic.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all'
            ? true
            : statusFilter === 'published'
                ? comic.isPublished
                : !comic.isPublished;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--gray-800)] flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-[var(--primary-600)]" />
                        Komik Edukasi
                    </h1>
                    <p className="text-[var(--gray-500)] mt-1">Kelola konten komik bergambar untuk literasi siswa.</p>
                </div>
                <Link href="/admin/comics/create">
                    <Button variant="primary" className="rounded-xl shadow-lg shadow-blue-500/20">
                        <Plus className="w-5 h-5 mr-2" />
                        Tambah Komik Baru
                    </Button>
                </Link>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white/60 backdrop-blur-md border border-white/50 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gray-400)] w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Cari judul komik..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[var(--primary-100)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)] text-[var(--gray-700)] placeholder:text-[var(--gray-400)] transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-2 md:flex gap-2 w-full md:w-auto">
                    <select
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[var(--primary-100)] text-[var(--gray-600)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)] cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Semua Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-[var(--primary-500)] animate-spin" />
                </div>
            ) : (
                /* Comic List Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Add New Placeholder Card (Always First) */}
                    <Link href="/admin/comics/create" className="group border-2 border-dashed border-[var(--primary-200)] rounded-3xl flex flex-col items-center justify-center p-8 bg-[var(--primary-50)]/50 hover:bg-[var(--primary-50)] transition-colors cursor-pointer min-h-[300px] aspect-[3/4] sm:aspect-auto">
                        <div className="w-14 h-14 rounded-full bg-white shadow-soft-md flex items-center justify-center text-[var(--primary-400)] mb-3 group-hover:scale-110 transition-transform">
                            <Plus className="w-7 h-7" />
                        </div>
                        <p className="font-bold text-[var(--primary-600)] text-sm">Upload Komik</p>
                        <p className="text-xs text-[var(--primary-400)] mt-1 text-center">Format PDF atau JPG</p>
                    </Link>

                    {filteredComics.map((comic) => (
                        <div
                            key={comic.id}
                            className="group relative bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-[var(--shadow-soft-md)] hover:shadow-[var(--shadow-soft-lg)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
                        >
                            {/* Cover Image Area (Portrait Aspect Ratio) */}
                            <div className="relative aspect-[3/4] w-full bg-gray-100 overflow-hidden">
                                <Image
                                    src={comic.coverUrl || '/placeholder-comic.jpg'} // Fallback image
                                    alt={comic.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    unoptimized
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                {/* Status Badge */}
                                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm ${comic.isPublished
                                    ? 'bg-emerald-100/90 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-100/90 text-amber-700 border border-amber-200'
                                    }`}>
                                    {comic.isPublished ? 'Terbit' : 'Draft'}
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-[10px] uppercase font-bold text-[var(--primary-600)] bg-[var(--primary-50)] px-2 py-0.5 rounded border border-[var(--primary-100)]">
                                        {comic.category || 'Umum'}
                                    </span>
                                    <div className="text-xs text-[var(--gray-500)] flex items-center gap-1">
                                        <Eye className="w-3 h-3" /> {comic._count?.reads || 0}
                                    </div>
                                </div>

                                <h3 className="font-bold text-[var(--gray-800)] text-base mb-1 line-clamp-2 leading-snug">
                                    {comic.title}
                                </h3>
                                <p className="text-xs text-[var(--gray-500)] mb-4">{comic.totalPages} Halaman</p>

                                <div className="mt-auto pt-3 border-t border-[var(--gray-100)] flex items-center justify-between">
                                    <Link href={`/admin/comics/${comic.id}`} className="flex-1">
                                        <Button variant="ghost" size="sm" className="w-full text-xs h-8">
                                            <Edit className="w-3 h-3 mr-1.5" />
                                            Edit
                                        </Button>
                                    </Link>
                                    <div className="w-px h-4 bg-[var(--gray-200)] mx-1" />
                                    <button
                                        onClick={() => handleDeleteClick(comic.id)}
                                        className="p-1.5 rounded-lg text-[var(--error-500)] hover:bg-[var(--error-50)] transition-colors"
                                        title="Hapus"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Modal */}
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Hapus Komik Ini?"
                description="Tindakan ini tidak dapat dibatalkan. Komik yang dihapus akan hilang permanen."
                isLoading={isDeleting}
            />
        </div>
    );
}
