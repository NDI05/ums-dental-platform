'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, User } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';

export default function StudentWaitingPage() {
    const params = useParams();
    const code = params.code as string;
    const router = useRouter();
    const { user } = useAuthStore();

    const [status, setStatus] = useState('WAITING');
    const [participantCount, setParticipantCount] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        const checkStatus = async () => {
            try {
                // Reusing the participants endpoint as it gives us status + count
                const res = await fetch(`/api/quiz-sessions/${code}/participants`);
                const data = await res.json();

                if (data.success) {
                    setStatus(data.data.status);
                    setParticipantCount(data.data.totalParticipants);

                    if (data.data.status === 'ACTIVE') {
                        router.push(`/live-quiz/${code}/play`);
                    } else if (data.data.status === 'COMPLETED') {
                        router.push(`/dashboard`); // Or results
                        alert('Sesi telah berakhir');
                    }
                }
            } catch (e) {
                console.error(e);
            }
        };

        checkStatus();
        interval = setInterval(checkStatus, 3000);
        return () => clearInterval(interval);
    }, [code, router]);

    return (
        <div className="min-h-screen bg-indigo-600 text-white flex flex-col items-center justify-center p-6 text-center space-y-8">

            {/* Animation */}
            <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
                <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/20 relative z-10">
                    <Loader2 className="w-16 h-16 animate-spin text-white" />
                </div>
            </div>

            <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tight">Menunggu Host...</h1>
                <p className="text-indigo-200 text-lg">Permainan akan segera dimulai!</p>
            </div>

            <div className="bg-indigo-800/50 px-8 py-4 rounded-2xl flex items-center gap-4 border border-indigo-500/30">
                <div className="flex -space-x-3">
                    {/* Fake avatars stack */}
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full bg-indigo-400 border-2 border-indigo-800 flex items-center justify-center text-xs font-bold">
                            <User className="w-5 h-5" />
                        </div>
                    ))}
                </div>
                <div className="font-bold">
                    {participantCount} Peserta Bergabung
                </div>
            </div>

            <div className="absolute bottom-8 text-indigo-300 text-sm">
                Masuk sebagai <strong className="text-white">{user?.username}</strong>
            </div>
        </div>
    );
}
