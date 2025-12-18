import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Profil Saya',
    description: 'Lihat progres dan koleksi lencanamu',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
