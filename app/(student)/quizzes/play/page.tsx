'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Clock, CheckCircle, XCircle, Star, Loader2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StudentBackground } from '@/components/layout/student-background';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth';
import { apiFetch } from '@/lib/api-client';
import useSWR from 'swr'; // Import SWR for prefetching if needed, but we handle logic custom here

interface QuizQuestion {
    id: string;
    question: string;
    category: string;
    difficulty: string;
    // answer: boolean; //  <-- REMOVED for security
    // explanation?: string; // <-- REMOVED for security
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

export default function QuizPlayPage() {
    const router = useRouter();
    const { accessToken } = useAuthStore();

    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [attemptId, setAttemptId] = useState<string | null>(null);

    // Game State
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
    const [feedbackState, setFeedbackState] = useState<'correct' | 'incorrect' | null>(null);
    // We don't know if it's correct immediately unless we trust our guess or response.
    // OPTIMISTIC STRATEGY: 
    // Since we removed 'answer' from client, we CANNOT know instantly if it's correct for sure unless we check server.
    // BUT the user asked for "Optimistic UI... Begitu klik, UI langsung berubah".
    // AND "Logika: Begitu klik... pindah soal".
    // Wait, if we don't have the answer key, how do we show green/red?
    // We CAN'T show green/red without the key or a server response.
    // If the user wants "Instant Feedback" AND "Lean Payload (Hidden Key)", these are conflicting goals unless:
    // 1. We fetch key on demand (fast).
    // 2. We allow "Next" immediately and show results at end (Quizizz style mostly shows immediate, but they have key).
    // Let's assume for "Deep Optimization" + "Security", we might store a hash? 
    // Or, we assume the server response is fast enough? 
    // OR, we stick to the user request: "Jangan menunggu respon API... UI langsung berubah (warna berubah)".
    // If we want color change, we NEED the answer.
    // COMPROMISE: We will keep the answer key hidden BUT verify on server. 
    // OPTIMISTIC UPDATES usually mean "Assume success". 
    // If we can't show Green/Red, we can just show "Selected" and move on?
    // User said: "warna berubah/pindah soal".
    // I will implement: Click -> Highlight selection -> Move next (Optimistic) -> Background validate.
    // We won't show "Correct/Incorrect" popup immediately if we want to be pure optimistic without key.
    // OR, we fetch the answer key individually? No that's slow.
    // OPTION: We request the 'answer' ONLY for the current question via a separate lean call?
    // PREFETCHING STRATEGY: We prefetch the NEXT question details (including answer/explanation hiddenly?).
    // Security-wise: If we send answer to client, user can hack.
    // User said: "Audit kembali semua API kuis... Jangan kirim seluruh objek...".
    // I will interpret this as: Submit answer -> Move Next immediately (don't block). 
    // Feedback will be deferred OR we assume we can't show "Correct" immediately without key.
    // However, User explicitely said: "UI langsung berubah (warna berubah/pindah soal)". 
    // Let's make the transition instant. We'll show "Loading/Checking" purely visual or just skip to next? 
    // Actually, widespread practice for secure quizzes is: Don't show immediate feedback, OR show it at end.
    // BUT for "Learning Mode", we want feedback.
    // I will try to fetch the answer for the CURRENT question validation in parallel or return it in the Save response.
    // To make it "Optimistic", we assume "Selected" state -> Move to Next. 
    // We'll show the detailed results at the end.

    // WAIT: If I can't show green/red, I can't fulfill "warna berubah".
    // I will change the UX to: Select -> Highlight Blue -> Slide Out -> Next Question.
    // This is instant. Authentication/Validation happens in BG.

    const [isFinishing, setIsFinishing] = useState(false);
    const [result, setResult] = useState<QuizResult | null>(null);

    // Initialization
    useEffect(() => {
        const initGame = async () => {
            try {
                // 1. Fetch Questions (Lean)
                const res = await apiFetch('/api/quizzes?limit=50&isActive=true'); // Fetch plenty
                const data = await res.json();

                if (data.success && Array.isArray(data.data.data)) {
                    const all = data.data.data;
                    const shuffled = [...all].sort(() => 0.5 - Math.random()).slice(0, 10);
                    setQuestions(shuffled);

                    // 2. Start Attempt
                    const startRes = await apiFetch('/api/quizzes/attempt/start', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ quizIds: shuffled.map(q => q.id) })
                    });
                    const startData = await startRes.json();
                    if (startData.success) {
                        setAttemptId(startData.data.attemptId);
                    }
                }
            } catch (e) {
                console.error("Init failed", e);
            } finally {
                setIsLoading(false);
            }
        };
        initGame();
    }, []);

    // Prefetch Next (Naive implementation)
    // SWR handles caching if we use it, but here we just have the list.
    // Optimization is mainly in the "Save" background process.

    const handleAnswer = async (answer: boolean) => {
        if (selectedAnswer !== null) return; // Prevent double click
        setSelectedAnswer(answer);

        // OPTIMISTIC UI: Wait small delay for visual feedback then move next
        // We do NOT show correct/wrong here to preserve 'Unknown' security model 
        // AND to imply speed (no waiting for validation).

        setTimeout(() => {
            handleNext(answer);
        }, 500); // 0.5s visual feedback of selection
    };

    const handleNext = async (answer: boolean) => {
        // 1. Fire and Forget Save (Background)
        if (attemptId && questions[currentQuestionIdx]) {
            const qId = questions[currentQuestionIdx].id;
            apiFetch(`/api/quizzes/attempt/${attemptId}/save`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quizId: qId, answer })
            }).then(res => res.json()).then(d => {
                // We could check d.isCorrect here if we wanted late feedback
            });
        }

        // 2. Advance UI immediately
        if (currentQuestionIdx < questions.length - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
            setSelectedAnswer(null);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = async () => {
        setIsFinishing(true);
        try {
            if (attemptId) {
                const res = await apiFetch(`/api/quizzes/attempt/${attemptId}/finish`, {
                    method: 'POST'
                });
                const data = await res.json();
                if (data.success) {
                    setResult(data.data);
                }
            }
        } catch (e) {
            console.error("Finish failed", e);
        } finally {
            setIsFinishing(false);
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

    if (result) {
        // Result View (Same as before)
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
                        <h2 className="text-3xl font-extrabold text-[#0DA5E9] mb-2">Selesai!</h2>
                        <p className="text-gray-600 font-medium mb-6">
                            Skor: {result.score} ( +{result.pointsEarned} XP )
                        </p>
                        <Link href="/quizzes" className="bg-[#0EA5E9] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0284C7]">Kembali</Link>
                    </motion.div>
                </div>
            </StudentBackground>
        );
    }

    const currentQ = questions[currentQuestionIdx];

    return (
        <StudentBackground>
            {/* Minimal Header */}
            <div className="flex items-center justify-between p-4 md:p-6 relative z-20">
                <div className="bg-white/20 px-4 py-2 rounded-xl text-white font-bold backdrop-blur-md">
                    Soal {currentQuestionIdx + 1} / {questions.length}
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 flex flex-col justify-center px-4 md:px-6 pb-24 max-w-3xl mx-auto w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQ?.id} // Key change triggers animation
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="w-full"
                    >
                        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 min-h-[200px] flex items-center justify-center text-center shadow-xl border-[3px] border-white mb-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                                {currentQ?.question}
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[true, false].map((val) => (
                                <button
                                    key={String(val)}
                                    // If we had options, we would map them. Here we have True/False.
                                    onClick={() => handleAnswer(val)}
                                    disabled={selectedAnswer !== null}
                                    className={`
                                        w-full p-6 rounded-2xl font-black text-xl flex items-center justify-center gap-2 transition-all duration-200
                                        shadow-lg border-b-[4px] active:scale-95 active:border-b-0 active:translate-y-1
                                        ${selectedAnswer === val
                                            ? 'bg-blue-500 text-white border-blue-700'
                                            : val ? 'bg-white text-green-600 border-gray-200' : 'bg-white text-red-500 border-gray-200'
                                        }
                                        ${selectedAnswer !== null && selectedAnswer !== val ? 'opacity-50' : ''}
                                    `}
                                >
                                    {val ? 'BENAR' : 'SALAH'}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {isFinishing && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center text-white">
                        <Loader2 className="animate-spin w-10 h-10" />
                    </div>
                )}
            </div>
        </StudentBackground>
    );
}
