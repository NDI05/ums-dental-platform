'use client';

import Link from 'next/link';
import { StudentBackground } from '@/components/layout/student-background';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';

// Metadata removed

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error?.message || 'Login gagal');
            }

            // SUCCESS
            setAuth(data.data.user, data.data.tokens.accessToken);

            // Redirect based on role
            if (data.data.user.role === 'SUPER_ADMIN' || data.data.user.role === 'CONTENT_MANAGER') {
                router.push('/admin/dashboard');
            } else {
                router.push('/dashboard');
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <StudentBackground>
            <div className="flex-1 w-full flex items-center justify-center px-4 relative z-10">
                {/* Back Button */}
                <div className="absolute top-6 left-6">
                    <Link href="/" className="flex items-center gap-2 text-white font-bold hover:underline drop-shadow-md">
                        <ArrowRight className="w-5 h-5 rotate-180" />
                        Kembali ke Depan
                    </Link>
                </div>

                <div className="max-w-md w-full relative">
                    <Card variant="white" className="pt-12 pb-8 px-8 ring-4 ring-white/30 border-white/60 shadow-2xl">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-black text-gray-800 mb-2">Masuk ke Markas</h1>
                            <p className="text-gray-500 text-sm">Hai Hero! Masukkan akunmu dulu ya.</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all font-medium font-fredoka"
                                        placeholder="hero@sekolah.id"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Kata Sandi</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all font-medium font-fredoka"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    className="w-full shadow-xl"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Masuk...' : 'Masuk Sekarang'}
                                </Button>
                            </div>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-500 text-sm">
                                Belum punya akun?{' '}
                                <Link href="/auth/register" className="font-bold text-sky-600 hover:text-sky-700 hover:underline">
                                    Daftar jadi Hero
                                </Link>
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </StudentBackground>
    );
}
