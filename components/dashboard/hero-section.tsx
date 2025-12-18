'use client';

import { Sparkles, CheckCircle2, Circle, X, Info } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Mission {
    id: string;
    label: string;
    isCompleted: boolean;
}

interface HeroSectionProps {
    completedMissions: number;
    totalMissions: number;
    missionDetails?: Mission[];
}

export function HeroSection({ completedMissions = 0, totalMissions = 5, missionDetails = [] }: HeroSectionProps) {
    const progress = Math.round((completedMissions / totalMissions) * 100);
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <div className="mx-4 mb-3 md:mb-4 relative z-10">
                {/* Welcome Text Badge - Smaller */}
                <div className="flex justify-center mb-2 md:mb-3">
                    <div className="inline-block px-4 py-2 bg-white/40 backdrop-blur-md rounded-full border-2 border-white/60 shadow-xl">
                        <p className="text-white drop-shadow-lg text-sm md:text-base" style={{ fontWeight: 700 }}>
                            Halo, Dental Hero! 👋
                        </p>
                    </div>
                </div>

                {/* Container for Mascots and Card with Overlap */}
                <div className="relative w-full max-w-lg mx-auto">
                    {/* MASCOTS */}
                    <div className="relative w-full flex items-end justify-between mb-[-30px] z-10 h-[180px] md:h-[220px]">
                        {/* Boy Mascot - LEFT SIDE */}
                        <div className="relative animate-float w-[140px] h-[160px] md:w-[180px] md:h-[200px]">
                            <Image
                                src="/images/mascot-boy.png"
                                alt="Dental Hero Boy"
                                fill
                                className="object-contain drop-shadow-2xl"
                            />
                            {/* Floating Badge on Boy */}
                            <div className="absolute top-1 right-1 w-8 h-8 bg-[#F59E0B] rounded-full flex items-center justify-center shadow-xl border-2 border-white animate-bounce">
                                <Sparkles className="w-4 h-4 text-white" fill="white" />
                            </div>
                        </div>

                        {/* Girl Mascot - RIGHT SIDE */}
                        <div className="relative animate-float w-[140px] h-[160px] md:w-[180px] md:h-[200px]" style={{ animationDelay: '0.5s' }}>
                            <Image
                                src="/images/mascot-girl.png"
                                alt="Dental Hero Girl"
                                fill
                                className="object-contain drop-shadow-2xl"
                            />
                        </div>
                    </div>

                    {/* Daily Mission Card - Clickable */}
                    <motion.div
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowModal(true)}
                        className="relative z-20 w-full bg-white/95 backdrop-blur-sm rounded-3xl p-4 shadow-2xl border-2 border-white/50 cursor-pointer group hover:bg-white transition-colors"
                    >
                        <div className="absolute top-4 right-4 animate-pulse">
                            <Info className="w-5 h-5 text-sky-400 opacity-50 group-hover:opacity-100" />
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] flex items-center justify-center shadow-lg">
                                <span className="text-xl">🦷</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-gray-900 text-sm md:text-base flex items-center gap-2" style={{ fontWeight: 700 }}>
                                    Misi Harian
                                    <span className="text-[10px] bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full border border-sky-200">Klik Detail</span>
                                </h3>
                                <p className="text-xs text-gray-700" style={{ fontWeight: 500 }}>
                                    Yuk Sikat Gigi Bareng!
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-700" style={{ fontWeight: 600 }}>
                                    Progress Hari Ini
                                </span>
                                <span className="text-xs text-[#0EA5E9]" style={{ fontWeight: 700 }}>
                                    {completedMissions}/{totalMissions} Misi
                                </span>
                            </div>
                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#0EA5E9] to-[#14B8A6] rounded-full shadow-lg transition-all duration-500 relative overflow-hidden"
                                    style={{ width: `${progress}%` }}
                                >
                                    {/* Shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Missions Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="relative bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl border-4 border-white/50 z-10 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-extrabold text-gray-800">Daftar Misi</h3>
                                    <p className="text-sm text-gray-500">Selesaikan untuk dapat XP!</p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* List */}
                            <div className="space-y-3 mb-6">
                                {missionDetails.length > 0 ? (
                                    missionDetails.map((mission) => (
                                        <div
                                            key={mission.id}
                                            className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${mission.isCompleted
                                                    ? 'bg-emerald-50 border-emerald-100'
                                                    : 'bg-white border-slate-100'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${mission.isCompleted ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-lg' : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                {mission.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-bold ${mission.isCompleted ? 'text-emerald-800' : 'text-slate-700'}`}>
                                                    {mission.label}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {mission.isCompleted ? 'Selesai!' : 'Belum selesai'}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-gray-400">
                                        Memuat misi...
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full py-3 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 active:scale-95 transition-all"
                            >
                                Tutup
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
