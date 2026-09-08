const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('requestfailed', request => {
    console.log('FAILED:', request.url(), request.failure().errorText);
  });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  try {
    const buttons = await page.$$('button');
    for (let btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Shop')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 2000));
        break;
      }
    }
    await page.evaluate(() => {
       const btns = Array.from(document.querySelectorAll('button'));
       const worldBtn = btns.find(b => b.textContent.toLowerCase().includes('world'));
       if(worldBtn) worldBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));
  } catch(e) {
    console.log('Click error:', e);
  }
  await browser.close();
})();
