'use client';

import Link from 'next/link';
import { Users, Video, HelpCircle, Trophy, TrendingUp, TrendingDown, Clock, Activity, ArrowRight, BarChart3, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth';

import dynamic from 'next/dynamic';

// Dynamic Import for Code Splitting
const WeeklyActivityChart = dynamic(() => import('@/components/admin/WeeklyActivityChart'), {
    loading: () => <div className="h-48 w-full bg-gray-50 rounded-xl animate-pulse" />,
    ssr: false // Client-side only rendering for heavy chart
});

// Metadata removed

export default function AdminDashboardPage() {
    const { accessToken } = useAuthStore();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                const data = await res.json();
                if (data.success) {
                    setStats(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };

        if (accessToken) {
            fetchStats();
        }
    }, [accessToken]);

    // Derived Data for Display
    const statCards = [
        { label: 'Total Siswa', value: stats?.totalUsers || 0, change: '+12%', trend: 'up', icon: Users, color: 'blue' },
        { label: 'Video Materi', value: stats?.totalVideos || 0, change: '+5', trend: 'up', icon: Video, color: 'purple' },
        { label: 'Komik Edukasi', value: stats?.totalComics || 0, change: '+2', trend: 'up', icon: BookOpen, color: 'emerald' },
        { label: 'Kuis Diselesaikan', value: stats?.totalQuizzes || 0, change: '0%', trend: 'neutral', icon: Trophy, color: 'amber' },
    ];

    const recentActivities = stats?.recentActivity || [];
    const weeklyData = stats?.weeklyActivity || Array(7).fill({ day: '-', count: 0 });
    const quizPerformance = stats?.quizPerformance || []; // Fallback empty

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--gray-800)] flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-[var(--primary-600)]" />
                        Dashboard Overview
                    </h1>
                    <p className="text-[var(--gray-500)] mt-1">Ringkasan aktivitas dan performa platform hari ini.</p>
                </div>
                <div className="bg-white/50 backdrop-blur-md border border-white/60 px-4 py-2 rounded-xl text-sm font-medium text-[var(--gray-600)] shadow-sm">
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <div key={i} className="group hover:-translate-y-1 transition-transform duration-300">
                        <Card variant="white" className="p-6 border border-white/60 shadow-[var(--shadow-soft-md)] h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                {/* Trend Indicator - kept simplified */}
                                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-100 text-green-700' :
                                    stat.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : stat.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
                                    {stat.change}
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-[var(--gray-800)] mb-1">
                                {loading ? '...' : stat.value}
                            </h3>
                            <p className="text-sm text-[var(--gray-500)] font-medium">{stat.label}</p>
                        </Card>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Charts) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Activity Chart */}
                    <Card variant="white" className="p-8 border border-white/60 shadow-[var(--shadow-soft-md)]">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-[var(--gray-800)] flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-[var(--primary-500)]" />
                                    Aktivitas Belajar Mingguan
                                </h2>
                                <p className="text-sm text-[var(--gray-500)]">Jumlah siswa yang aktif login dan belajar 7 hari terakhir.</p>
                            </div>
                        </div>
                        <WeeklyActivityChart data={weeklyData} />
                    </Card>

                    {/* Quiz Performance Distirbution */}
                    <Card variant="white" className="p-8 border border-white/60 shadow-[var(--shadow-soft-md)]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-[var(--gray-800)] flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-500" />
                                Rata-Rata Nilai Kuis per Kategori
                            </h2>
                        </div>
                        <div className="space-y-6">
                            {quizPerformance.length > 0 ? quizPerformance.map((item: any, i: number) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-2 font-medium">
                                        <span className="text-[var(--gray-700)]">{item.category}</span>
                                        <span className="text-[var(--gray-900)] font-bold">{item.score}/100</span>
                                    </div>
                                    <div className="h-3 w-full bg-[var(--gray-100)] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${item.color} transition-all duration-1000`}
                                            style={{ width: `${item.score}%` }}
                                        />
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-gray-500 py-4">Belum ada data kuis.</p>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column (Recent Activity & Quick Links) */}
                <div className="space-y-8">
                    {/* Recent Activity */}
                    <Card variant="white" className="p-6 border border-white/60 shadow-[var(--shadow-soft-md)] h-fit">
                        <h2 className="text-lg font-bold text-[var(--gray-800)] mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[var(--primary-500)]" />
                            Aktivitas Terbaru
                        </h2>
                        <div className="space-y-6">
                            {recentActivities.length > 0 ? recentActivities.map((activity: any, i: number) => (
                                <div key={i} className="flex items-start gap-3 relative pb-6 border-l-2 border-[var(--gray-100)] last:border-0 last:pb-0 pl-4 ml-2">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-[var(--primary-200)]" />
                                    <img src={activity.avatar} alt={activity.user} className="w-8 h-8 rounded-full border border-gray-200 bg-white" />
                                    <div>
                                        <p className="text-sm text-[var(--gray-800)]">
                                            <span className="font-bold">{activity.user}</span> {activity.action} <span className="text-[var(--primary-600)] font-medium">{activity.target}</span>
                                        </p>
                                        <p className="text-xs text-[var(--gray-400)] mt-1">{new Date(activity.time).toLocaleDateString('id-ID')}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-500">Belum ada aktivitas.</p>
                            )}
                        </div>
                    </Card>

                    {/* Quick Access */}
                    <Card variant="blue" className="p-6 border border-[var(--primary-200)] shadow-[var(--shadow-glow)]">
                        <h2 className="text-lg font-bold text-[var(--primary-800)] mb-4">Akses Cepat</h2>
                        <div className="space-y-3">
                            <Link href="/admin/videos/create">
                                <button className="w-full py-3 px-4 bg-white/50 hover:bg-white rounded-xl text-[var(--primary-700)] font-bold text-sm text-left transition-all border border-white/50 shadow-sm flex items-center justify-between group">
                                    + Upload Video Baru
                                    <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </button>
                            </Link>
                            <Link href="/admin/comics/create">
                                <button className="w-full py-3 px-4 bg-white/50 hover:bg-white rounded-xl text-[var(--primary-700)] font-bold text-sm text-left transition-all border border-white/50 shadow-sm flex items-center justify-between group">
                                    + Upload Komik Baru
                                    <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
