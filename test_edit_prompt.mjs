import { chromium } from '@playwright/test';

const browser = await chromium.connectOverCDP('http://localhost:9222');
const contexts = browser.contexts();
const context = contexts[0];
const pages = context.pages();
const page = pages[0];

console.log('📝 Current page:', await page.title());
console.log('📍 Current URL:', page.url());

// Verify we have the edit modal open
const modalVisible = await page.locator('.modal.show').isVisible();
console.log('✅ Edit modal is open:', modalVisible);

// Get current title value
const currentTitle = await page.locator('input#editTitle').inputValue();
console.log('📌 Current title:', currentTitle);

// Clear and update the title to append " - EDITED"
const newTitle = currentTitle + ' - EDITED';
await page.locator('input#editTitle').fill(newTitle);
console.log('✏️  New title:', newTitle);

// Click Save Changes button
console.log('💾 Clicking Save Changes button...');
await page.getByRole('button', { name: 'Save Changes' }).click();

// Wait for modal to close or success message
await page.waitForTimeout(2000);

// Check if modal closed (indicates success)
const modalStillVisible = await page.locator('.modal.show').isVisible();
console.log('✅ Modal closed (success):', !modalStillVisible);

// Check for any alert or success message
const alertText = await page.evaluate(() => {
  return document.body.innerText;
});

if (alertText.includes('successfully') || alertText.includes('saved')) {
  console.log('✅ Success message detected');
}

// Search for the edited prompt in the admin list
console.log('\n🔍 Searching for edited prompt in admin list...');
const promptRows = await page.locator('tbody tr').count();
console.log('📊 Total prompts in admin:', promptRows);

// Look for the edited title in the first few rows
const firstRowTitle = await page.locator('tbody tr').first().locator('td').nth(1).textContent();
console.log('📌 First row title:', firstRowTitle.trim());

if (firstRowTitle.includes('EDITED')) {
  console.log('✅ EDIT SUCCESSFUL - Edited prompt found in admin!');
} else {
  console.log('⚠️  Edited title not found in first row, checking more rows...');

  for (let i = 0; i < Math.min(10, promptRows); i++) {
    const title = await page.locator('tbody tr').nth(i).locator('td').nth(1).textContent();
    if (title.includes('EDITED')) {
      console.log(`✅ Found edited prompt at row ${i + 1}:`, title.trim());
      break;
    }
  }
}

await browser.close();
