import { createClient } from '@supabase/supabase-js';

// Singleton Supabase Client for Realtime Subscriptions
// We use the ANON key here because this is for client-side subscriptions.
// Security is handled by Postgres Row Level Security (RLS).
// Make sure "QuizAttempt" has RLS policies allowing SELECT for the user (or public if leaderboard is public).

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
        console.error('Supabase URL or Anon Key missing! Realtime will not work.');
    }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false, // We rely on our own auth store / httpOnly cookies usually, 
        // but for Realtime we just need the connection.
        // If RLS requires auth, we might need to set the token.
    },
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
});
