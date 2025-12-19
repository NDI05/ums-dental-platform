'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Users, Play, Copy, Share2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store/auth';

interface Participant {
    id: string;
    username: string;
    avatarUrl?: string; // If we have avatar
}

export function SessionLobbyContent() {
    const params = useParams();
    const code = params.code as string;
    const router = useRouter();
    const { accessToken } = useAuthStore();

    const [participants, setParticipants] = useState<Participant[]>([]);
    const [status, setStatus] = useState('WAITING');
    const [isLoading, setIsLoading] = useState(false);

    // Polling Participants
    useEffect(() => {
        let interval: NodeJS.Timeout;

        const fetchInfo = async () => {
            try {
                // We need an endpoint to get session info + participants
                // Creating GET /api/quiz-sessions/[code] next
                const res = await fetch(`/api/quiz-sessions/${code}/participants`);
                const data = await res.json();
                if (data.success) {
                    setParticipants(data.data.participants);
                    setStatus(data.data.status);

                    // If started, redirect to control panel
                    if (data.data.status === 'ACTIVE') {
                        router.push(`/admin/quiz-sessions/${code}/live`);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        };

        fetchInfo();
        interval = setInterval(fetchInfo, 3000); // 3s polling
        return () => clearInterval(interval);
    }, [code, router]);

    const handleStart = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/quiz-sessions/${code}/start`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (res.ok) {
                router.push(`/admin/quiz-sessions/${code}/live`);
            } else {
                alert('Gagal memulai sesi');
            }
        } catch (e) {
            alert('Error starting session');
        } finally {
            setIsLoading(false);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(code);
        alert('Kode disalin!');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[100px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[100px] rounded-full animate-pulse delay-1000" />
            </div>

            <div className="z-10 w-full max-w-4xl text-center space-y-12">

                {/* Header */}
                <div className="space-y-4">
                    <p className="text-slate-400 uppercase tracking-[0.2em] font-bold text-sm">Join Code</p>
                    <div
                        onClick={copyCode}
                        className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 px-12 py-6 rounded-3xl cursor-pointer hover:bg-white/20 transition-all group"
                    >
                        <h1 className="text-6xl md:text-8xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            {code}
                        </h1>
                        <Copy className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-slate-400">Minta siswa masukkan kode ini di aplikasi mereka</p>
                </div>

                {/* Participants Grid */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 min-h-[300px]">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Users className="w-6 h-6 text-blue-400" />
                            Peserta Bergabung
                            <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full">{participants.length}</span>
                        </h2>
                    </div>

                    {participants.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[200px] text-slate-500 animate-pulse">
                            <p>Menunggu peserta...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {participants.map((p) => (
                                <div key={p.id} className="bg-slate-700/50 p-3 rounded-xl border border-slate-600 flex items-center gap-3 animate-in zoom-in duration-300">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-lg">
                                        {p.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium truncate">{p.username}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex justify-center">
                    <Button
                        onClick={handleStart}
                        isLoading={isLoading}
                        size="lg"
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white border-0 py-6 px-12 text-2xl shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] hover:scale-105 transition-all duration-300 rounded-2xl"
                        disabled={participants.length === 0}
                    >
                        <Play className="w-8 h-8 mr-3 fill-current" />
                        MULAI GAME
                    </Button>
                </div>
            </div>
        </div>
    );
}
