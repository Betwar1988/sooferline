import { createClient, SupabaseClient } from '@supabase/supabase-js';

// IMPORTANT: The app needs these environment variables in .env.local to function.
// NEXT_PUBLIC_SUPABASE_URL should be your project URL (https://xyz.supabase.co)
// NEXT_PUBLIC_SUPABASE_ANON_KEY should be your anon/public key

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
    if (!_supabase) {
        // Validation: Must have a URL and a Key. URL must start with http.
        if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith('http')) {
            console.warn('Supabase credentials missing or invalid. Using placeholder client for build/dev stability.');
            // Return a dummy client to prevent the app from crashing during build
            // but it will fail on real auth calls until configured.
            _supabase = createClient('https://placeholder-project.supabase.co', 'placeholder-key');
        } else {
            _supabase = createClient(supabaseUrl, supabaseAnonKey);
        }
    }
    return _supabase;
}

// Lazy singleton proxy
export const supabase = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        const client = getSupabase();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = (client as any)[prop];
        if (typeof value === 'function') {
            return value.bind(client);
        }
        return value;
    },
});
