const puppeteer = require('puppeteer');
const fs = require('fs');

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
    
    // Screenshot of shop main view
    await page.screenshot({ path: 'shop_main.png' });
    console.log('Main screenshot saved');
    
    // Click world tab
    const tabBtns = await page.$$('button');
    let worldBtnFound = false;
    for (let btn of tabBtns) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.toLowerCase().includes('world')) {
            await btn.click();
            await new Promise(r => setTimeout(r, 2000));
            console.log('Clicked category world');
            worldBtnFound = true;
            break;
        }
    }
    
    if (worldBtnFound) {
      await page.screenshot({ path: 'shop_world2.png' });
      console.log('World screenshot saved');
    }

  } catch(e) {
    console.log('Click error:', e);
  }

  await browser.close();
  
  // Base64 encode the screenshots and print
  if (fs.existsSync('shop_main.png')) {
     console.log("Main image created.");
  }
  if (fs.existsSync('shop_world2.png')) {
     console.log("World image created.");
  }
})();
