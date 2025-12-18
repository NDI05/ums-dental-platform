import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Video Edukasi',
    description: 'Tonton video seru tentang kesehatan gigi',
};

export default function VideoLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
