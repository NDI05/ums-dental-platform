'use client';

import { ArrowLeft, ChevronLeft, ChevronRight, Share2, ZoomIn, Info } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { useState, useEffect, use } from 'react';
import { apiFetch } from '@/lib/api-client';

export default function ComicReaderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [currentPage, setCurrentPage] = useState(0);
    const [comic, setComic] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchComic = async () => {
            try {
                const res = await apiFetch(`/api/comics/${id}`);
                const json = await res.json();
                if (json.success) {
                    setComic(json.data);
                }
            } catch (error) {
                console.error("Failed to fetch comic", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchComic();
    }, [id]);

    const recordRead = async () => {
        try {
            await apiFetch(`/api/comics/${id}/read`, { method: 'POST' });
        } catch (error) {
            console.error("Failed to record read", error);
        }
    };

    const pages = comic?.pages || [];

    const nextPage = () => {
        if (currentPage < pages.length - 1) {
            setCurrentPage(prev => prev + 1);
            // If we just reached the last page, record it
            if (currentPage + 1 === pages.length - 1) {
                recordRead();
            }
        }
    };

    const prevPage = () => {
        if (currentPage > 0) setCurrentPage(prev => prev - 1);
    };

    // Also record if they click "Next" on the last page? Or just arriving there is enough?
    // Let's record when they ARRIVE at the last page.
    useEffect(() => {
        if (pages.length > 0 && currentPage === pages.length - 1) {
            recordRead();
        }
    }, [currentPage, pages.length]);

    if (isLoading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
    if (!comic) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Komik tidak ditemukan</div>;

    return (
        <div className="h-screen w-full bg-gray-900 flex flex-col relative overflow-hidden">
            {/* Navbar Overlay */}
            <div className="absolute top-0 inset-x-0 z-50 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between pointer-events-none">
                <Link href="/comics" className="pointer-events-auto">
                    <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                </Link>
                <div className="text-white font-bold text-shadow pointer-events-auto px-4 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/10">
                    Halaman {currentPage + 1} / {pages.length}
                </div>
                <div className="pointer-events-auto flex gap-2">
                    <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                        <Share2 className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                        <Info className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Content (Reader) - Optimized for Fit */}
            <div className="absolute inset-0 flex items-center justify-center pt-20 pb-24 px-4 z-10">
                <div className="relative w-full h-full max-w-5xl flex items-center justify-center">
                    {/* Image Wrapper needs to constrain the image but fill available space */}
                    <div className="relative w-full h-full">
                        {pages[currentPage] ? (
                            <Image
                                src={pages[currentPage]}
                                alt={`Halaman ${currentPage + 1}`}
                                fill
                                className="object-contain drop-shadow-2xl"
                                priority
                                unoptimized
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                        const msg = document.createElement('div');
                                        msg.textContent = 'Gagal memuat gambar';
                                        msg.className = 'text-white/70 font-medium flex items-center justify-center h-full w-full border border-white/10 rounded-lg bg-white/5';
                                        parent.appendChild(msg);
                                    }
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-white/50">Gambar tidak tersedia</div>
                        )}
                    </div>
                </div>

                {/* Navigation Zones (Invisible Click Areas) */}
                <div
                    className="absolute inset-y-0 left-0 w-1/4 z-30 cursor-pointer"
                    onClick={prevPage}
                    title="Halaman Sebelumnya"
                />
                <div
                    className="absolute inset-y-0 right-0 w-1/4 z-30 cursor-pointer"
                    onClick={nextPage}
                    title="Halaman Berikutnya"
                />
            </div>

            {/* Bottom Controls */}
            <div className="fixed bottom-8 inset-x-0 z-50 flex justify-center gap-6 pointer-events-none">
                <button
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    className="pointer-events-auto px-6 py-3 rounded-xl bg-[var(--primary-500)] text-white font-bold shadow-lg border-b-4 border-[var(--primary-700)] active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:grayscale transition-all flex items-center gap-2"
                >
                    <ChevronLeft className="w-5 h-5" /> Prev
                </button>

                <button
                    onClick={nextPage}
                    disabled={currentPage === pages.length - 1}
                    className="pointer-events-auto px-6 py-3 rounded-xl bg-[var(--primary-500)] text-white font-bold shadow-lg border-b-4 border-[var(--primary-700)] active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:grayscale transition-all flex items-center gap-2"
                >
                    Next <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
