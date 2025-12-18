'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import {
    LayoutDashboard,
    Video,
    BookOpen,
    HelpCircle,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    ShieldCheck,
    Gamepad2,
    GraduationCap,
    School,
    Radio
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Materi Video', href: '/admin/videos', icon: Video },
    { name: 'Komik Edukasi', href: '/admin/comics', icon: BookOpen },
    { name: 'Kuis Latihan', href: '/admin/quizzes', icon: HelpCircle },
    { name: 'Live Quiz', href: '/admin/quiz-sessions', icon: Radio },
    { name: 'Games', href: '/admin/games', icon: Gamepad2 },
    { name: 'Manajemen Kelas', href: '/admin/classes', icon: School },
    { name: 'Manajemen Siswa', href: '/admin/students', icon: GraduationCap },
    { name: 'Manajemen User', href: '/admin/users', icon: Users },
    { name: 'Pengaturan', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const { logout, user } = useAuthStore();

    const handleLogout = () => {
        logout();
        router.push('/auth/login');
    };

    // Define permissions based on role
    const getFilteredMenuItems = () => {
        const role = user?.role;

        if (!role) return []; // No role, no menu (or just dashboard?)

        if (role === 'SUPER_ADMIN') return menuItems;

        const allowedPaths: Record<string, string[]> = {
            'CONTENT_MANAGER': ['/admin/dashboard', '/admin/videos', '/admin/comics', '/admin/quizzes', '/admin/quiz-sessions', '/admin/games'],
            'TEACHER': ['/admin/dashboard', '/admin/classes', '/admin/students', '/admin/users', '/admin/videos', '/admin/comics', '/admin/quizzes', '/admin/quiz-sessions', '/admin/games'],
        };

        const allowed = allowedPaths[role as string] || [];
        return menuItems.filter(item => allowed.includes(item.href));
    };

    const filteredMenuItems = getFilteredMenuItems();

    return (
        <>
            {/* Mobile Menu Button - Floating Glass */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 shadow-lg text-[var(--primary-700)] active:scale-95 transition-transform"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                    // Glassmorphism Style
                    "bg-white/80 backdrop-blur-xl border-r border-white/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
                )}
            >
                <div className="flex flex-col h-full bg-gradient-to-b from-[#F0F9FF]/50 to-transparent">

                    {/* Brand Logo Area */}
                    <div className="h-24 flex items-center gap-3 px-8 border-b border-[var(--primary-100)]/50">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center text-white shadow-lg shadow-[var(--primary-200)]">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="font-fredoka font-bold text-xl text-[var(--primary-700)] leading-none">
                                UMS Dental
                            </h1>
                            <span className="text-xs font-medium text-[var(--primary-400)] tracking-wide">
                                ADMIN PORTAL
                            </span>
                        </div>
                    </div>



                    {/* Navigation Links */}
                    <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
                        <p className="px-4 text-xs font-bold text-[var(--gray-400)] uppercase tracking-wider mb-4">
                            Main Menu
                        </p>
                        {filteredMenuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname.startsWith(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group font-medium",
                                        isActive
                                            ? "bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white shadow-[0_8px_20px_-6px_rgba(14,165,233,0.4)] translate-x-2"
                                            : "text-[var(--gray-500)] hover:bg-[var(--primary-50)] hover:text-[var(--primary-600)]"
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-[var(--gray-400)] group-hover:text-[var(--primary-500)]")} />
                                    <span>{item.name}</span>

                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer / User Area */}
                    <div className="p-4 m-4 rounded-3xl bg-[var(--primary-50)] border border-[var(--primary-100)]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-400)] to-[var(--accent-500)] border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-lg">
                                {user?.username?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-[var(--gray-800)] truncate">{user?.username || 'Admin User'}</p>
                                <p className="text-xs text-[var(--gray-500)] truncate">{user?.email || 'admin@ums.ac.id'}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-[var(--error-600)] bg-white rounded-xl border border-[var(--error-200)] hover:bg-[var(--error-50)] transition-colors shadow-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
