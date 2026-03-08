// test-fetch.js
const url = 'https://twhzeibzgskajtkvgaso.supabase.co/rest/v1/profiles?select=role,status';
const key = 'sb_publishable_sezGDyOsK8AfqFIlHih54Q_VsrxFvsW';

async function test() {
    console.log('Testing direct REST API connection...');
    try {
        const res = await fetch(url, {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });
        console.log('STATUS:', res.status);
        const text = await res.text();
        console.log('RESPONSE:', text);
    } catch (e) {
        console.log('ERROR:', e);
    }
}
test();
