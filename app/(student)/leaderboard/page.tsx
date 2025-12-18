'use client';

import { ChevronLeft, Trophy, Medal, Crown, Loader2, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { StudentBackground } from '@/components/layout/student-background';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { apiFetch } from '@/lib/api-client';

interface LeaderboardUser {
    rank: number;
    id: string;
    name: string;
    xp: number;
    avatar: string;
    isMe?: boolean;
}

export default function LeaderboardPage() {
    const { user } = useAuthStore();
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await apiFetch('/api/leaderboard');
                const data = await res.json();

                if (data.success) {
                    const mappedData = data.data.map((item: any) => ({
                        ...item,
                        isMe: user?.id === item.id
                    }));
                    setLeaderboardData(mappedData);
                }
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, [user?.id]);

    const topThree = leaderboardData.slice(0, 3);
    const restList = leaderboardData.slice(3);

    // Fallback if empty
    if (!isLoading && leaderboardData.length === 0) {
        return (
            <StudentBackground>
                {/* Header with Back Button */}
                <div className="flex items-center justify-between p-4 md:p-6 relative z-20">
                    <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-lg hover:bg-white/30 transition-all active:scale-95">
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </Link>
                    <h1 className="text-xl font-bold text-white drop-shadow-md flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-300" />
                        Juara Kelas
                    </h1>
                    <div className="w-10" />
                </div>
                <div className="flex-1 flex items-center justify-center text-white">
                    <p className="font-bold text-lg">Belum ada data leaderboard.</p>
                </div>
            </StudentBackground>
        );
    }

    return (
        <StudentBackground>
            {/* Header with Back Button */}
            <div className="flex items-center justify-between p-4 md:p-6 relative z-20">
                <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-lg hover:bg-white/30 transition-all active:scale-95">
                    <ChevronLeft className="w-6 h-6 text-white" />
                </Link>
                <h1 className="text-xl font-bold text-white drop-shadow-md flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-300" />
                    Juara Kelas
                </h1>
                <div className="w-10" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-24 no-scrollbar">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-12 h-12 text-white animate-spin" />
                    </div>
                ) : (
                    <div className="max-w-md mx-auto">
                        {/* Top 3 Podium */}
                        {topThree.length > 0 && (
                            <div className="flex justify-center items-end gap-2 mb-8 mt-32 h-48">
                                {/* Rank 2 (Silver) */}
                                {topThree[1] && (
                                    <motion.div
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-white/90 backdrop-blur-md rounded-t-2xl w-24 p-2 flex flex-col items-center border-t-4 border-slate-300 shadow-xl relative order-1"
                                        style={{ height: '75%' }}
                                    >
                                        <div className="absolute -top-10 w-16 h-16 rounded-full border-4 border-slate-300 bg-white overflow-hidden shadow-lg">
                                            <Image src={topThree[1].avatar} alt="Rank 2" fill className="object-cover" />
                                        </div>
                                        <div className="mt-8 text-center w-full">
                                            <p className="font-bold text-slate-700 text-xs truncate">{topThree[1].name}</p>
                                            <p className="font-extrabold text-slate-500 text-sm">{topThree[1].xp} XP</p>
                                        </div>
                                        <div className="mt-auto mb-2 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 shadow-inner">2</div>
                                    </motion.div>
                                )}

                                {/* Rank 1 (Gold) */}
                                {topThree[0] && (
                                    <motion.div
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="bg-gradient-to-b from-yellow-100 to-white backdrop-blur-md rounded-t-2xl w-28 p-2 flex flex-col items-center border-t-4 border-yellow-400 shadow-[0_0_30px_-5px_rgba(250,204,21,0.5)] relative order-2 z-10"
                                        style={{ height: '100%' }}
                                    >
                                        <div className="absolute -top-14">
                                            <Crown className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-bounce absolute -top-8 left-1/2 -translate-x-1/2" />
                                            <div className="w-20 h-20 rounded-full border-4 border-yellow-400 bg-white overflow-hidden shadow-lg relative">
                                                <Image src={topThree[0].avatar} alt="Rank 1" fill className="object-cover" />
                                            </div>
                                        </div>
                                        <div className="mt-12 text-center w-full">
                                            <p className="font-bold text-slate-800 text-sm truncate">{topThree[0].name}</p>
                                            <p className="font-extrabold text-yellow-600 text-base">{topThree[0].xp} XP</p>
                                        </div>
                                        <div className="mt-auto mb-3 w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-white text-xl shadow-lg">1</div>
                                    </motion.div>
                                )}

                                {/* Rank 3 (Bronze) */}
                                {topThree[2] && (
                                    <motion.div
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="bg-white/90 backdrop-blur-md rounded-t-2xl w-24 p-2 flex flex-col items-center border-t-4 border-orange-300 shadow-xl relative order-3"
                                        style={{ height: '60%' }}
                                    >
                                        <div className="absolute -top-10 w-16 h-16 rounded-full border-4 border-orange-300 bg-white overflow-hidden shadow-lg">
                                            <Image src={topThree[2].avatar} alt="Rank 3" fill className="object-cover" />
                                        </div>
                                        <div className="mt-8 text-center w-full">
                                            <p className="font-bold text-slate-700 text-xs truncate">{topThree[2].name}</p>
                                            <p className="font-extrabold text-orange-600 text-sm">{topThree[2].xp} XP</p>
                                        </div>
                                        <div className="mt-auto mb-2 w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center font-bold text-orange-700 shadow-inner">3</div>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {/* Remaining List */}
                        {restList.length > 0 && (
                            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-2 border-2 border-white/40 shadow-xl">
                                {restList.map((student, idx) => (
                                    <motion.div
                                        key={student.rank}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + (idx * 0.1) }}
                                        className={`flex items-center gap-3 p-3 rounded-2xl mb-1 ${student.isMe
                                            ? 'bg-gradient-to-r from-sky-100 to-blue-50 border-2 border-sky-200 shadow-md transform scale-[1.02]'
                                            : 'border-b border-slate-100'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${student.isMe ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {student.rank}
                                        </div>

                                        <div className="relative w-10 h-10 rounded-full bg-white border border-slate-200 overflow-hidden shadow-sm">
                                            <Image src={student.avatar} alt={student.name} fill className="object-cover" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold text-sm truncate ${student.isMe ? 'text-sky-900' : 'text-slate-700'}`}>
                                                {student.name} {student.isMe && '(Saya)'}
                                            </p>
                                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                                                <div
                                                    className="h-full bg-yellow-400 rounded-full"
                                                    // XP bar needs a reference max. Using top score or constant 5000.
                                                    style={{ width: `${Math.min((student.xp / (leaderboardData[0]?.xp || 5000)) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="font-extrabold text-sm text-[#F59E0B]">
                                            {student.xp}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </StudentBackground>
    );
}
