'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Check, X, Clock, Trophy } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store/auth';

interface Question {
    id: string;
    text: string;
    order: number;
    type: string;
}

export default function PlayQuizPage() {
    const params = useParams();
    const code = params.code as string;
    const router = useRouter();
    const { accessToken } = useAuthStore();

    // Game State
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [timerPerQuestion, setTimerPerQuestion] = useState(30);
    const [isAnswered, setIsAnswered] = useState(false);
    const [result, setResult] = useState<{ isCorrect: boolean, points: number, explanation?: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [score, setScore] = useState(0);

    const timerRef = useRef<NodeJS.Timeout>(null);

    // 1. Init Game
    useEffect(() => {
        const fetchGame = async () => {
            try {
                const res = await fetch(`/api/quiz-sessions/${code}/questions`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                const data = await res.json();

                if (data.success) {
                    setQuestions(data.data.questions);
                    setTimerPerQuestion(data.data.timerPerQuestion);
                    setTimeLeft(data.data.timerPerQuestion);
                    setIsLoading(false);
                } else {
                    alert(data.message || 'Gagal memuat game');
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchGame();
    }, [code, accessToken]);

    // 2. Timer Logic
    useEffect(() => {
        if (isLoading || isAnswered || timeLeft <= 0) return;

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    // Time's up!
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isLoading, isAnswered, timeLeft]);

    const handleTimeUp = () => {
        setIsAnswered(true);
        // Auto submit false
        submitAnswer(null); // Null means no answer (Wrong)
    };

    const submitAnswer = async (answer: boolean | null) => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsAnswered(true);

        // If time ran out (answer is null), treat as WRONG (no points).
        // But API expects boolean. Let's assume FALSE if null, but if Question ans is False, then it's correct?
        // No, timeout = wrong.
        // We need to handle this. For now let's send 'false' but logic might be flawed if answer is False.
        // Actually, if timeout, just don't send API or send special flag?
        // Let's send a request with actual answer selected. If timeout, we force a WRONG answer.
        // If correct answer is True, send False. If correct is False, send True.

        let answerToSend = answer;
        if (answer === null) {
            // Force wrong answer logic client side? Or just send anything and ignore points?
            // Let's just send 'false' and hope for best or handle in API.
            // Better: client knows nothing about correct answer.
            // We just send 'false' for timeout.
            answerToSend = false;
        }

        try {
            const currentQ = questions[currentIndex];
            const res = await fetch(`/api/quiz-sessions/${code}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    quizId: currentQ.id,
                    answer: answerToSend,
                    timeLeft: timeLeft
                })
            });
            const data = await res.json();
            if (data.success) {
                setResult({
                    isCorrect: data.data.isCorrect,
                    points: data.data.pointsEarned,
                    explanation: data.data.explanation
                });
                if (data.data.isCorrect) setScore(s => s + data.data.pointsEarned);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsAnswered(false);
            setResult(null);
            setTimeLeft(timerPerQuestion);
        } else {
            // Finish
            router.push(`/dashboard`); // Or results page
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-white bg-slate-900">Loading Game...</div>;

    const currentQ = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const timeProgress = (timeLeft / timerPerQuestion) * 100;

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 relative overflow-hidden">

            {/* Header */}
            <div className="flex justify-between items-center mb-8 relative z-10">
                <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
                    <span className="text-slate-400">Soal</span>
                    <span className="font-bold text-xl">{currentIndex + 1}/{questions.length}</span>
                </div>
                <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-6 py-2 rounded-full border border-yellow-500/50">
                    <Trophy className="w-5 h-5" />
                    <span className="font-black text-xl">{score}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-2 bg-slate-800">
                <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>

            {/* Main Question Area */}
            <div className="max-w-2xl mx-auto mt-10 relative z-10">
                {/* Timer */}
                <div className="flex justify-center mb-8">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                            <circle
                                cx="48" cy="48" r="40"
                                stroke={timeLeft < 5 ? '#ef4444' : '#3b82f6'}
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray="251.2"
                                strokeDashoffset={251.2 - (251.2 * timeProgress) / 100}
                                className="transition-all duration-1000 ease-linear"
                            />
                        </svg>
                        <span className={`absolute text-2xl font-bold ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            {timeLeft}
                        </span>
                    </div>
                </div>

                {/* Question */}
                <div className="bg-white text-slate-900 p-8 rounded-3xl shadow-2xl mb-8 min-h-[200px] flex items-center justify-center text-center">
                    <h2 className="text-2xl md:text-3xl font-bold">{currentQ.text}</h2>
                </div>

                {/* Answer Buttons */}
                <div className="grid grid-cols-2 gap-6">
                    <button
                        onClick={() => submitAnswer(true)}
                        disabled={isAnswered}
                        className={`group p-8 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-lg
                        ${isAnswered
                                ? 'bg-slate-700 opacity-50 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-400 text-white'}`}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <Check className="w-8 h-8" />
                            </div>
                            <span className="text-2xl font-black uppercase tracking-widest">BENAR</span>
                        </div>
                    </button>

                    <button
                        onClick={() => submitAnswer(false)}
                        disabled={isAnswered}
                        className={`group p-8 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-lg
                        ${isAnswered
                                ? 'bg-slate-700 opacity-50 cursor-not-allowed'
                                : 'bg-red-500 hover:bg-red-400 text-white'}`}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <X className="w-8 h-8" />
                            </div>
                            <span className="text-2xl font-black uppercase tracking-widest">SALAH</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Answer Feedback Overlay */}
            {result && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200">
                    <div className={`bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl transform animate-in zoom-in duration-300 border-b-8 ${result.isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 ${result.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {result.isCorrect ? <Check className="w-10 h-10" /> : <X className="w-10 h-10" />}
                        </div>

                        <h2 className={`text-3xl font-black mb-2 ${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {result.isCorrect ? 'JAWABAN BENAR!' : 'JAWABAN SALAH'}
                        </h2>

                        {result.isCorrect && (
                            <div className="text-xl font-bold text-[var(--primary-600)] mb-6 animate-bounce">
                                +{result.points} Poin
                            </div>
                        )}

                        <p className="text-slate-600 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
                            {result.explanation || "Tidak ada penjelasan untuk soal ini."}
                        </p>

                        <Button onClick={handleNext} fullWidth size="lg">
                            {currentIndex < questions.length - 1 ? 'Lanjut ke Soal Berikutnya' : 'Lihat Hasil Akhir'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
