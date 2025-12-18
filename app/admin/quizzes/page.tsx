'use client';

import Link from 'next/link';
import { Plus, Search, ClipboardList, Loader2, Trash, Edit, CheckCircle, XCircle, FileUp } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import DeleteModal from '@/components/admin/delete-modal';
import ImportQuizModal from '@/components/admin/import-quiz-modal';
import { useAuthStore } from '@/lib/store/auth';
import { apiFetch } from '@/lib/api-client';

interface Quiz {
    id: string;
    question: string;
    category: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    answer: boolean;
    isActive: boolean;
    createdAt: string;
}

// Metadata removed

export default function QuizManagementPage() {
    const { accessToken } = useAuthStore();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('all');

    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchQuizzes = async () => {
        setIsLoading(true);
        try {
            const query = new URLSearchParams({ limit: '100' });
            if (searchTerm) query.append('search', searchTerm);
            if (filterDifficulty !== 'all') query.append('difficulty', filterDifficulty);

            const res = await apiFetch(`/api/quizzes?${query.toString()}`);
            const data = await res.json();

            if (data.success) {
                setQuizzes(data.data.data);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (accessToken) {
            fetchQuizzes();
        }
    }, [accessToken, searchTerm, filterDifficulty]);

    const handleDeleteClick = (id: string) => {
        setSelectedQuizId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedQuizId) return;
        setIsDeleting(true);
        try {
            const res = await apiFetch(`/api/quizzes/${selectedQuizId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setQuizzes(prev => prev.filter(q => q.id !== selectedQuizId));
                setIsDeleteModalOpen(false);
                setSelectedQuizId(null);
                alert('Soal kuis berhasil dihapus!');
            } else {
                alert('Gagal menghapus soal.');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Terjadi kesalahan.');
        } finally {
            setIsDeleting(false);
        }
    };

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'EASY': return 'bg-green-100 text-green-700';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
            case 'HARD': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--gray-800)] flex items-center gap-3">
                        <ClipboardList className="w-8 h-8 text-[var(--primary-600)]" />
                        Bank Soal Kuis
                    </h1>
                    <p className="text-[var(--gray-500)] mt-1">Kelola pertanyaan True/False untuk permainan kuis siswa.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/quizzes/categories">
                        <Button
                            variant="secondary"
                            className="rounded-xl shadow-lg shadow-gray-200/50"
                        >
                            Atur Kategori
                        </Button>
                    </Link>
                    <Button
                        variant="secondary"
                        onClick={() => setIsImportModalOpen(true)}
                        className="rounded-xl shadow-lg shadow-gray-200/50"
                    >
                        <FileUp className="w-5 h-5 mr-2" />
                        Import Excel
                    </Button>
                    <Link href="/admin/quizzes/builder">
                        <Button variant="primary" className="rounded-xl shadow-lg shadow-blue-500/20">
                            <Plus className="w-5 h-5 mr-2" />
                            Buat Soal Baru
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white/60 backdrop-blur-md border border-white/50 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gray-400)] w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Cari pertanyaan..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[var(--primary-100)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)] text-[var(--gray-700)] placeholder:text-[var(--gray-400)] transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-white border border-[var(--primary-100)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)] text-[var(--gray-700)] cursor-pointer"
                >
                    <option value="all">Semua Kesulitan</option>
                    <option value="EASY">Mudah (Easy)</option>
                    <option value="MEDIUM">Sedang (Medium)</option>
                    <option value="HARD">Sulit (Hard)</option>
                </select>
            </div>

            {/* Quiz List */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[var(--primary-500)] animate-spin" />
                </div>
            ) : quizzes.length === 0 ? (
                <div className="text-center py-20 bg-white/40 rounded-3xl border border-dashed border-gray-300">
                    <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Belum ada soal kuis yang ditemukan.</p>
                    <Link href="/admin/quizzes/builder" className="text-[var(--primary-600)] font-bold hover:underline mt-2 inline-block">
                        Buat soal pertama sekarang
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {quizzes.map((quiz) => (
                        <div key={quiz.id} className="group bg-white p-5 rounded-2xl border border-[var(--gray-100)] shadow-sm hover:shadow-md hover:border-[var(--primary-200)] transition-all flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getDifficultyColor(quiz.difficulty)}`}>
                                        {quiz.difficulty}
                                    </span>
                                    <span className="text-xs text-[var(--gray-400)] bg-[var(--gray-50)] px-2 py-1 rounded-md">
                                        {quiz.category || 'Umum'}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-[var(--gray-800)] leading-snug">
                                    {quiz.question}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-[var(--gray-500)]">Jawaban:</span>
                                    {quiz.answer ? (
                                        <span className="flex items-center gap-1 text-green-600 text-sm font-bold bg-green-50 px-2 py-0.5 rounded">
                                            <CheckCircle className="w-3 h-3" /> BENAR
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-red-600 text-sm font-bold bg-red-50 px-2 py-0.5 rounded">
                                            <XCircle className="w-3 h-3" /> SALAH
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-[var(--gray-100)]">
                                <Link href={`/admin/quizzes/${quiz.id}`}>
                                    <Button variant="ghost" size="sm" className="text-[var(--gray-500)] hover:text-[var(--primary-600)] hover:bg-[var(--primary-50)] w-full md:w-auto">
                                        <Edit className="w-4 h-4 mr-2 md:mr-0" />
                                        <span className="md:hidden">Edit</span>
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(quiz.id)}
                                    className="text-[var(--gray-500)] hover:text-red-600 hover:bg-red-50 w-full md:w-auto"
                                >
                                    <Trash className="w-4 h-4 mr-2 md:mr-0" />
                                    <span className="md:hidden">Hapus</span>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Hapus Soal Kuis"
                description="Apakah Anda yakin ingin menghapus soal ini? Data yang dihapus tidak dapat dikembalikan."
                isLoading={isDeleting}
            />

            <ImportQuizModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={fetchQuizzes}
            />

        </div>
    );
}
