'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, Hash } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store/auth';

export default function JoinQuizPage() {
    const router = useRouter();
    const { accessToken } = useAuthStore();

    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/quiz-sessions/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ code })
            });

            const data = await res.json();

            if (res.ok) {
                // Redirect to Student Waiting Room
                router.push(`/live-quiz/${data.data.code}`);
                // Note: We need to create this page at app/(student)/live-quiz/[code]/page.tsx
            } else {
                setError(data.message || 'Gagal bergabung');
            }
        } catch (err) {
            setError('Terjadi kesalahan jaringan');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background-soft)] flex flex-col justify-center items-center p-6 animate-in fade-in">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-blue-50 p-8 space-y-8 relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500" />

                <div className="text-center space-y-2">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-500 mb-4">
                        <Play className="w-10 h-10 ml-1" />
                    </div>
                    <h1 className="text-3xl font-black text-[var(--gray-800)]">Live Quiz</h1>
                    <p className="text-[var(--gray-500)]">Masukkan kode untuk bergabung</p>
                </div>

                <form onSubmit={handleJoin} className="space-y-6">
                    <div>
                        <div className="relative">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[var(--gray-400)] pointer-events-none" />
                            <input
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="A7X92"
                                maxLength={6}
                                className="w-full text-center text-3xl font-bold tracking-widest pl-10 pr-4 py-4 rounded-xl border-2 border-[var(--gray-200)] focus:border-[var(--primary-500)] outline-none uppercase placeholder:text-[var(--gray-300)] transition-all"
                            />
                        </div>
                        {error && (
                            <p className="text-red-500 text-sm text-center mt-2 animate-in slide-in-from-top-1">{error}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        className="py-4 text-lg shadow-lg shadow-blue-200"
                        isLoading={isLoading}
                    >
                        Gabung Sesi
                    </Button>
                </form>

                <div className="text-center">
                    <Link href="/dashboard" className="text-sm text-[var(--gray-500)] hover:text-[var(--primary-600)]">
                        Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
