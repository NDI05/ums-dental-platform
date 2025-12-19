import { Suspense } from 'react';
import { LiveSessionContent } from './live-content';

export default function LiveSessionPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            </div>
        }>
            <LiveSessionContent />
        </Suspense>
    );
}
