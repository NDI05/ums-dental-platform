'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Gamepad2, Image as ImageIcon, Link as LinkIcon, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Button from '@/components/ui/Button';

interface GameFormData {
    title: string;
    description: string;
    thumbnailUrl: string;
    gameUrl: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    sortOrder: number;
    isPublished: boolean;
}

interface GameFormProps {
    initialData?: GameFormData;
    onSubmit: (data: GameFormData) => Promise<void>;
    isLoading: boolean;
    error: string;
    submitLabel?: string;
}

export function GameForm({ initialData, onSubmit, isLoading, error, submitLabel = 'Simpan Game' }: GameFormProps) {
    const [formData, setFormData] = useState<GameFormData>({
        title: '',
        description: '',
        thumbnailUrl: '',
        gameUrl: '',
        difficulty: 'EASY',
        sortOrder: 0,
        isPublished: false
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : name === 'sortOrder' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-[var(--gray-200)] shadow-sm space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--gray-700)]">Judul Game <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--gray-200)] focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-100)] transition-all outline-none"
                            placeholder="Contoh: Petualangan Sikat Gigi"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--gray-700)]">Deskripsi</label>
                        <textarea
                            name="description"
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--gray-200)] focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-100)] transition-all outline-none resize-none"
                            placeholder="Jelaskan cara bermain atau tujuan game ini..."
                        />
                    </div>

                    {/* Game URL */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--gray-700)] flex items-center gap-2">
                            <LinkIcon className="w-4 h-4" /> Link Game (HTML5 / WebGL) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="url"
                            name="gameUrl"
                            required
                            value={formData.gameUrl}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--gray-200)] focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-100)] transition-all outline-none font-mono text-sm"
                            placeholder="https://..."
                        />
                        <p className="text-xs text-[var(--gray-400)]">Masukkan URL game yang bisa di-embed (iframe compatible).</p>
                    </div>
                </div>
            </div>

            {/* Right Column - Settings & Preview */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-[var(--gray-200)] shadow-sm space-y-6">

                    {/* Difficulty */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--gray-700)]">Tingkat Kesulitan</label>
                        <select
                            name="difficulty"
                            value={formData.difficulty}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--gray-200)] focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-100)] transition-all outline-none"
                        >
                            <option value="EASY">Mudah (Easy)</option>
                            <option value="MEDIUM">Sedang (Medium)</option>
                            <option value="HARD">Sulit (Hard)</option>
                        </select>
                    </div>

                    {/* Thumbnail URL */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-[var(--gray-700)] flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" /> Thumbnail URL <span className="text-red-500">*</span>
                        </label>

                        <div className="relative aspect-video w-full bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center group">
                            {formData.thumbnailUrl ? (
                                <Image
                                    src={formData.thumbnailUrl}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Error';
                                    }}
                                />
                            ) : (
                                <div className="text-center p-4">
                                    <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-xs text-gray-400">Preview akan muncul di sini</p>
                                </div>
                            )}
                        </div>

                        <input
                            type="url"
                            name="thumbnailUrl"
                            required
                            value={formData.thumbnailUrl}
                            onChange={handleChange}
                            className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--gray-200)] focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-100)] transition-all outline-none"
                            placeholder="https://..."
                        />
                    </div>

                    {/* Status Toggle */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <span className={`block text-sm font-bold ${formData.isPublished ? 'text-[var(--primary-600)]' : 'text-gray-600'}`}>
                                    {formData.isPublished ? 'Status: Terbit (Published)' : 'Status: Draft'}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {formData.isPublished ? 'Game dapat dimainkan siswa' : 'Game disembunyikan dari siswa'}
                                </span>
                            </div>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="isPublished"
                                    checked={formData.isPublished}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-600)]"></div>
                            </div>
                        </label>
                    </div>

                    <hr className="border-[var(--gray-100)]" />

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full py-4 rounded-xl font-bold shadow-lg shadow-blue-500/20"
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
                                {submitLabel}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </form>
    );
}
