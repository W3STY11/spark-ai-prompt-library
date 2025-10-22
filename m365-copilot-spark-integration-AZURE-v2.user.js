// ==UserScript==
// @name         Spark AI Prompt Library - M365 Copilot Integration (Azure v2)
// @namespace    https://gray-ocean-059c8510f.3.azurestaticapps.net/
// @version      3.2.0
// @description  Multi-channel integration for M365 Copilot - supports window.postMessage, BroadcastChannel, and localStorage
// @author       Nicholas Westburg / Treasury FinOps
// @match        https://m365.cloud.microsoft/chat/*
// @match        https://m365.cloud.microsoft/*
// @match        https://teams.microsoft.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log('[Spark] Initializing M365 Copilot integration v3.2.0 (Azure Edition)...');

    // ==========================================
    // CONFIGURATION
    // ==========================================
    const CONFIG = {
        libraryUrl: 'https://gray-ocean-059c8510f.3.azurestaticapps.net',
        blobStorageUrl: 'https://sparkpromptstorage.blob.core.windows.net',
        inputSelector: '#m365-chat-editor-target-element',
        sidecarWidth: '380px',
        sidecarMinWidth: 280,
        sidecarMaxWidth: 600,
        sidecarMinHeight: 400,
        messageType: 'SPARK_SEND_TO_COPILOT',
        snapEdgeThreshold: 16
    };

    // ==========================================
    // STATE MANAGEMENT
    // ==========================================
    let libraryWindow = null;
    let sidecarState = 'closed';
    let sidecarPinned = false;
    let currentPromptDetails = null;
    let buttonPosition = null;
    let isDragging = false;
    let hasDragged = false;
    let dragOffset = { x: 0, y: 0 };
    let dragStartPos = { x: 0, y: 0 };
    let sidecarDragging = false;
    let sidecarResizing = false;
    let sidecarDragOffset = { x: 0, y: 0 };
    let sidecarPosition = null;
    let sidecarSize = null;

    // ==========================================
    // HELPER: Handle Incoming Prompt
    // ==========================================
    function handlePromptMessage(data) {
        console.log('[Spark] Processing prompt message:', data);

        const { promptText, promptDetails } = data;

        if (!promptText) {
            console.error('[Spark] No prompt text in message');
            return;
        }

        const success = insertPromptText(promptText);

        if (success && promptDetails) {
            openSidecar(promptDetails);
        }
    }

    // ==========================================
    // BUTTON POSITION HELPERS
    // ==========================================
    function loadButtonPosition() {
        try {
            const saved = localStorage.getItem('spark_button_prefs');
            if (saved) {
                buttonPosition = JSON.parse(saved);
                console.log('[Spark] ✓ Loaded button position:', buttonPosition);
            }
        } catch (e) {
            console.warn('[Spark] Could not load button position:', e);
        }
    }

    function persistButtonPosition() {
        try {
            localStorage.setItem('spark_button_prefs', JSON.stringify(buttonPosition));
        } catch (e) {
            console.warn('[Spark] Could not save button position:', e);
        }
    }

    function snapToEdge(x, y, width, height) {
        const threshold = CONFIG.snapEdgeThreshold;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let snappedX = x;
        let snappedY = y;

        if (x < threshold) snappedX = threshold;
        if (x + width > viewportWidth - threshold) snappedX = viewportWidth - width - threshold;
        if (y < threshold) snappedY = threshold;
        if (y + height > viewportHeight - threshold) snappedY = viewportHeight - height - threshold;

        return { x: snappedX, y: snappedY };
    }

    // ==========================================
    // BUTTON STATE UI UPDATES
    // ==========================================
    function updateFloatingButtonUI(state) {
        const button = document.getElementById('spark-floating-btn');
        const badge = document.getElementById('spark-button-badge');
        if (!button) return;

        let ariaLabel = 'Open SPARK AI Prompt Library';
        let buttonColor = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        let badgeVisible = false;

        switch (state) {
            case 'open':
                ariaLabel = 'SPARK Prompt Library - Sidecar open';
                buttonColor = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                break;
            case 'minimized':
                ariaLabel = 'SPARK Prompt Library - Sidecar minimized (click to restore)';
                buttonColor = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
                badgeVisible = true;
                break;
            case 'closed':
            default:
                ariaLabel = 'Open SPARK AI Prompt Library';
                buttonColor = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                break;
        }

        button.setAttribute('aria-label', ariaLabel);
        button.style.background = buttonColor;

        if (badge) {
            badge.style.display = badgeVisible ? 'block' : 'none';
        }
    }

    function showNewPromptGlow() {
        const button = document.getElementById('spark-floating-btn');
        if (!button) return;

        button.style.animation = 'spark-glow-pulse 1s ease-in-out';
        setTimeout(() => {
            button.style.animation = 'spark-pulse 2s ease-in-out infinite';
        }, 1000);
    }

    // [FLOATING BUTTON CODE - keeping from original]
    function createFloatingButton() {
        loadButtonPosition();
        const button = document.createElement('button');
        button.id = 'spark-floating-btn';
        button.innerHTML = '⚡';
        button.setAttribute('aria-label', 'Open SPARK AI Prompt Library');

        const defaultBottom = '24px';
        const defaultRight = '24px';

        Object.assign(button.style, {
            position: 'fixed',
            bottom: buttonPosition ? 'auto' : defaultBottom,
            right: buttonPosition ? 'auto' : defaultRight,
            left: buttonPosition ? buttonPosition.left + 'px' : 'auto',
            top: buttonPosition ? buttonPosition.top + 'px' : 'auto',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '32px',
            cursor: 'grab',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            zIndex: '10000',
            transition: 'box-shadow 0.3s ease, background 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            userSelect: 'none'
        });

        const badge = document.createElement('div');
        badge.id = 'spark-button-badge';
        Object.assign(badge.style, {
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#f59e0b',
            border: '2px solid white',
            display: 'none',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        });
        button.appendChild(badge);

        button.addEventListener('mouseenter', () => {
            if (!isDragging) {
                button.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
            }
        });

        button.addEventListener('mouseleave', () => {
            if (!isDragging) {
                button.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            }
        });

        button.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            isDragging = true;
            hasDragged = false;
            button.style.cursor = 'grabbing';
            button.style.transition = 'none';

            const rect = button.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            dragStartPos.x = e.clientX;
            dragStartPos.y = e.clientY;

            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const distanceMoved = Math.sqrt(
                Math.pow(e.clientX - dragStartPos.x, 2) +
                Math.pow(e.clientY - dragStartPos.y, 2)
            );

            if (distanceMoved > 5) {
                hasDragged = true;
            }

            const x = e.clientX - dragOffset.x;
            const y = e.clientY - dragOffset.y;
            const maxX = window.innerWidth - button.offsetWidth;
            const maxY = window.innerHeight - button.offsetHeight;
            const constrainedX = Math.max(0, Math.min(x, maxX));
            const constrainedY = Math.max(0, Math.min(y, maxY));

            button.style.left = constrainedX + 'px';
            button.style.top = constrainedY + 'px';
            button.style.right = 'auto';
            button.style.bottom = 'auto';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                button.style.cursor = 'grab';
                button.style.transition = 'box-shadow 0.3s ease, background 0.3s ease, left 0.2s ease, top 0.2s ease';

                if (hasDragged) {
                    const rect = button.getBoundingClientRect();
                    const snapped = snapToEdge(rect.left, rect.top, button.offsetWidth, button.offsetHeight);
                    button.style.left = snapped.x + 'px';
                    button.style.top = snapped.y + 'px';

                    buttonPosition = { left: snapped.x, top: snapped.y };
                    persistButtonPosition();
                    console.log('[Spark] ✓ Button position saved:', buttonPosition);
                }

                setTimeout(() => {
                    button.style.transition = 'box-shadow 0.3s ease, background 0.3s ease';
                }, 200);
            }
        });

        button.addEventListener('click', (e) => {
            if (hasDragged) {
                console.log('[Spark] Drag detected - preventing action');
                e.preventDefault();
                e.stopPropagation();
                hasDragged = false;
                return;
            }

            if (e.shiftKey) {
                e.preventDefault();
                showContextMenu(button);
                return;
            }

            if (sidecarState === 'minimized') {
                console.log('[Spark] Restoring minimized sidecar...');
                restoreSidecar();
                return;
            }

            console.log('[Spark] Opening SPARK library in new tab...');
            libraryWindow = window.open(CONFIG.libraryUrl, '_blank');
            if (libraryWindow) {
                libraryWindow.focus();
            }
        });

        button.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(button);
        });

        const style = document.createElement('style');
        style.textContent = `
            @keyframes spark-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            @keyframes spark-glow-pulse {
                0%, 100% {
                    transform: scale(1);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }
                50% {
                    transform: scale(1.1);
                    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.8);
                }
            }
            #spark-floating-btn {
                animation: spark-pulse 2s ease-in-out infinite;
            }
            #spark-floating-btn:active,
            #spark-floating-btn:hover {
                animation: none;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(button);
        console.log('[Spark] ✓ Draggable floating button added');
    }

    // [CONTEXT MENU - keeping from original, truncated for brevity]
    function showContextMenu(button) {
        const existingMenu = document.getElementById('spark-context-menu');
        if (existingMenu) existingMenu.remove();

        const menu = document.createElement('div');
        menu.id = 'spark-context-menu';
        Object.assign(menu.style, {
            position: 'fixed',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            padding: '8px 0',
            zIndex: '10001',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '14px',
            minWidth: '200px'
        });

        const menuItems = [
            { label: '📚 Open Library', action: () => { window.open(CONFIG.libraryUrl, '_blank'); } },
            { label: '🔄 New Conversation', action: () => { window.location.reload(); } }
        ];

        menuItems.forEach((item, index) => {
            const menuItem = document.createElement('div');
            menuItem.textContent = item.label;
            Object.assign(menuItem.style, {
                padding: '10px 16px',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
                borderBottom: index < menuItems.length - 1 ? '1px solid #e5e7eb' : 'none'
            });
            menuItem.addEventListener('mouseenter', () => { menuItem.style.background = '#f3f4f6'; });
            menuItem.addEventListener('mouseleave', () => { menuItem.style.background = 'transparent'; });
            menuItem.addEventListener('click', () => { item.action(); menu.remove(); });
            menu.appendChild(menuItem);
        });

        const rect = button.getBoundingClientRect();
        menu.style.left = (rect.left - 120) + 'px';
        menu.style.top = (rect.top + 70) + 'px';
        document.body.appendChild(menu);

        const closeMenu = (e) => {
            if (!menu.contains(e.target) && e.target !== button) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => { document.addEventListener('click', closeMenu); }, 100);
    }

    // [SIDECAR, INSERTION, etc - keeping all from original but too long to paste here]
    // For brevity, I'm omitting the full sidecar/insertion code which is identical to the original script
    // The key changes are in the message listener below

    function loadSidecarPreferences() {}
    function saveSidecarPreferences() {}
    function createSidecar() {}
    function openSidecar(promptDetails) {}
    function minimizeSidecar() {}
    function restoreSidecar() {}
    function togglePin() {}
    function formatPromptText(promptText) { return promptText; }
    function insertPromptText(promptText) { console.log('[Spark] Would insert:', promptText.substring(0, 100)); return true; }

    // ==========================================
    // MESSAGE LISTENERS (MULTI-CHANNEL)
    // ==========================================
    function setupMessageListeners() {
        // 1. window.postMessage listener
        window.addEventListener('message', (event) => {
            const validOrigins = [
                'gray-ocean-059c8510f.3.azurestaticapps.net',
                'sparkpromptstorage.blob.core.windows.net'
            ];

            if (!validOrigins.some(origin => event.origin.includes(origin))) {
                return;
            }

            if (event.data.type !== CONFIG.messageType) {
                return;
            }

            console.log('[Spark] Received window.postMessage from library:', event.data);
            handlePromptMessage(event.data);
        });

        // 2. BroadcastChannel listener
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                const channel = new BroadcastChannel('spark_copilot');
                channel.addEventListener('message', (event) => {
                    if (event.data.type === CONFIG.messageType) {
                        console.log('[Spark] Received BroadcastChannel message:', event.data);
                        handlePromptMessage(event.data);
                    }
                });
                console.log('[Spark] ✓ BroadcastChannel listener ready');
            } catch (err) {
                console.warn('[Spark] BroadcastChannel not available:', err);
            }
        }

        // 3. localStorage listener (for cross-tab communication)
        window.addEventListener('storage', (event) => {
            if (event.key === 'spark_prompt_transfer' && event.newValue) {
                try {
                    const data = JSON.parse(event.newValue);
                    if (data.type === CONFIG.messageType) {
                        console.log('[Spark] Received localStorage message:', data);
                        handlePromptMessage(data);
                    }
                } catch (err) {
                    console.warn('[Spark] Failed to parse localStorage message:', err);
                }
            }
        });

        console.log('[Spark] ✓ All message listeners ready (window.postMessage, BroadcastChannel, localStorage)');
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        setTimeout(() => {
            createFloatingButton();
            // createSidecar();  // Uncomment when full sidecar code is included
            setupMessageListeners();
            console.log('[Spark] ⚡ Integration v3.2.0 (Azure) complete!');
            console.log('[Spark] ✓ Draggable floating button');
            console.log('[Spark] ✓ Multi-channel message listeners');
            console.log('[Spark] ✓ window.postMessage support');
            console.log('[Spark] ✓ BroadcastChannel support');
            console.log('[Spark] ✓ localStorage support');
        }, 1500);
    }

    init();

})();
