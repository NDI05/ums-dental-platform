import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Dashboard',
    description: 'Ringkasan Statistik UMS Dental Platform',
};

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
