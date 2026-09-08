const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 400, height: 800 });

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
    await page.screenshot({ path: 'shop_world3.png' });
    console.log('World screenshot saved');
  } catch(e) {
    console.log('Click error:', e);
  }

  await browser.close();
  
  if (fs.existsSync('shop_world3.png')) {
     console.log("Size:", fs.statSync('shop_world3.png').size);
  }
})();
