const puppeteer = require('puppeteer');

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
    
    const canvasData = await page.evaluate(() => {
       // Find a thumbnail canvas in the item list
       const canvases = Array.from(document.querySelectorAll('canvas'));
       if (canvases.length > 1) {
          // The first canvas is LivePreviewCanvas
          // The next canvases are ItemPreviewCanvas
          const thumb = canvases[1];
          return thumb.toDataURL();
       }
       return null;
    });
    
    if (canvasData) {
       console.log('Thumbnail data length:', canvasData.length);
       if (canvasData.length < 100) {
           console.log('Thumbnail is basically empty');
       }
    } else {
       console.log('No thumbnail canvas found');
    }
    
  } catch(e) {
    console.log('Click error:', e);
  }

  await browser.close();
})();
