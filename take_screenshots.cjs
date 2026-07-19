const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\agraw\\.gemini\\antigravity-ide\\brain\\ecea4f4f-9220-4de1-9c00-1f995fcf0dc6';
const BASE_URL = 'http://localhost:5173';

const pagesToCapture = [
  { path: '/', name: 'landing.png' },
  { path: '/catalogue', name: 'catalogue.png' },
  { path: '/events', name: 'events.png' },
  { path: '/gallery', name: 'gallery.png' },
  { path: '/login', name: 'login.png' }
];

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1024 });

  for (const p of pagesToCapture) {
    try {
      console.log(`Navigating to ${BASE_URL}${p.path}...`);
      await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle2', timeout: 15000 });
      // Wait for 2 seconds to allow animations or lazy loaded images to appear
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const savePath = path.join(ARTIFACT_DIR, p.name);
      await page.screenshot({ path: savePath, fullPage: true });
      console.log(`Saved screenshot: ${savePath}`);
    } catch (e) {
      console.error(`Failed to capture ${p.path}: ${e.message}`);
    }
  }

  await browser.close();
  console.log('All screenshots captured.');
})();
