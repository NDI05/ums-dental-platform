'use client';

import { GamificationHeader } from '@/components/dashboard/gamification-header';
import { HeroSection } from '@/components/dashboard/hero-section';
import { MenuGrid } from '@/components/dashboard/menu-grid';
import { StudentBackground } from '@/components/layout/student-background';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { apiFetch } from '@/lib/api-client';

// Metadata removed (Client Component)

interface DashboardData {
    user: {
        name: string;
        avatar: string;
        points: number;
    };
    missions: {
        completed: number;
        total: number;
        progress: number;
        details: { id: string; label: string; isCompleted: boolean; }[];
    };
}

export default function DashboardPage() {
    const { accessToken, user } = useAuthStore();
    const [data, setData] = useState<DashboardData | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Add timestamp to prevent caching
                const res = await apiFetch(`/api/student/dashboard?t=${Date.now()}`);
                const json = await res.json();

                if (json.success) {
                    setData(json.data);
                } else {
                    console.error('Dashboard data fetch failed:', json.message);
                }
            } catch (error) {
                console.error("Dashboard fetch error", error);
            }
        };

        if (accessToken) {
            fetchDashboardData();
        }
    }, [accessToken]);

    // Use fetched data or fallbacks (optimistic UI or loading state could be better, but we keep it simple)
    const userName = data?.user.name || user?.username || "Friend";
    const coinBalance = data?.user.points || 0;
    const avatarUrl = data?.user.avatar;
    const completedMissions = data?.missions.completed || 0;
    const totalMissions = data?.missions.total || 5;
    const missionDetails = data?.missions.details || [];

    // Predictive Prefetching
    const { useRouter } = require('next/navigation');
    const router = useRouter();

    const prefetchRoutes = () => {
        router.prefetch('/student/quizzes');
        router.prefetch('/student/videos');
        router.prefetch('/student/leaderboard');
    };

    return (
        <StudentBackground>
            <GamificationHeader
                userName={userName}
                coinBalance={coinBalance}
                avatarUrl={avatarUrl}
            />
            <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-32">
                <div className="flex-1 flex flex-col pt-6" onMouseEnter={prefetchRoutes}>
                    <HeroSection
                        completedMissions={completedMissions}
                        totalMissions={totalMissions}
                        missionDetails={missionDetails}
                    />
                    <MenuGrid />
                </div>
            </div>
        </StudentBackground>
    );
}
