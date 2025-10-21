// ==UserScript==
// @name         SPARK Prompt Library - Cross-Tab M365 Copilot Integration
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  Opens SPARK library in new tab, sends prompts to Copilot with side reference panel
// @author       SPARK Library
// @match        https://m365.cloud.microsoft/chat*
// @match        https://m365.cloud.microsoft.com/chat*
// @match        http://localhost:3000/*
// @icon         data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">⚡</text></svg>
// @grant        GM_addStyle
// @grant        window.focus
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const SPARK_LIBRARY_URL = 'http://localhost:3000';
    const COPILOT_ORIGIN = 'https://m365.cloud.microsoft';

    // ============================================================================
    // PART 1: M365 COPILOT SIDE (Receiver)
    // ============================================================================

    if (window.location.href.includes('m365.cloud.microsoft')) {
        console.log('🎯 SPARK: Initializing Copilot integration...');

        // Inject styles for FAB and reference panel
        GM_addStyle(`
            /* FAB Button */
            .spark-fab {
                position: fixed;
                bottom: 24px;
                right: 24px;
                width: 56px;
                height: 56px;
                background: #FFFFFF;
                border: 1px solid #E0E0E0;
                border-radius: 28px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                cursor: pointer;
                z-index: 9998;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                opacity: 0;
                transform: scale(0.8);
                animation: sparkFabFadeIn 0.5s ease-out 0.5s forwards;
            }

            @keyframes sparkFabFadeIn {
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            .spark-fab:hover {
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
                transform: translateY(-2px) scale(1.05);
            }

            .spark-fab:active {
                transform: scale(0.95);
            }

            .spark-fab-icon {
                font-size: 28px;
                line-height: 1;
                user-select: none;
            }

            .spark-fab-badge {
                position: absolute;
                top: -4px;
                right: -4px;
                background: #6B47DC;
                color: white;
                font-size: 10px;
                font-weight: 600;
                padding: 2px 6px;
                border-radius: 10px;
                font-family: "Segoe UI", sans-serif;
            }

            /* Reference Panel */
            .spark-reference-panel {
                position: fixed;
                top: 60px;
                right: 20px;
                width: 380px;
                max-height: calc(100vh - 80px);
                background: #FFFFFF;
                border: 1px solid #E0E0E0;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                z-index: 9999;
                font-family: "Segoe UI", "Segoe UI Web (West European)", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;
                display: none;
                flex-direction: column;
                opacity: 0;
                transform: translateX(100px);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .spark-reference-panel.active {
                display: flex;
                opacity: 1;
                transform: translateX(0);
            }

            .spark-reference-panel-header {
                padding: 16px 20px;
                border-bottom: 1px solid #E0E0E0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 12px 12px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .spark-reference-panel-title {
                font-size: 16px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .spark-reference-panel-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                width: 28px;
                height: 28px;
                border-radius: 6px;
                color: white;
                cursor: pointer;
                font-size: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .spark-reference-panel-close:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .spark-reference-panel-content {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
            }

            .spark-reference-panel-content::-webkit-scrollbar {
                width: 8px;
            }

            .spark-reference-panel-content::-webkit-scrollbar-thumb {
                background: #D1D1D1;
                border-radius: 4px;
            }

            .spark-reference-section {
                margin-bottom: 20px;
            }

            .spark-reference-section:last-child {
                margin-bottom: 0;
            }

            .spark-reference-section-title {
                font-size: 13px;
                font-weight: 600;
                color: #6B47DC;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .spark-reference-section-content {
                font-size: 14px;
                line-height: 1.6;
                color: #424242;
            }

            .spark-reference-section-content ul {
                margin: 0;
                padding-left: 20px;
            }

            .spark-reference-section-content li {
                margin-bottom: 8px;
            }

            .spark-reference-section-content p {
                margin: 0 0 10px 0;
            }

            .spark-reference-meta {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
                padding: 12px;
                background: #F5F5F5;
                border-radius: 8px;
                margin-bottom: 16px;
            }

            .spark-reference-meta-item {
                font-size: 12px;
                color: #616161;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .spark-reference-meta-item strong {
                color: #242424;
            }

            /* Toast */
            .spark-toast {
                position: fixed;
                top: 80px;
                right: 20px;
                background: #10B981;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 10000;
                font-family: "Segoe UI", sans-serif;
                font-size: 14px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
                animation: sparkToastSlide 0.3s ease-out, sparkToastFadeOut 0.3s ease-out 2.7s forwards;
            }

            @keyframes sparkToastSlide {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @keyframes sparkToastFadeOut {
                to {
                    opacity: 0;
                    transform: translateX(100px);
                }
            }
        `);

        // Create FAB
        function createFAB() {
            const fab = document.createElement('button');
            fab.className = 'spark-fab';
            fab.setAttribute('aria-label', 'Open SPARK Prompt Library');
            fab.setAttribute('title', 'Open SPARK Prompt Library in new tab');
            fab.innerHTML = `
                <span class="spark-fab-icon">⚡</span>
                <span class="spark-fab-badge">2.4K+</span>
            `;

            fab.addEventListener('click', () => {
                const libraryWindow = window.open(SPARK_LIBRARY_URL, '_blank');
                if (libraryWindow) {
                    showToast('📚 SPARK Library opened in new tab!');
                } else {
                    showToast('⚠️ Please allow popups for this site', 'warning');
                }
            });

            return fab;
        }

        // Create reference panel
        function createReferencePanel() {
            const panel = document.createElement('div');
            panel.className = 'spark-reference-panel';
            panel.id = 'spark-reference-panel';
            panel.innerHTML = `
                <div class="spark-reference-panel-header">
                    <div class="spark-reference-panel-title">
                        <span>📖</span>
                        <span>Prompt Reference</span>
                    </div>
                    <button class="spark-reference-panel-close" aria-label="Close reference panel">×</button>
                </div>
                <div class="spark-reference-panel-content" id="spark-reference-content">
                    <p style="text-align:center;color:#999;padding:40px 20px;">
                        Select a prompt from the SPARK library to view guidance here
                    </p>
                </div>
            `;

            panel.querySelector('.spark-reference-panel-close').addEventListener('click', () => {
                panel.classList.remove('active');
            });

            return panel;
        }

        // Show toast notification
        function showToast(message, type = 'success') {
            const toast = document.createElement('div');
            toast.className = 'spark-toast';
            if (type === 'warning') {
                toast.style.background = '#F59E0B';
            }
            toast.textContent = message;
            document.body.appendChild(toast);

            setTimeout(() => toast.remove(), 3000);
        }

        // Insert prompt into Copilot input
        function insertPromptIntoCopilot(promptText) {
            const input = document.querySelector('[role="combobox"]') ||
                          document.querySelector('textarea[placeholder*="Message"]') ||
                          document.querySelector('textarea[placeholder*="Copilot"]');

            if (!input) {
                console.error('SPARK: Could not find Copilot input field');
                showToast('⚠️ Could not find Copilot input field', 'warning');
                return false;
            }

            // Insert the text
            input.textContent = promptText;
            input.value = promptText;

            // Trigger events
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.focus();

            return true;
        }

        // Update reference panel with prompt details
        function updateReferencePanel(promptData) {
            const panel = document.getElementById('spark-reference-panel');
            const content = document.getElementById('spark-reference-content');

            if (!panel || !content) return;

            let html = '';

            // Metadata
            if (promptData.word_count || promptData.department || promptData.complexity) {
                html += `<div class="spark-reference-meta">`;
                if (promptData.word_count) {
                    html += `<div class="spark-reference-meta-item"><strong>${promptData.word_count}</strong> words</div>`;
                }
                if (promptData.department) {
                    html += `<div class="spark-reference-meta-item"><strong>${promptData.department}</strong></div>`;
                }
                if (promptData.complexity) {
                    html += `<div class="spark-reference-meta-item"><strong>${promptData.complexity}</strong></div>`;
                }
                html += `</div>`;
            }

            // What it does
            if (promptData.description) {
                html += `
                    <div class="spark-reference-section">
                        <div class="spark-reference-section-title">⚙️ What This Prompt Does</div>
                        <div class="spark-reference-section-content">
                            <p>${promptData.description}</p>
                        </div>
                    </div>
                `;
            }

            // Tips
            if (promptData.tips && promptData.tips.length > 0) {
                html += `
                    <div class="spark-reference-section">
                        <div class="spark-reference-section-title">💡 Tips</div>
                        <div class="spark-reference-section-content">
                            <ul>
                                ${promptData.tips.map(tip => `<li>${tip}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            }

            // How to use
            if (promptData.how_to_use) {
                html += `
                    <div class="spark-reference-section">
                        <div class="spark-reference-section-title">❓ How To Use</div>
                        <div class="spark-reference-section-content">
                            <p>${promptData.how_to_use}</p>
                        </div>
                    </div>
                `;
            }

            // Example input
            if (promptData.example_input) {
                html += `
                    <div class="spark-reference-section">
                        <div class="spark-reference-section-title">📥 Example Input</div>
                        <div class="spark-reference-section-content">
                            <p style="background:#F5F5F5;padding:12px;border-radius:6px;font-family:monospace;font-size:13px;">${promptData.example_input}</p>
                        </div>
                    </div>
                `;
            }

            content.innerHTML = html || '<p style="text-align:center;color:#999;padding:40px 20px;">No additional guidance available for this prompt</p>';
            panel.classList.add('active');
        }

        // Listen for messages from SPARK library
        window.addEventListener('message', (event) => {
            // Security: verify origin
            if (!event.origin.includes('localhost:3000')) {
                return;
            }

            const { type, promptData } = event.data;

            if (type === 'SPARK_COPY_TO_COPILOT' && promptData) {
                console.log('📨 SPARK: Received prompt from library:', promptData.title);

                // Insert prompt into Copilot
                const success = insertPromptIntoCopilot(promptData.content);

                if (success) {
                    showToast(`✓ "${promptData.title}" inserted into Copilot!`);

                    // Update reference panel with guidance
                    updateReferencePanel(promptData);
                }
            }
        });

        // Initialize when Copilot is ready
        function waitForCopilot() {
            return new Promise((resolve) => {
                if (document.querySelector('[role="combobox"]') || document.querySelector('textarea')) {
                    resolve();
                    return;
                }

                const observer = new MutationObserver((mutations, obs) => {
                    if (document.querySelector('[role="combobox"]') || document.querySelector('textarea')) {
                        obs.disconnect();
                        resolve();
                    }
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });

                setTimeout(() => {
                    observer.disconnect();
                    resolve();
                }, 30000);
            });
        }

        async function initCopilot() {
            console.log('⚡ SPARK: Waiting for Copilot to load...');
            await waitForCopilot();
            console.log('✅ SPARK: Copilot ready, injecting UI...');

            const fab = createFAB();
            const panel = createReferencePanel();

            document.body.appendChild(fab);
            document.body.appendChild(panel);

            console.log('🎉 SPARK: Copilot integration ready! Click ⚡ to open library.');
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initCopilot);
        } else {
            initCopilot();
        }
    }

    // ============================================================================
    // PART 2: SPARK LIBRARY SIDE (Sender)
    // ============================================================================

    if (window.location.href.includes('localhost:3000')) {
        console.log('📚 SPARK Library: Initializing Copilot sender...');

        // Inject styles to enhance "Copy to Copilot" buttons
        GM_addStyle(`
            .copilot-send-button {
                position: relative;
                overflow: visible;
            }

            .copilot-send-button::after {
                content: "Sends to M365 Copilot";
                position: absolute;
                top: -28px;
                left: 50%;
                transform: translateX(-50%);
                background: #6B47DC;
                color: white;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 11px;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s;
            }

            .copilot-send-button:hover::after {
                opacity: 1;
            }
        `);

        // Override "Copy to Copilot" button functionality
        function enhanceCopyButtons() {
            // Find all "Copy to Copilot" buttons
            const buttons = document.querySelectorAll('button');

            buttons.forEach(button => {
                const buttonText = button.textContent.trim();

                if (buttonText === 'Copy to Copilot' || buttonText.includes('Copy to Copilot')) {
                    button.classList.add('copilot-send-button');

                    // Remove existing listeners and add new one
                    const newButton = button.cloneNode(true);
                    button.parentNode.replaceChild(newButton, button);

                    newButton.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();

                        // Get prompt data from the page
                        const promptData = extractPromptData();

                        if (promptData) {
                            // Send to all M365 Copilot tabs
                            if (window.opener && !window.opener.closed) {
                                window.opener.postMessage({
                                    type: 'SPARK_COPY_TO_COPILOT',
                                    promptData: promptData
                                }, '*');

                                // Visual feedback
                                newButton.textContent = '✓ Sent to Copilot!';
                                newButton.style.background = '#10B981';

                                setTimeout(() => {
                                    newButton.textContent = 'Copy to Copilot';
                                    newButton.style.background = '';
                                }, 2000);
                            } else {
                                alert('⚠️ Please open this library from the M365 Copilot ⚡ button');
                            }
                        }
                    });
                }
            });
        }

        // Extract prompt data from the current page
        function extractPromptData() {
            const data = {};

            // Title
            const titleEl = document.querySelector('h1, h2, .prompt-title, [class*="title"]');
            data.title = titleEl ? titleEl.textContent.trim() : 'Untitled Prompt';

            // Content (main prompt text)
            const contentEl = document.querySelector('.prompt-content, [class*="prompt-text"], pre');
            data.content = contentEl ? contentEl.textContent.trim() : '';

            // Description
            const descEl = document.querySelector('.prompt-description, [class*="description"]');
            data.description = descEl ? descEl.textContent.trim() : '';

            // Metadata
            const metaEls = document.querySelectorAll('[class*="meta"], [class*="badge"]');
            metaEls.forEach(el => {
                const text = el.textContent.trim();
                if (text.includes('words')) {
                    data.word_count = text;
                } else if (['Business', 'Marketing', 'Sales', 'SEO', 'Finance', 'Education', 'Writing', 'Productivity', 'Solopreneurs'].includes(text)) {
                    data.department = text;
                } else if (['Beginner', 'Intermediate', 'Advanced'].includes(text)) {
                    data.complexity = text;
                }
            });

            // Tips
            const tipsEls = document.querySelectorAll('[class*="tips"] li, [class*="tip"] li');
            data.tips = Array.from(tipsEls).map(el => el.textContent.trim()).filter(Boolean);

            // How to use
            const howToEl = document.querySelector('[class*="how-to-use"], [class*="instructions"]');
            data.how_to_use = howToEl ? howToEl.textContent.trim() : '';

            // Example input
            const exampleEl = document.querySelector('[class*="example-input"], [class*="example"]');
            data.example_input = exampleEl ? exampleEl.textContent.trim() : '';

            return data;
        }

        // Enhance buttons when page loads
        function init() {
            enhanceCopyButtons();

            // Re-enhance if content changes (SPA navigation)
            const observer = new MutationObserver(() => {
                enhanceCopyButtons();
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            console.log('✅ SPARK Library: Copilot sender ready!');
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }

})();
