'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Clock, CheckCircle, XCircle, Star, Loader2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StudentBackground } from '@/components/layout/student-background';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth';
import { apiFetch } from '@/lib/api-client';

interface QuizQuestion {
    id: string;
    question: string;
    category: string;
    difficulty: string;
    answer: boolean; // Added answer field
    explanation?: string; // Added explanation
}

interface QuizResult {
    score: number;
    pointsEarned: number;
    correctAnswers: number;
    totalQuestions: number;
    answers: {
        quizId: string;
        isCorrect: boolean;
        explanation?: string;
    }[];
}

// ... existing interfaces ...

export default function QuizPlayPage() {
    const router = useRouter();
    // ... existing hooks ...
    const { accessToken } = useAuthStore();

    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Game State
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [userAnswers, setUserAnswers] = useState<{ quizId: string, answer: boolean }[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<QuizResult | null>(null);

    // Feedback State
    const [showFeedback, setShowFeedback] = useState<boolean>(false);
    const [isCorrect, setIsCorrect] = useState<boolean>(false);

    // ... useEffect fetchQuizzes ... 
    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                // Fetch 10 random quizzes (or just 10 latest for now, API limitation)
                // Ideally backend should support /api/quizzes/random ideally.
                // We'll fetch a larger list and shuffle locally for MVP randomness.
                const res = await apiFetch('/api/quizzes?isActive=true');
                const data = await res.json();

                if (data.success && data.data && Array.isArray(data.data.data)) {
                    const allQuizzes = data.data.data;
                    // Shuffle and take 10
                    const shuffled = [...allQuizzes].sort(() => 0.5 - Math.random());
                    setQuestions(shuffled.slice(0, 10));
                }
            } catch (error) {
                console.error("Failed to fetch quizzes", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuizzes();
    }, []);

    const handleAnswer = (answer: boolean) => {
        if (selectedAnswer !== null) return;

        setSelectedAnswer(answer);

        // Check Correctness
        const currentQ = questions[currentQuestionIdx];
        const correct = currentQ.answer === answer;
        setIsCorrect(correct);
        setShowFeedback(true);

        // Add to answers
        const newAnswers = [...userAnswers, { quizId: currentQ.id, answer }];
        setUserAnswers(newAnswers);

        // NO TIMEOUT - Wait for user to click "Lanjut"
    };

    const handleNextQuestion = () => {
        setShowFeedback(false);
        if (currentQuestionIdx < questions.length - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
            setSelectedAnswer(null);
        } else {
            submitQuiz(userAnswers);
        }
    };

    const submitQuiz = async (finalAnswers: { quizId: string, answer: boolean }[]) => {
        setIsSubmitting(true);
        try {
            const res = await apiFetch('/api/quizzes/attempt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ answers: finalAnswers })
            });
            const data = await res.json();

            if (data.success) {
                setResult(data.data);
            } else {
                alert('Gagal mengirim jawaban: ' + data.message);
                router.push('/quizzes');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Terjadi kesalahan saat mengirim jawaban.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <StudentBackground>
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                </div>
            </StudentBackground>
        );
    }

    if (questions.length === 0) {
        return (
            <StudentBackground>
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <div className="bg-white/90 p-8 rounded-3xl shadow-xl max-w-sm w-full">
                        <Loader2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 font-bold mb-4">Tidak ada kuis tersedia saat ini.</p>
                        <Link href="/dashboard" className="text-[#0EA5E9] font-bold hover:underline">Kembali ke Dashboard</Link>
                    </div>
                </div>
            </StudentBackground>
        );
    }

    if (result) {
        return (
            <StudentBackground>
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white/90 backdrop-blur-md rounded-3xl p-8 border-[3px] border-white shadow-2xl max-w-md w-full"
                    >
                        <div className="w-24 h-24 bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg rotate-12">
                            <CheckCircle className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-[#0DA5E9] mb-2 flex items-center justify-center gap-2">
                            Selesai! <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                        </h2>
                        <p className="text-gray-600 font-medium mb-6">
                            Kamu menjawab {result.correctAnswers} dari {result.totalQuestions} soal dengan benar.
                        </p>

                        <div className="bg-[#E0F2FE] rounded-2xl p-6 mb-8 border border-[#BAE6FD]">
                            <p className="text-sm text-[#0284C7] font-bold uppercase tracking-wider mb-1">Skor Kamu</p>
                            <p className="text-5xl font-black text-[#0284C7]">{result.score}</p>
                            <p className="text-sm text-[#0369A1] font-bold mt-2">+ {result.pointsEarned} XP</p>
                        </div>

                        <Link
                            href="/quizzes"
                            className="block w-full py-4 rounded-2xl bg-[#0EA5E9] text-white font-bold text-lg shadow-lg hover:shadow-xl hover:bg-[#0284C7] transition-all border-b-[6px] border-[#0284C7] active:border-b-0 active:translate-y-2 active:scale-[0.98]"
                        >
                            Main Lagi
                        </Link>
                    </motion.div>
                </div>
            </StudentBackground>
        );
    }

    const currentQ = questions[currentQuestionIdx];

    if (!currentQ) {
        return (
            <StudentBackground>
                <div className="flex-1 flex flex-col items-center justify-center text-white p-10 text-center">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p className="font-bold">Memuat soal...</p>
                    <div className="mt-4 p-4 bg-black/20 rounded text-xs text-left font-mono">
                        <p>Debug Info (Temporary):</p>
                        <p>Questions: {questions?.length ?? 'undefined'}</p>
                        <p>Index: {currentQuestionIdx}</p>
                        <p>Loading: {String(isLoading)}</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-6 py-2 bg-white text-sky-600 rounded-full font-bold hover:bg-sky-50"
                    >
                        Reload
                    </button>
                </div>
            </StudentBackground>
        );
    }

    return (
        <StudentBackground>
            {/* Feedback Popup Overlay */}
            <AnimatePresence>
                {showFeedback && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        {/* Backdrop with blur */}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

                        <div className={`relative z-10 w-full max-w-md p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border-4 text-center ${isCorrect
                            ? 'bg-green-500 border-green-300 text-white'
                            : 'bg-red-500 border-red-300 text-white'
                            }`}>

                            {isCorrect ? (
                                <>
                                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-2 animate-bounce">
                                        <CheckCircle className="w-12 h-12" />
                                    </div>
                                    <h3 className="text-3xl font-black uppercase tracking-wider">Benar!</h3>
                                    {currentQ.explanation && (
                                        <div className="bg-black/10 p-4 rounded-xl w-full text-sm md:text-base leading-relaxed">
                                            <p className="font-bold mb-1 opacity-80 uppercase text-xs">Penjelasan:</p>
                                            {currentQ.explanation}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-2 animate-pulse">
                                        <XCircle className="w-12 h-12" />
                                    </div>
                                    <h3 className="text-3xl font-black uppercase tracking-wider">Salah!</h3>
                                    <div className="bg-black/10 p-4 rounded-xl w-full text-sm md:text-base leading-relaxed">
                                        <p className="font-bold mb-2">Jawaban Benar: <span className="underline">{currentQ.answer ? 'BENAR' : 'SALAH'}</span></p>
                                        {currentQ.explanation && (
                                            <>
                                                <hr className="border-white/20 my-2" />
                                                <p className="font-bold mb-1 opacity-80 uppercase text-xs">Penjelasan:</p>
                                                {currentQ.explanation}
                                            </>
                                        )}
                                    </div>
                                </>
                            )}

                            <button
                                onClick={handleNextQuestion}
                                className="mt-4 w-full py-3 bg-white text-gray-900 rounded-xl font-black uppercase tracking-widest hover:bg-gray-100 active:scale-95 transition-all shadow-lg"
                            >
                                {currentQuestionIdx < questions.length - 1 ? 'Lanjut Soal Berikutnya' : 'Lihat Hasil'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            {/* ... rest of the UI ... */}
            <div className="flex items-center justify-between p-4 md:p-6 relative z-20">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-lg hover:bg-white/30 transition-all active:scale-95"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>

                {/* Progress Bar */}
                <div className="flex-1 max-w-xs mx-4">
                    <div className="h-4 bg-white/30 backdrop-blur-sm rounded-full overflow-hidden border border-white/40">
                        <motion.div
                            className="h-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/40 font-bold text-white text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {currentQuestionIdx + 1}/{questions.length}
                </div>
            </div>

            {/* Question Card */}
            <div className="flex-1 flex flex-col justify-center px-4 md:px-6 pb-24 max-w-3xl mx-auto w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQ.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="w-full"
                    >
                        {/* Question Text */}
                        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 min-h-[160px] flex items-center justify-center text-center shadow-xl border-[3px] border-white mb-6 relative">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed">
                                {currentQ.question}
                            </h2>
                        </div>

                        {/* Options True/False */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleAnswer(true)}
                                disabled={selectedAnswer !== null}
                                className={`
                                    w-full p-8 rounded-3xl font-black text-2xl flex flex-col items-center gap-2 transition-all duration-300
                                    shadow-lg border-b-[6px] active:border-b-0 active:translate-y-2
                                    ${selectedAnswer === true
                                        ? (isCorrect ? 'bg-green-500 text-white border-green-700' : 'bg-red-500 text-white border-red-700')
                                        : 'bg-white text-green-500 border-gray-200 hover:bg-green-50'}
                                    ${selectedAnswer !== null && selectedAnswer !== true ? 'opacity-50' : ''}
                                `}
                            >
                                <CheckCircle className="w-12 h-12" />
                                BENAR
                            </button>

                            <button
                                onClick={() => handleAnswer(false)}
                                disabled={selectedAnswer !== null}
                                className={`
                                    w-full p-8 rounded-3xl font-black text-2xl flex flex-col items-center gap-2 transition-all duration-300
                                    shadow-lg border-b-[6px] active:border-b-0 active:translate-y-2
                                    ${selectedAnswer === false
                                        ? (isCorrect ? 'bg-green-500 text-white border-green-700' : 'bg-red-500 text-white border-red-700')
                                        : 'bg-white text-red-500 border-gray-200 hover:bg-red-50'}
                                    ${selectedAnswer !== null && selectedAnswer !== false ? 'opacity-50' : ''}
                                `}
                            >
                                <XCircle className="w-12 h-12" />
                                SALAH
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {isSubmitting && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center text-white font-bold flex-col gap-4">
                        <Loader2 className="w-12 h-12 animate-spin" />
                        Sedang mengirim jawaban...
                    </div>
                )}
            </div>
        </StudentBackground>
    );
}
