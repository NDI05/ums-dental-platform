'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Trophy, User, StopCircle, RefreshCw, BarChart3 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store/auth';

interface Participant {
    id: string;
    username: string;
    score: number;
    status: string;
    avatarUrl?: string;
}

export function LiveSessionContent() {
    const params = useParams();
    const code = params.code as string;
    const router = useRouter();
    const { accessToken } = useAuthStore();

    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Polling Leaderboard
    useEffect(() => {
        let interval: NodeJS.Timeout;

        const fetchLeaderboard = async () => {
            try {
                // Reuse the same participants endpoint, but client-side sort
                const res = await fetch(`/api/quiz-sessions/${code}/participants`);
                const data = await res.json();

                if (data.success) {
                    // Sort by score desc
                    const sorted = data.data.participants.sort((a: Participant, b: Participant) => b.score - a.score);
                    setParticipants(sorted);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
        interval = setInterval(fetchLeaderboard, 3000); // 3s polling
        return () => clearInterval(interval);
    }, [code]);

    const handleEndSession = async () => {
        if (!confirm('Akhiri sesi ini? Siswa tidak akan bisa menjawab lagi.')) return;

        try {
            const res = await fetch(`/api/quiz-sessions/${code}/end`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (res.ok) {
                router.push('/admin/quiz-sessions'); // Back to list
                alert('Sesi berakhir.');
            }
        } catch (e) {
            alert('Error ending session');
        }
    };

    const top3 = participants.slice(0, 3);
    const others = participants.slice(3);

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 md:p-12 overflow-hidden relative">

            <div className="max-w-6xl mx-auto relative z-10">

                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-4">
                        <div className="bg-red-600 px-4 py-1 rounded text-xs font-bold animate-pulse">LIVE</div>
                        <h1 className="text-3xl font-black tracking-tighter">Leaderboard</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-800 px-4 py-2 rounded-xl flex items-center gap-2 border border-slate-700">
                            <span className="text-slate-400 text-sm">Game Code</span>
                            <span className="font-mono font-bold text-xl tracking-widest">{code}</span>
                        </div>
                        <Button
                            onClick={handleEndSession}
                            variant="danger"
                            className="bg-red-500 hover:bg-red-600 shadow-lg shadow-red-900/20"
                        >
                            <StopCircle className="w-5 h-5 mr-2" />
                            Akhiri Sesi
                        </Button>
                    </div>
                </div>

                {/* Podium */}
                {top3.length > 0 ? (
                    <div className="flex justify-center items-end gap-4 md:gap-8 mb-16 h-[300px]">
                        {/* 2nd Place */}
                        {top3[1] && (
                            <div className="flex flex-col items-center w-1/3 md:w-[160px] animate-in slide-in-from-bottom-10 fade-in duration-700 delay-100">
                                <div className="mb-4 text-center">
                                    <div className="w-16 h-16 bg-slate-700 rounded-full border-4 border-slate-500 flex items-center justify-center font-bold text-2xl mx-auto shadow-xl">
                                        {top3[1].username.charAt(0)}
                                    </div>
                                    <div className="font-bold mt-2 truncate max-w-full">{top3[1].username}</div>
                                    <div className="text-slate-400 text-sm">{top3[1].score} pts</div>
                                </div>
                                <div className="w-full bg-slate-700 h-[120px] rounded-t-xl relative border-t-4 border-slate-500 shadow-[0_0_30px_rgba(100,116,139,0.3)] flex items-end justify-center pb-4">
                                    <span className="text-4xl font-black text-slate-800/30">2</span>
                                </div>
                            </div>
                        )}

                        {/* 1st Place */}
                        {top3[0] && (
                            <div className="flex flex-col items-center w-1/3 md:w-[200px] z-10 animate-in slide-in-from-bottom-20 fade-in duration-700">
                                <div className="mb-4 text-center relative">
                                    <Trophy className="w-12 h-12 text-yellow-400 absolute -top-14 left-1/2 -translate-x-1/2 animate-bounce" />
                                    <div className="w-24 h-24 bg-yellow-500 rounded-full border-4 border-yellow-300 flex items-center justify-center font-bold text-4xl mx-auto shadow-2xl overflow-hidden">
                                        {top3[0].avatarUrl ? <img src={top3[0].avatarUrl} className="w-full h-full object-cover" /> : top3[0].username.charAt(0)}
                                    </div>
                                    <div className="font-bold mt-2 text-xl truncate max-w-full text-yellow-500">{top3[0].username}</div>
                                    <div className="text-yellow-200 font-bold">{top3[0].score} pts</div>
                                </div>
                                <div className="w-full bg-gradient-to-t from-yellow-600 to-yellow-500 h-[180px] rounded-t-2xl relative border-t-4 border-yellow-300 shadow-[0_0_50px_rgba(234,179,8,0.5)] flex items-end justify-center pb-4">
                                    <span className="text-6xl font-black text-yellow-800/30">1</span>
                                </div>
                            </div>
                        )}

                        {/* 3rd Place */}
                        {top3[2] && (
                            <div className="flex flex-col items-center w-1/3 md:w-[160px] animate-in slide-in-from-bottom-10 fade-in duration-700 delay-200">
                                <div className="mb-4 text-center">
                                    <div className="w-16 h-16 bg-orange-700 rounded-full border-4 border-orange-500 flex items-center justify-center font-bold text-2xl mx-auto shadow-xl">
                                        {top3[2].username.charAt(0)}
                                    </div>
                                    <div className="font-bold mt-2 truncate max-w-full">{top3[2].username}</div>
                                    <div className="text-slate-400 text-sm">{top3[2].score} pts</div>
                                </div>
                                <div className="w-full bg-orange-800 h-[90px] rounded-t-xl relative border-t-4 border-orange-600 shadow-[0_0_30px_rgba(154,52,18,0.3)] flex items-end justify-center pb-4">
                                    <span className="text-4xl font-black text-orange-900/30">3</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-800/50 rounded-3xl border border-slate-700 mb-8">
                        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                        <h3 className="text-xl text-slate-400">Belum ada peserta yang mendapat poin</h3>
                    </div>
                )}


                {/* List Table */}
                <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-3xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800 border-b border-slate-700">
                            <tr>
                                <th className="p-6 font-bold uppercase text-xs text-slate-400">Rank</th>
                                <th className="p-6 font-bold uppercase text-xs text-slate-400">Player</th>
                                <th className="p-6 font-bold uppercase text-xs text-slate-400 text-right">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {others.map((p, idx) => (
                                <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="p-6 font-mono text-slate-400">#{idx + 4}</td>
                                    <td className="p-6 font-medium flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                                            {p.username.charAt(0)}
                                        </div>
                                        {p.username}
                                    </td>
                                    <td className="p-6 font-bold text-right text-blue-400">{p.score}</td>
                                </tr>
                            ))}
                            {others.length === 0 && top3.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-slate-500">
                                        Menunggu data...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
