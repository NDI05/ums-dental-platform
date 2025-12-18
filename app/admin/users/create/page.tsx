'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Save, Loader2, UserPlus, AlertCircle, Shield, User } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/store/auth';
import { apiFetch } from '@/lib/api-client';

export default function CreateUserPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultRole = searchParams?.get('role') || 'STUDENT';

    const { accessToken } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [classes, setClasses] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: defaultRole,
        kelas: ''
    });

    // Fetch classes on mount
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await fetch('/api/classes');
                const data = await res.json();
                if (data.success) {
                    setClasses(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch classes');
            }
        };
        fetchClasses();
    }, []);

    // Update role if query param changes
    useEffect(() => {
        if (defaultRole) {
            setFormData(prev => ({ ...prev, role: defaultRole }));
        }
    }, [defaultRole]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.username || !formData.email || !formData.password) return alert('Mohon lengkapi data');
        if (formData.role === 'STUDENT' && !formData.kelas) return alert('Siswa wajib memiliki kelas');

        setIsLoading(true);

        try {
            const payload = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                kelas: formData.role === 'STUDENT' ? formData.kelas : undefined,
            };

            const res = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || data.error?.message || 'Gagal membuat user');
            }

            alert('User berhasil dibuat!');
            // Redirect based on role to keep context
            if (formData.role === 'STUDENT') {
                router.push('/admin/students');
            } else {
                router.push('/admin/users');
            }

        } catch (error: any) {
            console.error('Create Error:', error);
            setError(error.message);
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href={formData.role === 'STUDENT' ? "/admin/students" : "/admin/users"} className="p-2 rounded-xl bg-white border border-[var(--gray-200)] text-[var(--gray-600)] hover:bg-[var(--gray-50)] shadow-sm transition-all">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--gray-800)]">
                        {formData.role === 'STUDENT' ? 'Tambah Siswa Baru' : 'Tambah User Baru'}
                    </h1>
                    <p className="text-sm text-[var(--gray-500)]">Buat akun untuk siswa atau admin baru.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card variant="white" className="p-6 md:p-8 space-y-6 border border-white/60 shadow-[var(--shadow-soft-md)]">
                            <h2 className="text-lg font-bold text-[var(--gray-800)] flex items-center gap-2">
                                <User className="w-5 h-5 text-[var(--primary-500)]" />
                                Informasi Akun
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-[var(--gray-700)] mb-2">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--gray-50)] border border-[var(--gray-200)] focus:ring-4 focus:ring-[var(--primary-100)] focus:border-[var(--primary-500)] outline-none transition-all"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        placeholder="Contoh: budisentosa"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[var(--gray-700)] mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--gray-50)] border border-[var(--gray-200)] focus:ring-4 focus:ring-[var(--primary-100)] focus:border-[var(--primary-500)] outline-none transition-all"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="Contoh: budi@sekolah.id"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[var(--gray-700)] mb-2">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--gray-50)] border border-[var(--gray-200)] focus:ring-4 focus:ring-[var(--primary-100)] focus:border-[var(--primary-500)] outline-none transition-all"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        placeholder="Minimal 6 karakter"
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Role & Settings */}
                    <div className="space-y-6">
                        <Card variant="blue" className="p-6 space-y-4">
                            <h2 className="text-lg font-bold text-[var(--primary-700)] flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Peran & Akses
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-[var(--primary-700)] mb-2">Role</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-white border border-[var(--primary-200)] focus:ring-4 focus:ring-[var(--primary-100)] focus:border-[var(--primary-500)] outline-none transition-all cursor-pointer"
                                    >
                                        <option value="STUDENT">Siswa (Student)</option>
                                        <option value="TEACHER">Guru (Teacher)</option>
                                        <option value="SUPER_ADMIN">Admin (Super Admin)</option>
                                    </select>
                                </div>

                                {formData.role === 'STUDENT' && (
                                    <div>
                                        <label className="block text-sm font-bold text-[var(--primary-700)] mb-2">Kelas</label>
                                        <select
                                            name="kelas"
                                            value={formData.kelas}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl bg-white border border-[var(--primary-200)] focus:ring-4 focus:ring-[var(--primary-100)] focus:border-[var(--primary-500)] outline-none transition-all cursor-pointer"
                                            required={formData.role === 'STUDENT'}
                                        >
                                            <option value="">Pilih Kelas...</option>
                                            {classes.map((cls) => (
                                                <option key={cls.id} value={cls.name}>{cls.name}</option>
                                            ))}
                                            {classes.length === 0 && (
                                                <option value="" disabled>Belum ada kelas</option>
                                            )}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 sticky top-6">
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full shadow-lg shadow-blue-500/20"
                                disabled={isLoading}
                            >
                                <UserPlus className="w-5 h-5 mr-2" />
                                {isLoading ? 'Memproses...' : 'Buat User'}
                            </Button>
                            <Link href={formData.role === 'STUDENT' ? "/admin/students" : "/admin/users"} className="w-full">
                                <Button type="button" variant="secondary" size="lg" className="w-full">
                                    Batal
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
