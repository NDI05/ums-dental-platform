'use client';

import Link from 'next/link';
import { Search, Users, Plus, Loader2, UserCog, Shield, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { apiFetch } from '@/lib/api-client';

// Metadata removed

export default function UsersPage() {
    const { accessToken } = useAuthStore();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            // We fetch all and filter client side for non-students, or filter by specific role if selected
            // Since API only supports one role, if 'all' is selected we fetch all and filter.
            if (roleFilter !== 'all') {
                params.append('role', roleFilter);
            }
            params.append('limit', '100'); // Fetch more to ensure we get staff

            const res = await apiFetch(`/api/users?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                let filtered = data.data.data;
                // If filter is 'all', we still want to exclude STUDENTS for this specific page
                if (roleFilter === 'all') {
                    filtered = filtered.filter((u: any) => u.role !== 'STUDENT');
                }
                setUsers(filtered);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accessToken) {
            fetchUsers();
        }
    }, [accessToken, searchTerm, roleFilter]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--gray-800)] flex items-center gap-3">
                        <UserCog className="w-8 h-8 text-[var(--primary-600)]" />
                        Manajemen User
                    </h1>
                    <p className="text-[var(--gray-500)] mt-1">Kelola akun Admin, Guru, dan Content Manager.</p>
                </div>
                <Link href="/admin/users/create">
                    <Button variant="primary" className="rounded-xl shadow-lg shadow-blue-500/20">
                        <Plus className="w-5 h-5 mr-2" />
                        Tambah User Baru
                    </Button>
                </Link>
            </div>

            {/* Filter & Search */}
            <div className="bg-white/60 backdrop-blur-md border border-white/50 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gray-400)] w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Cari nama atau email..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[var(--primary-100)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)] text-[var(--gray-700)] placeholder:text-[var(--gray-400)] transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-white border border-[var(--primary-100)] text-[var(--gray-600)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)] cursor-pointer"
                    >
                        <option value="all">Semua Staff</option>
                        <option value="TEACHER">Guru</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
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
                        <div className="text-center py-10 text-[var(--gray-500)]">Tidak ada data user ditemukan.</div>
                    ) : (
                        users.map((user, index) => (
                            <div
                                key={user.id}
                                className="group bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/60 shadow-[var(--shadow-soft-md)] hover:shadow-[var(--shadow-soft-lg)] hover:-translate-x-1 transition-all duration-300 flex items-center gap-4 md:gap-6"
                            >
                                {/* Avatar */}
                                <div className="relative w-12 h-12 flex-none">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm">
                                        {user.avatarUrl ? (
                                            <Image src={user.avatarUrl} alt={user.username} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-indigo-300 to-pink-400 flex items-center justify-center text-white font-bold text-xl uppercase">
                                                {user.username.substring(0, 2)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                    <div className="col-span-1">
                                        <h3 className="font-bold text-[var(--gray-800)] truncate">{user.username}</h3>
                                        <p className="text-xs text-[var(--gray-500)]">{user.email}</p>
                                    </div>

                                    {/* Role Badge */}
                                    <div className="flex items-center justify-end md:justify-start">
                                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                            user.role === 'CONTENT_MANAGER' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                'bg-emerald-100 text-emerald-700 border-emerald-200'
                                            }`}>
                                            {user.role === 'SUPER_ADMIN' && <ShieldCheck className="w-3 h-3" />}
                                            {user.role === 'CONTENT_MANAGER' && <Users className="w-3 h-3" />}
                                            {user.role === 'TEACHER' && <Users className="w-3 h-3" />}
                                            {user.role}
                                        </span>
                                    </div>
                                </div>

                                {/* Action */}
                                <Link href={`/admin/users/${user.id}`} className="hidden md:block">
                                    <Button variant="ghost" size="sm">
                                        <UserCog className="w-4 h-4 mr-2" />
                                        Edit
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
