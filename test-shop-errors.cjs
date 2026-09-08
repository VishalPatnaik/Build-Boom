const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
  });
  
  page.on('error', err => {
    console.log('ERROR:', err.toString());
  });
  
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
    
    const tabs = ['world', 'block', 'boom', 'plate'];
    for (const tabName of tabs) {
      console.log('Clicking tab:', tabName);
      await page.evaluate((name) => {
         const btns = Array.from(document.querySelectorAll('button'));
         const btn = btns.find(b => b.textContent.toLowerCase().includes(name));
         if(btn) btn.click();
      }, tabName);
      
      await new Promise(r => setTimeout(r, 1000));
    }

  } catch(e) {
    console.log('Click error:', e);
  }

  await browser.close();
})();
