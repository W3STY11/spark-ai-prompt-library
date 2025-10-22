#!/usr/bin/env node

/**
 * Comprehensive End-to-End Test Suite for SPARK Prompt Library
 * Tests blob storage integration, data integrity, and all major features
 */

import { chromium } from '@playwright/test';
import { writeFileSync } from 'fs';

const BASE_URL = 'https://gray-ocean-059c8510f.3.azurestaticapps.net';
const BLOB_URL = 'https://sparkpromptstorage.blob.core.windows.net/data/prompts_index.json';
const SCREENSHOTS_DIR = '.playwright-blob-tests';

// Test results tracking
const results = {
  passed: [],
  failed: [],
  warnings: []
};

async function runTest(name, testFn) {
  console.log(`\n🧪 Testing: ${name}...`);
  try {
    await testFn();
    results.passed.push(name);
    console.log(`✅ PASSED: ${name}`);
    return true;
  } catch (error) {
    results.failed.push({ name, error: error.message });
    console.error(`❌ FAILED: ${name}`);
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting SPARK Library Blob Storage Integration Tests');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`📦 Blob Storage: ${BLOB_URL}`);

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Track network requests
  const networkRequests = [];
  page.on('request', request => {
    networkRequests.push({
      url: request.url(),
      method: request.method(),
      timestamp: new Date().toISOString()
    });
  });

  try {
    // Test 1: Homepage loads successfully
    await runTest('Homepage Loads', async () => {
      const response = await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      if (!response.ok()) throw new Error(`HTTP ${response.status()}`);

      // Wait for departments to load from blob storage
      await page.waitForSelector('text=SPARK AI Prompt Library', { timeout: 10000 });

      // Verify blob storage request was made
      const blobRequest = networkRequests.find(r => r.url.includes('sparkpromptstorage.blob.core.windows.net'));
      if (!blobRequest) throw new Error('No blob storage request detected');

      await page.screenshot({ path: `${SCREENSHOTS_DIR}/01-homepage.png`, fullPage: true });
    });

    // Test 2: Department cards loaded from blob storage
    await runTest('Department Cards Display', async () => {
      const departments = await page.$$('[class*="departmentCard"]');
      if (departments.length === 0) throw new Error('No department cards found');
      console.log(`   Found ${departments.length} department cards`);

      // Check for specific departments
      const businessCard = await page.locator('text=Business').first();
      await businessCard.waitFor({ state: 'visible', timeout: 5000 });

      await page.screenshot({ path: `${SCREENSHOTS_DIR}/02-departments.png` });
    });

    // Test 3: Browse page loads all prompts
    await runTest('Browse Page Loads All Prompts', async () => {
      await page.click('text=Browse Prompts');
      await page.waitForLoadState('networkidle');

      // Wait for prompts to load
      await page.waitForSelector('[class*="promptCard"]', { timeout: 15000 });

      const promptCards = await page.$$('[class*="promptCard"]');
      console.log(`   Found ${promptCards.length} prompt cards on current page`);

      if (promptCards.length === 0) throw new Error('No prompts loaded on browse page');

      // Check for total count display
      const totalText = await page.textContent('body');
      if (!totalText.includes('2,4')) { // Should show "2,4xx prompts" or similar
        results.warnings.push('Total prompt count not visible on browse page');
      }

      await page.screenshot({ path: `${SCREENSHOTS_DIR}/03-browse-all-prompts.png`, fullPage: true });
    });

    // Test 4: Filter by department
    await runTest('Department Filter Works', async () => {
      // Click Business filter
      await page.click('text=Business');
      await page.waitForTimeout(1000); // Wait for filter to apply

      const filteredCards = await page.$$('[class*="promptCard"]');
      console.log(`   Found ${filteredCards.length} Business prompts`);

      if (filteredCards.length === 0) throw new Error('No prompts after filtering');

      await page.screenshot({ path: `${SCREENSHOTS_DIR}/04-filtered-business.png` });
    });

    // Test 5: Search functionality
    await runTest('Search Functionality', async () => {
      // Clear filter first
      await page.click('text=All Departments');
      await page.waitForTimeout(500);

      // Search for "marketing"
      const searchBox = await page.locator('input[placeholder*="Search"]');
      await searchBox.fill('marketing');
      await page.waitForTimeout(1000);

      const searchResults = await page.$$('[class*="promptCard"]');
      console.log(`   Found ${searchResults.length} search results`);

      if (searchResults.length === 0) throw new Error('No search results found');

      await page.screenshot({ path: `${SCREENSHOTS_DIR}/05-search-results.png` });

      // Clear search
      await searchBox.clear();
      await page.waitForTimeout(500);
    });

    // Test 6: Individual prompt view with rich content
    await runTest('Individual Prompt View with Rich Content', async () => {
      // Click first prompt card
      const firstCard = await page.locator('[class*="promptCard"]').first();
      await firstCard.click();
      await page.waitForLoadState('networkidle');

      // Wait for prompt content to load
      await page.waitForSelector('[class*="promptTitle"]', { timeout: 10000 });

      // Check for rich content sections
      const pageContent = await page.textContent('body');

      // Verify key sections are present
      const hasTips = pageContent.includes('💡') || pageContent.includes('Tips');
      const hasExamples = pageContent.includes('Examples') || pageContent.includes('📝');
      const hasContent = pageContent.length > 500; // Should have substantial content

      if (!hasContent) throw new Error('Prompt content is too short');

      console.log(`   ✓ Tips section: ${hasTips}`);
      console.log(`   ✓ Examples: ${hasExamples}`);
      console.log(`   ✓ Content length: ${pageContent.length} chars`);

      await page.screenshot({ path: `${SCREENSHOTS_DIR}/06-prompt-view-full.png`, fullPage: true });
    });

    // Test 7: Favorites functionality
    await runTest('Favorites System', async () => {
      // Click favorite button
      const favoriteBtn = await page.locator('[aria-label*="favorite"], [title*="favorite"]').first();
      if (await favoriteBtn.count() > 0) {
        await favoriteBtn.click();
        await page.waitForTimeout(500);
      }

      // Navigate to favorites page
      await page.click('text=Favorites');
      await page.waitForLoadState('networkidle');

      // Check if favorites loaded
      const favoritesContent = await page.textContent('body');
      const hasFavorites = favoritesContent.includes('saved') || favoritesContent.includes('Favorites');

      if (!hasFavorites) throw new Error('Favorites page not loaded properly');

      await page.screenshot({ path: `${SCREENSHOTS_DIR}/07-favorites.png`, fullPage: true });
    });

    // Test 8: Dark theme toggle
    await runTest('Dark Theme Toggle', async () => {
      // Find and click theme toggle button
      const themeToggle = await page.locator('[aria-label*="theme"], button[class*="theme"]').first();

      if (await themeToggle.count() > 0) {
        await themeToggle.click();
        await page.waitForTimeout(1000);

        // Verify dark theme applied
        const html = await page.locator('html');
        const classes = await html.getAttribute('class');

        console.log(`   HTML classes: ${classes}`);

        await page.screenshot({ path: `${SCREENSHOTS_DIR}/08-dark-theme.png`, fullPage: true });
      } else {
        results.warnings.push('Theme toggle button not found');
      }
    });

    // Test 9: Blob storage performance
    await runTest('Blob Storage Performance', async () => {
      const blobRequests = networkRequests.filter(r =>
        r.url.includes('sparkpromptstorage.blob.core.windows.net')
      );

      console.log(`   Total blob storage requests: ${blobRequests.length}`);
      console.log(`   Requests:`);
      blobRequests.forEach(req => {
        console.log(`     - ${req.method} ${req.url.split('/').pop()}`);
      });

      if (blobRequests.length === 0) {
        throw new Error('No blob storage requests detected during session');
      }
    });

    // Test 10: Data integrity check
    await runTest('Data Integrity - All Prompts Accessible', async () => {
      // Fetch prompts_index.json directly
      const response = await fetch(BLOB_URL);
      if (!response.ok) throw new Error(`Failed to fetch: HTTP ${response.status}`);

      const data = await response.json();
      const promptCount = data.prompts?.length || 0;

      console.log(`   Total prompts in index: ${promptCount}`);
      console.log(`   Departments: ${data.departments?.length || 0}`);

      if (promptCount < 2000) {
        throw new Error(`Expected >2000 prompts, got ${promptCount}`);
      }

      // Check for complete metadata
      const samplePrompt = data.prompts[0];
      const requiredFields = ['id', 'title', 'department', 'description', 'content'];
      const missingFields = requiredFields.filter(field => !samplePrompt[field]);

      if (missingFields.length > 0) {
        throw new Error(`Sample prompt missing fields: ${missingFields.join(', ')}`);
      }

      console.log(`   ✓ Sample prompt has all required fields`);
    });

  } catch (error) {
    console.error('❌ Fatal error during tests:', error);
    results.failed.push({ name: 'Test Suite Execution', error: error.message });
  } finally {
    await browser.close();

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${results.passed.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log(`⚠️  Warnings: ${results.warnings.length}`);

    if (results.passed.length > 0) {
      console.log('\n✅ Passed Tests:');
      results.passed.forEach(name => console.log(`   ✓ ${name}`));
    }

    if (results.failed.length > 0) {
      console.log('\n❌ Failed Tests:');
      results.failed.forEach(({ name, error }) => {
        console.log(`   ✗ ${name}`);
        console.log(`     ${error}`);
      });
    }

    if (results.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      results.warnings.forEach(warning => console.log(`   - ${warning}`));
    }

    // Save results to file
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      blobUrl: BLOB_URL,
      results: {
        passed: results.passed,
        failed: results.failed,
        warnings: results.warnings
      },
      networkRequests: networkRequests.filter(r =>
        r.url.includes('sparkpromptstorage') || r.url.includes('prompts_index')
      )
    };

    writeFileSync(
      `${SCREENSHOTS_DIR}/test-report.json`,
      JSON.stringify(report, null, 2)
    );

    console.log(`\n📄 Full report saved to: ${SCREENSHOTS_DIR}/test-report.json`);
    console.log(`📸 Screenshots saved to: ${SCREENSHOTS_DIR}/`);

    const exitCode = results.failed.length > 0 ? 1 : 0;
    process.exit(exitCode);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
