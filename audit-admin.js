import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

async function auditAdminPanel() {
  // Create audit directory
  await mkdir('audit-screenshots', { recursive: true });

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  console.log('🔐 ADMIN PANEL COMPREHENSIVE AUDIT\n');
  console.log('=' .repeat(60));

  try {
    // ========== ADMIN LOGIN & AUTHENTICATION ==========
    console.log('\n🔐 1. ADMIN LOGIN PROCESS');
    await page.goto('http://localhost:3000/admin-login.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Fill in admin credentials
    await page.fill('#password', 'MyTestPassword123!');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'audit-screenshots/15-admin-login-filled.png',
      fullPage: true
    });
    console.log('   ✓ Admin Login Form (Filled) captured');

    // Submit login
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // ========== ADMIN DASHBOARD - LIGHT MODE ==========
    console.log('\n📊 2. ADMIN DASHBOARD - LIGHT MODE');
    await page.screenshot({
      path: 'audit-screenshots/16-admin-dashboard-light.png',
      fullPage: true
    });
    console.log('   ✓ Admin Dashboard (Light) captured');

    // ========== ADMIN DASHBOARD - DARK MODE ==========
    console.log('\n🌙 3. ADMIN DASHBOARD - DARK MODE');
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'audit-screenshots/17-admin-dashboard-dark.png',
      fullPage: true
    });
    console.log('   ✓ Admin Dashboard (Dark) captured');

    // ========== ADMIN - FILTER BY DEPARTMENT ==========
    console.log('\n🎯 4. ADMIN - DEPARTMENT FILTERING');
    const departments = ['Business', 'Marketing', 'Sales'];

    for (const dept of departments) {
      // Find and click department filter
      await page.selectOption('#departmentFilter', dept);
      await page.waitForTimeout(1500);

      await page.screenshot({
        path: `audit-screenshots/18-admin-${dept.toLowerCase()}-filter.png`,
        fullPage: true
      });
      console.log(`   ✓ Admin - ${dept} filter captured`);
    }

    // ========== ADMIN - SEARCH FUNCTIONALITY ==========
    console.log('\n🔍 5. ADMIN - SEARCH FUNCTIONALITY');
    await page.selectOption('#departmentFilter', '');
    await page.waitForTimeout(500);

    await page.fill('#searchInput', 'strategy');
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: 'audit-screenshots/19-admin-search-results.png',
      fullPage: true
    });
    console.log('   ✓ Admin Search Results captured');

    // Clear search
    await page.fill('#searchInput', '');
    await page.waitForTimeout(1000);

    // ========== ADMIN - EDIT PROMPT MODAL ==========
    console.log('\n✏️ 6. ADMIN - EDIT PROMPT MODAL');
    const editButtons = await page.$$('button:has-text("Edit")');
    if (editButtons.length > 0) {
      await editButtons[0].click();
      await page.waitForTimeout(1500);

      await page.screenshot({
        path: 'audit-screenshots/20-admin-edit-modal-light.png'
      });
      console.log('   ✓ Edit Prompt Modal (Light) captured');

      await page.evaluate(() => document.documentElement.classList.add('dark'));
      await page.waitForTimeout(500);
      await page.screenshot({
        path: 'audit-screenshots/21-admin-edit-modal-dark.png'
      });
      console.log('   ✓ Edit Prompt Modal (Dark) captured');

      // Close modal
      const closeBtn = await page.$('button:has-text("Cancel")');
      if (closeBtn) await closeBtn.click();
      await page.waitForTimeout(500);
    }

    // ========== ADMIN - ADD NEW PROMPT MODAL ==========
    console.log('\n➕ 7. ADMIN - ADD NEW PROMPT MODAL');
    await page.click('#addPromptBtn');
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: 'audit-screenshots/22-admin-add-prompt-modal.png'
    });
    console.log('   ✓ Add New Prompt Modal captured');

    // Fill in some example data to show form validation
    await page.fill('#promptTitle', 'Test Prompt Title');
    await page.waitForTimeout(300);
    await page.fill('#promptDescription', 'This is a test description to show form validation.');
    await page.waitForTimeout(300);

    await page.screenshot({
      path: 'audit-screenshots/23-admin-add-prompt-filled.png'
    });
    console.log('   ✓ Add Prompt Form (Filled) captured');

    // Close modal
    const cancelBtn = await page.$('button:has-text("Cancel")');
    if (cancelBtn) await cancelBtn.click();
    await page.waitForTimeout(500);

    // ========== ADMIN - STATS & OVERVIEW ==========
    console.log('\n📈 8. ADMIN - STATISTICS & OVERVIEW');
    await page.goto('http://localhost:3000/admin.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'audit-screenshots/24-admin-stats-overview.png',
      fullPage: true
    });
    console.log('   ✓ Admin Statistics Overview captured');

    // ========== ADMIN - RESPONSIVE VIEWS ==========
    console.log('\n📱 9. ADMIN - RESPONSIVE DESIGN');

    const viewports = [
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 812 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:3000/admin.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      await page.screenshot({
        path: `audit-screenshots/25-admin-responsive-${viewport.name}.png`,
        fullPage: true
      });
      console.log(`   ✓ Admin ${viewport.name.charAt(0).toUpperCase() + viewport.name.slice(1)} View captured`);
    }

    // ========== ADMIN - INTERACTION STATES ==========
    console.log('\n🖱️  10. ADMIN - INTERACTION STATES');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3000/admin.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Hover over edit button
    const firstEditBtn = await page.$('button:has-text("Edit")');
    if (firstEditBtn) {
      await firstEditBtn.hover();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: 'audit-screenshots/26-admin-button-hover.png'
      });
      console.log('   ✓ Admin Button Hover State captured');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ ADMIN AUDIT COMPLETE: All admin screenshots captured');
    console.log('📁 Location: audit-screenshots/');
    console.log('📊 Admin Screenshots: 12+');
    console.log('\n🎯 Combined with previous audit: 26+ total screenshots');

  } catch (error) {
    console.error('❌ Error during admin audit:', error);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

auditAdminPanel();
