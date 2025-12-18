'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, User, Save, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { apiFetch } from '@/lib/api-client';

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        role: 'STUDENT',
        kelas: ''
    });
    const [classes, setClasses] = useState<any[]>([]);

    useEffect(() => {
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
        }
        fetchClasses();
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await apiFetch(`/api/users/${id}`);
                const data = await res.json();

                if (data.success) {
                    const user = data.data;
                    setFormData({
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        kelas: user.kelas || ''
                    });
                } else {
                    setError('Gagal mengambil data user');
                }
            } catch (err) {
                setError('Terjadi kesalahan saat mengambil data');
            } finally {
                setIsFetching(false);
            }
        };

        if (id) fetchUser();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Note: Password update is usually separate or optional. 
            // We'll update the main profile info here.
            const res = await apiFetch(`/api/users/${id}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || 'Gagal update user');
            }

            router.push('/admin/users');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/users">
                    <Button variant="ghost" size="sm" className="rounded-xl p-2 h-10 w-10">
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--gray-800)] flex items-center gap-2">
                        <User className="w-6 h-6 text-[var(--primary-600)]" />
                        Edit User
                    </h1>
                    <p className="text-[var(--gray-500)] text-sm">Update informasi pengguna</p>
                </div>
            </div>

            <Card variant="white" className="p-6 border border-white/60 shadow-sm">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm mb-6">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--gray-700)]">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--gray-200)] focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-100)] transition-all outline-none bg-white"
                        >
                            <option value="STUDENT">Siswa (Student)</option>
                            <option value="TEACHER">Guru (Teacher)</option>
                            <option value="SUPER_ADMIN">Admin Utama</option>
                        </select>
                    </div>

                    {formData.role === 'STUDENT' && (
                        <div>
                            <label className="block text-sm font-bold text-[var(--gray-700)] mb-2">Kelas</label>
                            <select
                                name="kelas"
                                value={formData.kelas}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-[var(--gray-50)] border border-[var(--gray-200)] focus:ring-4 focus:ring-[var(--primary-100)] focus:border-[var(--primary-500)] outline-none transition-all"
                            >
                                <option value="">Pilih Kelas...</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.name}>{cls.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end">
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full md:w-auto px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5 mr-2" />
                                    Simpan Perubahan
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
