#!/usr/bin/env node
/**
 * Capture screenshots of the 3D exercise viewer at different animation phases
 */

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots');
const URL = process.argv[2] || 'https://tribe.pilareta.com/learn/exercises/bridging';

async function captureScreenshots() {
  console.log('Launching browser...');

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('CORS')) {
      console.log('PAGE ERROR:', msg.text());
    }
  });

  console.log(`Navigating to ${URL}...`);

  try {
    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });
  } catch (e) {
    console.log('Navigation completed (may have timed out on auth)');
  }

  // Wait for page and canvas
  console.log('Waiting for 3D scene...');
  await new Promise(r => setTimeout(r, 4000));

  try {
    await page.waitForSelector('canvas', { timeout: 10000 });
    console.log('Canvas found!');
  } catch (e) {
    console.log('Canvas timeout, continuing...');
  }

  // Wait for initial render
  await new Promise(r => setTimeout(r, 3000));

  const timestamp = Date.now();

  // Capture at start of cycle (lying flat)
  const startPath = path.join(SCREENSHOT_DIR, `bridge-start-${timestamp}.png`);
  await page.screenshot({ path: startPath, fullPage: false });
  console.log(`Start position saved: ${startPath}`);

  // Wait 2 seconds (should be during lift phase - cycle is 5 seconds)
  await new Promise(r => setTimeout(r, 2000));
  const midPath = path.join(SCREENSHOT_DIR, `bridge-mid-${timestamp}.png`);
  await page.screenshot({ path: midPath, fullPage: false });
  console.log(`Mid position saved: ${midPath}`);

  // Wait another 2 seconds (should be at or near peak)
  await new Promise(r => setTimeout(r, 2000));
  const peakPath = path.join(SCREENSHOT_DIR, `bridge-peak-${timestamp}.png`);
  await page.screenshot({ path: peakPath, fullPage: false });
  console.log(`Peak position saved: ${peakPath}`);

  // Wait for return to start
  await new Promise(r => setTimeout(r, 2000));
  const endPath = path.join(SCREENSHOT_DIR, `bridge-end-${timestamp}.png`);
  await page.screenshot({ path: endPath, fullPage: false });
  console.log(`End position saved: ${endPath}`);

  await browser.close();
  console.log('Done!');

  return { startPath, midPath, peakPath, endPath };
}

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

captureScreenshots().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
