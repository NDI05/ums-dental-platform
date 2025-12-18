import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Manajemen Pengguna',
    description: 'Kelola data pengguna, guru, dan admin',
};

export default function UsersLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
