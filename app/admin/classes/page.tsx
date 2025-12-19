'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { School, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/lib/store/auth';
import { apiFetch } from '@/lib/api-client';

interface ClassItem {
    id: string;
    name: string;
    createdAt: string;
}

// Metadata removed

export default function AdminClassesPage() {
    const { accessToken } = useAuthStore();
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [error, setError] = useState('');

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/classes');
            const data = await res.json();
            if (data.success) {
                setClasses(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch classes', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClassName.trim()) return;

        setIsCreating(true);
        setError('');

        try {
            const res = await apiFetch('/api/classes', {
                method: 'POST',
                body: JSON.stringify({ name: newClassName })
            });
            const data = await res.json();

            if (data.success) {
                setNewClassName('');
                fetchClasses(); // Refresh list
            } else {
                setError(data.message || 'Gagal membuat kelas');
            }
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan');
        } finally {
            setIsCreating(false);
        }
    };

    // Delete functionality removed as Class management is now derived from Users
    const handleDelete = async (id: string) => {
        alert("Fitur hapus kelas dinonaktifkan sementara karena sinkronisasi data User.");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--gray-800)] flex items-center gap-3">
                        <School className="w-8 h-8 text-[var(--primary-600)]" />
                        Manajemen Kelas
                    </h1>
                    <p className="text-[var(--gray-500)] mt-1">Tambah dan kelola daftar kelas untuk siswa.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <Card variant="white" className="p-6 border border-white/60 sticky top-6">
                        <h2 className="text-lg font-bold text-[var(--gray-800)] mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-[var(--primary-500)]" />
                            Tambah Kelas Baru
                        </h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleCreate} className="space-y-4">
                            <Input
                                label="Nama Kelas"
                                placeholder="Contoh: 1A"
                                value={newClassName}
                                onChange={(e) => setNewClassName(e.target.value)}
                                required
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full"
                                disabled={isCreating || !newClassName}
                            >
                                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan'}
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <Card variant="white" className="p-0 overflow-hidden border border-white/60 shadow-sm">
                        <div className="p-4 bg-[var(--gray-50)] border-b border-[var(--gray-100)]">
                            <h3 className="font-bold text-[var(--gray-700)]">Daftar Kelas ({classes.length})</h3>
                        </div>

                        {loading ? (
                            <div className="p-8 flex justify-center">
                                <Loader2 className="w-8 h-8 text-[var(--primary-500)] animate-spin" />
                            </div>
                        ) : classes.length === 0 ? (
                            <div className="p-8 text-center text-[var(--gray-500)]">
                                Belum ada kelas yang dibuat.
                            </div>
                        ) : (
                            <div className="divide-y divide-[var(--gray-100)]">
                                {classes.map((cls) => (
                                    <div key={cls.id} className="p-4 flex items-center justify-between hover:bg-[var(--primary-50)] transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                {cls.name.substring(0, 2)}
                                            </div>
                                            <span className="font-bold text-[var(--gray-800)]">{cls.name}</span>
                                        </div>
                                        {/* Delete button disabled */}
                                        {/* <button
                                            onClick={() => handleDelete(cls.id)}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Hapus Kelas"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button> */}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
