'use client';

import { ChevronLeft, BookOpen, User, Users, ArrowRight, Play, Lock, Zap } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentBackground } from '@/components/layout/student-background';

// ... imports
import { useAuthStore } from '@/lib/store/auth';

// Metadata removed

export default function QuizzesPage() {
    const router = useRouter();
    const { accessToken } = useAuthStore();
    const [viewMode, setViewMode] = useState<'menu' | 'join'>('menu');
    const [gameCode, setGameCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSinglePlayer = () => {
        router.push('/quizzes/play');
    };

    const handleJoinSession = async () => {
        if (!gameCode) return;
        setIsLoading(true);

        try {
            const res = await fetch('/api/quiz-sessions/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ code: gameCode })
            });

            const data = await res.json();

            if (res.ok) {
                router.push(`/live-quiz/${data.data.code}`);
            } else {
                alert(data.message || 'Gagal bergabung');
            }
        } catch (error) {
            alert('Terjadi kesalahan jaringan');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <StudentBackground>
            {/* Header with Back Button */}
            <div className="flex items-center justify-between p-4 md:p-6 relative z-20">
                <button
                    onClick={() => viewMode === 'join' ? setViewMode('menu') : router.push('/dashboard')}
                    className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-lg hover:bg-white/30 transition-all active:scale-95"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <h1 className="text-xl font-bold text-white drop-shadow-md flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-300" />
                    Kuis Seru
                </h1>
                <div className="w-10" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-24 no-scrollbar flex flex-col justify-center">
                <div className="max-w-xl mx-auto w-full space-y-8">

                    {viewMode === 'menu' ? (
                        /* MODE SELECTION */
                        <div className="grid grid-cols-1 gap-6">
                            {/* Single Player Card */}
                            <button
                                onClick={handleSinglePlayer}
                                className="group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 ease-out border-b-[8px] active:border-b-0 active:translate-y-2 active:scale-[0.98] bg-[#E0F2FE] border-[#0284C7] shadow-[0_10px_25px_-5px_rgba(14,165,233,0.4)] text-left min-h-[160px] flex flex-col justify-between"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                    <User className="w-32 h-32 text-[#0EA5E9]" />
                                </div>
                                <div className="relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#38BDF8] to-[#0EA5E9] flex items-center justify-center shadow-lg mb-4 group-hover:rotate-6 transition-transform">
                                        <User className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-[#0C4A6E] mb-1">
                                        Main Sendiri
                                    </h3>
                                    <p className="text-[#0369A1] font-semibold text-sm opacity-80 leading-tight max-w-[80%]">
                                        Langsung main & kumpulkan XP tanpa perlu menunggu teman!
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-[#0284C7] font-bold text-sm bg-white/40 self-start px-3 py-1.5 rounded-xl backdrop-blur-sm">
                                    Mulai Sekarang <ArrowRight className="w-4 h-4" />
                                </div>
                            </button>

                            {/* Multiplayer Card */}
                            <button
                                onClick={() => setViewMode('join')}
                                className="group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 ease-out border-b-[8px] active:border-b-0 active:translate-y-2 active:scale-[0.98] bg-[#FEF3C7] border-[#D97706] shadow-[0_10px_25px_-5px_rgba(245,158,11,0.4)] text-left min-h-[160px] flex flex-col justify-between"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                    <Users className="w-32 h-32 text-[#F59E0B]" />
                                </div>
                                <div className="relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] flex items-center justify-center shadow-lg mb-4 group-hover:-rotate-6 transition-transform">
                                        <Users className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-[#78350F] mb-1">
                                        Main Bersama
                                    </h3>
                                    <p className="text-[#92400E] font-semibold text-sm opacity-80 leading-tight max-w-[80%]">
                                        Tantang teman sekelasmu dan jadilah juara ranking 1!
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-[#D97706] font-bold text-sm bg-white/40 self-start px-3 py-1.5 rounded-xl backdrop-blur-sm">
                                    Masuk Room <ArrowRight className="w-4 h-4" />
                                </div>
                            </button>
                        </div>
                    ) : (
                        /* JOIN ROOM (CODE ENTRY) */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border-[3px] border-white shadow-2xl"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 rotate-3">
                                    <Lock className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-extrabold text-gray-800">Masukkan Kode</h2>
                                <p className="text-gray-500 font-medium text-sm">Minta kode permainan dari gurumu!</p>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={gameCode}
                                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                                    placeholder="CONTOH: 123456"
                                    className="w-full text-center text-3xl font-black tracking-[0.2em] py-4 rounded-2xl border-2 border-gray-200 focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/20 outline-none uppercase placeholder:text-gray-300 transition-all text-gray-700 bg-gray-50"
                                    maxLength={6}
                                />

                                <button
                                    onClick={handleJoinSession}
                                    disabled={gameCode.length < 4 || isLoading}
                                    className={`w-full py-4 rounded-2xl font-extrabold text-lg transition-all duration-300 border-b-[6px] active:border-b-0 active:translate-y-2 active:scale-[0.98] flex items-center justify-center gap-2 ${gameCode.length < 4 || isLoading
                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                        : 'bg-gradient-to-b from-[#F59E0B] to-[#D97706] text-white border-[#B45309] shadow-lg shadow-orange-200 hover:brightness-110'
                                        }`}
                                >
                                    {isLoading ? 'Bergabung...' : 'Gabung Permainan'} <Play className="w-5 h-5 fill-current" />
                                </button>

                                <button
                                    onClick={() => setViewMode('menu')}
                                    className="w-full py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    Kembali
                                </button>
                            </div>
                        </motion.div>
                    )}

                </div>
            </div>
        </StudentBackground>
    );
}
