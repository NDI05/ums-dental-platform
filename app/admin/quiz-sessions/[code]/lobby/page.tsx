import { Suspense } from 'react';
import { SessionLobbyContent } from './lobby-content';

export default function SessionLobbyPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        }>
            <SessionLobbyContent />
        </Suspense>
    );
}
