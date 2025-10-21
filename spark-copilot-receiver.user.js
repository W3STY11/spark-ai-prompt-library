// ==UserScript==
// @name         SPARK Copilot Integration Receiver
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Receives prompts from SPARK Prompt Library and inserts them into M365 Copilot
// @author       SPARK Team
// @match        https://copilot.microsoft.com/*
// @match        https://www.bing.com/chat*
// @match        https://copilot.cloud.microsoft/*
// @match        https://*.microsoft365.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log('[SPARK Copilot] Receiver script loaded');

    // Create floating indicator
    const indicator = document.createElement('div');
    indicator.id = 'spark-indicator';
    indicator.innerHTML = '⚡ SPARK Ready';
    indicator.style.cssText = `
        position: fixed;
        top: 16px;
        right: 16px;
        background: linear-gradient(135deg, #6264A7 0%, #8b5cf6 100%);
        color: white;
        padding: 8px 16px;
        border-radius: 24px;
        font-size: 14px;
        font-weight: 600;
        z-index: 999999;
        box-shadow: 0 4px 12px rgba(98, 100, 167, 0.4);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        opacity: 0.7;
        transition: all 0.3s ease;
        cursor: pointer;
    `;
    document.body.appendChild(indicator);

    indicator.addEventListener('mouseenter', () => {
        indicator.style.opacity = '1';
    });

    indicator.addEventListener('mouseleave', () => {
        indicator.style.opacity = '0.7';
    });

    // Show toast notification
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 70px;
            right: 16px;
            background: ${type === 'success' ? '#10b981' : '#f59e0b'};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 500;
            z-index: 999999;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
        `;
        toast.textContent = message;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in';
            toast.style.transform = 'translateX(400px)';
            toast.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Find Copilot input textarea with retry mechanism
    function findCopilotInput() {
        // Common selectors for M365 Copilot and Bing Chat
        const selectors = [
            'textarea[placeholder*="Ask me anything"]',
            'textarea[placeholder*="chat"]',
            'textarea[aria-label*="chat"]',
            'textarea[aria-label*="message"]',
            'div[contenteditable="true"][role="textbox"]',
            'textarea.cib-serp-main',
            'textarea#searchbox',
            '[data-id="userInput"]',
            'cib-text-input textarea',
            '.input-container textarea',
            '#b_sydConvCont textarea'
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                console.log('[SPARK Copilot] Found input element:', selector);
                return element;
            }
        }

        return null;
    }

    // Insert text into input field
    function insertPrompt(content) {
        let input = findCopilotInput();

        if (!input) {
            console.log('[SPARK Copilot] Input not found, retrying...');
            // Retry after a short delay
            setTimeout(() => {
                input = findCopilotInput();
                if (input) {
                    performInsertion(input, content);
                } else {
                    showToast('⚠️ Could not find Copilot input field. Please try again.', 'warning');
                }
            }, 500);
            return;
        }

        performInsertion(input, content);
    }

    // Perform the actual insertion
    function performInsertion(input, content) {
        console.log('[SPARK Copilot] Inserting prompt into input field');

        // Handle both textarea and contenteditable div
        if (input.tagName === 'TEXTAREA') {
            input.value = content;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (input.isContentEditable) {
            input.textContent = content;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Focus the input
        input.focus();

        // Trigger React/Vue event handlers
        const inputEvent = new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertText',
            data: content
        });
        input.dispatchEvent(inputEvent);

        // Scroll to input
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Visual feedback
        input.style.boxShadow = '0 0 0 3px rgba(98, 100, 167, 0.5)';
        setTimeout(() => {
            input.style.boxShadow = '';
        }, 1000);

        showToast('✅ Prompt inserted successfully! Ready to send to Copilot.');

        // Update indicator
        indicator.innerHTML = '⚡ Prompt Inserted';
        indicator.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        setTimeout(() => {
            indicator.innerHTML = '⚡ SPARK Ready';
            indicator.style.background = 'linear-gradient(135deg, #6264A7 0%, #8b5cf6 100%)';
        }, 3000);
    }

    // Set up BroadcastChannel listener
    if (window.BroadcastChannel) {
        const channel = new BroadcastChannel('spark-copilot');

        channel.onmessage = (event) => {
            console.log('[SPARK Copilot] Received message:', event.data);

            if (event.data.action === 'INSERT_PROMPT' && event.data.content) {
                insertPrompt(event.data.content);
            }
        };

        console.log('[SPARK Copilot] BroadcastChannel listener established');
    } else {
        console.warn('[SPARK Copilot] BroadcastChannel not supported in this browser');
        showToast('⚠️ Cross-tab messaging not supported. Use clipboard instead.', 'warning');
    }

    // Also listen for clipboard paste events as fallback
    document.addEventListener('paste', (e) => {
        // Check if paste event contains SPARK identifier
        const text = e.clipboardData?.getData('text');
        if (text && text.includes('[SPARK Prompt Library]')) {
            console.log('[SPARK Copilot] Detected SPARK prompt paste');
            showToast('✅ SPARK prompt detected from clipboard');
        }
    });

    // Monitor for dynamic content changes (M365 Copilot loads dynamically)
    const observer = new MutationObserver(() => {
        if (!document.querySelector('#spark-indicator')) {
            document.body.appendChild(indicator);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: false
    });

    console.log('[SPARK Copilot] Integration ready - Listening for prompts...');
})();
