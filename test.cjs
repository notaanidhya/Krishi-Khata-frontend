const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 10000 });
    console.log("Page loaded successfully");
    const html = await page.content();
    if (html.includes('Mera Hisab')) {
      console.log('Khata Page Rendered!');
    } else {
      console.log('App did not render Khata Page');
    }
  } catch (error) {
    console.error('PUPPETEER ERROR:', error);
  } finally {
    await browser.close();
  }
})();
