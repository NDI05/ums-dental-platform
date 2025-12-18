'use client';

import { Settings, User, Lock, Save, ShieldCheck, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/lib/store/auth';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

// Metadata removed

export default function SettingsPage() {
    const { user } = useAuthStore();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        role: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                username: user.username || '',
                email: user.email || '',
                role: user.role || ''
            });
        }
    }, [user]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async () => {
        if (!user?.id) return;
        setIsSaving(true);
        setMessage(null);

        try {
            const res = await apiFetch(`/api/users/${user.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    username: profileData.username,
                    // Email usually not editable or requires special flow, but we'll try sending it if allowed
                })
            });

            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Profil berhasil diperbarui' });
                // Update local store if needed (optional, effectively handled by verify on reload usually)
            } else {
                throw new Error(data.message || 'Gagal update profil');
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok' });
            return;
        }

        setIsSaving(true);
        setMessage(null);

        try {
            const res = await apiFetch('/api/auth/change-password', {
                method: 'POST',
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Password berhasil diubah' });
                setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
            } else {
                throw new Error(data.message || 'Gagal mengubah password');
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[var(--gray-800)] flex items-center gap-3">
                    <Settings className="w-8 h-8 text-[var(--primary-600)]" />
                    Pengaturan
                </h1>
                <p className="text-[var(--gray-500)] mt-1">Kelola profil akun dan keamanan.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Navigation / Simple Layout */}
                <div className="lg:col-span-1 space-y-6">
                    <Card variant="white" className="p-6 border border-white/60 shadow-[var(--shadow-soft-md)]">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary-400)] to-[var(--primary-600)] flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
                                <ShieldCheck className="w-12 h-12" />
                            </div>
                            <h2 className="text-xl font-bold text-[var(--gray-800)]">{user.username}</h2>
                            <p className="text-sm text-[var(--gray-500)]">{user.email}</p>
                            <div className="mt-4 px-3 py-1 rounded-full bg-[var(--primary-50)] text-[var(--primary-700)] text-xs font-bold border border-[var(--primary-100)]">
                                Role: {user.role}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Forms */}
                <div className="lg:col-span-2 space-y-8">

                    {/* General Profile Section */}
                    <Card variant="white" className="p-6 border border-white/60 shadow-sm">
                        <h3 className="text-lg font-bold text-[var(--gray-800)] mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-[var(--primary-500)]" />
                            Informasi Profil
                        </h3>
                        <div className="space-y-4">
                            <Input
                                label="Username"
                                name="username"
                                value={profileData.username}
                                onChange={handleProfileChange}
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={profileData.email}
                                disabled
                                helperText="Email tidak dapat diubah"
                            />

                            <div className="flex justify-end pt-4">
                                <Button variant="primary" size="sm" onClick={handleUpdateProfile} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Security Section */}
                    <Card variant="white" className="p-6 border border-white/60 shadow-sm">
                        <h3 className="text-lg font-bold text-[var(--gray-800)] mb-6 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-[var(--error-500)]" />
                            Keamanan Akun
                        </h3>
                        <div className="space-y-4">
                            <Input
                                label="Password Saat Ini"
                                type="password"
                                placeholder="••••••••"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Password Baru"
                                    type="password"
                                    placeholder="••••••••"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                />
                                <Input
                                    label="Konfirmasi Password Baru"
                                    type="password"
                                    placeholder="••••••••"
                                    name="confirmNewPassword"
                                    value={passwordData.confirmNewPassword}
                                    onChange={handlePasswordChange}
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    variant="secondary"
                                    className="border-[var(--error-200)] text-[var(--error-600)] hover:bg-[var(--error-50)]"
                                    onClick={handleUpdatePassword}
                                    disabled={isSaving}
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Update Password
                                </Button>
                            </div>
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
}
