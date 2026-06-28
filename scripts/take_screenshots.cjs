const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const artifactsDir = 'C:\\Users\\arvin\\.gemini\\antigravity\\brain\\0fdd5a12-1d5f-4e66-99a5-ec1920d1ea2c\\artifacts';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to login...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });

  // Login
  await page.type('input[type="email"]', 'shivam@gmail.com');
  await page.type('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  console.log('Waiting for dashboard to load...');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  
  // Quick wait for animations
  await new Promise(r => setTimeout(r, 2000));

  console.log('Taking Overview screenshot...');
  await page.screenshot({ path: path.join(artifactsDir, '01_author_overview.png'), fullPage: true });

  // My Books tab
  console.log('Taking Books screenshot...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const booksTab = tabs.find(t => t.textContent.includes('My Books'));
    if (booksTab) booksTab.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(artifactsDir, '02_author_books.png'), fullPage: true });

  // Order Management tab
  console.log('Taking Orders screenshot...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const ordersTab = tabs.find(t => t.textContent.includes('Order Management'));
    if (ordersTab) ordersTab.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(artifactsDir, '03_author_orders.png'), fullPage: true });

  // My Profile tab
  console.log('Taking Profile screenshot...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const profileTab = tabs.find(t => t.textContent.includes('My Profile'));
    if (profileTab) profileTab.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(artifactsDir, '04_author_profile.png'), fullPage: true });

  // Events & Forms tab
  console.log('Taking Events screenshot...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const eventsTab = tabs.find(t => t.textContent.includes('Events'));
    if (eventsTab) eventsTab.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(artifactsDir, '05_author_events.png'), fullPage: true });

  // Gallery tab
  console.log('Taking Gallery screenshot...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const galleryTab = tabs.find(t => t.textContent.includes('Gallery'));
    if (galleryTab) galleryTab.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(artifactsDir, '06_author_gallery.png'), fullPage: true });

  await browser.close();
  console.log('Screenshots complete.');
})();
