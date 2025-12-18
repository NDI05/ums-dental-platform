import { AdminSidebar } from '@/components/admin/sidebar';
import AuthGuard from '@/components/auth/AuthGuard';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard allowedRoles={['SUPER_ADMIN', 'TEACHER', 'CONTENT_MANAGER']}>
            <div className="h-[100dvh] w-full bg-[var(--gray-50)] text-[var(--gray-900)] flex font-fredoka overflow-hidden">
                {/* Sidebar */}
                <AdminSidebar />

                {/* Main Content Area */}
                <main className="flex-1 relative overflow-y-auto overflow-x-hidden h-full w-full custom-scrollbar">
                    {/* Background Decoration (Subtle blob) */}
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[var(--primary-100)] rounded-full blur-[120px] opacity-40 pointer-events-none" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[var(--secondary-100)] rounded-full blur-[100px] opacity-40 pointer-events-none" />

                    <div className="relative z-10 pt-20 px-4 pb-6 md:p-10 max-w-7xl mx-auto font-fredoka">
                        {children}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
