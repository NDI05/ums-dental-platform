'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface CharacterMascotProps {
    className?: string;
    variant?: 'waving' | 'idle' | 'happy';
}

export function CharacterMascot({ className = "", variant = 'waving' }: CharacterMascotProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Simple breathing animation
    const breathing = {
        y: [0, -10, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut" as const
        }
    };

    // Waving hand animation
    const waving = {
        rotate: [0, 5, -5, 0],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "linear" as const,
            delay: 0.5
        }
    };

    if (!isMounted) {
        return (
            <div className={`relative ${className}`}>
                {/* Glow Effect behind */}
                <div className="absolute inset-0 bg-blue-400/30 blur-3xl rounded-full scale-90 translate-y-4 -z-10" />

                <Image
                    src="/images/hero-character.png"
                    alt="UMS Dental Hero"
                    width={300}
                    height={300}
                    className="object-contain drop-shadow-2xl"
                    priority
                />
            </div>
        );
    }

    return (
        <motion.div
            className={`relative ${className}`}
            animate={variant === 'waving' ? waving : breathing}
        >
            {/* Glow Effect behind */}
            <div className="absolute inset-0 bg-blue-400/30 blur-3xl rounded-full scale-90 translate-y-4 -z-10" />

            <Image
                src="/images/hero-character.png"
                alt="UMS Dental Hero"
                width={300}
                height={300}
                className="object-contain drop-shadow-2xl"
                priority
            />
        </motion.div>
    );
}
