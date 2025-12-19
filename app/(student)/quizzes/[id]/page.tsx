'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Clock, CheckCircle, XCircle, ArrowRight, RotateCw, Trophy, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StudentBackground } from '@/components/layout/student-background';
import Link from 'next/link';

// MOCK QUESTIONS
const QUESTIONS = [
    {
        id: 1,
        question: "Berapa kali kita harus menyikat gigi dalam sehari?",
        options: ["1 kali", "2 kali", "Setiap makan", "Tidak perlu"],
        correct: 1 // Index
    },
    {
        id: 2,
        question: "Makanan apa yang bisa merusak gigi jika dimakan berlebihan?",
        options: ["Sayuran", "Buah-buahan", "Permen & Coklat", "Ikan"],
        correct: 2
    },
    {
        id: 3,
        question: "Berapa lama waktu ideal untuk menyikat gigi?",
        options: ["10 detik", "30 detik", "2 menit", "5 menit"],
        correct: 2
    },
    {
        id: 4,
        question: "Apa nama dokter yang merawat gigi kita?",
        options: ["Dokter Jantung", "Dokter Gigi", "Dokter Mata", "Dokter Hewan"],
        correct: 1
    },
    {
        id: 5,
        question: "Kapan waktu yang tepat untuk mengganti sikat gigi?",
        options: ["Setiap minggu", "Setiap 3-4 bulan", "1 tahun sekali", "Saat rusak saja"],
        correct: 1
    }
];

export default function QuizPlayerPage() {
    const router = useRouter();
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const currentQ = QUESTIONS[currentQuestionIdx];

    const handleAnswer = (optionIdx: number) => {
        if (selectedOption !== null) return; // Prevent double click

        setSelectedOption(optionIdx);
        const correct = optionIdx === currentQ.correct;
        setIsCorrect(correct);

        if (correct) {
            setScore(s => s + 20); // 100 / 5 = 20 points per question
        }

        // Auto advance after 1.5s
        setTimeout(() => {
            if (currentQuestionIdx < QUESTIONS.length - 1) {
                setCurrentQuestionIdx(p => p + 1);
                setSelectedOption(null);
                setIsCorrect(null);
            } else {
                setIsFinished(true);
            }
        }, 1500);
    };

    if (isFinished) {
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
                            Hebat! <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                        </h2>
                        <p className="text-gray-600 font-medium mb-6">Kamu telah menyelesaikan kuis ini.</p>

                        <div className="bg-[#E0F2FE] rounded-2xl p-6 mb-8 border border-[#BAE6FD]">
                            <p className="text-sm text-[#0284C7] font-bold uppercase tracking-wider mb-1">Skor Kamu</p>
                            <p className="text-5xl font-black text-[#0284C7]">{score}</p>
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

    return (
        <StudentBackground>
            {/* Header */}
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
                            animate={{ width: `${((currentQuestionIdx + 1) / QUESTIONS.length) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/40 font-bold text-white text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> 02:00
                </div>
            </div>

            {/* Question Card */}
            <div className="flex-1 flex flex-col justify-center px-4 md:px-6 pb-24 max-w-3xl mx-auto w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIdx}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="w-full"
                    >
                        {/* Question Text */}
                        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 min-h-[160px] flex items-center justify-center text-center shadow-xl border-[3px] border-white mb-6 relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0EA5E9] text-white px-4 py-1 rounded-full text-xs font-bold border-2 border-white shadow-md">
                                Pertanyaan {currentQuestionIdx + 1}/{QUESTIONS.length}
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed">
                                {currentQ.question}
                            </h2>
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentQ.options.map((opt, idx) => {
                                let stateStyle = 'bg-white border-b-gray-200 text-gray-700 hover:bg-gray-50';

                                if (selectedOption !== null) {
                                    if (idx === currentQ.correct) {
                                        stateStyle = 'bg-green-100 border-green-500 text-green-700 ring-2 ring-green-500';
                                    } else if (idx === selectedOption) {
                                        stateStyle = 'bg-red-100 border-red-500 text-red-700 ring-2 ring-red-500';
                                    } else {
                                        stateStyle = 'bg-gray-100 text-gray-400 opacity-50';
                                    }
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(idx)}
                                        disabled={selectedOption !== null}
                                        className={`
                                            w-full p-4 rounded-2xl font-bold text-lg text-left transition-all duration-300 relative overflow-hidden
                                            border-2 border-transparent shadow-lg
                                            ${selectedOption === null ? 'active:scale-[0.98] border-b-[6px] active:border-b-2 active:translate-y-1' : ''}
                                            ${stateStyle}
                                            ${selectedOption === null ? 'border-b-gray-300' : ''}
                                        `}
                                    >
                                        <div className="flex items-center justify-between relative z-10">
                                            <span>{opt}</span>
                                            {selectedOption !== null && idx === currentQ.correct && (
                                                <CheckCircle className="w-6 h-6 text-green-600" />
                                            )}
                                            {selectedOption !== null && idx === selectedOption && idx !== currentQ.correct && (
                                                <XCircle className="w-6 h-6 text-red-600" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

        </StudentBackground>
    );
}
