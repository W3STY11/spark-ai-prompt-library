import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const TAMPERMONKEY_SCRIPT = readFileSync('/home/aiwithnick/SPARK_LIBRARY_FLUENT_UI_VERSION/m365-copilot-spark-integration.user.js', 'utf-8');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const copilotPage = await context.newPage();

    console.log('\n🚀 Starting Sidecar Integration Test...\n');

    // Step 1: Navigate to M365 Copilot
    console.log('1️⃣ Navigating to M365 Copilot...');
    await copilotPage.goto('https://m365.cloud.microsoft/chat/');
    await copilotPage.waitForTimeout(3000);

    // Step 2: Inject Tampermonkey script
    console.log('2️⃣ Injecting Tampermonkey script...');
    await copilotPage.evaluate(TAMPERMONKEY_SCRIPT);
    await copilotPage.waitForTimeout(1000);

    // Verify floating button exists
    const floatingButtonCount = await copilotPage.locator('#spark-floating-button').count();
    console.log('   ✓ Floating button found:', floatingButtonCount > 0);

    // Step 3: Click floating button to open library
    console.log('3️⃣ Clicking floating button...');
    await copilotPage.click('#spark-floating-button');
    await copilotPage.waitForTimeout(2000);

    // Step 4: Switch to SPARK library tab
    const pages = context.pages();
    const libraryPage = pages[pages.length - 1];
    console.log('   ✓ Switched to library tab:', libraryPage.url());
    await libraryPage.waitForTimeout(2000);

    // Step 5: Navigate to a specific prompt
    console.log('4️⃣ Navigating to prompt detail page...');
    await libraryPage.goto('http://localhost:3000/view?id=b8cfe3d2fc43976c6a03b50ad7573dd9');
    await libraryPage.waitForTimeout(2000);

    // Step 6: Click "Copy to Copilot" button
    console.log('5️⃣ Clicking "Copy to Copilot" button...');

    // Find and click the button
    const copyButton = libraryPage.locator('button:has-text("Copy to Copilot")');
    await copyButton.click();
    console.log('   ✓ Button clicked!');

    await libraryPage.waitForTimeout(1000);

    // Step 7: Switch back to Copilot and check for sidecar
    console.log('6️⃣ Switching back to Copilot tab...');
    await copilotPage.bringToFront();
    await copilotPage.waitForTimeout(2000);

    // Step 8: Verify prompt insertion
    console.log('7️⃣ Verifying prompt insertion...');
    const inputElement = await copilotPage.locator('#m365-chat-editor-target-element');
    const promptText = await inputElement.innerText();
    console.log('   ✓ Prompt inserted:', promptText.length, 'characters');
    console.log('   ✓ Preview:', promptText.substring(0, 100) + '...');

    // Step 9: Check for sidecar
    console.log('8️⃣ Checking for sidecar...');
    const sidecarExists = await copilotPage.locator('#spark-sidecar').count();
    const overlayExists = await copilotPage.locator('#spark-sidecar-overlay').count();

    console.log('   ✓ Sidecar element exists:', sidecarExists > 0);
    console.log('   ✓ Overlay element exists:', overlayExists > 0);

    if (sidecarExists > 0) {
        // Check sidecar visibility
        const sidecar = copilotPage.locator('#spark-sidecar');
        const rightPosition = await sidecar.evaluate(el => el.style.right);
        console.log('   ✓ Sidecar position (right):', rightPosition);

        // Check overlay visibility
        const overlay = copilotPage.locator('#spark-sidecar-overlay');
        const overlayDisplay = await overlay.evaluate(el => el.style.display);
        const overlayOpacity = await overlay.evaluate(el => el.style.opacity);
        console.log('   ✓ Overlay display:', overlayDisplay, ', opacity:', overlayOpacity);

        // Get sidecar content
        const sidecarContent = await copilotPage.locator('#spark-sidecar-content').innerHTML();
        console.log('   ✓ Sidecar content length:', sidecarContent.length, 'chars');

        // Check for specific elements
        const hasTips = sidecarContent.includes('💡');
        const hasTags = sidecarContent.includes('🏷️');
        const hasTitle = sidecarContent.includes('Achieve Sustainable Wealth Strategies');

        console.log('   ✓ Contains title:', hasTitle);
        console.log('   ✓ Contains tips section:', hasTips);
        console.log('   ✓ Contains tags section:', hasTags);
    }

    // Step 10: Take screenshot showing both prompt and sidecar
    console.log('9️⃣ Taking screenshot...');
    await copilotPage.screenshot({
        path: '/home/aiwithnick/SPARK_LIBRARY_FLUENT_UI_VERSION/copilot-with-sidecar.png',
        fullPage: true
    });
    console.log('   ✓ Screenshot saved: copilot-with-sidecar.png');

    // Wait to observe
    console.log('\n⏱️ Waiting 5 seconds for observation...');
    await copilotPage.waitForTimeout(5000);

    console.log('\n✅ Test complete! Check the screenshot.');

    await browser.close();
})();
