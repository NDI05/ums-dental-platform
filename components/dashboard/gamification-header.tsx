'use client';

import { Coins, Sparkles, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface GamificationHeaderProps {
    userName: string;
    coinBalance: number;
    avatarUrl?: string | null;
}

export function GamificationHeader({ userName, coinBalance, avatarUrl }: GamificationHeaderProps) {
    return (
        <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 relative z-20">
            {/* Decorative elements */}
            <Star className="absolute top-2 left-1/2 w-3 h-3 md:w-4 md:h-4 text-white/40 animate-pulse" fill="currentColor" />

            {/* User Avatar - Link to Profile */}
            <Link href="/profile" className="flex items-center gap-2 md:gap-3 group">
                <div className="relative transition-transform duration-300 group-hover:scale-105">
                    {/* Avatar with 3D effect - Smaller */}
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/30 backdrop-blur-md p-0.5 shadow-xl border-2 border-white/50">
                        <div className="w-full h-full rounded-full bg-white p-1">
                            <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-[#E0F2FE] to-[#CCFBF1] relative">
                                <Image
                                    src={avatarUrl || "/images/mascot-boy.png"}
                                    alt="Avatar"
                                    fill
                                    className="object-cover scale-110"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status Badge - Smaller */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                        <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                    </div>
                </div>

                <div>
                    <p className="text-white/95 drop-shadow-lg text-xs group-hover:text-white transition-colors" style={{ fontWeight: 600 }}>
                        Halo,
                    </p>
                    <h3 className="text-white drop-shadow-lg text-base md:text-lg group-hover:scale-105 transition-transform origin-left" style={{ fontWeight: 800 }}>
                        {userName}
                    </h3>
                </div>
            </Link>

            {/* Coin Balance - Compact */}
            <Link href="/points" className="cursor-pointer group">
                <div className="relative transform transition-all duration-300 group-hover:scale-110 active:scale-95">
                    {/* Shine effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] rounded-full blur opacity-40 animate-pulse group-hover:opacity-60" />

                    {/* Main coin display */}
                    <div className="relative bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] rounded-full px-3 py-2 md:px-4 md:py-2.5 flex items-center gap-1.5 md:gap-2 shadow-xl border-2 border-white/50">
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center animate-bounce">
                            <Coins className="w-3 h-3 md:w-4 md:h-4 text-white" />
                        </div>
                        <span className="text-white drop-shadow-md text-sm md:text-base" style={{ fontWeight: 700 }}>
                            {coinBalance.toLocaleString()}
                        </span>
                    </div>
                </div>
            </Link>
        </header>
    );
}
