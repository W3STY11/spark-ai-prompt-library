// ==UserScript==
// @name         ⚡ SPARK → Copilot DEBUG VERSION
// @namespace    http://tampermonkey.net/
// @version      4.1.0
// @description  DEBUG VERSION - Shows console logs for everything
// @author       SPARK Library
// @match        https://m365.cloud.microsoft/chat*
// @match        https://m365.cloud.microsoft.com/chat*
// @match        https://copilot.microsoft.com/*
// @match        https://c7c817a549a4.ngrok-free.app/*
// @icon         data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">⚡</text></svg>
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    console.log('🔥🔥🔥 SPARK DEBUG SCRIPT LOADED! 🔥🔥🔥');

    const LIBRARY_URL = 'https://c7c817a549a4.ngrok-free.app';
    const BRAND_COLOR = '#6B47DC';

    // Detect page type
    const isCopilotPage = window.location.href.includes('microsoft') || window.location.href.includes('copilot');
    const isLibraryPage = window.location.href.includes('ngrok-free.app');

    console.log('🔍 PAGE TYPE:', isCopilotPage ? 'COPILOT' : isLibraryPage ? 'LIBRARY' : 'UNKNOWN');
    console.log('🌐 URL:', window.location.href);

    // ============================================================================
    // COPILOT PAGE
    // ============================================================================

    if (isCopilotPage) {
        console.log('✅ Running on COPILOT page');

        // Add styles
        GM_addStyle(`
            .spark-fab {
                position: fixed;
                bottom: 24px;
                right: 24px;
                width: 64px;
                height: 64px;
                background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #8B5CF6 100%);
                border: none;
                border-radius: 50%;
                box-shadow: 0 6px 24px rgba(107, 71, 220, 0.5);
                cursor: pointer;
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 38px;
            }
            .spark-toast {
                position: fixed;
                top: 24px;
                right: 24px;
                background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
                z-index: 1000000;
                font-family: "Segoe UI", sans-serif;
                font-size: 15px;
                font-weight: 600;
            }
        `);

        // Create button
        const fab = document.createElement('button');
        fab.className = 'spark-fab';
        fab.innerHTML = '⚡';
        fab.title = 'SPARK Library (DEBUG MODE)';
        fab.onclick = () => {
            console.log('🖱️ Button clicked! Opening library...');
            window.open(LIBRARY_URL + '/browse', '_blank');
        };
        document.body.appendChild(fab);
        console.log('✅ Button added to page!');

        // Listen for BroadcastChannel
        if (typeof BroadcastChannel !== 'undefined') {
            const channel = new BroadcastChannel('spark_copilot');
            console.log('📡 BroadcastChannel created and listening...');

            channel.onmessage = (e) => {
                console.log('🎉🎉🎉 MESSAGE RECEIVED FROM LIBRARY!');
                console.log('📦 Message data:', e.data);

                if (e.data.type === 'INSERT_PROMPT') {
                    console.log('✅ Type is INSERT_PROMPT');
                    console.log('📝 Content:', e.data.content);
                    insertPrompt(e.data.content);
                } else {
                    console.log('❌ Unknown message type:', e.data.type);
                }
            };
        } else {
            console.error('❌ BroadcastChannel NOT SUPPORTED!');
        }

        // Listen for localStorage
        window.addEventListener('storage', (e) => {
            console.log('💾 Storage event detected!');
            console.log('🔑 Key:', e.key);
            console.log('📦 New value:', e.newValue);

            if (e.key === 'spark_prompt_transfer' && e.newValue) {
                try {
                    const data = JSON.parse(e.newValue);
                    console.log('✅ Parsed localStorage data:', data);
                    insertPrompt(data.content);
                } catch (err) {
                    console.error('❌ Failed to parse localStorage:', err);
                }
            }
        });
        console.log('💾 localStorage listener active');

        function insertPrompt(content) {
            console.log('🚀 insertPrompt() called');
            console.log('📝 Content length:', content.length);

            // Try all possible selectors
            const selectors = [
                'textarea[placeholder*="Ask"]',
                'textarea[placeholder*="Message"]',
                'textarea[placeholder*="Copilot"]',
                'div[contenteditable="true"]',
                '[role="textbox"]',
                'textarea',
                'input[type="text"]'
            ];

            console.log('🔍 Trying to find input field...');
            let input = null;

            for (const selector of selectors) {
                const found = document.querySelector(selector);
                if (found) {
                    console.log('✅ FOUND INPUT with selector:', selector);
                    console.log('📋 Element:', found);
                    input = found;
                    break;
                } else {
                    console.log('❌ Not found:', selector);
                }
            }

            if (!input) {
                console.error('❌❌❌ NO INPUT FOUND!');
                showToast('❌ Could not find Copilot input field');

                // Debug: show all textareas and inputs
                console.log('🔍 All textareas on page:', document.querySelectorAll('textarea'));
                console.log('🔍 All inputs on page:', document.querySelectorAll('input'));
                console.log('🔍 All contenteditable:', document.querySelectorAll('[contenteditable="true"]'));
                return;
            }

            console.log('✅ Input field found!');
            console.log('📋 Tag name:', input.tagName);
            console.log('📋 Current value:', input.value || input.textContent);

            // Insert text
            if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
                console.log('✍️ Setting textarea/input value...');
                input.value = content;
            } else {
                console.log('✍️ Setting contenteditable textContent...');
                input.textContent = content;
            }

            // Trigger events
            console.log('⚡ Triggering events...');
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
            input.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', bubbles: true }));

            // Focus
            console.log('🎯 Focusing input...');
            input.focus();

            console.log('✅✅✅ PROMPT INSERTED SUCCESSFULLY!');
            showToast('✅ Prompt inserted! Check the textbox');
        }

        function showToast(message) {
            console.log('🍞 Showing toast:', message);
            const toast = document.createElement('div');
            toast.className = 'spark-toast';
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        console.log('✅ Copilot page setup complete!');
    }

    // ============================================================================
    // LIBRARY PAGE
    // ============================================================================

    if (isLibraryPage) {
        console.log('✅ Running on LIBRARY page');

        // Intercept ALL button clicks
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const buttonText = button.textContent || button.innerText;
            console.log('🖱️ Button clicked:', buttonText);

            if (buttonText.includes('Copy to Copilot')) {
                console.log('🎯 COPY TO COPILOT BUTTON CLICKED!');

                // Get the prompt content - try multiple methods
                let content = '';

                // Method 1: Look for prompt card
                const card = button.closest('[data-prompt-id]') || button.closest('.prompt-card') || button.closest('article');
                if (card) {
                    console.log('✅ Found prompt card');
                    const contentEl = card.querySelector('.prompt-content') || card.querySelector('pre');
                    if (contentEl) {
                        content = contentEl.textContent || contentEl.innerText;
                        console.log('✅ Extracted content from card:', content.substring(0, 100) + '...');
                    }
                }

                // Method 2: Check if there's a data attribute
                if (!content && card?.dataset?.content) {
                    content = card.dataset.content;
                    console.log('✅ Got content from data attribute');
                }

                // For testing, use dummy content if nothing found
                if (!content) {
                    content = 'TEST PROMPT FROM LIBRARY - ' + new Date().toISOString();
                    console.log('⚠️ Using test content:', content);
                }

                console.log('📤 Sending via BroadcastChannel...');
                if (typeof BroadcastChannel !== 'undefined') {
                    const channel = new BroadcastChannel('spark_copilot');
                    channel.postMessage({
                        type: 'INSERT_PROMPT',
                        content: content,
                        timestamp: Date.now()
                    });
                    console.log('✅ BroadcastChannel message sent!');
                    channel.close();
                } else {
                    console.error('❌ BroadcastChannel not supported!');
                }

                console.log('📤 Sending via localStorage...');
                try {
                    localStorage.setItem('spark_prompt_transfer', JSON.stringify({
                        content: content,
                        timestamp: Date.now()
                    }));
                    console.log('✅ localStorage set!');
                    setTimeout(() => {
                        localStorage.removeItem('spark_prompt_transfer');
                        console.log('✅ localStorage cleaned up');
                    }, 100);
                } catch (err) {
                    console.error('❌ localStorage error:', err);
                }

                console.log('🎉 Message sent! Switch to Copilot tab');
            }
        }, true);

        console.log('✅ Library page setup complete!');
    }

    console.log('🔥 SPARK DEBUG SCRIPT FULLY LOADED! 🔥');
})();
