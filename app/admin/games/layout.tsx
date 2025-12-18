import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Manajemen Games',
    description: 'Kelola game edukasi interaktif',
};

export default function GamesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
