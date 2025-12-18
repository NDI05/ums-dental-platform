'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Gamepad2, Edit, Trash, Eye, Loader2, PlayCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import DeleteModal from '@/components/admin/delete-modal';
import { useAuthStore } from '@/lib/store/auth';

interface Game {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    gameUrl: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    isPublished: boolean;
    clickCount: number;
    sortOrder: number;
}

// Metadata removed

export default function GamesManagementPage() {
    const { accessToken } = useAuthStore();
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [difficultyFilter, setDifficultyFilter] = useState('all');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchGames = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (difficultyFilter !== 'all') params.append('difficulty', difficultyFilter);

            const res = await fetch(`/api/games?${params.toString()}&limit=100`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setGames(data.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch games', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accessToken) {
            fetchGames();
        }
    }, [accessToken, difficultyFilter]);

    const handleDeleteClick = (id: string) => {
        setSelectedGameId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedGameId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/games/${selectedGameId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (res.ok) {
                setGames(prev => prev.filter(g => g.id !== selectedGameId));
                setIsDeleteModalOpen(false);
                setSelectedGameId(null);
            } else {
                alert('Gagal menghapus game');
            }
        } catch (error) {
            alert('Terjadi kesalahan saat menghapus');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredGames = games.filter(game => {
        const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all'
            ? true
            : statusFilter === 'published'
                ? game.isPublished
                : !game.isPublished;

        return matchesSearch && matchesStatus;
    });

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'EASY': return 'bg-green-100 text-green-700 border-green-200';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'HARD': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--gray-800)] flex items-center gap-3">
                        <Gamepad2 className="w-8 h-8 text-[var(--primary-600)]" />
                        Manajemen Games
                    </h1>
                    <p className="text-[var(--gray-500)] mt-1">Kelola konten mini-games edukasi untuk siswa.</p>
                </div>
                <Link href="/admin/games/create">
                    <Button variant="primary" className="rounded-xl shadow-lg shadow-blue-500/20">
                        <Plus className="w-5 h-5 mr-2" />
                        Tambah Game Baru
                    </Button>
                </Link>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white/60 backdrop-blur-md border border-white/50 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gray-400)] w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Cari judul game..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[var(--primary-100)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)] text-[var(--gray-700)] placeholder:text-[var(--gray-400)] transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-2 md:flex gap-2 w-full md:w-auto">
                    <select
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-white border border-[var(--primary-100)] text-[var(--gray-600)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)] cursor-pointer"
                    >
                        <option value="all">Semua Level</option>
                        <option value="EASY">Mudah</option>
                        <option value="MEDIUM">Sedang</option>
                        <option value="HARD">Sulit</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-white border border-[var(--primary-100)] text-[var(--gray-600)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)] cursor-pointer"
                    >
                        <option value="all">Semua Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>
            </div>

            {/* Games List Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[var(--primary-500)] animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Add New Placeholder Card */}
                    <Link href="/admin/games/create" className="group border-2 border-dashed border-[var(--primary-200)] rounded-3xl flex flex-col items-center justify-center p-8 bg-[var(--primary-50)]/50 hover:bg-[var(--primary-50)] transition-colors cursor-pointer min-h-[300px]">
                        <div className="w-16 h-16 rounded-full bg-white shadow-soft-md flex items-center justify-center text-[var(--primary-400)] mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="w-8 h-8" />
                        </div>
                        <p className="font-bold text-[var(--primary-600)]">Tambah Game</p>
                        <p className="text-xs text-[var(--primary-400)] mt-1">HTML5 / Embed Link</p>
                    </Link>

                    {filteredGames.map((game) => (
                        <div
                            key={game.id}
                            className="group relative bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-[var(--shadow-soft-md)] hover:shadow-[var(--shadow-soft-lg)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
                        >
                            {/* Thumbnail Area */}
                            <div className="relative aspect-video w-full bg-gray-100 overflow-hidden">
                                <Image
                                    src={game.thumbnailUrl || '/placeholder-game.jpg'}
                                    alt={game.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />

                                {/* Status Badge */}
                                <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md shadow-sm border uppercase ${game.isPublished
                                    ? 'bg-emerald-100/90 text-emerald-700 border-emerald-200'
                                    : 'bg-amber-100/90 text-amber-700 border-amber-200'
                                    }`}>
                                    {game.isPublished ? 'Terbit' : 'Draft'}
                                </div>

                                {/* Difficulty Badge */}
                                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-md shadow-sm border uppercase ${getDifficultyColor(game.difficulty)}`}>
                                    {game.difficulty}
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-bold text-[var(--gray-800)] text-lg mb-2 line-clamp-1">
                                    {game.title}
                                </h3>
                                <p className="text-sm text-[var(--gray-500)] line-clamp-2 mb-4">
                                    {game.description}
                                </p>

                                <div className="mt-auto pt-4 border-t border-[var(--gray-100)] flex items-center justify-between">
                                    <div className="text-xs text-[var(--gray-400)] flex items-center gap-1">
                                        <Eye className="w-3 h-3" /> {game.clickCount || 0} Plays
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/admin/games/${game.id}`}>
                                            <button
                                                className="p-2 rounded-xl text-[var(--primary-600)] hover:bg-[var(--primary-50)] transition-colors"
                                                title="Edit Game"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteClick(game.id)}
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
                </div>
            )}

            {/* Delete Modal */}
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Hapus Game Ini?"
                description="Tindakan ini tidak dapat dibatalkan. Game yang dihapus akan hilang permanen."
                isLoading={isDeleting}
            />
        </div>
    );
}
