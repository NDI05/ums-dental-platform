'use client';

import { Search, Play, Clock, Star, Filter, Lock, Clapperboard, ChevronLeft, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { StudentBackground } from '@/components/layout/student-background';
import { apiFetch } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store/auth';

interface Video {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    category: string;
    duration?: string; // Not in DB yet?
    keyPoints?: string[];
    createdAt: string;
}

const CATEGORIES = ['Semua', 'Tutorial', 'Lagu', 'Edukasi', 'Kartun'];

const fetcher = (url: string) => apiFetch(url).then((res) => res.json());

// Metadata removed

export default function VideosPage() {
    const { accessToken } = useAuthStore();
    const [activeCategory, setActiveCategory] = useState('Semua');
    const [searchTerm, setSearchTerm] = useState('');

    const { data: apiData, isLoading } = useSWR('/api/videos?limit=50', fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 10000, // 10 seconds
    });

    const videos: Video[] = apiData?.success && Array.isArray(apiData.data.data) ? apiData.data.data : [];

    const filteredVideos = videos.filter(video => {
        const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'Semua' || video.category === activeCategory;
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
                    <Clapperboard className="w-6 h-6 text-white" />
                    Video Seru
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
                            placeholder="Cari video..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/90 backdrop-blur-md border-2 border-white/50 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-lg"
                        />
                    </div>

                    {/* Filter Chips */}
                    <div className="flex gap-3 overflow-x-auto pb-6 pt-2 scrollbar-hide px-2">
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
                                            ? 'bg-[#0EA5E9] text-white border-[#0284C7] shadow-[0_8px_20px_-6px_rgba(14,165,233,0.5)]'
                                            : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:bg-slate-50 shadow-[0_4px_10px_-4px_rgba(148,163,184,0.3)]'
                                        }
                                    `}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>

                    {/* Video Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white/50 backdrop-blur-sm rounded-3xl h-64 animate-pulse" />
                            ))}
                        </div>
                    ) : filteredVideos.length === 0 ? (
                        <div className="text-center py-10 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/50">
                            <Clapperboard className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 font-bold">Tidak ada video ditemukan 😔</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredVideos.map((video, idx) => (
                                <Link key={video.id} href={`/videos/${video.id}`}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group bg-white/90 backdrop-blur-md rounded-3xl p-3 border-2 border-white/50 shadow-xl hover:scale-[1.02] transition-all duration-300 h-full flex flex-col"
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gray-100 mb-3 shadow-inner">
                                            <Image
                                                src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`} // Fallback if thumbnailUrl is missing, though create ensures it
                                                alt={video.title}
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                                    <PlayCircle className="w-6 h-6 text-[#0EA5E9] fill-[#0EA5E9]" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {video.duration || '05:00'}
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="px-1 flex-1 flex flex-col">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-100 px-2 py-1 rounded-lg">
                                                    {video.category || 'Umum'}
                                                </span>
                                                <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-lg border border-amber-200">
                                                    +{50} XP
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-gray-800 text-base leading-tight mb-1 line-clamp-2 group-hover:text-[#0EA5E9] transition-colors">
                                                {video.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                                {video.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </StudentBackground>
    );
}
