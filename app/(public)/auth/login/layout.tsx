import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Masuk',
    description: 'Masuk ke akun UMS Dental Platform',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
