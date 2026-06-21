const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const screenshotDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir);
}

const delay = (ms) => new Promise(res => setTimeout(res, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: {
      width: 390,
      height: 844,
      isMobile: true,
      hasTouch: true
    }
  });

  const page = await browser.newPage();
  
  console.log("Navigating to app...");
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // Clear local storage and cookies
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  const client = await page.createCDPSession();
  await client.send('Network.clearBrowserCookies');
  
  await page.reload({ waitUntil: 'networkidle0' });
  await delay(1000);

  let step = 1;

  // 1. Welcome Screen
  console.log("Capturing Welcome Screen...");
  await page.screenshot({ path: path.join(screenshotDir, `0${step++}_welcome.png`) });

  // Try to register to pass welcome screen
  console.log("Registering a new user...");
  try {
    await page.type('input[placeholder*="Name"], input[type="text"]', 'Test User');
    await delay(500);
    const pinInputs = await page.$$('input[type="password"], input[type="text"]');
    // Fill pin if there is any array of inputs
    if (pinInputs.length > 1) {
      for (const input of pinInputs) {
         if (await input.evaluate(el => el.placeholder !== 'Name' && !el.placeholder.includes('Name'))) {
           await input.type('1234');
         }
      }
    }
    await page.keyboard.press('Enter');
    await delay(1000);
    // Click any register/submit button
    const buttons = await page.$$('button');
    for (const btn of buttons) {
       const text = await btn.evaluate(el => el.innerText);
       if (text && (text.toLowerCase().includes('start') || text.toLowerCase().includes('shuru') || text.toLowerCase().includes('register') || text.toLowerCase().includes('continue'))) {
         await btn.click();
         break;
       }
    }
  } catch (e) {
    console.log("Could not auto-register:", e.message);
  }

  await delay(2000);

  // 2. Dashboard / Khata
  console.log("Capturing Dashboard...");
  await page.screenshot({ path: path.join(screenshotDir, `0${step++}_khata_dashboard.png`) });

  // Navigate through bottom nav routes
  const routes = [
    { name: 'crops', path: '/crops' },
    { name: 'mandi', path: '/mandi' },
    { name: 'community', path: '/community' },
    { name: 'weather', path: '/weather' }
  ];

  for (const route of routes) {
    console.log(`Navigating to ${route.name}...`);
    // Some apps use SPA routing, so we can try to click the nav link or just goto URL
    await page.goto(`http://localhost:5173${route.path}`, { waitUntil: 'networkidle0' });
    await delay(1500);
    await page.screenshot({ path: path.join(screenshotDir, `0${step++}_${route.name}.png`) });
  }

  console.log("Done capturing screenshots.");
  await browser.close();
})();
