import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.log('MISSING ENV VARS');
    process.exit(1);
}

const supabase = createClient(url, key);

async function test() {
    console.log('Testing connection to Supabase...');
    console.log('URL:', url);
    try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT_ERROR')), 5000));
        const req = supabase.from('profiles').select('*').limit(1);
        
        const res = await Promise.race([req, timeout]);
        console.log('REPLY:', res);
        process.exit(0);
    } catch (e) {
        console.log('ERROR:', e.message);
        process.exit(1);
    }
}

test();
