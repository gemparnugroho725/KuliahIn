const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', error => console.error('BROWSER ERROR:', error));

    try {
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    } catch (e) {
        console.error('FAILED TO LOAD:', e);
    }

    await browser.close();
})();
