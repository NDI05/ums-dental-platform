import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pengaturan Akun',
    description: 'Kelola profil dan keamanan akun',
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
