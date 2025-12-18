'use client';

import { StudentBackground } from '@/components/layout/student-background';
import { ChevronLeft, Coins, History, Calendar, Star, Film, Gamepad2, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api-client';

interface PointTransaction {
    id: string;
    activityType: string;
    pointsEarned: number;
    description: string;
    createdAt: string;
}

export default function PointsHistoryPage() {
    const [transactions, setTransactions] = useState<PointTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await apiFetch('/api/points/history?limit=50');
                const data = await res.json();
                if (data.success) {
                    setTransactions(data.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'VIDEO_WATCHED': return <Film className="w-6 h-6 text-sky-500" />;
            case 'QUIZ_COMPLETED': return <Star className="w-6 h-6 text-amber-500" />;
            case 'GAME_PLAYED': return <Gamepad2 className="w-6 h-6 text-purple-500" />;
            case 'COMIC_READ': return <BookOpen className="w-6 h-6 text-pink-500" />;
            default: return <Coins className="w-6 h-6 text-gray-500" />;
        }
    };

    const getLabel = (type: string) => {
        switch (type) {
            case 'VIDEO_WATCHED': return 'Menonton Video';
            case 'QUIZ_COMPLETED': return 'Mengerjakan Kuis';
            case 'GAME_PLAYED': return 'Bermain Game';
            case 'COMIC_READ': return 'Membaca Komik';
            default: return 'Aktivitas Lain';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <StudentBackground>
            {/* Header */}
            <div className="flex items-center gap-3 p-4 md:p-6 relative z-20">
                <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-lg hover:bg-white/30 transition-all active:scale-95">
                    <ChevronLeft className="w-6 h-6 text-white" />
                </Link>
                <h1 className="text-xl font-bold text-white drop-shadow-md">Riwayat Poin</h1>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-8 no-scrollbar">
                <div className="max-w-2xl mx-auto">
                    {/* Total Points Summary Card could go here if we fetched balance, but let's stick to list */}

                    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-xl border-2 border-white/50 min-h-[500px]">
                        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <History className="w-5 h-5 text-sky-500" />
                            Aktivitas Terakhir
                        </h2>

                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <History className="w-12 h-12 mb-2 opacity-50" />
                                <p>Belum ada riwayat aktivitas.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {transactions.map((trx) => (
                                    <div key={trx.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                                            {getIcon(trx.activityType)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-800 truncate">{getLabel(trx.activityType)}</p>
                                            <p className="text-sm text-gray-500 truncate">{trx.description}</p>
                                            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400 font-medium">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(trx.createdAt)}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-bold text-sm">
                                                +{trx.pointsEarned} XP
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StudentBackground>
    );
}
