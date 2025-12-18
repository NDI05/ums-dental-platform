import AuthGuard from '@/components/auth/AuthGuard';

// MobileContainer removed to allow full-width pages (like dashboard)
export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard allowedRoles={['STUDENT']}>
            {children}
        </AuthGuard>
    );
}
