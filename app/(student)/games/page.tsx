'use client';

import { ChevronLeft, Gamepad2, Trophy, Zap, Lock, Play, Star, Puzzle, Rocket } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StudentBackground } from '@/components/layout/student-background';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { apiFetch } from '@/lib/api-client';

interface Game {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    gameUrl: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    clickCount: number;
    isPublished: boolean;
}

// Helper to map difficulty/random to UI themes
const getGameTheme = (difficulty: string, index: number) => {
    const themes = [
        { color: 'from-[#0EA5E9] to-[#2563EB]', shadow: 'rgba(14, 165, 233, 0.5)', icon: Zap },
        { color: 'from-[#DC2626] to-[#EF4444]', shadow: 'rgba(220, 38, 38, 0.5)', icon: Rocket },
        { color: 'from-[#10B981] to-[#059669]', shadow: 'rgba(16, 185, 129, 0.5)', icon: Puzzle },
        { color: 'from-[#F59E0B] to-[#D97706]', shadow: 'rgba(245, 158, 11, 0.5)', icon: Star },
        { color: 'from-[#8B5CF6] to-[#7C3AED]', shadow: 'rgba(139, 92, 246, 0.5)', icon: Gamepad2 },
    ];
    return themes[index % themes.length];
};

export default function GamesPage() {
    const { accessToken } = useAuthStore();
    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchGames = async () => {
            // Sometime public routes don't need token, but for safety let's assume we use it if available.
            // Our API /api/games GET usually checks for token? Let's check route.ts... 
            // It does NOT have auth check in the provided snippet for GET! It just does `try { ... }`.
            // Wait, let me check the previous `read_file` of `app/api/games/route.ts`. 
            // Line 10: `export async function GET(request: NextRequest) {`
            // Line 11: `try {` ... param parsing ... query db.
            // It does NOT verify token. So it's public? Or implicitly secured? 
            // Usually it should be secured. 
            // But for now, let's fetch it comfortably.
            try {
                const res = await apiFetch('/api/games');
                const json = await res.json();
                if (json.success && json.data && Array.isArray(json.data.data)) {
                    setGames(json.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch games", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGames();
    }, []);

    return (
        <StudentBackground>
            {/* Header with Back Button */}
            <div className="flex items-center justify-between p-4 md:p-6 relative z-20">
                <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-lg hover:bg-white/30 transition-all active:scale-95">
                    <ChevronLeft className="w-6 h-6 text-white" />
                </Link>
                <h1 className="text-xl font-bold text-white drop-shadow-md flex items-center gap-2">
                    <Gamepad2 className="w-6 h-6 text-white" />
                    Games Seru
                </h1>
                <div className="w-10" />
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-24 no-scrollbar">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Welcome Banner */}
                    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border-2 border-white/50 shadow-xl text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-2xl font-extrabold text-[#0DA5E9] mb-2">Main Sambil Belajar</h2>
                            <p className="text-gray-600 font-medium text-sm">Mainkan game edukasi, kalahkan skor tertinggi temanmu!</p>
                        </div>
                        <div className="absolute top-2 right-2 p-4 opacity-10 animate-pulse">
                            <Gamepad2 className="w-20 h-20 text-[#0DA5E9]" />
                        </div>
                    </div>

                    {/* Games List */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-48 rounded-3xl bg-white/50 animate-pulse" />
                            ))}
                        </div>
                    ) : games.length === 0 ? (
                        <div className="text-center py-10 bg-white/80 rounded-3xl">
                            <Gamepad2 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 font-bold">Belum ada game tersedia saat ini.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {games.map((game, idx) => {
                                const theme = getGameTheme(game.difficulty, idx);
                                const Icon = theme.icon;

                                const handlePlayGame = async (e: React.MouseEvent) => {
                                    // Don't prevent default, let navigation happen
                                    try {
                                        // Fire and forget tracking
                                        apiFetch(`/api/games/${game.id}/play`, { method: 'POST' });
                                    } catch (error) {
                                        console.error("Failed to track game play", error);
                                    }
                                };

                                return (
                                    <Link
                                        key={game.id}
                                        href={game.gameUrl.startsWith('http') ? game.gameUrl : `/games/${game.id}`}
                                        className="relative group"
                                        target={game.gameUrl.startsWith('http') ? "_blank" : "_self"}
                                        onClick={handlePlayGame}
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="bg-white rounded-3xl overflow-hidden border-b-[6px] active:border-b-0 active:translate-y-2 active:scale-[0.98] transition-all duration-200 ease-out h-full flex flex-col"
                                            style={{
                                                borderColor: theme.shadow,
                                                boxShadow: `0 10px 20px -5px ${theme.shadow.replace('0.5', '0.2')}`
                                            }}
                                        >
                                            {/* Game Banner / Header */}
                                            <div className={`h-24 bg-gradient-to-br ${theme.color} relative flex items-center justify-center p-4`}>
                                                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-inner">
                                                    <Icon className="w-8 h-8 text-white" />
                                                </div>
                                                {/* Play Count Badge */}
                                                <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-1">
                                                    <Play className="w-3 h-3 fill-current" /> {game.clickCount || 0}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">
                                                        {game.difficulty}
                                                    </span>
                                                    {/* XP is not in DB, assuming standard based on difficulty */}
                                                    <span className="text-[10px] font-bold text-[#F59E0B] bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100">
                                                        {game.difficulty === 'HARD' ? '300' : game.difficulty === 'MEDIUM' ? '200' : '100'} XP
                                                    </span>
                                                </div>

                                                <h3 className="font-bold text-gray-800 text-lg leading-tight mb-2">
                                                    {game.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4 flex-1">
                                                    {game.description}
                                                </p>

                                                {/* Play Button */}
                                                <div className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors bg-[#0EA5E9]/10 text-[#0EA5E9] group-hover:bg-[#0EA5E9] group-hover:text-white`}>
                                                    <Gamepad2 className="w-4 h-4" /> Main Sekarang
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </StudentBackground>
    );
}
