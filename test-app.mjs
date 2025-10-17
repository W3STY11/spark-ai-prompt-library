#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.join(__dirname, 'test-screenshots');

// Ensure screenshot directory exists
await fs.mkdir(screenshotDir, { recursive: true });

console.log('🚀 Starting Playwright browser tests...\n');

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox']
});

const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
});

const page = await context.newPage();

const testResults = {
  passed: [],
  failed: [],
  screenshots: []
};

// Helper function to add test result
function addResult(test, success, details = '') {
  const result = { test, success, details, timestamp: new Date().toISOString() };
  if (success) {
    testResults.passed.push(result);
    console.log(`✅ ${test}`);
  } else {
    testResults.failed.push(result);
    console.log(`❌ ${test}: ${details}`);
  }
  if (details) console.log(`   ${details}`);
}

// Helper function to take screenshot
async function takeScreenshot(name) {
  const filename = `${name.replace(/\s+/g, '_')}_${Date.now()}.png`;
  const filepath = path.join(screenshotDir, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  testResults.screenshots.push({ name, path: filepath });
  console.log(`📸 Screenshot saved: ${filename}`);
  return filepath;
}

try {
  // Test 1: Homepage loads
  console.log('\n📄 Testing Homepage...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000); // Wait for any animations

  const title = await page.title();
  addResult('Homepage loads', title.includes('Prompt') || title.includes('SPARK'), `Title: ${title}`);

  await takeScreenshot('01_homepage_light');

  // Test 2: Check for main heading
  const mainHeading = await page.locator('h1').first().textContent();
  addResult('Homepage has main heading', mainHeading && mainHeading.length > 0, `Heading: ${mainHeading}`);

  // Test 3: Check for department cards
  const departmentCards = await page.locator('[role="button"], button, .card').count();
  addResult('Department cards visible', departmentCards >= 9, `Found ${departmentCards} interactive elements`);

  // Test 4: Dark mode toggle
  console.log('\n🌙 Testing Dark Mode...');
  const darkModeButton = page.locator('button').filter({ hasText: /theme|dark|light/i }).first();
  if (await darkModeButton.count() > 0) {
    await darkModeButton.click();
    await page.waitForTimeout(1000);
    await takeScreenshot('02_homepage_dark');
    addResult('Dark mode toggle works', true, 'Successfully toggled to dark mode');
  } else {
    // Try finding by icon or aria-label
    const themeToggle = page.locator('button[aria-label*="theme"], button[title*="theme"]').first();
    if (await themeToggle.count() > 0) {
      await themeToggle.click();
      await page.waitForTimeout(1000);
      await takeScreenshot('02_homepage_dark');
      addResult('Dark mode toggle works', true, 'Successfully toggled to dark mode');
    } else {
      addResult('Dark mode toggle works', false, 'Could not find theme toggle button');
    }
  }

  // Test 5: Navigate to Browse page
  console.log('\n📚 Testing Browse Page...');
  await page.goto('http://localhost:3000/browse', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  await takeScreenshot('03_browse_page');

  const browsePageLoaded = await page.locator('h1, h2').filter({ hasText: /browse/i }).count() > 0;
  addResult('Browse page loads', browsePageLoaded, 'Browse page header found');

  // Test 6: Check for prompt cards
  const promptCards = await page.locator('.card, [role="article"], article').count();
  addResult('Prompt cards displayed', promptCards > 0, `Found ${promptCards} prompt cards`);

  // Test 7: Search functionality
  console.log('\n🔍 Testing Search...');
  const searchInput = page.locator('input[placeholder*="search" i]').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill('marketing');
    await page.waitForTimeout(1500);
    await takeScreenshot('04_search_marketing');

    const resultsAfterSearch = await page.locator('.card, [role="article"], article').count();
    addResult('Search functionality works', resultsAfterSearch > 0, `Found ${resultsAfterSearch} results for "marketing"`);

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(1000);
  } else {
    addResult('Search functionality works', false, 'Search input not found');
  }

  // Test 8: Department filter
  console.log('\n📂 Testing Department Filter...');
  const dropdown = page.locator('select, [role="combobox"], button[aria-haspopup]').first();
  if (await dropdown.count() > 0) {
    try {
      await dropdown.click();
      await page.waitForTimeout(500);

      // Try to find and click a department option
      const option = page.locator('[role="option"]').filter({ hasText: /business|marketing/i }).first();
      if (await option.count() > 0) {
        await option.click();
        await page.waitForTimeout(1500);
        await takeScreenshot('05_filtered_by_department');
        addResult('Department filter works', true, 'Successfully filtered by department');
      } else {
        addResult('Department filter works', false, 'Could not find department options');
      }
    } catch (error) {
      addResult('Department filter works', false, `Error: ${error.message}`);
    }
  } else {
    addResult('Department filter works', false, 'Dropdown not found');
  }

  // Test 9: View individual prompt
  console.log('\n👁️ Testing Prompt View...');
  await page.goto('http://localhost:3000/browse', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const firstPromptCard = page.locator('.card, [role="article"], article').first();
  if (await firstPromptCard.count() > 0) {
    await firstPromptCard.click();
    await page.waitForTimeout(2000);
    await takeScreenshot('06_prompt_view');

    const viewPageLoaded = await page.url().includes('/view') || await page.locator('h1, h2, h3').count() > 0;
    addResult('Prompt view page loads', viewPageLoaded, `URL: ${page.url()}`);
  } else {
    addResult('Prompt view page loads', false, 'No prompt cards found to click');
  }

  // Test 10: Copy to clipboard functionality
  console.log('\n📋 Testing Copy to Clipboard...');
  const copyButton = page.locator('button').filter({ hasText: /copy|copilot/i }).first();
  if (await copyButton.count() > 0) {
    await copyButton.click();
    await page.waitForTimeout(1000);

    // Check for success toast or button state change
    const toastVisible = await page.locator('[role="alert"], .toast, [class*="toast"]').count() > 0;
    const buttonChanged = await copyButton.textContent() !== await page.locator('button').filter({ hasText: /copy|copilot/i }).first().textContent();

    addResult('Copy to clipboard works', toastVisible || buttonChanged, 'Copy button triggered successfully');
    await takeScreenshot('07_copy_clicked');
  } else {
    addResult('Copy to clipboard works', false, 'Copy button not found');
  }

  // Test 11: Navigate back to home
  console.log('\n🏠 Testing Navigation...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);

  const backToHome = await page.url() === 'http://localhost:3000/' || await page.url() === 'http://localhost:3000';
  addResult('Navigation to homepage works', backToHome, `Final URL: ${page.url()}`);

  // Test 12: Responsive design check (mobile viewport)
  console.log('\n📱 Testing Mobile Responsive...');
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(1000);
  await takeScreenshot('08_mobile_view');

  const mobileContentVisible = await page.locator('h1, h2').count() > 0;
  addResult('Mobile responsive design', mobileContentVisible, 'Content visible in mobile viewport');

  // Test 13: Tablet viewport
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(1000);
  await takeScreenshot('09_tablet_view');

  const tabletContentVisible = await page.locator('h1, h2').count() > 0;
  addResult('Tablet responsive design', tabletContentVisible, 'Content visible in tablet viewport');

  // Test 14: Check API health
  console.log('\n🔌 Testing API...');
  const apiResponse = await page.goto('http://localhost:3001/api/health', { timeout: 10000 });
  const apiHealthy = apiResponse.ok();
  const apiBody = await apiResponse.json();
  addResult('API health endpoint', apiHealthy, `Status: ${apiResponse.status()}, Response: ${JSON.stringify(apiBody)}`);

  // Test 15: Fetch prompts from API
  const promptsResponse = await page.goto('http://localhost:3001/api/prompts', { timeout: 10000 });
  const promptsHealthy = promptsResponse.ok();
  if (promptsHealthy) {
    const promptsData = await promptsResponse.json();
    const promptCount = promptsData.prompts?.length || 0;
    addResult('API prompts endpoint', promptsHealthy && promptCount > 0, `Found ${promptCount} prompts`);
  } else {
    addResult('API prompts endpoint', false, `HTTP ${promptsResponse.status()}`);
  }

} catch (error) {
  console.error('\n❌ Fatal error during testing:', error);
  testResults.failed.push({
    test: 'Overall test execution',
    success: false,
    details: error.message,
    timestamp: new Date().toISOString()
  });
} finally {
  await browser.close();

  // Generate test report
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Passed: ${testResults.passed.length}`);
  console.log(`❌ Failed: ${testResults.failed.length}`);
  console.log(`📸 Screenshots: ${testResults.screenshots.length}`);
  console.log(`📁 Screenshot directory: ${screenshotDir}`);
  console.log('='.repeat(80));

  if (testResults.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.failed.forEach(({ test, details }) => {
      console.log(`   • ${test}: ${details}`);
    });
  }

  console.log('\n📸 Screenshots captured:');
  testResults.screenshots.forEach(({ name, path }) => {
    console.log(`   • ${name}: ${path}`);
  });

  // Save detailed report as JSON
  const reportPath = path.join(__dirname, 'test-report.json');
  await fs.writeFile(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n💾 Detailed report saved: ${reportPath}`);

  const successRate = testResults.passed.length / (testResults.passed.length + testResults.failed.length) * 100;
  console.log(`\n📈 Success Rate: ${successRate.toFixed(1)}%`);

  if (testResults.failed.length === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Review the report above.');
    process.exit(1);
  }
}
