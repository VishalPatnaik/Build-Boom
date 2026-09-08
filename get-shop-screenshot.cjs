const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
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
    
    // Click world tab
    const tabBtns = await page.$$('button');
    for (let btn of tabBtns) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.toLowerCase().includes('world')) {
            await btn.click();
            await new Promise(r => setTimeout(r, 1000));
            console.log('Clicked category world');
            break;
        }
    }

    await page.screenshot({ path: 'shop_world.png' });
    console.log('Screenshot saved');
  } catch(e) {
    console.log('Click error:', e);
  }

  await browser.close();
})();
