'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash, Save, X, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store/auth';

interface QuizCategory {
    id: string;
    name: string;
    description: string | null;
    _count: {
        quizzes: number;
    }
}

export default function CategoryManagementPage() {
    const { accessToken } = useAuthStore();
    const [categories, setCategories] = useState<QuizCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [isEditing, setIsEditing] = useState<string | null>(null); // ID of editing item, or 'new'
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [isSaving, setIsSaving] = useState(false);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/quiz-categories');
            const data = await res.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleEdit = (cat: QuizCategory) => {
        setIsEditing(cat.id);
        setFormData({ name: cat.name, description: cat.description || '' });
    };

    const handleCreate = () => {
        setIsEditing('new');
        setFormData({ name: '', description: '' });
    };

    const handleCancel = () => {
        setIsEditing(null);
        setFormData({ name: '', description: '' });
    };

    const handleSave = async () => {
        if (!formData.name.trim()) return alert('Nama kategori wajib diisi');

        setIsSaving(true);
        try {
            const url = isEditing === 'new'
                ? '/api/quiz-categories'
                : `/api/quiz-categories/${isEditing}`;

            const method = isEditing === 'new' ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                await fetchCategories();
                handleCancel();
            } else {
                alert(data.message || 'Gagal menyimpan kategori');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Terjadi kesalahan jaringan');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, count: number) => {
        if (count > 0) return alert(`Kategori ini digunakan oleh ${count} soal. Tidak dapat dihapus.`);
        if (!confirm('Hapus kategori ini?')) return;

        try {
            const res = await fetch(`/api/quiz-categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (res.ok) {
                setCategories(prev => prev.filter(c => c.id !== id));
            } else {
                const data = await res.json();
                alert(data.message || 'Gagal menghapus');
            }
        } catch (error) {
            alert('Terjadi kesalahan');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/quizzes">
                    <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0">
                        <ArrowLeft className="w-5 h-5 text-[var(--gray-600)]" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-[var(--gray-800)]">Kategori Kuis</h1>
                    <p className="text-[var(--gray-500)]">Kelola list kategori untuk soal kuis.</p>
                </div>
                <div className="ml-auto">
                    <Button onClick={handleCreate} disabled={isEditing !== null} variant="primary">
                        <Plus className="w-5 h-5 mr-2" /> Tambah
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-[var(--gray-100)] shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[var(--gray-50)] text-[var(--gray-600)] uppercase text-xs font-bold">
                        <tr>
                            <th className="px-6 py-4">Nama Kategori</th>
                            <th className="px-6 py-4">Deskripsi</th>
                            <th className="px-6 py-4 text-center">Jumlah Soal</th>
                            <th className="px-6 py-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--gray-100)]">
                        {isEditing === 'new' && (
                            <tr className="bg-blue-50/50">
                                <td className="px-6 py-4">
                                    <input
                                        autoFocus
                                        className="w-full border rounded px-2 py-1"
                                        placeholder="Nama Kategori..."
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        className="w-full border rounded px-2 py-1"
                                        placeholder="Deskripsi (Opsional)"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </td>
                                <td className="px-6 py-4 text-center text-sm text-[var(--gray-400)]">-</td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        <Button size="sm" variant="success" onClick={handleSave} disabled={isSaving}>
                                            <Save className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={handleCancel} disabled={isSaving}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {categories.map((cat) => (
                            <tr key={cat.id} className="group hover:bg-[var(--gray-50)] transition-colors">
                                {isEditing === cat.id ? (
                                    <>
                                        <td className="px-6 py-4">
                                            <input
                                                className="w-full border rounded px-2 py-1"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                className="w-full border rounded px-2 py-1"
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-bold text-[var(--primary-600)]">
                                            {cat._count.quizzes}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <Button size="sm" variant="success" onClick={handleSave} disabled={isSaving}>
                                                    <Save className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={handleCancel} disabled={isSaving}>
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-6 py-4 font-medium text-[var(--gray-800)]">{cat.name}</td>
                                        <td className="px-6 py-4 text-sm text-[var(--gray-500)]">{cat.description || '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-[var(--primary-50)] text-[var(--primary-700)] px-2 py-1 rounded-md text-xs font-bold">
                                                {cat._count.quizzes} Soal
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex justify-center gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => handleEdit(cat)}>
                                                    <Edit className="w-4 h-4 text-blue-500" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(cat.id, cat._count.quizzes)}
                                                    className={cat._count.quizzes > 0 ? 'opacity-50 cursor-not-allowed' : ''}
                                                >
                                                    <Trash className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}

                        {!isLoading && categories.length === 0 && isEditing !== 'new' && (
                            <tr>
                                <td colSpan={4} className="text-center py-10 text-gray-400">
                                    Belum ada kategori.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
