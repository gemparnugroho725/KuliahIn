import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xxxxxxxxxxxxxxxxxxxx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key';

if (!import.meta.env.VITE_SUPABASE_URL) {
    console.error('❌ Supabase env vars missing. Cek VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
