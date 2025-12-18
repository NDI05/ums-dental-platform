import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Daftar',
    description: 'Daftar akun baru di UMS Dental Platform',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
