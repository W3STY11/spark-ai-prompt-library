#!/usr/bin/env node
import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Capture all console messages
  page.on('console', msg => {
    console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, msg.text());
  });

  // Capture errors
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR]:`, error.message);
  });

  // Capture request failures
  page.on('requestfailed', request => {
    console.log(`[REQUEST FAILED]:`, request.url(), request.failure().errorText);
  });

  try {
    console.log('Navigating to deployed site...\n');
    await page.goto('https://gray-ocean-059c8510f.3.azurestaticapps.net', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log('\n✅ Page loaded successfully');

    // Wait a bit for React to render
    await page.waitForTimeout(3000);

    // Check if root div has content
    const rootContent = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        hasChildren: root && root.children.length > 0,
        innerHTML: root ? root.innerHTML.substring(0, 500) : 'No root element found'
      };
    });

    console.log('\n📦 Root element status:', rootContent);

    // Take a screenshot
    await page.screenshot({ path: '/tmp/deployed-site-screenshot.png', fullPage: true });
    console.log('\n📸 Screenshot saved to /tmp/deployed-site-screenshot.png');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
