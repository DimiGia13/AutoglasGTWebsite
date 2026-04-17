import puppeteer from 'puppeteer';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const screenshotDir = join(__dirname, 'temporary screenshots');
if (!existsSync(screenshotDir)) {
  mkdirSync(screenshotDir, { recursive: true });
}

const existing = readdirSync(screenshotDir);
let maxN = 0;
for (const f of existing) {
  const m = f.match(/^screenshot-(\d+)/);
  if (m) maxN = Math.max(maxN, parseInt(m[1]));
}
const n = maxN + 1;
const filename = label ? `screenshot-${n}-${label}.png` : `screenshot-${n}.png`;
const filepath = join(screenshotDir, filename);

// Try to find Chrome in common locations
const chromePaths = [
  'C:/Users/nateh/.cache/puppeteer/chrome/win64-131.0.6778.204/chrome-win64/chrome.exe',
  'C:/Users/Administrator/.cache/puppeteer/chrome/win64-131.0.6778.204/chrome-win64/chrome.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];

let executablePath;
for (const p of chromePaths) {
  if (existsSync(p)) {
    executablePath = p;
    break;
  }
}

const launchOptions = {
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
};
if (executablePath) launchOptions.executablePath = executablePath;

const browser = await puppeteer.launch(launchOptions);
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle2' });
await page.screenshot({ path: filepath, fullPage: true });
await browser.close();

console.log(`Screenshot saved: ${filepath}`);
