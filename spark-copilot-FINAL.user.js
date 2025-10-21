// ==UserScript==
// @name         ⚡ SPARK → Copilot Integration
// @namespace    http://tampermonkey.net/
// @version      4.0.0
// @description  Draggable SPARK button on Copilot - Opens library in new tab, prompts auto-populate!
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

    const LIBRARY_URL = 'https://c7c817a549a4.ngrok-free.app';
    const BRAND_COLOR = '#6B47DC';
    const GRADIENT_START = '#6B47DC';
    const GRADIENT_END = '#8B5CF6';

    // ============================================================================
    // DETECT PAGE TYPE
    // ============================================================================

    const isCopilotPage = window.location.href.includes('microsoft') || window.location.href.includes('copilot');
    const isLibraryPage = window.location.href.includes('ngrok-free.app');

    console.log('⚡ SPARK: Page detected -', isCopilotPage ? 'Copilot' : isLibraryPage ? 'Library' : 'Unknown');

    // ============================================================================
    // COPILOT PAGE: DRAGGABLE FLOATING BUTTON
    // ============================================================================

    if (isCopilotPage) {
        GM_addStyle(`
            .spark-fab {
                position: fixed;
                bottom: 24px;
                right: 24px;
                width: 64px;
                height: 64px;
                background: linear-gradient(135deg, ${GRADIENT_START} 0%, ${GRADIENT_END} 100%);
                border: none;
                border-radius: 50%;
                box-shadow: 0 6px 24px rgba(107, 71, 220, 0.5), 0 2px 12px rgba(0, 0, 0, 0.15);
                cursor: move;
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                user-select: none;
                touch-action: none;
                font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            }

            .spark-fab:hover {
                transform: scale(1.08) translateY(-2px);
                box-shadow: 0 8px 32px rgba(107, 71, 220, 0.6), 0 4px 16px rgba(0, 0, 0, 0.2);
            }

            .spark-fab:active {
                transform: scale(1.02);
            }

            .spark-fab.dragging {
                cursor: grabbing;
                transform: scale(1.05);
                box-shadow: 0 12px 40px rgba(107, 71, 220, 0.7), 0 6px 20px rgba(0, 0, 0, 0.3);
            }

            .spark-fab-icon {
                font-size: 38px;
                line-height: 1;
                pointer-events: none;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
                animation: sparkPulse 3s ease-in-out infinite;
            }

            @keyframes sparkPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }

            .spark-fab-badge {
                position: absolute;
                top: -6px;
                right: -6px;
                background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
                color: white;
                font-size: 11px;
                font-weight: 700;
                padding: 4px 7px;
                border-radius: 12px;
                font-family: "Segoe UI", sans-serif;
                box-shadow: 0 2px 8px rgba(239, 68, 68, 0.5);
                pointer-events: none;
                letter-spacing: -0.5px;
            }

            .spark-toast {
                position: fixed;
                top: 24px;
                right: 24px;
                background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4), 0 2px 12px rgba(0, 0, 0, 0.2);
                z-index: 1000000;
                font-family: "Segoe UI", sans-serif;
                font-size: 15px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 12px;
                animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1), fadeOut 0.3s ease-out 2.5s forwards;
            }

            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @keyframes fadeOut {
                to {
                    opacity: 0;
                    transform: translateY(-20px);
                }
            }

            .spark-toast-icon {
                font-size: 24px;
                animation: rotate 0.5s ease-out;
            }

            @keyframes rotate {
                from { transform: rotate(-180deg); }
                to { transform: rotate(0deg); }
            }
        `);

        class DraggableFAB {
            constructor() {
                this.fab = null;
                this.isDragging = false;
                this.offset = { x: 0, y: 0 };
                this.startPos = { x: 0, y: 0 };
                this.init();
            }

            init() {
                this.createFAB();
                this.loadPosition();
                this.attachEvents();
                this.listenForPrompts();
                console.log('⚡ SPARK: Draggable FAB initialized!');
            }

            createFAB() {
                this.fab = document.createElement('button');
                this.fab.className = 'spark-fab';
                this.fab.title = 'Click: Open SPARK Library\nDrag: Move button';
                this.fab.innerHTML = `
                    <span class="spark-fab-icon">⚡</span>
                    <span class="spark-fab-badge">2.4K</span>
                `;
                document.body.appendChild(this.fab);
            }

            loadPosition() {
                const saved = GM_getValue('fab_pos', null);
                if (saved) {
                    this.fab.style.bottom = saved.bottom + 'px';
                    this.fab.style.right = saved.right + 'px';
                }
            }

            savePosition() {
                const rect = this.fab.getBoundingClientRect();
                GM_setValue('fab_pos', {
                    bottom: window.innerHeight - rect.bottom,
                    right: window.innerWidth - rect.right
                });
            }

            attachEvents() {
                this.fab.addEventListener('mousedown', this.onMouseDown.bind(this));
                this.fab.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
            }

            onMouseDown(e) {
                if (e.button !== 0) return;
                e.preventDefault();

                const rect = this.fab.getBoundingClientRect();
                this.offset.x = e.clientX - rect.left;
                this.offset.y = e.clientY - rect.top;
                this.startPos.x = e.clientX;
                this.startPos.y = e.clientY;

                this.isDragging = true;
                this.fab.classList.add('dragging');

                document.addEventListener('mousemove', this.boundMouseMove = this.onMouseMove.bind(this));
                document.addEventListener('mouseup', this.boundMouseUp = this.onMouseUp.bind(this));
            }

            onTouchStart(e) {
                const touch = e.touches[0];
                const rect = this.fab.getBoundingClientRect();
                this.offset.x = touch.clientX - rect.left;
                this.offset.y = touch.clientY - rect.top;
                this.startPos.x = touch.clientX;
                this.startPos.y = touch.clientY;

                this.isDragging = true;
                this.fab.classList.add('dragging');

                document.addEventListener('touchmove', this.boundTouchMove = this.onTouchMove.bind(this), { passive: false });
                document.addEventListener('touchend', this.boundTouchEnd = this.onTouchEnd.bind(this));
            }

            onMouseMove(e) {
                if (!this.isDragging) return;
                e.preventDefault();

                const x = e.clientX - this.offset.x;
                const y = e.clientY - this.offset.y;

                const maxX = window.innerWidth - this.fab.offsetWidth;
                const maxY = window.innerHeight - this.fab.offsetHeight;

                this.fab.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
                this.fab.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
                this.fab.style.bottom = 'auto';
                this.fab.style.right = 'auto';
            }

            onTouchMove(e) {
                if (!this.isDragging) return;
                e.preventDefault();

                const touch = e.touches[0];
                const x = touch.clientX - this.offset.x;
                const y = touch.clientY - this.offset.y;

                const maxX = window.innerWidth - this.fab.offsetWidth;
                const maxY = window.innerHeight - this.fab.offsetHeight;

                this.fab.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
                this.fab.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
                this.fab.style.bottom = 'auto';
                this.fab.style.right = 'auto';
            }

            onMouseUp(e) {
                document.removeEventListener('mousemove', this.boundMouseMove);
                document.removeEventListener('mouseup', this.boundMouseUp);

                this.fab.classList.remove('dragging');

                // Check if it was a click (not drag)
                const distance = Math.sqrt(
                    Math.pow(e.clientX - this.startPos.x, 2) +
                    Math.pow(e.clientY - this.startPos.y, 2)
                );

                if (distance < 10) {
                    this.openLibrary();
                } else {
                    this.savePosition();
                }

                this.isDragging = false;
            }

            onTouchEnd(e) {
                document.removeEventListener('touchmove', this.boundTouchMove);
                document.removeEventListener('touchend', this.boundTouchEnd);

                this.fab.classList.remove('dragging');

                const touch = e.changedTouches[0];
                const distance = Math.sqrt(
                    Math.pow(touch.clientX - this.startPos.x, 2) +
                    Math.pow(touch.clientY - this.startPos.y, 2)
                );

                if (distance < 10) {
                    this.openLibrary();
                } else {
                    this.savePosition();
                }

                this.isDragging = false;
            }

            openLibrary() {
                console.log('⚡ SPARK: Opening library in new tab...');
                window.open(LIBRARY_URL + '/browse', '_blank', 'noopener,noreferrer');
                this.showToast('📚 Opening SPARK Library...');
            }

            listenForPrompts() {
                // Listen via BroadcastChannel (primary method)
                if (typeof BroadcastChannel !== 'undefined') {
                    const channel = new BroadcastChannel('spark_copilot');
                    channel.onmessage = (e) => {
                        console.log('⚡ SPARK: Received BroadcastChannel message:', e.data);
                        if (e.data.type === 'INSERT_PROMPT') {
                            this.insertPrompt(e.data.content, e.data.title);
                        }
                    };
                    console.log('⚡ SPARK: BroadcastChannel listener active');
                }

                // Listen via localStorage (fallback method)
                window.addEventListener('storage', (e) => {
                    if (e.key === 'spark_prompt_transfer' && e.newValue) {
                        console.log('⚡ SPARK: Received localStorage message');
                        try {
                            const promptData = JSON.parse(e.newValue);
                            this.insertPrompt(promptData.content, promptData.title);
                        } catch (err) {
                            console.error('⚡ SPARK: Failed to parse localStorage data:', err);
                        }
                    }
                });
                console.log('⚡ SPARK: localStorage listener active');
            }

            insertPrompt(content, title = 'Prompt') {
                console.log('⚡ SPARK: Attempting to insert prompt:', title);

                // Find Copilot input with multiple selectors
                const selectors = [
                    'textarea[placeholder*="Ask"]',
                    'textarea[placeholder*="Message"]',
                    'textarea[placeholder*="Copilot"]',
                    'div[contenteditable="true"]',
                    '[role="textbox"]',
                    'textarea',
                    '.cib-serp-main textarea',
                    'input[type="text"]'
                ];

                let input = null;
                for (const selector of selectors) {
                    input = document.querySelector(selector);
                    if (input) {
                        console.log('⚡ SPARK: Found input with selector:', selector);
                        break;
                    }
                }

                if (!input) {
                    console.error('⚡ SPARK: Could not find input field');
                    this.showToast('⚠️ Could not find Copilot input field', 'error');
                    return;
                }

                // Insert text (handle both textarea and contenteditable)
                if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
                    input.value = content;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                } else {
                    // contenteditable div
                    input.textContent = content;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }

                // Trigger keyboard events to ensure React/Vue/etc detect the change
                input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
                input.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', bubbles: true }));

                // Focus and move cursor to end
                input.focus();
                if (input.setSelectionRange) {
                    input.setSelectionRange(content.length, content.length);
                } else if (input.tagName !== 'TEXTAREA' && input.tagName !== 'INPUT') {
                    // For contenteditable, move cursor to end
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents(input);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }

                console.log('⚡ SPARK: Prompt inserted successfully!');
                this.showToast(`✨ "${title}" inserted! Click send when ready`);
            }

            showToast(message, type = 'success') {
                const toast = document.createElement('div');
                toast.className = 'spark-toast';
                const icon = type === 'error' ? '⚠️' : '⚡';
                toast.innerHTML = `<span class="spark-toast-icon">${icon}</span> ${message}`;

                if (type === 'error') {
                    toast.style.background = 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
                }

                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 3000);
            }
        }

        // Initialize on Copilot page
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                console.log('⚡ SPARK: DOM loaded, initializing FAB...');
                new DraggableFAB();
            });
        } else {
            console.log('⚡ SPARK: Initializing FAB immediately...');
            new DraggableFAB();
        }
    }

    // ============================================================================
    // LIBRARY PAGE: ALREADY HAS BROADCASTCHANNEL SUPPORT BUILT-IN
    // ============================================================================

    if (isLibraryPage) {
        console.log('⚡ SPARK: Library page detected - BroadcastChannel support is built-in!');
        console.log('⚡ SPARK: "Copy to Copilot" buttons will send prompts to Copilot tab automatically');
    }

    console.log('⚡ SPARK: Integration loaded successfully!');
})();
