import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Manajemen Kelas',
    description: 'Kelola data kelas dan siswa',
};

export default function ClassesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
