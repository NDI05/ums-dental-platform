import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Kuis & Permainan',
    description: 'Mainkan kuis seru dan raih poin',
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
