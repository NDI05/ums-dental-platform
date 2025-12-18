'use client';

import Link from 'next/link';

import { StudentBackground } from '@/components/layout/student-background';
import { ArrowRight, Lock, Mail, User, School, Sparkles, Rocket } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';

// Metadata removed

export default function RegisterPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [kelas, setKelas] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [classes, setClasses] = useState<any[]>([]); // Added classes state

    useEffect(() => { // Added useEffect to fetch classes
        const fetchClasses = async () => {
            try {
                const res = await fetch('/api/classes');
                const data = await res.json();
                if (data.success) {
                    setClasses(data.data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchClasses();
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    kelas: kelas || undefined
                }),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error?.message || 'Registrasi gagal');
            }

            // SUCCESS - Auto Login
            setAuth(data.data.user, data.data.tokens.accessToken);
            router.push('/dashboard');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <StudentBackground>
            <div className="flex-1 w-full flex items-center justify-center p-4 relative z-10 py-12">
                {/* Back Button */}
                <div className="absolute top-6 left-6 hidden md:block">
                    <Link href="/" className="flex items-center gap-2 text-white font-bold hover:underline drop-shadow-md">
                        <ArrowRight className="w-5 h-5 rotate-180" />
                        Kembali ke Depan
                    </Link>
                </div>

                <div className="max-w-md w-full relative md:mt-0">
                    <Card variant="white" className="pt-12 pb-8 px-6 md:px-8 ring-4 ring-white/30 border-white/60 shadow-2xl">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-black text-gray-800 mb-2 flex items-center justify-center gap-2">
                                Daftar Jadi Hero
                                <Sparkles className="w-6 h-6 text-yellow-500" />
                            </h1>
                            <p className="text-gray-500 text-sm">Siap untuk petualangan gigi sehat?</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Nama Lengkap</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all font-medium font-fredoka"
                                        placeholder="Namamu.."
                                    />
                                </div>
                            </div>

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
                                        placeholder="email@sekolah.id"
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
                                        placeholder="Rahasia..."
                                        minLength={8}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Kelas (Opsional)</label>
                                <div className="relative">
                                    <School className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <select
                                        value={kelas}
                                        onChange={(e) => setKelas(e.target.value)}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all font-medium font-fredoka appearance-none bg-white ${!kelas && 'text-gray-400'}`}
                                    >
                                        <option value="">Pilih Kelas...</option>
                                        {classes.map((cls) => (
                                            <option key={cls.id} value={cls.name} className="text-gray-800">{cls.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    variant="success"
                                    size="lg"
                                    className="w-full shadow-xl bg-gradient-to-br from-green-400 to-emerald-500 border-emerald-600"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Mendaftar...' : 'Mulai Petualangan!'} <Rocket className="w-5 h-5 ml-1" />
                                </Button>
                            </div>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-500 text-sm">
                                Sudah punya akun?{' '}
                                <Link href="/auth/login" className="font-bold text-sky-600 hover:text-sky-700 hover:underline">
                                    Masuk di sini
                                </Link>
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </StudentBackground>
    );
}
