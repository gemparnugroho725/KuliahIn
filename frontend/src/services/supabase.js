import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

// Supabase-js throws if URL is not a valid URL starting with http
const isValidUrl = (url) => {
    try {
        return url && url.startsWith('http');
    } catch (e) {
        return false;
    }
};

if (!isValidUrl(supabaseUrl)) {
    console.error('❌ Supabase URL is missing or invalid. Please set VITE_SUPABASE_URL in Netlify environment variables.');
}

export const supabase = createClient(
    isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co',
    supabaseAnonKey
);
