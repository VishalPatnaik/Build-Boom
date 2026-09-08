const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 400, height: 800 });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
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
        console.log('Clicked Shop');
        break;
      }
    }
    
    await page.evaluate(() => {
       const btns = Array.from(document.querySelectorAll('button'));
       const worldBtn = btns.find(b => b.textContent.toLowerCase().includes('world'));
       if(worldBtn) worldBtn.click();
    });
    console.log('Clicked category world');
    
    await new Promise(r => setTimeout(r, 2000));
    
    const isBlank = await page.evaluate(() => {
       return document.body.innerText.trim() === '';
    });
    console.log('Is body blank?', isBlank);
    
    if (isBlank) {
       console.log('React crashed!');
    }
    
  } catch(e) {
    console.log('Click error:', e);
  }

  await browser.close();
})();
