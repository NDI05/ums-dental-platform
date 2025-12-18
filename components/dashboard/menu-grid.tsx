'use client';

import { Gamepad2, Play, Trophy, Zap, BookOpen, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function MenuGrid() {
    const menuItems = [
        {
            id: 'video',
            title: 'Video Seru',
            subtitle: 'Tonton & belajar',
            icon: Play,
            href: '/videos',
            gradient: 'from-sky-400 to-blue-500',
            bgColor: '#F0F9FF', // sky-50
            shadowColor: 'rgba(56, 189, 248, 0.3)', // sky-400
            delay: 'delay-0',
        },
        {
            id: 'comic',
            title: 'Komik',
            subtitle: 'Baca cerita seru',
            icon: BookOpen,
            href: '/comics',
            gradient: 'from-violet-400 to-purple-500',
            bgColor: '#F5F3FF', // violet-50
            shadowColor: 'rgba(167, 139, 250, 0.3)', // violet-400
            delay: 'delay-75',
        },
        {
            id: 'quiz',
            title: 'Kuis',
            subtitle: 'Uji pemahamanmu',
            icon: Zap,
            href: '/quizzes',
            gradient: 'from-emerald-400 to-teal-500',
            bgColor: '#ECFDF5', // emerald-50
            shadowColor: 'rgba(52, 211, 153, 0.3)', // emerald-400
            delay: 'delay-100',
        },
        {
            id: 'games',
            title: 'Games',
            subtitle: 'Main sambil belajar',
            icon: Gamepad2,
            href: '/games',
            gradient: 'from-emerald-400 to-green-500',
            bgColor: '#F0FDF4', // green-50
            shadowColor: 'rgba(74, 222, 128, 0.3)', // green-400
            delay: 'delay-150',
        },
        {
            id: 'leaderboard',
            title: 'Juara',
            subtitle: 'Lihat peringkat',
            icon: Trophy,
            href: '/leaderboard',
            gradient: 'from-amber-300 to-orange-400',
            bgColor: '#FFFBEB', // amber-50
            shadowColor: 'rgba(251, 191, 36, 0.3)', // amber-400
            delay: 'delay-200',
        },
    ];

    return (
        <div className="px-4 pb-4 relative z-20">
            {/* Section Title - Compact */}
            <div className="flex items-center justify-between mb-3 px-2 max-w-7xl mx-auto">
                <div className="relative">
                    <h3
                        className="text-white drop-shadow-lg text-xl md:text-2xl"
                        style={{ fontWeight: 800 }}
                    >
                        Mari Belajar! 🚀
                    </h3>
                    {/* Underline decoration */}
                    <div className="h-1 w-3/4 bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] rounded-full mt-0.5 shadow-lg" />
                </div>
                <div className="animate-bounce">
                    <Sparkles className="w-6 h-6 text-[#F59E0B] drop-shadow-lg" fill="#F59E0B" />
                </div>
            </div>

            {/* Menu Items Grid - Compact */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className="group relative overflow-hidden rounded-3xl p-5 transition-all duration-300 ease-out flex flex-col min-h-[140px] md:min-h-[160px] border-b-[6px] active:border-b-0 active:translate-y-2 active:scale-[0.98]"
                            style={{
                                backgroundColor: item.bgColor,
                                borderColor: item.shadowColor.replace('0.3', '0.5'), // Darker border for 3D effect
                                boxShadow: `0 10px 25px -5px ${item.shadowColor}, 0 8px 10px -6px ${item.shadowColor}`,
                            }}
                        >
                            {/* Icon Circle with Gradient */}
                            <div
                                className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-3 shadow-lg shadow-black/5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
                            >
                                <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" strokeWidth={2.5} />
                            </div>

                            {/* Title and Description */}
                            <div className="text-left flex-1 flex flex-col justify-center relative z-10">
                                <h4
                                    className="mb-1 leading-tight text-lg md:text-xl group-hover:tracking-wide transition-all"
                                    style={{
                                        fontWeight: 800,
                                        color: '#1F2937',
                                    }}
                                >
                                    {item.title}
                                </h4>
                                <p
                                    className="leading-tight text-xs md:text-sm opacity-80"
                                    style={{
                                        fontWeight: 600,
                                        color: '#374151'
                                    }}
                                >
                                    {item.subtitle}
                                </p>
                            </div>

                            {/* Floating Sparkle (Top Right) */}
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Sparkles
                                    className="w-5 h-5 text-gray-700/20 group-hover:text-gray-700/40 animate-pulse"
                                />
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
