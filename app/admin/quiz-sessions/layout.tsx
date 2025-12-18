import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sesi Live Quiz',
    description: 'Kelola sesi permainan kuis langsung',
};

export default function QuizSessionsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
