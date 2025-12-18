'use client';

import Link from 'next/link';
import { Search, GraduationCap, Eye, Plus, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth';

export default function StudentManagementPage() {
    const { accessToken } = useAuthStore();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('all');
    const [classes, setClasses] = useState<any[]>([]);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await fetch('/api/classes');
                const data = await res.json();
                if (data.success) {
                    setClasses(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch classes', error);
            }
        };
        fetchClasses();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (classFilter !== 'all') params.append('kelas', classFilter);
            params.append('role', 'STUDENT'); // Force filter for students

            const res = await fetch(`/api/users?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch students', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accessToken) {
            fetchUsers();
        }
    }, [accessToken, searchTerm, classFilter]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--gray-800)] flex items-center gap-3">
                        <GraduationCap className="w-8 h-8 text-[var(--primary-600)]" />
                        Manajemen Siswa
                    </h1>
                    <p className="text-[var(--gray-500)] mt-1">Pantau perkembangan belajar dan manajemen akun siswa.</p>
                </div>
                <Link href="/admin/users/create?role=STUDENT">
                    <Button variant="primary" className="rounded-xl shadow-lg shadow-blue-500/20">
                        <Plus className="w-5 h-5 mr-2" />
                        Tambah Siswa Baru
                    </Button>
                </Link>
            </div>

            {/* Filter & Search */}
            <div className="bg-white/60 backdrop-blur-md border border-white/50 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gray-400)] w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Cari nama siswa atau email..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[var(--primary-100)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)] text-[var(--gray-700)] placeholder:text-[var(--gray-400)] transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                        className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-white border border-[var(--primary-100)] text-[var(--gray-600)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)] cursor-pointer"
                    >
                        <option value="all">Semua Kelas</option>
                        {classes.map((cls) => (
                            <option key={cls.id} value={cls.name}>{cls.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Users List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[var(--primary-500)] animate-spin" />
                </div>
            ) : (
                <div className="space-y-4">
                    {users.length === 0 ? (
                        <div className="text-center py-10 text-[var(--gray-500)]">Tidak ada data siswa ditemukan.</div>
                    ) : (
                        users.map((user, index) => (
                            <div
                                key={user.id}
                                className="group bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/60 shadow-[var(--shadow-soft-md)] hover:shadow-[var(--shadow-soft-lg)] hover:-translate-x-1 transition-all duration-300 flex items-center gap-4 md:gap-6"
                            >
                                {/* Index Badge */}
                                <div className="w-10 h-10 flex-none flex items-center justify-center rounded-full font-bold text-lg bg-[var(--gray-100)] text-[var(--gray-500)]">
                                    #{index + 1}
                                </div>

                                {/* Avatar */}
                                <div className="relative w-12 h-12 flex-none">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm">
                                        {user.avatarUrl ? (
                                            <Image src={user.avatarUrl} alt={user.username} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-300 to-purple-400 flex items-center justify-center text-white font-bold text-xl uppercase">
                                                {user.username.substring(0, 2)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                    <div className="col-span-1 md:col-span-2">
                                        <h3 className="font-bold text-[var(--gray-800)] truncate">{user.username}</h3>
                                        <p className="text-xs text-[var(--gray-500)] flex items-center gap-2">
                                            {user.kelas && (
                                                <span className="bg-[var(--primary-50)] text-[var(--primary-600)] px-1.5 py-0.5 rounded border border-[var(--primary-100)] uppercase">
                                                    {user.kelas}
                                                </span>
                                            )}
                                            <span className="truncate">{user.email}</span>
                                        </p>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-6 text-sm text-[var(--gray-600)]">
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold text-[var(--primary-600)]">{user.totalPoints || 0}</span>
                                            <span className="text-[10px] uppercase tracking-wider text-[var(--gray-400)]">XP Points</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold text-[var(--gray-800)]">{user._count?.videoViews || 0}</span>
                                            <span className="text-[10px] uppercase tracking-wider text-[var(--gray-400)]">Video</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold text-[var(--gray-800)]">{user._count?.quizAttempts || 0}</span>
                                            <span className="text-[10px] uppercase tracking-wider text-[var(--gray-400)]">Kuis</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action */}
                                <Link href={`/admin/users/${user.id}`} className="hidden md:block">
                                    <Button variant="ghost" size="sm">
                                        <Eye className="w-4 h-4 mr-2" />
                                        Detail
                                    </Button>
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
