'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Play, MoreVertical, Trash, Users } from 'lucide-react';
import Button from '@/components/ui/Button';

import { useAuthStore } from '@/lib/store/auth';

interface QuizSession {
    id: string;
    code: string;
    title: string;
    status: 'WAITING' | 'ACTIVE' | 'COMPLETED';
    createdAt: string;
    _count: { participants: number };
}

// Metadata removed

export default function SessionListPage() {
    const { accessToken } = useAuthStore();
    const [sessions, setSessions] = useState<QuizSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!accessToken) return;

        const fetchSessions = async () => {
            try {
                const res = await fetch('/api/quiz-sessions', {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                const data = await res.json();
                if (data.success) {
                    setSessions(data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, [accessToken]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--gray-800)]">Sesi Live Quiz</h1>
                    <p className="text-[var(--gray-500)]">Kelola sesi permainan interaktif untuk kelas.</p>
                </div>
                <Link href="/admin/quiz-sessions/create">
                    <Button variant="primary" className="shadow-lg shadow-indigo-200">
                        <Plus className="w-5 h-5 mr-2" />
                        Buat Sesi Baru
                    </Button>
                </Link>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Session Items will go here */}
                {sessions.map((session) => (
                    <div key={session.id} className="bg-white p-6 rounded-2xl border border-[var(--gray-100)] shadow-sm hover:shadow-md transition-all relative">
                        {/* Basic Card UI for now */}
                        <h3 className="font-bold">{session.title}</h3>
                        <p className="text-sm text-gray-500">{session.code}</p>
                        <Link href={`/admin/quiz-sessions/${session.code}/lobby`}>
                            <Button size="sm" className="mt-4">Buka Lobby</Button>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Empty State hint */}
            <div className="text-center py-20">
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Play className="w-10 h-10 text-indigo-500 ml-1" />
                </div>
                <h3 className="text-xl font-bold text-[var(--gray-800)] mb-2">Belum ada Sesi Aktif</h3>
                <p className="text-[var(--gray-500)] max-w-md mx-auto mb-8">
                    Buat sesi baru untuk memulai permainan kuis interaktif dengan siswa di kelas.
                </p>
                <Link href="/admin/quiz-sessions/create">
                    <Button variant="primary">Mulai Sekarang</Button>
                </Link>
            </div>
        </div>
    );
}
