import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

async function comprehensiveAudit() {
  // Create audit directory
  await mkdir('audit-screenshots', { recursive: true });

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // Slower for observation
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  console.log('🔍 PHASE 1: COMPREHENSIVE UI/UX AUDIT\n');
  console.log('=' .repeat(60));

  try {
    // ========== HOMEPAGE ==========
    console.log('\n📄 1. HOMEPAGE ANALYSIS');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'audit-screenshots/01-homepage-light.png',
      fullPage: true
    });
    console.log('   ✓ Homepage (Light Mode) captured');

    // Enable dark mode
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'audit-screenshots/02-homepage-dark.png',
      fullPage: true
    });
    console.log('   ✓ Homepage (Dark Mode) captured');

    // ========== BROWSE PAGE - MAIN VIEW ==========
    console.log('\n📚 2. BROWSE PAGE ANALYSIS');
    await page.goto('http://localhost:3000/browse.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'audit-screenshots/03-browse-all-light.png',
      fullPage: true
    });
    console.log('   ✓ Browse - All Prompts (Light) captured');

    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'audit-screenshots/04-browse-all-dark.png',
      fullPage: true
    });
    console.log('   ✓ Browse - All Prompts (Dark) captured');

    // ========== BROWSE - FILTERED VIEWS ==========
    console.log('\n🎯 3. FILTERED VIEWS');

    const departments = ['Business', 'Marketing', 'Sales'];
    for (const dept of departments) {
      await page.goto(`http://localhost:3000/browse.html?department=${dept}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      await page.screenshot({
        path: `audit-screenshots/05-browse-${dept.toLowerCase()}-dark.png`,
        fullPage: true
      });
      console.log(`   ✓ Browse - ${dept} category captured`);
    }

    // ========== LIST VIEW ==========
    console.log('\n📋 4. LIST VIEW ANALYSIS');
    await page.goto('http://localhost:3000/browse.html?department=Business');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Click list view button
    await page.click('#viewList');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'audit-screenshots/06-browse-list-view.png',
      fullPage: true
    });
    console.log('   ✓ List View captured');

    // ========== INDIVIDUAL PROMPT VIEW ==========
    console.log('\n📖 5. PROMPT DETAIL VIEW');

    // Get first prompt card and click it
    const cards = await page.$$('.prompt-card');
    if (cards.length > 0) {
      await cards[0].click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'audit-screenshots/07-prompt-detail-light.png',
        fullPage: true
      });
      console.log('   ✓ Prompt Detail (Light) captured');

      await page.evaluate(() => document.documentElement.classList.add('dark'));
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: 'audit-screenshots/08-prompt-detail-dark.png',
        fullPage: true
      });
      console.log('   ✓ Prompt Detail (Dark) captured');
    }

    // ========== SEARCH FUNCTIONALITY ==========
    console.log('\n🔍 6. SEARCH FUNCTIONALITY');
    await page.goto('http://localhost:3000/browse.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.fill('#searchInput', 'strategy');
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: 'audit-screenshots/09-search-results.png',
      fullPage: true
    });
    console.log('   ✓ Search Results captured');

    // ========== ADD PROMPT MODAL ==========
    console.log('\n➕ 7. ADD PROMPT MODAL');
    await page.goto('http://localhost:3000/browse.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.click('#addPromptBtn');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'audit-screenshots/10-add-prompt-modal.png'
    });
    console.log('   ✓ Add Prompt Modal captured');

    // Close modal
    await page.click('#closeModalBtn');
    await page.waitForTimeout(500);

    // ========== ADMIN LOGIN ==========
    console.log('\n🔐 8. ADMIN INTERFACE');
    await page.goto('http://localhost:3000/admin-login.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'audit-screenshots/11-admin-login-light.png',
      fullPage: true
    });
    console.log('   ✓ Admin Login (Light) captured');

    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'audit-screenshots/12-admin-login-dark.png',
      fullPage: true
    });
    console.log('   ✓ Admin Login (Dark) captured');

    // ========== RESPONSIVE VIEWS ==========
    console.log('\n📱 9. RESPONSIVE DESIGN ANALYSIS');

    const viewports = [
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 812 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:3000/browse.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      await page.screenshot({
        path: `audit-screenshots/13-responsive-${viewport.name}.png`,
        fullPage: true
      });
      console.log(`   ✓ ${viewport.name.charAt(0).toUpperCase() + viewport.name.slice(1)} View captured`);
    }

    // ========== INTERACTION STATES ==========
    console.log('\n🖱️  10. INTERACTION STATES');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3000/browse.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Hover state
    const firstCard = await page.$('.prompt-card');
    if (firstCard) {
      await firstCard.hover();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: 'audit-screenshots/14-card-hover-state.png'
      });
      console.log('   ✓ Card Hover State captured');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ PHASE 1 COMPLETE: All screenshots captured');
    console.log('📁 Location: audit-screenshots/');
    console.log('📊 Total Screenshots: 14+');
    console.log('\n🔄 Ready for Phase 2: Research & Analysis');

  } catch (error) {
    console.error('❌ Error during audit:', error);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

comprehensiveAudit();
