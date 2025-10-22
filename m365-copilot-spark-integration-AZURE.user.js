// ==UserScript==
// @name         Spark AI Prompt Library - M365 Copilot Integration (Azure)
// @namespace    https://gray-ocean-059c8510f.3.azurestaticapps.net/
// @version      3.1.0
// @description  Draggable floating button with persistent sidecar (minimize/restore/pin) for M365 Copilot - Azure Edition
// @author       Nicholas Westburg / Treasury FinOps
// @match        https://m365.cloud.microsoft/chat/*
// @match        https://m365.cloud.microsoft/*
// @match        https://teams.microsoft.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log('[Spark] Initializing M365 Copilot integration v3.1.0 (Azure Edition)...');

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
        minimizeToButtonMode: false,
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
    let longPressTimer = null;
    let longPressTriggered = false;

    let sidecarDragging = false;
    let sidecarResizing = false;
    let sidecarDragOffset = { x: 0, y: 0 };
    let sidecarPosition = null;
    let sidecarSize = null;

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

    // ==========================================
    // FLOATING BUTTON (DRAGGABLE + STATE AWARE)
    // ==========================================
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

    // ==========================================
    // CONTEXT MENU FOR BUTTON
    // ==========================================
    function showContextMenu(button) {
        const existingMenu = document.getElementById('spark-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

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
            {
                label: '📚 Open Library',
                action: () => {
                    libraryWindow = window.open(CONFIG.libraryUrl, '_blank');
                    if (libraryWindow) libraryWindow.focus();
                }
            },
            {
                label: sidecarState === 'minimized' ? '👁️ Show Sidecar' : '👁️‍🗨️ Hide Sidecar',
                action: () => {
                    if (sidecarState === 'minimized') {
                        restoreSidecar();
                    } else if (sidecarState === 'open') {
                        minimizeSidecar();
                    }
                }
            },
            {
                label: '🔄 New Conversation',
                action: () => {
                    console.log('[Spark] ✓ Starting new conversation - refreshing page...');
                    window.location.reload();
                }
            },
            {
                label: '📍 Reset Position',
                action: () => {
                    buttonPosition = null;
                    persistButtonPosition();
                    const btn = document.getElementById('spark-floating-btn');
                    if (btn) {
                        btn.style.bottom = '24px';
                        btn.style.right = '24px';
                        btn.style.left = 'auto';
                        btn.style.top = 'auto';
                    }
                    console.log('[Spark] ✓ Button position reset to default');
                }
            },
            {
                label: '🗑️ Clear Saved Preferences',
                action: () => {
                    localStorage.removeItem('spark_button_prefs');
                    localStorage.removeItem('spark_sidecar_prefs');
                    buttonPosition = null;
                    sidecarPosition = null;
                    sidecarSize = null;
                    console.log('[Spark] ✓ All preferences cleared');
                    alert('SPARK preferences cleared! Refresh the page to see defaults.');
                }
            }
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

            menuItem.addEventListener('mouseenter', () => {
                menuItem.style.background = '#f3f4f6';
            });

            menuItem.addEventListener('mouseleave', () => {
                menuItem.style.background = 'transparent';
            });

            menuItem.addEventListener('click', () => {
                item.action();
                menu.remove();
            });

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

        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 100);
    }

    // ==========================================
    // LOCALSTORAGE HELPERS
    // ==========================================
    function loadSidecarPreferences() {
        try {
            const saved = localStorage.getItem('spark_sidecar_prefs');
            if (saved) {
                const prefs = JSON.parse(saved);
                sidecarPosition = prefs.position || null;
                sidecarSize = prefs.size || null;
                console.log('[Spark] ✓ Loaded sidecar preferences:', prefs);
            }
        } catch (e) {
            console.warn('[Spark] Could not load sidecar preferences:', e);
        }
    }

    function saveSidecarPreferences() {
        try {
            const prefs = {
                position: sidecarPosition,
                size: sidecarSize
            };
            localStorage.setItem('spark_sidecar_prefs', JSON.stringify(prefs));
        } catch (e) {
            console.warn('[Spark] Could not save sidecar preferences:', e);
        }
    }

    // ==========================================
    // SIDECAR PANEL (DRAGGABLE & RESIZABLE)
    // ==========================================
    function createSidecar() {
        loadSidecarPreferences();
        const overlay = document.createElement('div');
        overlay.id = 'spark-sidecar-overlay';
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: '9998',
            display: 'none',
            opacity: '0',
            transition: 'opacity 0.3s ease'
        });
        overlay.addEventListener('click', () => {
            if (!sidecarPinned) {
                minimizeSidecar();
            }
        });

        const sidecar = document.createElement('div');
        sidecar.id = 'spark-sidecar';

        const width = sidecarSize?.width || CONFIG.sidecarWidth;
        const height = sidecarSize?.height || '100vh';

        Object.assign(sidecar.style, {
            position: 'fixed',
            top: sidecarPosition?.top || '0',
            left: 'auto',
            right: `-${width}`,
            width: width,
            height: height,
            background: 'white',
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
            zIndex: '9999',
            transition: 'none',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
            borderRadius: '12px 0 0 12px',
            overflow: 'hidden',
            resize: 'none'
        });

        const header = document.createElement('div');
        header.id = 'spark-sidecar-header';
        Object.assign(header.style, {
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            cursor: 'grab',
            userSelect: 'none'
        });

        const headerTitle = document.createElement('div');
        headerTitle.innerHTML = '<strong style="font-size: 20px; font-weight: 700;">⚡ Spark Prompt</strong>';

        const buttonContainer = document.createElement('div');
        Object.assign(buttonContainer.style, {
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
        });

        const pinBtn = document.createElement('button');
        pinBtn.id = 'spark-pin-btn';
        pinBtn.innerHTML = '📌';
        pinBtn.title = 'Pin panel (keeps it open)';
        Object.assign(pinBtn.style, {
            background: 'rgba(255, 255, 255, 0.15)',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '0',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'rotate(0deg)'
        });
        pinBtn.addEventListener('click', togglePin);

        const minimizeBtn = document.createElement('button');
        minimizeBtn.innerHTML = '➖';
        minimizeBtn.title = 'Minimize to tab';
        Object.assign(minimizeBtn.style, {
            background: 'rgba(255, 255, 255, 0.15)',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '0',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            transition: 'background 0.2s ease'
        });
        minimizeBtn.addEventListener('click', minimizeSidecar);

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.title = 'Minimize (Esc)';
        Object.assign(closeBtn.style, {
            background: 'rgba(255, 255, 255, 0.15)',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            transition: 'background 0.2s ease'
        });
        closeBtn.addEventListener('click', minimizeSidecar);

        buttonContainer.appendChild(pinBtn);
        buttonContainer.appendChild(minimizeBtn);
        buttonContainer.appendChild(closeBtn);

        header.appendChild(headerTitle);
        header.appendChild(buttonContainer);

        const content = document.createElement('div');
        content.id = 'spark-sidecar-content';
        Object.assign(content.style, {
            flex: '1',
            padding: '24px',
            overflowY: 'auto',
            fontSize: '14px',
            lineHeight: '1.7',
            color: '#374151'
        });

        sidecar.appendChild(header);
        sidecar.appendChild(content);
        document.body.appendChild(overlay);
        document.body.appendChild(sidecar);

        const minimizedTab = document.createElement('div');
        minimizedTab.id = 'spark-minimized-tab';
        Object.assign(minimizedTab.style, {
            position: 'fixed',
            top: '50%',
            right: '0',
            transform: 'translateY(-50%)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px 14px',
            borderRadius: '12px 0 0 12px',
            boxShadow: '-4px 0 16px rgba(102, 126, 234, 0.3)',
            cursor: 'pointer',
            zIndex: '9997',
            display: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            writingMode: 'vertical-rl',
            fontSize: '14px',
            fontWeight: '600',
            letterSpacing: '0.5px',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
        });
        minimizedTab.innerHTML = '📋 Prompt Details';
        minimizedTab.addEventListener('click', restoreSidecar);
        document.body.appendChild(minimizedTab);

        const resizeHandle = document.createElement('div');
        resizeHandle.id = 'spark-resize-handle';
        Object.assign(resizeHandle.style, {
            position: 'absolute',
            bottom: '0',
            right: '0',
            width: '20px',
            height: '20px',
            cursor: 'nwse-resize',
            zIndex: '10000',
            background: 'linear-gradient(135deg, transparent 0%, transparent 50%, rgba(102, 126, 234, 0.3) 50%)',
            borderRadius: '0 0 0 12px'
        });
        sidecar.appendChild(resizeHandle);

        header.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

            sidecarDragging = true;
            header.style.cursor = 'grabbing';

            const rect = sidecar.getBoundingClientRect();
            sidecarDragOffset.x = e.clientX - rect.left;
            sidecarDragOffset.y = e.clientY - rect.top;

            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (sidecarDragging) {
                const x = e.clientX - sidecarDragOffset.x;
                const y = e.clientY - sidecarDragOffset.y;

                const maxX = window.innerWidth - sidecar.offsetWidth;
                const maxY = window.innerHeight - sidecar.offsetHeight;

                const constrainedX = Math.max(0, Math.min(x, maxX));
                const constrainedY = Math.max(0, Math.min(y, maxY));

                sidecar.style.left = constrainedX + 'px';
                sidecar.style.top = constrainedY + 'px';
                sidecar.style.right = 'auto';
                sidecar.style.bottom = 'auto';

                sidecarPosition = { top: constrainedY + 'px', left: constrainedX + 'px' };
            }

            if (sidecarResizing) {
                const newWidth = Math.max(
                    CONFIG.sidecarMinWidth,
                    Math.min(CONFIG.sidecarMaxWidth, e.clientX - sidecar.getBoundingClientRect().left)
                );
                const newHeight = Math.max(
                    CONFIG.sidecarMinHeight,
                    e.clientY - sidecar.getBoundingClientRect().top
                );

                sidecar.style.width = newWidth + 'px';
                sidecar.style.height = newHeight + 'px';

                sidecarSize = { width: newWidth + 'px', height: newHeight + 'px' };
            }
        });

        document.addEventListener('mouseup', () => {
            if (sidecarDragging || sidecarResizing) {
                sidecarDragging = false;
                sidecarResizing = false;
                header.style.cursor = 'grab';

                saveSidecarPreferences();
            }
        });

        resizeHandle.addEventListener('mousedown', (e) => {
            sidecarResizing = true;
            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidecarState === 'open' && !sidecarPinned) {
                minimizeSidecar();
            }
        });

        console.log('[Spark] ✓ Draggable & resizable sidecar created');
    }

    function openSidecar(promptDetails) {
        currentPromptDetails = promptDetails;
        const overlay = document.getElementById('spark-sidecar-overlay');
        const sidecar = document.getElementById('spark-sidecar');
        const content = document.getElementById('spark-sidecar-content');

        if (!overlay || !sidecar || !content) {
            console.error('[Spark] Sidecar elements not found');
            return;
        }

        let html = `
            <div style="margin-bottom: 24px;">
                <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px;">
                    <span style="font-size: 48px; line-height: 1;">${promptDetails.icon}</span>
                    <div style="flex: 1;">
                        <h2 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 700; color: #111827; line-height: 1.3;">${promptDetails.title}</h2>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            <span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);">${promptDetails.department}</span>
                            ${promptDetails.complexity ? `<span style="background: #f3f4f6; color: #6b7280; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600;">${promptDetails.complexity}</span>` : ''}
                            ${promptDetails.word_count ? `<span style="background: #eff6ff; color: #1e40af; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600;">📝 ${promptDetails.word_count} words</span>` : ''}
                        </div>
                    </div>
                </div>
                ${promptDetails.subcategory ? `
                    <div style="background: #f9fafb; padding: 12px 16px; border-radius: 8px; border-left: 3px solid #667eea; margin-bottom: 16px;">
                        <span style="color: #667eea; font-weight: 600; font-size: 13px;">📂 ${promptDetails.subcategory}</span>
                    </div>
                ` : ''}
                <p style="color: #4b5563; margin: 0; font-size: 15px; line-height: 1.6;">${promptDetails.description}</p>
            </div>
        `;

        if (promptDetails.metadata && promptDetails.metadata.whatItDoes) {
            html += `
                <div style="margin-bottom: 20px; padding: 20px; background: rgba(102, 126, 234, 0.05); border-radius: 12px; border-left: 4px solid #667eea;">
                    <h3 style="margin: 0 0 14px 0; font-size: 16px; font-weight: 700; color: #667eea;">⚙️ What This Prompt Does</h3>
                    <ul style="margin: 0; padding-left: 20px; list-style: disc; color: #4b5563; font-size: 14px; line-height: 1.7;">
                        ${promptDetails.metadata.whatItDoes.split('\\n').filter(line => line.trim()).map(line => `
                            <li style="margin-bottom: 8px;">${line.trim()}</li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        if (promptDetails.tips && promptDetails.tips.length > 0) {
            html += `
                <div style="margin-bottom: 20px; padding: 20px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; border-left: 4px solid #f59e0b;">
                    <h3 style="margin: 0 0 14px 0; font-size: 16px; font-weight: 700; color: #92400e;">💡 Tips</h3>
                    <ul style="margin: 0; padding-left: 20px; list-style: disc; color: #78350f; font-size: 14px; line-height: 1.7;">
                        ${promptDetails.tips.map(tip => `
                            <li style="margin-bottom: 8px;">${tip}</li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        if (promptDetails.metadata && promptDetails.metadata.howToUse) {
            html += `
                <div style="margin-bottom: 20px; padding: 20px; background: rgba(168, 85, 247, 0.05); border-radius: 12px; border-left: 4px solid #a855f7;">
                    <h3 style="margin: 0 0 14px 0; font-size: 16px; font-weight: 700; color: #a855f7;">❓ How To Use This Prompt</h3>
                    <ul style="margin: 0; padding-left: 20px; list-style: disc; color: #4b5563; font-size: 14px; line-height: 1.7;">
                        ${promptDetails.metadata.howToUse.split(/[●•]/).filter(item => item.trim()).map(instruction => `
                            <li style="margin-bottom: 8px;">${instruction.trim()}</li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        if (promptDetails.metadata && promptDetails.metadata.exampleInput) {
            html += `
                <div style="margin-bottom: 20px; padding: 20px; background: rgba(16, 185, 129, 0.05); border-radius: 12px; border-left: 4px solid #10b981;">
                    <h3 style="margin: 0 0 14px 0; font-size: 16px; font-weight: 700; color: #10b981;">📥 Example Input</h3>
                    <div style="color: #4b5563; font-size: 14px; line-height: 1.7;">
                        ${promptDetails.metadata.exampleInput.split(/[●•]/).filter(line => line.trim()).map(line => `
                            <div style="margin-bottom: 8px;">${line.trim()}</div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (promptDetails.images && promptDetails.images.length > 0) {
            console.log('[Spark] 📸 Found', promptDetails.images.length, 'images');
            html += `
                <div style="margin-bottom: 20px; padding: 20px; background: rgba(236, 72, 153, 0.05); border-radius: 12px; border-left: 4px solid #ec4899;">
                    <h3 style="margin: 0 0 14px 0; font-size: 16px; font-weight: 700; color: #ec4899;">📤 Example Output</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
                        ${promptDetails.images.map((img, index) => {
                            const imgUrl = `${CONFIG.blobStorageUrl}/thumbnails/${img}`;
                            return `
                                <div style="position: relative; border-radius: 12px; overflow: hidden; border: 2px solid #ec4899; cursor: pointer; transition: all 0.3s ease; background: white;" onclick="window.open('${imgUrl}', '_blank', 'width=1200,height=800')" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 24px rgba(236, 72, 153, 0.4)'; this.style.zIndex='10';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'; this.style.zIndex='1';">
                                    <img src="${imgUrl}" alt="Example Output ${index + 1}" style="width: 100%; height: 150px; object-fit: cover; display: block;" onerror="this.parentElement.innerHTML='<div style=\\'padding:20px;text-align:center;color:#9f1239;\\'><div style=\\'font-size:32px;margin-bottom:8px;\\'>🖼️</div><div style=\\'font-size:12px;\\'>Image not found</div></div>';">
                                    <div style="padding: 10px; background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%); text-align: center;">
                                        <div style="font-weight: 600; color: #831843; font-size: 12px; margin-bottom: 4px;">Example ${index + 1}</div>
                                        <div style="font-size: 10px; color: #9f1239; opacity: 0.8;">Click to enlarge</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div style="margin-top: 12px; padding: 12px; background: rgba(236, 72, 153, 0.1); border-radius: 8px; font-size: 13px; color: #831843; line-height: 1.6;">
                        <strong>💡 Tip:</strong> Click any image to open full-size in a new window. ${promptDetails.images.length} example output image${promptDetails.images.length > 1 ? 's' : ''} available.
                    </div>
                </div>
            `;
        }

        html += `
            <div style="margin-top: 24px; padding: 16px; background: #d1fae5; border-radius: 10px; border-left: 4px solid #10b981;">
                <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 500;">
                    ✅ Prompt inserted into Copilot! Customize placeholders and send.
                </p>
            </div>
        `;

        content.innerHTML = html;

        overlay.style.display = 'block';

        requestAnimationFrame(() => {
            overlay.style.opacity = '1';

            if (sidecarPosition && sidecarPosition.left) {
                sidecar.style.left = sidecarPosition.left;
                sidecar.style.top = sidecarPosition.top;
                sidecar.style.right = 'auto';
            } else {
                sidecar.style.right = '0';
                sidecar.style.left = 'auto';
                sidecar.style.top = '0';
            }
        });

        sidecarState = 'open';
        updateFloatingButtonUI('open');
        showNewPromptGlow();
        console.log('[Spark] ✓ Sidecar opened:', promptDetails.title);
    }

    function minimizeSidecar() {
        const overlay = document.getElementById('spark-sidecar-overlay');
        const sidecar = document.getElementById('spark-sidecar');
        const minimizedTab = document.getElementById('spark-minimized-tab');
        const pinBtn = document.getElementById('spark-pin-btn');

        if (!overlay || !sidecar || !minimizedTab) return;

        if (sidecarPinned) {
            sidecarPinned = false;
            if (pinBtn) {
                pinBtn.style.background = 'rgba(255, 255, 255, 0.15)';
                pinBtn.style.transform = 'rotate(0deg)';
            }
        }

        const currentWidth = sidecar.offsetWidth;
        sidecar.style.left = window.innerWidth + 'px';
        sidecar.style.right = 'auto';

        overlay.style.opacity = '0';

        setTimeout(() => {
            overlay.style.display = 'none';
            minimizedTab.style.display = 'block';
        }, 300);

        sidecarState = 'minimized';
        updateFloatingButtonUI('minimized');
        console.log('[Spark] ✓ Sidecar minimized to tab');
    }

    function restoreSidecar() {
        if (!currentPromptDetails) {
            console.warn('[Spark] No prompt details to restore');
            return;
        }

        const overlay = document.getElementById('spark-sidecar-overlay');
        const sidecar = document.getElementById('spark-sidecar');
        const minimizedTab = document.getElementById('spark-minimized-tab');

        if (!overlay || !sidecar || !minimizedTab) return;

        minimizedTab.style.display = 'none';
        overlay.style.display = 'block';

        requestAnimationFrame(() => {
            overlay.style.opacity = '1';

            if (sidecarPosition && sidecarPosition.left) {
                sidecar.style.left = sidecarPosition.left;
                sidecar.style.top = sidecarPosition.top;
                sidecar.style.right = 'auto';
            } else {
                sidecar.style.right = '0';
                sidecar.style.left = 'auto';
                sidecar.style.top = '0';
            }
        });

        sidecarState = 'open';
        updateFloatingButtonUI('open');
        console.log('[Spark] ✓ Sidecar restored:', currentPromptDetails.title);
    }

    function togglePin() {
        sidecarPinned = !sidecarPinned;
        const pinBtn = document.getElementById('spark-pin-btn');
        const overlay = document.getElementById('spark-sidecar-overlay');

        if (pinBtn) {
            if (sidecarPinned) {
                if (overlay) {
                    overlay.style.opacity = '0';
                    setTimeout(() => {
                        overlay.style.display = 'none';
                    }, 300);
                }

                pinBtn.style.background = 'rgba(255, 255, 255, 0.3)';
                pinBtn.style.transform = 'rotate(45deg)';
                pinBtn.title = 'Unpin panel';
                console.log('[Spark] ✓ Sidecar pinned - overlay hidden');
            } else {
                if (overlay && sidecarState === 'open') {
                    overlay.style.display = 'block';
                    requestAnimationFrame(() => {
                        overlay.style.opacity = '1';
                    });
                }

                pinBtn.style.background = 'rgba(255, 255, 255, 0.15)';
                pinBtn.style.transform = 'rotate(0deg)';
                pinBtn.title = 'Pin panel (keeps it open)';
                console.log('[Spark] ✓ Sidecar unpinned - overlay visible');
            }
        }
    }

    // ==========================================
    // PROMPT FORMATTING & INSERTION
    // ==========================================
    function formatPromptText(promptText) {
        let formatted = promptText;

        formatted = formatted.replace(/#CONTEXT:/g, '\n\n#CONTEXT:\n');
        formatted = formatted.replace(/#GOAL:/g, '\n\n#GOAL:\n');
        formatted = formatted.replace(/#RESPONSE GUIDELINES:/g, '\n\n#RESPONSE GUIDELINES:\n');
        formatted = formatted.replace(/#INFORMATION ABOUT ME:/g, '\n\n#INFORMATION ABOUT ME:\n');
        formatted = formatted.replace(/#OUTPUT:/g, '\n\n#OUTPUT:\n');
        formatted = formatted.replace(/#CONTEXT #/g, '\n\n#CONTEXT\n');
        formatted = formatted.replace(/#GOAL #/g, '\n\n#GOAL\n');
        formatted = formatted.replace(/([^\n])(\d+\.\s)/g, '$1\n$2');
        formatted = formatted.replace(/([^\n])([\-\*]\s)/g, '$1\n$2');
        formatted = formatted.replace(/\n{4,}/g, '\n\n\n');
        formatted = formatted.trim();

        console.log('[Spark] ✓ Formatted prompt with proper line breaks');
        return formatted;
    }

    function insertPromptText(promptText) {
        const formattedPrompt = formatPromptText(promptText);

        const possibleSelectors = [
            '#m365-chat-editor-target-element',
            '[contenteditable="true"][role="textbox"]',
            '[contenteditable="true"]',
            'div[class*="editor"]',
            'div[class*="input"]'
        ];

        let inputElement = null;
        for (const selector of possibleSelectors) {
            inputElement = document.querySelector(selector);
            if (inputElement) {
                console.log('[Spark] ✓ Found input with selector:', selector);
                break;
            }
        }

        if (!inputElement) {
            console.error('[Spark] ❌ Could not find ANY input element!');
            const allEditable = document.querySelectorAll('[contenteditable="true"]');
            if (allEditable.length > 0) {
                inputElement = allEditable[0];
                console.log('[Spark] Using first contenteditable found:', inputElement);
            } else {
                alert('❌ FAILED: Cannot find Copilot input field!');
                return false;
            }
        }

        try {
            console.log('[Spark] Inserting', formattedPrompt.length, 'characters...');

            inputElement.focus();
            inputElement.click();

            const p = inputElement.querySelector('p') || inputElement;

            p.innerHTML = '';
            p.textContent = '';

            p.textContent = formattedPrompt;
            p.innerText = formattedPrompt;
            p.innerHTML = formattedPrompt.replace(/\n/g, '<br>');

            const lines = formattedPrompt.split('\n');
            lines.forEach((line, index) => {
                const textNode = document.createTextNode(line);
                p.appendChild(textNode);
                if (index < lines.length - 1) {
                    p.appendChild(document.createElement('br'));
                }
            });

            if (p !== inputElement) {
                inputElement.textContent = formattedPrompt;
            }

            const allEvents = [
                new Event('focus', { bubbles: true }),
                new Event('focusin', { bubbles: true }),
                new Event('click', { bubbles: true }),
                new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'insertText', data: formattedPrompt }),
                new InputEvent('input', { bubbles: true, inputType: 'insertText', data: formattedPrompt }),
                new InputEvent('textInput', { bubbles: true, data: formattedPrompt }),
                new Event('change', { bubbles: true }),
                new Event('keydown', { bubbles: true }),
                new Event('keypress', { bubbles: true }),
                new Event('keyup', { bubbles: true }),
                new Event('blur', { bubbles: true })
            ];

            allEvents.forEach(event => {
                try {
                    inputElement.dispatchEvent(event);
                    p.dispatchEvent(event);
                } catch (e) {
                    // Ignore
                }
            });

            try {
                const reactKey = Object.keys(inputElement).find(key =>
                    key.startsWith('__reactProps') ||
                    key.startsWith('__reactFiber') ||
                    key.startsWith('__reactInternalInstance')
                );

                if (reactKey) {
                    const reactInstance = inputElement[reactKey];
                    if (reactInstance && reactInstance.onChange) {
                        reactInstance.onChange({ target: { value: formattedPrompt } });
                    }
                }
            } catch (reactError) {
                console.log('[Spark] React method failed:', reactError);
            }

            try {
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(p);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            } catch (selError) {
                // Ignore
            }

            console.log('[Spark] ✓ Insertion complete');

            setTimeout(() => {
                const currentText = inputElement.innerText || inputElement.textContent || '';
                console.log('[Spark] Current text length:', currentText.length);
                console.log('[Spark] Expected length:', formattedPrompt.length);

                if (currentText.length > 100) {
                    console.log('[Spark] ✅ SUCCESS! TEXT IS IN THE CHATBOX!');
                } else {
                    console.error('[Spark] ❌ FAILED - Text not persisting');
                }
            }, 1000);

            return true;

        } catch (error) {
            console.error('[Spark] ❌ ERROR:', error);
            console.error('[Spark] Stack:', error.stack);
            return false;
        }
    }

    // ==========================================
    // MESSAGE LISTENER
    // ==========================================
    function setupMessageListener() {
        // 1. Listen for window.postMessage (when opened via button)
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

            const { promptText, promptDetails } = event.data;

            if (!promptText) {
                console.error('[Spark] No prompt text in message');
                return;
            }

            const success = insertPromptText(promptText);

            if (success && promptDetails) {
                openSidecar(promptDetails);
            }
        });

        // 2. Listen for BroadcastChannel (fallback for manual navigation)
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                const channel = new BroadcastChannel('spark_copilot');
                channel.addEventListener('message', (event) => {
                    if (event.data.type === CONFIG.messageType) {
                        console.log('[Spark] Received BroadcastChannel message:', event.data);

                        const { promptText, promptDetails } = event.data;

                        if (!promptText) {
                            console.error('[Spark] No prompt text in message');
                            return;
                        }

                        const success = insertPromptText(promptText);

                        if (success && promptDetails) {
                            openSidecar(promptDetails);
                        }
                    }
                });
                console.log('[Spark] ✓ BroadcastChannel listener ready');
            } catch (err) {
                console.warn('[Spark] BroadcastChannel not available:', err);
            }
        }

        // 3. Listen for localStorage changes (additional fallback)
        window.addEventListener('storage', (event) => {
            if (event.key === 'spark_prompt_transfer' && event.newValue) {
                try {
                    const data = JSON.parse(event.newValue);
                    if (data.type === CONFIG.messageType) {
                        console.log('[Spark] Received localStorage message:', data);

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
            createSidecar();
            setupMessageListener();
            console.log('[Spark] ⚡ Integration v3.1.0 (Azure) complete!');
            console.log('[Spark] ✓ Draggable floating button');
            console.log('[Spark] ✓ Draggable & resizable sidecar');
            console.log('[Spark] ✓ Persistent panel (minimize/restore/pin)');
            console.log('[Spark] ✓ Position & size saved to localStorage');
            console.log('[Spark] ✓ Formatted prompts with nuclear insertion');
            console.log('[Spark] ✓ Copilot interaction when pinned');
            console.log('[Spark] ✓ Azure Blob Storage image URLs');
        }, 1500);
    }

    init();

})();
