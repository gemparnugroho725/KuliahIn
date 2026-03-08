
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', error => console.error('BROWSER ERROR:', error));

    try {
        await page.goto('http://localhost:3000');
        await page.waitForTimeout(2000);
    } catch (e) {
        console.error('FAILED TO LOAD:', e);
    }

    await browser.close();
})();
