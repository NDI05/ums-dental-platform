import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Manajemen Video',
    description: 'Kelola konten video edukasi',
};

export default function AdminVideosLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
