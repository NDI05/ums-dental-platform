'use client';

import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle, XCircle, HelpCircle, Upload, FileSpreadsheet, Download, Trash2, PenTool, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';

function QuizBuilderContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const quizId = searchParams.get('id');
    const { accessToken } = useAuthStore();

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(!!quizId);

    // Form State
    const [question, setQuestion] = useState('');
    const [category, setCategory] = useState('');
    const [difficulty, setDifficulty] = useState('EASY');
    const [explanation, setExplanation] = useState('');
    const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);

    // Fetch existing quiz if ID is present
    useEffect(() => {
        if (quizId && accessToken) {
            const fetchQuiz = async () => {
                try {
                    // API implementation for single quiz fetch is needed.
                    // IMPORTANT: The /api/quizzes endpoint is currently a LIST. 
                    // AND /api/quizzes/[id] is DELETE/PUT. We need GET /api/quizzes/[id] too if we want to edit.
                    // Wait, /api/users/[id] had GET. Does /api/quizzes/[id] have GET?
                    // I need to double check. If not, I'll have to rely on list or add GET.
                    // Let's assume for now I added it, or will add it.
                    // I will prioritize CREATE first. If EDIT fails, I will fix API.
                    // Wait, I can verify if GET /api/quizzes/[id] exists. I saw PUT/DELETE in the file view.
                    // I will add GET /api/quizzes/[id] if missing in the next step.
                    // For now, let's implement the fetching logic assuming it will be there.
                    // But to be safe, I'll use a try-catch and alert if fails.
                    /* 
                       Actually, I saw the code for /api/quizzes/[id]/route.ts and it ONLY had PUT and DELETE.
                       So I MUST add GET to it. 
                    */
                } catch (err) {
                    console.error(err);
                }
            };
            // fetchQuiz(); 
            // I will implement the fetch logic but I know the API is missing GET.
            // So for this step, I will only fully enable CREATE. 
            // I will update the API in the next step to support GET /api/quizzes/[id]
        }
    }, [quizId, accessToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!question || selectedAnswer === null || !explanation) {
            alert('Mohon lengkapi semua field!');
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                question,
                answer: selectedAnswer,
                explanation,
                category: category || 'Umum',
                difficulty,
            };

            const url = quizId ? `/api/quizzes/${quizId}` : '/api/quizzes';
            const method = quizId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Gagal menyimpan soal');
            }

            alert(quizId ? 'Soal berhasil diperbarui!' : 'Soal berhasil dibuat!');
            router.push('/admin/quizzes');

        } catch (error: any) {
            console.error('Save Error:', error);
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/quizzes" className="p-2 rounded-xl bg-white border border-[var(--gray-200)] text-[var(--gray-600)] hover:bg-[var(--gray-50)] shadow-sm transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--gray-800)] flex items-center gap-2">
                            <PenTool className="w-6 h-6 text-[var(--primary-600)]" />
                            {quizId ? 'Edit Soal' : 'Quiz Builder'}
                        </h1>
                        <p className="text-sm text-[var(--gray-500)]">
                            {quizId ? 'Perbarui pertanyaan kuis.' : 'Tambah soal baru ke bank soal kuis.'}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card variant="white" className="p-6 md:p-8 space-y-6 border border-white/60 shadow-[var(--shadow-soft-md)]">
                            <h2 className="text-lg font-bold text-[var(--gray-800)] flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-[var(--primary-500)]" />
                                Detail Pertanyaan
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-[var(--gray-700)] mb-2">Kalimat Soal</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Contoh: Gigi susu berjumlah 20 buah pada anak-anak."
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--gray-50)] border border-[var(--gray-200)] focus:ring-4 focus:ring-[var(--primary-100)] focus:border-[var(--primary-500)] outline-none transition-all resize-none text-lg font-medium text-[var(--gray-800)]"
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        required
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
                                            <option value="Pengetahuan Umum">Pengetahuan Umum</option>
                                            <option value="Anatomi Gigi">Anatomi Gigi</option>
                                            <option value="Cara Merawat">Cara Merawat</option>
                                            <option value="Penyakit Gigi">Penyakit Gigi</option>
                                            <option value="Makanan Sehat">Makanan Sehat</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-[var(--gray-700)] mb-2">Tingkat Kesulitan</label>
                                        <select
                                            value={difficulty}
                                            onChange={(e) => setDifficulty(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-[var(--gray-50)] border border-[var(--gray-200)] focus:ring-4 focus:ring-[var(--primary-100)] focus:border-[var(--primary-500)] outline-none transition-all cursor-pointer"
                                        >
                                            <option value="EASY">Mudah (Easy)</option>
                                            <option value="MEDIUM">Sedang (Medium)</option>
                                            <option value="HARD">Sulit (Hard)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card variant="white" className="p-6 md:p-8 space-y-6 border border-white/60 shadow-[var(--shadow-soft-md)]">
                            <h2 className="text-lg font-bold text-[var(--gray-800)] text-center">Tentukan Kunci Jawaban</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setSelectedAnswer(true)}
                                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${selectedAnswer === true
                                        ? 'bg-green-50 border-green-500 shadow-md transform scale-[1.02]'
                                        : 'bg-[var(--gray-50)] border-[var(--gray-200)] hover:bg-[var(--gray-100)] opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedAnswer === true ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                    <span className={`font-black text-xl ${selectedAnswer === true ? 'text-green-600' : 'text-gray-500'}`}>BENAR</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSelectedAnswer(false)}
                                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${selectedAnswer === false
                                        ? 'bg-red-50 border-red-500 shadow-md transform scale-[1.02]'
                                        : 'bg-[var(--gray-50)] border-[var(--gray-200)] hover:bg-[var(--gray-100)] opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedAnswer === false ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                        <XCircle className="w-6 h-6" />
                                    </div>
                                    <span className={`font-black text-xl ${selectedAnswer === false ? 'text-red-600' : 'text-gray-500'}`}>SALAH</span>
                                </button>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card variant="white" className="p-6 space-y-4 border border-white/60 shadow-[var(--shadow-soft-md)]">
                            <h2 className="text-lg font-bold text-[var(--gray-800)]">Penjelasan Jawaban</h2>
                            <textarea
                                rows={6}
                                placeholder="Jelaskan kenapa jawabannya Benar/Salah..."
                                className="w-full px-4 py-3 rounded-xl bg-[var(--gray-50)] border border-[var(--gray-200)] focus:ring-4 focus:ring-[var(--primary-100)] focus:border-[var(--primary-500)] outline-none transition-all resize-none"
                                value={explanation}
                                onChange={(e) => setExplanation(e.target.value)}
                                required
                            />
                        </Card>

                        <div className="flex flex-col gap-3 sticky top-6">
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full shadow-lg shadow-blue-500/20"
                                isLoading={isLoading}
                                disabled={selectedAnswer === null}
                            >
                                <Save className="w-5 h-5 mr-2" />
                                Simpan Soal
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default function QuizBuilderPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>}>
            <QuizBuilderContent />
        </Suspense>
    );
}
