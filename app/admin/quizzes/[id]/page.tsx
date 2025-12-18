'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, CheckCircle, XCircle, HelpCircle, Edit, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/store/auth';

interface QuizForm {
    question: string;
    category: string;
    difficulty: string;
    answer: boolean;
    explanation: string;
}

export default function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const quizId = resolvedParams.id;
    const router = useRouter();
    const { accessToken } = useAuthStore();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<QuizForm>({
        question: '',
        category: 'umum',
        difficulty: 'EASY',
        answer: true,
        explanation: '',
    });

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await fetch(`/api/quizzes/${quizId}`);
                if (!res.ok) throw new Error('Failed to fetch quiz');

                const data = await res.json();
                const quiz = data.data;

                // Direct mapping from Quiz model (Single Question)
                setFormData({
                    question: quiz.question || '',
                    category: quiz.category || 'umum',
                    difficulty: quiz.difficulty || 'EASY',
                    answer: quiz.answer ?? true,
                    explanation: quiz.explanation || '',
                });
            } catch (error) {
                console.error(error);
                alert('Gagal mengambil data kuis');
                router.push('/admin/quizzes');
            } finally {
                setIsLoading(false);
            }
        };

        if (quizId) {
            fetchQuiz();
        }
    }, [quizId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Payload matching updateQuizQuestionSchema
            const payload = {
                question: formData.question,
                answer: formData.answer,
                explanation: formData.explanation,
                category: formData.category,
                difficulty: formData.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
            };

            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };
            if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

            const res = await fetch(`/api/quizzes/${quizId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Gagal update kuis');
            }

            alert('Berhasil menyimpan perubahan');
            router.push('/admin/quizzes');
        } catch (error: any) {
            console.error(error);
            alert(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-[var(--primary-500)] animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/quizzes" className="p-2 rounded-xl bg-white border border-[var(--gray-200)] text-[var(--gray-600)] hover:bg-[var(--gray-50)] shadow-sm transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--gray-800)] flex items-center gap-2">
                        <Edit className="w-6 h-6 text-[var(--primary-600)]" />
                        Edit Soal Kuis
                    </h1>
                    <p className="text-sm text-[var(--gray-500)]">Perbaiki pertanyaan atau kunci jawaban.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Question Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card variant="white" className="p-6 md:p-8 space-y-6 border border-white/60 shadow-[var(--shadow-soft-md)]">
                            <h2 className="text-lg font-bold text-[var(--gray-800)] flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-[var(--primary-500)]" />
                                Pertanyaan
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-[var(--gray-700)] mb-2">Kalimat Soal</label>
                                    <textarea
                                        rows={3}
                                        value={formData.question}
                                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--gray-50)] border border-[var(--gray-200)] focus:ring-4 focus:ring-[var(--primary-100)] focus:border-[var(--primary-500)] outline-none transition-all resize-none text-lg font-medium text-[var(--gray-800)]"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Category: Hidden or Optional if not supported by backend yet, keeping UI for now */}
                                    <div>
                                        <label className="block text-sm font-bold text-[var(--gray-700)] mb-2">Kategori</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-[var(--gray-50)] border border-[var(--gray-200)] focus:ring-4 focus:ring-[var(--primary-100)] focus:border-[var(--primary-500)] outline-none transition-all cursor-pointer"
                                        >
                                            <option value="umum">Pengetahuan Umum</option>
                                            <option value="anatomi">Anatomi Gigi</option>
                                            <option value="kesehatan">Cara Merawat</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-[var(--gray-700)] mb-2">Tingkat Kesulitan</label>
                                        <select
                                            value={formData.difficulty}
                                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
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
                                    onClick={() => setFormData({ ...formData, answer: true })}
                                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${formData.answer === true
                                        ? 'bg-green-50 border-green-500 shadow-md transform scale-[1.02]'
                                        : 'bg-[var(--gray-50)] border-[var(--gray-200)] hover:bg-[var(--gray-100)] opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${formData.answer === true ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                    <span className={`font-black text-xl ${formData.answer === true ? 'text-green-600' : 'text-gray-500'}`}>BENAR</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, answer: false })}
                                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${formData.answer === false
                                        ? 'bg-red-50 border-red-500 shadow-md transform scale-[1.02]'
                                        : 'bg-[var(--gray-50)] border-[var(--gray-200)] hover:bg-[var(--gray-100)] opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${formData.answer === false ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                        <XCircle className="w-6 h-6" />
                                    </div>
                                    <span className={`font-black text-xl ${formData.answer === false ? 'text-red-600' : 'text-gray-500'}`}>SALAH</span>
                                </button>
                            </div>
                        </Card>
                    </div>

                    {/* Right: Explanation & Submit */}
                    <div className="space-y-6">
                        <Card variant="white" className="p-6 space-y-4 border border-white/60 shadow-[var(--shadow-soft-md)]">
                            <h2 className="text-lg font-bold text-[var(--gray-800)]">Penjelasan Jawaban</h2>

                            <textarea
                                rows={6}
                                value={formData.explanation}
                                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                                placeholder="Jelaskan kenapa jawabannya Benar/Salah..."
                                className="w-full px-4 py-3 rounded-xl bg-[var(--gray-50)] border border-[var(--gray-200)] focus:ring-4 focus:ring-[var(--primary-100)] focus:border-[var(--primary-500)] outline-none transition-all resize-none"
                            />
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 sticky top-6">
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full shadow-lg shadow-blue-500/20"
                                disabled={isSaving}
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                            <Link href="/admin/quizzes" className="w-full">
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
