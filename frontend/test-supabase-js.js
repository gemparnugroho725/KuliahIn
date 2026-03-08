import { createClient } from '@supabase/supabase-js';

const url = 'https://twhzeibzgskajtkvgaso.supabase.co';
const key = 'sb_publishable_sezGDyOsK8AfqFIlHih54Q_VsrxFvsW';
const supabase = createClient(url, key);

async function test() {
    console.log('Testing createClient connection...');
    try {
        const req = supabase.from('profiles').select('role, status').limit(1);
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT_ERROR')), 10000));
        
        const res = await Promise.race([req, timeout]);
        console.log('REPLY:', res);
        process.exit(0);
    } catch (e) {
        console.log('ERROR:', e.message);
        process.exit(1);
    }
}
test();
