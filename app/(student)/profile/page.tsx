'use client';

import { StudentBackground } from '@/components/layout/student-background';
import { ChevronLeft, LogOut, Edit3, Award, Zap, Trophy, Shield, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store/auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api-client';

// Metadata removed

export default function ProfilePage() {
    const { user, logout, accessToken } = useAuthStore();
    const router = useRouter();
    const [profileData, setProfileData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleLogout = () => {
        logout();
        router.push('/auth/login');
    };



    // ...

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) return;
            try {
                const res = await apiFetch(`/api/users/${user.id}`);
                const data = await res.json();
                if (data.success) {
                    setProfileData(data.data);
                }
            } catch (error) {
                console.error('Fetch profile error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchProfile();
        }
    }, [user]);

    if (!user) {
        return null; // Or redirect
    }

    return (
        <StudentBackground>
            {/* Header with Back Button */}
            <div className="flex items-center justify-between p-4 md:p-6 relative z-20">
                <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-lg hover:bg-white/30 transition-all active:scale-95">
                    <ChevronLeft className="w-6 h-6 text-white" />
                </Link>
                <h1 className="text-xl font-bold text-white drop-shadow-md">Profil Saya</h1>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto pb-8 px-4 md:px-6 no-scrollbar">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Profile Card */}
                    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-xl border-2 border-white/50 relative mt-24">
                        {/* Floating Avatar - Centered Top */}
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                            <div className="w-24 h-24 rounded-full bg-white p-1.5 shadow-2xl">
                                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-[#E0F2FE] to-[#CCFBF1] relative">
                                    <Image
                                        src={profileData?.avatarUrl || user.avatarUrl || "/images/mascot-boy.png"}
                                        alt="Profile Avatar"
                                        fill
                                        className="object-cover scale-110"
                                    />
                                </div>

                            </div>
                        </div>

                        {/* Name & Title */}
                        <div className="mt-12 text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">{user.username}</h2>
                            <p className="text-sky-600 font-semibold">{profileData?.kelas || 'Student'}</p>
                        </div>

                        {/* Stats Grid */}
                        {isLoading ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-[#E0F2FE] p-3 rounded-2xl border border-sky-100 shadow-sm flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center mb-1 text-sky-500">
                                        <Zap className="w-4 h-4 fill-current" />
                                    </div>
                                    <span className="text-2xl font-bold text-gray-800">{profileData?.totalPoints || 0}</span>
                                    <span className="text-xs text-gray-500 font-medium">XP Total</span>
                                </div>
                                <div className="bg-[#FEF3C7] p-3 rounded-2xl border border-amber-100 shadow-sm flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center mb-1 text-amber-500">
                                        <Trophy className="w-4 h-4 fill-current" />
                                    </div>
                                    <span className="text-2xl font-bold text-gray-800">{profileData?.ranking || '-'}</span>
                                    <span className="text-xs text-gray-500 font-medium">Ranking</span>
                                </div>
                            </div>
                        )}



                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleLogout}
                                className="w-full py-3 rounded-2xl bg-red-50 text-red-500 font-bold border border-red-100 hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Keluar
                            </button>
                        </div>
                    </div>

                    <p className="text-center text-white/60 text-xs mt-4">
                        Versi Aplikasi v1.0.0
                    </p>
                </div>
            </div>
        </StudentBackground>
    );
}
