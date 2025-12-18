import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Manajemen Komik',
    description: 'Kelola komik literasi kesehatan gigi',
};

export default function ComicsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
