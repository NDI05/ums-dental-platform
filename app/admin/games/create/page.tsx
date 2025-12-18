'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Gamepad2 } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store/auth';
import { GameForm } from '@/components/admin/game-form';

export default function CreateGamePage() {
    const router = useRouter();
    const { accessToken } = useAuthStore();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (formData: any) => {
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/games', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Gagal membuat game');
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
                        Tambah Game Baru
                    </h1>
                    <p className="text-[var(--gray-500)] text-sm">Tambahkan game edukasi baru ke dalam platform</p>
                </div>
            </div>

            <GameForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                error={error}
            />
        </div>
    );
}
