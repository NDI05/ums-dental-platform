'use client';

import { TriangleAlert, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    isLoading?: boolean;
}

export default function DeleteModal({ isOpen, onClose, onConfirm, title, description, isLoading }: DeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-white/60">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-2">
                        <TriangleAlert className="w-8 h-8 text-red-500" />
                    </div>

                    <h3 className="text-xl font-bold text-[var(--gray-800)]">
                        {title}
                    </h3>

                    <p className="text-[var(--gray-500)] text-sm leading-relaxed">
                        {description}
                    </p>

                    <div className="flex gap-3 w-full mt-6">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="danger"
                            className="flex-1"
                            onClick={onConfirm}
                            isLoading={isLoading}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
