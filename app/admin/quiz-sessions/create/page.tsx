'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, Settings, Users, Clock, HelpCircle, Layers } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store/auth';

interface QuizCategory {
    id: string;
    name: string;
    _count: { quizzes: number };
}

export default function CreateSessionPage() {
    const router = useRouter();
    const { accessToken } = useAuthStore();

    // Data
    const [categories, setCategories] = useState<QuizCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form
    const [title, setTitle] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [questionCount, setQuestionCount] = useState(10);
    const [timer, setTimer] = useState(30);

    // Fetch Categories
    useEffect(() => {
        const fetchCats = async () => {
            try {
                const res = await fetch('/api/quiz-categories');
                const data = await res.json();
                if (data.success) setCategories(data.data);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCats();
    }, []);

    const maxQuestions = selectedCategory
        ? categories.find(c => c.id === selectedCategory)?._count.quizzes || 0
        : 50; // Arbitrary max if random? No, API implementation handles category filter. Actually API handles "no category" too? 
    // My API implementation: if categoryId empty -> filter { isActive: true } (All questions). 
    // But for UX, let's defaulting to "Semua Kategori" is good.

    // Calculate max available questions dynamically
    useEffect(() => {
        if (questionCount > maxQuestions && maxQuestions > 0) {
            setQuestionCount(maxQuestions);
        }
    }, [selectedCategory, maxQuestions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                title,
                categoryId: selectedCategory || undefined, // Send undefined if empty string
                totalQuestions: questionCount,
                timerPerQuestion: timer,
                isShuffled: true
            };

            const res = await fetch('/api/quiz-sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                // Redirect to Lobby
                router.push(`/admin/quiz-sessions/${data.data.code}/lobby`);
            } else {
                alert(data.message || 'Gagal membuat sesi');
            }
        } catch (error) {
            alert('Terjadi kesalahan jaringan');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div>
                <Link href="/admin/quizzes" className="inline-flex items-center text-[var(--gray-500)] hover:text-[var(--primary-600)] mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Menu Kuis
                </Link>
                <h1 className="text-3xl font-bold text-[var(--gray-800)] flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg">
                        <Play className="w-6 h-6" />
                    </div>
                    Buat Sesi Live Quiz
                </h1>
                <p className="text-[var(--gray-500)] mt-2 ml-14">
                    Konfigurasi sesi permainan kuis interaktif untuk siswa.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-[var(--gray-100)] shadow-xl shadow-blue-50/50 space-y-8">

                {/* 1. Identity */}
                <section className="space-y-4">
                    <label className="block text-sm font-bold text-[var(--gray-700)] uppercase tracking-wider mb-2">
                        <span className="flex items-center gap-2">
                            <Settings className="w-4 h-4" /> Informasi Sesi
                        </span>
                    </label>
                    <div>
                        <input
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Contoh: Kuis Harian Anatomi Gigi"
                            className="w-full text-lg px-4 py-3 rounded-xl border-2 border-[var(--gray-200)] focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-100)] transition-all outline-none font-medium"
                        />
                    </div>
                </section>

                <hr className="border-[var(--gray-100)]" />

                {/* 2. Questions Source */}
                <section className="space-y-4">
                    <label className="block text-sm font-bold text-[var(--gray-700)] uppercase tracking-wider mb-2">
                        <span className="flex items-center gap-2">
                            <Layers className="w-4 h-4" /> Sumber Soal
                        </span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <span className="text-sm text-[var(--gray-500)] mb-1 block">Pilih Kategori</span>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--gray-200)] bg-white focus:border-[var(--primary-500)] outline-none appearance-none"
                            >
                                <option value="">-- Semua Kategori (Acak) --</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name} ({cat._count.quizzes} Soal)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm text-[var(--gray-500)]">Jumlah Soal</span>
                                <span className="font-bold text-[var(--primary-600)]">{questionCount} Soal</span>
                            </div>
                            <input
                                type="range"
                                min={5}
                                max={50} // Or actual max
                                step={1}
                                value={questionCount}
                                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                                className="w-full h-2 bg-[var(--gray-200)] rounded-lg appearance-none cursor-pointer accent-[var(--primary-600)]"
                            />
                            {selectedCategory && (
                                <p className="text-xs text-[var(--gray-400)] mt-1 text-right">Maks. {maxQuestions} soal tersedia</p>
                            )}
                        </div>
                    </div>
                </section>

                <hr className="border-[var(--gray-100)]" />

                {/* 3. Game Settings */}
                <section className="space-y-4">
                    <label className="block text-sm font-bold text-[var(--gray-700)] uppercase tracking-wider mb-2">
                        <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Pengaturan Game
                        </span>
                    </label>
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm text-[var(--gray-500)]">Waktu per Soal</span>
                            <span className="font-bold text-orange-500">{timer} Detik</span>
                        </div>
                        <input
                            type="range"
                            min={10}
                            max={60}
                            step={5}
                            value={timer}
                            onChange={(e) => setTimer(parseInt(e.target.value))}
                            className="w-full h-2 bg-[var(--gray-200)] rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                        <div className="flex justify-between text-xs text-[var(--gray-400)] mt-1">
                            <span>Cepat (10s)</span>
                            <span>Santai (60s)</span>
                        </div>
                    </div>
                </section>

                <div className="pt-4">
                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        size="lg"
                        isLoading={isSubmitting}
                        disabled={isLoading}
                        className="py-4 text-lg shadow-xl shadow-indigo-200"
                    >
                        {isSubmitting ? 'Sedang Membuat Sesi...' : 'Buat Sesi & Buka Lobby'}
                    </Button>
                </div>

            </form>
        </div>
    );
}
