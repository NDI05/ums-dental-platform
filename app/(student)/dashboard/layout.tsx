import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard',
    description: 'Dashboard Siswa UMS Dental Platform',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
