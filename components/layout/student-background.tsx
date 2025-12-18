'use client';

import { Star, Sparkles } from 'lucide-react';
import { ReactNode } from 'react';

interface StudentBackgroundProps {
    children: ReactNode;
}

export function StudentBackground({ children }: StudentBackgroundProps) {
    return (
        <div className="h-dvh relative overflow-hidden bg-[var(--background)]">
            {/* Background with UMS Ocean Blue to Tosca Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0EA5E9] to-[#14B8A6] z-0" />

            {/* Curved Wave Shapes (Like Duolingo Hills) - Creates 3D Depth - FULL PAGE */}
            <svg className="absolute bottom-0 left-0 w-full h-full z-0" viewBox="0 0 400 800" preserveAspectRatio="none">
                {/* Furthest back hill - Darker Tosca for depth */}
                <path
                    d="M0,400 Q100,300 200,400 T400,400 L400,800 L0,800 Z"
                    fill="#0d9488"
                    opacity="0.4"
                />
                {/* Middle back hill - Mint Green */}
                <path
                    d="M0,480 Q100,380 200,480 T400,480 L400,800 L0,800 Z"
                    fill="#10B981"
                    opacity="0.5"
                />
                {/* Middle front hill - Tosca */}
                <path
                    d="M0,560 Q100,460 200,560 T400,560 L400,800 L0,800 Z"
                    fill="#14B8A6"
                    opacity="0.6"
                />
                {/* Front hill - Light Tosca */}
                <path
                    d="M0,640 Q100,540 200,640 T400,640 L400,800 L0,800 Z"
                    fill="#5EEAD4"
                    opacity="0.8"
                />
            </svg>

            {/* Floating Decorative Blobs - Adjusted positions for viewport */}
            <div className="absolute top-20 left-8 w-16 h-16 rounded-full bg-[#F59E0B] opacity-20 blur-xl animate-bounce" style={{ animationDuration: '3s' }} />
            <div className="absolute top-32 right-12 w-12 h-12 rounded-full bg-[#10B981] opacity-25 blur-xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4s' }} />

            {/* Decorative Stars - Adjusted positions */}
            <Star className="absolute top-16 right-10 w-5 h-5 text-white/60 animate-pulse" fill="white" />
            <Star className="absolute top-1/2 left-12 w-4 h-4 text-[#F59E0B]/70 animate-pulse" fill="currentColor" style={{ animationDelay: '0.5s' }} />
            <Sparkles className="absolute top-1/3 right-20 w-4 h-4 text-white/50 animate-pulse" style={{ animationDelay: '1s' }} />

            {/* Main Content - Scrollable */}
            <div className="relative z-10 h-full flex flex-col overflow-y-auto custom-scrollbar">
                {children}
            </div>
        </div>
    );
}
