import { useState, useRef } from 'react';
import { Upload, FileDown, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store/auth';

interface ImportQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ImportQuizModal({ isOpen, onClose, onSuccess }: ImportQuizModalProps) {
    const { accessToken } = useAuthStore();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setUploadStatus('idle');
            setMessage('');
        }
    };

    const handleDownloadTemplate = () => {
        window.location.href = '/api/quizzes/template';
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setUploadStatus('idle');
        setMessage('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/quizzes/import', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                setUploadStatus('success');
                setMessage(data.message || 'Import berhasil!');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                    setFile(null);
                    setUploadStatus('idle');
                }, 2000);
            } else {
                setUploadStatus('error');
                setMessage(data.message || 'Gagal mengimport file.');
            }
        } catch (error) {
            setUploadStatus('error');
            setMessage('Terjadi kesalahan jaringan.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 relative">
                <button
                    onClick={onClose}
                    disabled={isUploading}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="mb-6 text-center">
                    <div className="w-16 h-16 bg-[var(--primary-50)] text-[var(--primary-600)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--gray-800)]">Import Soal Kuis</h2>
                    <p className="text-[var(--gray-500)] mt-2">Upload file Excel berisi daftar pertanyaan kuis.</p>
                </div>

                <div className="space-y-4">
                    {/* Template Download */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                <FileDown className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-blue-900 text-sm">Download Template</p>
                                <p className="text-xs text-blue-700">Gunakan format ini agar import berhasil.</p>
                            </div>
                        </div>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleDownloadTemplate}
                            className="text-xs"
                        >
                            Download
                        </Button>
                    </div>

                    {/* File Upload Area */}
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${file ? 'border-[var(--primary-500)] bg-[var(--primary-50)]' : 'border-gray-300 hover:border-[var(--primary-400)]'
                            }`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                setFile(e.dataTransfer.files[0]);
                            }
                        }}
                    >
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />

                        {file ? (
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                                    <Check className="w-6 h-6" />
                                </div>
                                <p className="font-bold text-[var(--gray-800)]">{file.name}</p>
                                <p className="text-xs text-[var(--gray-500)]">{(file.size / 1024).toFixed(2)} KB</p>
                                <button
                                    onClick={() => setFile(null)}
                                    className="text-red-500 text-xs font-bold mt-2 hover:underline"
                                >
                                    Ganti File
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="w-10 h-10 text-[var(--gray-400)] mb-2" />
                                <p className="text-[var(--gray-600)] font-medium">Klik untuk upload atau drag & drop</p>
                                <p className="text-xs text-[var(--gray-400)] mt-1">Format: .xlsx (Excel)</p>
                            </div>
                        )}
                    </div>

                    {/* Status Messages */}
                    {uploadStatus === 'error' && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span>{message}</span>
                        </div>
                    )}
                    {uploadStatus === 'success' && (
                        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            <span>{message}</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-8">
                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={onClose}
                        disabled={isUploading}
                    >
                        Batal
                    </Button>
                    <Button
                        variant="primary"
                        fullWidth
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Mengupload...
                            </>
                        ) : 'Import Sekarang'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

import { CheckCircle } from 'lucide-react';
