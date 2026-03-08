import { createClient } from '@supabase/supabase-js';

const getEnv = (key) => import.meta.env[key] || '';

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');
const supabaseServiceRoleKey = getEnv('VITE_SUPABASE_SERVICE_ROLE_KEY');

// Ensure the URL is valid before calling createClient to avoid crash
const fallbackUrl = 'https://placeholder-project.supabase.co';
const actualUrl = supabaseUrl && supabaseUrl.startsWith('http') ? supabaseUrl : fallbackUrl;

export const supabase = createClient(actualUrl, supabaseAnonKey || 'placeholder');

// Admin client required for operations like creating users without logging out
export const supabaseAdmin = createClient(actualUrl, supabaseServiceRoleKey || 'placeholder', {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
