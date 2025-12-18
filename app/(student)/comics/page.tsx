'use client';

import { BookOpen, Search, Star, Sparkles, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { StudentBackground } from '@/components/layout/student-background';
import { apiFetch } from '@/lib/api-client';

// Fallback Mock Data (in case API is empty)
const MOCK_COMICS = [
    {
        id: '1',
        title: 'Petualangan Gigi Sehat',
        coverUrl: '/images/hero-character.png',
        category: 'Edukasi',
        totalPages: 12,
        isPublished: true,
        _count: { reads: 340 }
    },
    {
        id: '2',
        title: 'Melawan Monster Karies',
        coverUrl: '/images/mascot-boy.png',
        category: 'Cerita Seru',
        totalPages: 15,
        isPublished: true,
        _count: { reads: 520 }
    },
    {
        id: '3',
        title: 'Kenapa Gusi Berdarah?',
        coverUrl: '/images/mascot-girl.png',
        category: 'Sains',
        totalPages: 8,
        isPublished: true,
        _count: { reads: 120 }
    },
];

const CATEGORIES = ['Semua', 'Cerita Seru', 'Edukasi', 'Sains', 'Misteri'];

export default function StudentComicsPage() {
    const [activeCategory, setActiveCategory] = useState('Semua');
    const [comics, setComics] = useState<any[]>(MOCK_COMICS);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchComics = async () => {
            try {
                // Try fetching real data
                const res = await apiFetch('/api/comics?limit=20');
                const data = await res.json();
                if (data.success && data.data.data.length > 0) {
                    setComics(data.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch comics, using mock", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchComics();
    }, []);

    const filteredComics = comics.filter(comic => {
        const matchesSearch = comic.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'Semua' || comic.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <StudentBackground>
            {/* Header with Back Button */}
            <div className="flex items-center justify-between p-4 md:p-6 relative z-20">
                <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-lg hover:bg-white/30 transition-all active:scale-95">
                    <ChevronLeft className="w-6 h-6 text-white" />
                </Link>
                <h1 className="text-xl font-bold text-white drop-shadow-md flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-white animate-bounce" />
                    Komik Seru
                </h1>
                <div className="w-10" />
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-24 no-scrollbar">
                <div className="max-w-4xl mx-auto space-y-6">

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari judul komik..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/90 backdrop-blur-md border-2 border-white/50 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-lg placeholder:text-gray-400 text-gray-700"
                        />
                    </div>

                    {/* Filter Chips */}
                    <div className="flex gap-3 overflow-x-auto pb-2 pt-2 scrollbar-hide px-2">
                        {CATEGORIES.map((cat) => {
                            const isActive = activeCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`
                                        px-6 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 ease-out
                                        border-b-[3px] active:scale-95 active:border-b-0 active:translate-y-1
                                        ${isActive
                                            ? 'bg-[#F59E0B] text-white border-[#D97706] shadow-[0_8px_20px_-6px_rgba(245,158,11,0.5)]'
                                            : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:bg-slate-50 shadow-[0_4px_10px_-4px_rgba(148,163,184,0.3)]'
                                        }
                                    `}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>

                    {/* Featured Comic Banner (Only show if ALL) */}
                    {activeCategory === 'Semua' && !searchTerm && comics.length > 0 && (
                        <Link href={`/comics/${comics[0].id}`}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full rounded-[2rem] bg-gradient-to-r from-violet-500 to-purple-600 border-4 border-white/30 shadow-2xl relative overflow-hidden flex items-center p-6 md:p-8 cursor-pointer group mb-10"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                                <div className="relative z-10 flex-1 pr-4">
                                    <span className="bg-yellow-400 text-yellow-900 border border-yellow-200 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3 inline-block shadow-sm">
                                        Pilihan Editor ✨
                                    </span>
                                    <h2 className="text-2xl md:text-3xl font-black text-white drop-shadow-md mb-2 leading-tight line-clamp-2">
                                        {comics[0].title}
                                    </h2>
                                    <p className="text-white/90 text-sm mb-4 line-clamp-2">
                                        {comics[0].description || 'Ikuti perjalanan seru dan edukatif untuk menjaga kesehatan gigi dan mulut bersama karakter favoritmu!'}
                                    </p>
                                    <button className="bg-white text-violet-600 px-6 py-2.5 rounded-xl font-bold border-b-4 border-violet-200 group-active:border-b-0 group-active:translate-y-1 transition-all shadow-lg text-sm">
                                        Baca Sekarang
                                    </button>
                                </div>
                                <div className="relative w-28 h-40 md:w-36 md:h-48 transform rotate-6 group-hover:rotate-0 transition-transform duration-500 shadow-2xl rounded-lg overflow-hidden border-4 border-white/20 flex-shrink-0 bg-white">
                                    <Image
                                        src={comics[0].coverUrl || '/placeholder-comic.jpg'}
                                        alt={comics[0].title}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.srcset = '/placeholder-comic.jpg';
                                            target.src = '/placeholder-comic.jpg';
                                        }}
                                    />
                                </div>
                            </motion.div>
                        </Link>
                    )}

                    {/* Comic Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-10">
                        {filteredComics.map((comic, idx) => (
                            <Link href={`/comics/${comic.id}`} key={comic.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group relative bg-white/90 backdrop-blur-md rounded-3xl p-3 border-2 border-white/50 shadow-xl hover:scale-[1.03] transition-all duration-300 h-full flex flex-col"
                                >
                                    {/* Cover */}
                                    <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden mb-3 border border-black/5 shadow-inner bg-gray-100">
                                        <Image
                                            src={comic.coverUrl || '/placeholder-comic.jpg'} // Fallback
                                            alt={comic.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            unoptimized
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.srcset = '/placeholder-comic.jpg';
                                                target.src = '/placeholder-comic.jpg';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                                        {/* Category Badge */}
                                        <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/20">
                                            {comic.category || 'Umum'}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="px-1 flex-1 flex flex-col">
                                        <h3 className="text-sm md:text-base font-black text-gray-800 leading-tight mb-1 line-clamp-2 group-hover:text-[var(--primary-600)] transition-colors">
                                            {comic.title}
                                        </h3>
                                        <div className="flex items-center gap-1 mt-auto">
                                            <Sparkles className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                            <span className="text-xs font-bold text-gray-500">{comic._count?.reads || 0} Pembaca</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>

                    {filteredComics.length === 0 && (
                        <div className="text-center py-10 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/50">
                            <p className="text-gray-500 font-bold">Tidak ada komik ditemukan 😔</p>
                        </div>
                    )}
                </div>
            </div>
        </StudentBackground>
    );
}
