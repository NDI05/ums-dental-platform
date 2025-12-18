'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Gamepad2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store/auth';
import { GameForm } from '@/components/admin/game-form';
import { apiFetch } from '@/lib/api-client';

export default function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { accessToken } = useAuthStore();

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');
    const [initialData, setInitialData] = useState<any>(null);

    useEffect(() => {
        const fetchGame = async () => {
            try {
                const res = await apiFetch(`/api/games/${id}`);
                const data = await res.json();
                if (data.success) {
                    setInitialData(data.data);
                } else {
                    setError('Gagal mengambil data game');
                }
            } catch (err) {
                setError('Terjadi kesalahan saat mengambil data');
            } finally {
                setIsFetching(false);
            }
        };

        if (id) fetchGame();
    }, [id]);

    const handleSubmit = async (formData: any) => {
        setError('');
        setIsLoading(true);

        try {
            const res = await apiFetch(`/api/games/${id}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || 'Gagal mengupdate game');
            }

            // Success
            router.push('/admin/games');
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
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/games">
                    <Button variant="ghost" size="sm" className="rounded-xl p-2 h-10 w-10">
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--gray-800)] flex items-center gap-2">
                        <Gamepad2 className="w-6 h-6 text-[var(--primary-600)]" />
                        Edit Game
                    </h1>
                    <p className="text-[var(--gray-500)] text-sm">Update informasi game edukasi</p>
                </div>
            </div>

            <GameForm
                initialData={initialData}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                error={error}
                submitLabel="Update Game"
            />
        </div>
    );
}
