import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Manajemen Kuis',
    description: 'Kelola kuis dan bank soal',
};

export default function QuizzesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
