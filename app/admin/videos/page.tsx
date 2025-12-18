'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, MoreVertical, Edit, Trash, PlayCircle, Eye, Film, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useState, useEffect } from 'react';
import DeleteModal from '@/components/admin/delete-modal';
import { useAuthStore } from '@/lib/store/auth';

// Metadata removed

export default function AdminVideosPage() {
    const { accessToken } = useAuthStore();
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchVideos = async () => {
        setLoading(true);
        try {
            // Build Query Params with explicit defaults to avoid "undefined" string
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (categoryFilter !== 'all') params.append('category', categoryFilter);
            // Note: API might not support status filtering yet, filtering client side if needed or update API later.
            // But let's send it if supported or filter client side.
            // The current API route provided earlier:
            // where: { isPublished: true } for GET /api/videos. 
            // WAIT. The GET /api/videos implementation viewed earlier ONLY returns isPublished: true videos!
            // That is for STUDENTS. Admin needs to see ALL videos (drafts too).
            // I need to check if /api/videos supports admin mode or if I should use a different endpoint?
            // Usually standard pattern: if admin, return all.
            // The previous view of /api/videos/route.ts showed:
            // "const where: Prisma.VideoWhereInput = { isPublished: true };"
            // This means admins CANNOT see drafts. This is a BUG in the API for Admin use.
            // I should fix the API first.

            const res = await fetch(`/api/videos?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setVideos(data.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch videos', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accessToken) {
            fetchVideos();
        }
    }, [accessToken, searchTerm, categoryFilter]);

    const handleDeleteClick = (id: string) => {
        setSelectedVideoId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedVideoId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/videos/${selectedVideoId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (res.ok) {
                setVideos(prev => prev.filter(v => v.id !== selectedVideoId));
                setIsDeleteModalOpen(false);
                setSelectedVideoId(null);
            } else {
                alert('Gagal menghapus video');
            }
        } catch (error) {
            alert('Terjadi kesalahan saat menghapus');
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter displayed videos by status client-side since API might return mixed or we fix API
    const filteredVideos = videos.filter(video => {
        if (statusFilter !== 'all') {
            const isPub = statusFilter === 'published';
            if (video.isPublished !== isPub) return false;
        }
        return true;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--gray-800)] flex items-center gap-3">
                        <Film className="w-8 h-8 text-[var(--primary-600)]" />
                        Materi Video
                    </h1>
                    <p className="text-[var(--gray-500)] mt-1">Kelola konten video pembelajaran untuk siswa.</p>
                </div>
                <Link href="/admin/videos/create">
                    <Button variant="primary" className="rounded-xl shadow-lg shadow-blue-500/20">
                        <Plus className="w-5 h-5 mr-2" />
                        Tambah Video Baru
                    </Button>
                </Link>
            </div>

            {/* Filter & Search Bar - Glass Effect */}
            <div className="bg-white/60 backdrop-blur-md border border-white/50 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gray-400)] w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Cari judul video..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[var(--primary-100)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)] text-[var(--gray-700)] placeholder:text-[var(--gray-400)] transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-2 md:flex gap-2 w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[var(--primary-100)] text-[var(--gray-600)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)] cursor-pointer"
                    >
                        <option value="all">Semua Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                    </select>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[var(--primary-100)] text-[var(--gray-600)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)] cursor-pointer"
                    >
                        <option value="all">Semua Kategori</option>
                        <option value="tutorial">Tutorial</option>
                        <option value="edukasi">Edukasi</option>
                        <option value="tips">Tips & Trik</option>
                    </select>
                </div>
            </div>

            {/* Video List Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[var(--primary-500)] animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVideos.map((video) => (
                        <div
                            key={video.id}
                            className="group relative bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-[var(--shadow-soft-md)] hover:shadow-[var(--shadow-soft-lg)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
                        >
                            {/* Thumbnail Area */}
                            <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                                <Image
                                    src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                                    alt={video.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />

                                {/* Status Badge */}
                                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm ${video.isPublished
                                    ? 'bg-emerald-100/90 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-100/90 text-amber-700 border border-amber-200'
                                    }`}>
                                    {video.isPublished ? 'Terbit' : 'Draft'}
                                </div>

                                {/* Play Icon Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/50">
                                        <PlayCircle className="w-6 h-6 fill-white/20" />
                                    </div>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-xs font-bold text-[var(--primary-600)] bg-[var(--primary-50)] px-2 py-1 rounded-lg border border-[var(--primary-100)] uppercase">
                                        {video.category}
                                    </span>
                                    <div className="text-xs text-[var(--gray-400)] flex items-center gap-1">
                                        <Eye className="w-3 h-3" /> {video.viewCount || 0}
                                    </div>
                                </div>

                                <h3 className="font-bold text-[var(--gray-800)] text-lg mb-2 line-clamp-2 leading-snug">
                                    {video.title}
                                </h3>

                                <div className="mt-auto pt-4 border-t border-[var(--gray-100)] flex items-center justify-between">
                                    <span className="text-xs text-[var(--gray-400)]">
                                        {new Date(video.createdAt || Date.now()).toLocaleDateString('id-ID')}
                                    </span>
                                    <div className="flex gap-2">
                                        <Link href={`/admin/videos/${video.id}`}>
                                            <button className="p-2 rounded-xl text-[var(--primary-600)] hover:bg-[var(--primary-50)] transition-colors" title="Edit">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteClick(video.id)}
                                            className="p-2 rounded-xl text-[var(--error-500)] hover:bg-[var(--error-50)] transition-colors"
                                            title="Hapus"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add New Placeholder Card */}
                    <Link href="/admin/videos/create" className="group border-2 border-dashed border-[var(--primary-200)] rounded-3xl flex flex-col items-center justify-center p-8 bg-[var(--primary-50)]/50 hover:bg-[var(--primary-50)] transition-colors cursor-pointer min-h-[300px]">
                        <div className="w-16 h-16 rounded-full bg-white shadow-soft-md flex items-center justify-center text-[var(--primary-400)] mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="w-8 h-8" />
                        </div>
                        <p className="font-bold text-[var(--primary-600)]">Tambah Video Baru</p>
                        <p className="text-xs text-[var(--primary-400)] mt-1">Upload materi pembelajaran</p>
                    </Link>
                </div>
            )}

            {/* Delete Modal */}
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Hapus Video Ini?"
                description="Tindakan ini tidak dapat dibatalkan. Video yang dihapus akan hilang permanen dari database."
                isLoading={isDeleting}
            />
        </div>
    );
}
