import { chromium } from 'playwright';

async function testAddPrompt() {
  console.log('🚀 Starting Add Prompt automated tests...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // Slow down actions so we can see what's happening
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to Browse page
    console.log('📍 Navigating to Browse page...');
    await page.goto('http://localhost:3000/browse');
    await page.waitForTimeout(2000);

    // TEST 1: Weird/Random Test Prompt
    console.log('\n✨ TEST 1: Adding weird/random test prompt...');
    await page.click('button:has-text("Add Prompt")');
    await page.waitForTimeout(1000);

    // Fill in weird data
    await page.fill('input[placeholder*="Analyze Business"]', 'Banana Rocket Submarine Analysis Methodology');
    await page.click('button[role="combobox"]'); // Open department dropdown
    await page.waitForTimeout(500);
    await page.click('div[role="option"]:has-text("Solopreneurs")');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="Analytics"]', 'Interdimensional Coffee Bean Optimization');
    await page.fill('textarea[placeholder*="💡Optimize"]', 'This mega-prompt helps you analyze the quantum mechanics of underwater banana transportation using advanced submarine rocket technology and caffeinated propulsion systems.');

    const weirdContent = `You are an expert in banana rocket submarine operations with deep knowledge of interdimensional coffee bean physics. Your task is to analyze the optimal transportation methods for bananas using submarine-based rocket propulsion while maintaining the integrity of quantum coffee bean structures throughout the journey.`;
    await page.fill('textarea[placeholder*="#CONTEXT"]', weirdContent);
    await page.fill('input[placeholder*="analysis, strategy"]', 'weird, random, banana-rockets, quantum-coffee, submarine-analysis, test-data');

    await page.waitForTimeout(1000);
    await page.click('button:has-text("Add Prompt")');

    console.log('✅ Weird prompt submitted! Waiting for success...');
    await page.waitForTimeout(2000);

    // TEST 2: Minimum Character Requirements
    console.log('\n✨ TEST 2: Testing minimum character requirements...');
    await page.click('button:has-text("Add Prompt")');
    await page.waitForTimeout(1000);

    await page.fill('input[placeholder*="Analyze Business"]', 'Min Char Test');
    await page.click('button[role="combobox"]');
    await page.waitForTimeout(500);
    await page.click('div[role="option"]:has-text("Business")');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="Analytics"]', 'Testing');
    await page.fill('textarea[placeholder*="💡Optimize"]', 'This is exactly fifty characters for minimum test!!'); // 50 chars
    await page.fill('textarea[placeholder*="#CONTEXT"]', 'This is the minimum content test. It needs to be at least one hundred characters long for validation purposes ok.'); // 111 chars
    await page.fill('input[placeholder*="analysis, strategy"]', 'min-test, validation');

    await page.waitForTimeout(1000);
    await page.click('button:has-text("Add Prompt")');

    console.log('✅ Min chars prompt submitted!');
    await page.waitForTimeout(2000);

    // TEST 3: Different Department (Marketing)
    console.log('\n✨ TEST 3: Testing different department (Marketing)...');
    await page.click('button:has-text("Add Prompt")');
    await page.waitForTimeout(1000);

    await page.fill('input[placeholder*="Analyze Business"]', 'Purple Unicorn Marketing Strategy Analyzer');
    await page.click('button[role="combobox"]');
    await page.waitForTimeout(500);
    await page.click('div[role="option"]:has-text("Marketing")');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="Analytics"]', 'Mythical Creature Brand Development');
    await page.fill('textarea[placeholder*="💡Optimize"]', 'Deploy this mega-prompt to craft marketing campaigns featuring purple unicorns, rainbow explosions, and sparkle-based conversion optimization strategies.');

    const marketingContent = `You are a mythical creature marketing specialist with expertise in unicorn-based brand development. Analyze the target audience's receptiveness to purple unicorn imagery, calculate the ROI of sparkle-based marketing, and develop a comprehensive strategy for rainbow explosion conversion funnels. Consider magical engagement metrics and enchantment-based KPIs.`;
    await page.fill('textarea[placeholder*="#CONTEXT"]', marketingContent);
    await page.fill('input[placeholder*="analysis, strategy"]', 'unicorns, purple, marketing, sparkles, mythical, rainbow-strategy');

    await page.waitForTimeout(1000);
    await page.click('button:has-text("Add Prompt")');

    console.log('✅ Marketing prompt submitted!');
    await page.waitForTimeout(2000);

    // TEST 4: Validation - Try to submit empty form
    console.log('\n✨ TEST 4: Testing validation (empty form)...');
    await page.click('button:has-text("Add Prompt")');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Add Prompt")'); // Try to submit without filling

    console.log('✅ Validation test - should show errors');
    await page.waitForTimeout(3000);

    // Close the modal
    await page.click('button[aria-label*="Close"], button:has-text("Cancel")');
    await page.waitForTimeout(1000);

    // Verify prompts are in the list
    console.log('\n🔍 Verifying added prompts appear in Browse page...');
    await page.waitForTimeout(1000);

    const bananaPrompt = await page.locator('text=Banana Rocket Submarine').count();
    const minCharPrompt = await page.locator('text=Min Char Test').count();
    const unicornPrompt = await page.locator('text=Purple Unicorn').count();

    console.log(`\n📊 Results:`);
    console.log(`   Banana Rocket prompt found: ${bananaPrompt > 0 ? '✅' : '❌'}`);
    console.log(`   Min Char prompt found: ${minCharPrompt > 0 ? '✅' : '❌'}`);
    console.log(`   Purple Unicorn prompt found: ${unicornPrompt > 0 ? '✅' : '❌'}`);

    console.log('\n✅ All automated tests completed!');
    console.log('🎉 Browser will stay open for manual inspection...');

    // Keep browser open for inspection
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('❌ Error during testing:', error);
    throw error;
  } finally {
    await browser.close();
    console.log('\n👋 Tests finished. Browser closed.');
  }
}

// Run the tests
testAddPrompt().catch(console.error);
