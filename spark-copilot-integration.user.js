// ==UserScript==
// @name         SPARK Prompt Library - M365 Copilot Integration
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Premium floating integration for SPARK Prompt Library inside Microsoft 365 Copilot
// @author       SPARK Library
// @match        https://m365.cloud.microsoft/chat*
// @match        https://m365.cloud.microsoft.com/chat*
// @icon         data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">⚡</text></svg>
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      localhost
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // ============================================================================
    // CONFIGURATION
    // ============================================================================

    const CONFIG = {
        API_BASE_URL: 'http://localhost:3001',
        DRAWER_WIDTH: 420,
        ANIMATION_DURATION: 350,
        SEARCH_DEBOUNCE: 200,
        FAB_SIZE: 56,
        FAB_POSITION: { bottom: 24, right: 24 },
        BRAND_COLOR: '#6B47DC',
        MAX_RECENT_PROMPTS: 10,
        VIRTUAL_SCROLL_BUFFER: 30
    };

    // ============================================================================
    // STYLES
    // ============================================================================

    GM_addStyle(`
        /* FAB (Floating Action Button) */
        .spark-fab {
            position: fixed;
            bottom: ${CONFIG.FAB_POSITION.bottom}px;
            right: ${CONFIG.FAB_POSITION.right}px;
            width: ${CONFIG.FAB_SIZE}px;
            height: ${CONFIG.FAB_SIZE}px;
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
            animation: fabFadeIn 0.5s ease-out 0.5s forwards;
        }

        @keyframes fabFadeIn {
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        .spark-fab:hover {
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
            transform: translateY(-2px);
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
            background: ${CONFIG.BRAND_COLOR};
            color: white;
            font-size: 10px;
            font-weight: 600;
            padding: 2px 6px;
            border-radius: 10px;
            font-family: "Segoe UI", sans-serif;
        }

        /* Backdrop */
        .spark-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.2);
            z-index: 9998;
            opacity: 0;
            transition: opacity ${CONFIG.ANIMATION_DURATION}ms ease-out;
            pointer-events: none;
        }

        .spark-backdrop.active {
            opacity: 1;
            pointer-events: auto;
        }

        /* Drawer */
        .spark-drawer {
            position: fixed;
            top: 0;
            right: 0;
            width: ${CONFIG.DRAWER_WIDTH}px;
            height: 100vh;
            background: #FFFFFF;
            box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            transform: translateX(100%);
            transition: transform ${CONFIG.ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1);
            font-family: "Segoe UI", "Segoe UI Web (West European)", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;
        }

        .spark-drawer.active {
            transform: translateX(0);
        }

        /* Drawer Header */
        .spark-drawer-header {
            padding: 20px;
            border-bottom: 1px solid #E0E0E0;
            background: #FFFFFF;
            flex-shrink: 0;
        }

        .spark-drawer-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
        }

        .spark-drawer-title h2 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #242424;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .spark-drawer-close {
            width: 32px;
            height: 32px;
            border: none;
            background: transparent;
            cursor: pointer;
            border-radius: 6px;
            font-size: 20px;
            color: #616161;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .spark-drawer-close:hover {
            background: #F5F5F5;
        }

        /* Search Bar */
        .spark-search-bar {
            position: relative;
        }

        .spark-search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #616161;
            font-size: 16px;
        }

        .spark-search-input {
            width: 100%;
            padding: 10px 12px 10px 40px;
            border: 1px solid #D1D1D1;
            border-radius: 6px;
            font-size: 14px;
            font-family: inherit;
            outline: none;
            transition: all 0.2s;
        }

        .spark-search-input:focus {
            border-color: ${CONFIG.BRAND_COLOR};
            box-shadow: 0 0 0 2px rgba(107, 71, 220, 0.1);
        }

        .spark-search-input::placeholder {
            color: #999;
        }

        /* Quick Filters */
        .spark-quick-filters {
            display: flex;
            gap: 8px;
            overflow-x: auto;
            padding: 16px 20px;
            border-bottom: 1px solid #E0E0E0;
            scrollbar-width: none;
            -ms-overflow-style: none;
            flex-shrink: 0;
        }

        .spark-quick-filters::-webkit-scrollbar {
            display: none;
        }

        .spark-filter-chip {
            padding: 6px 14px;
            border: 1px solid #D1D1D1;
            border-radius: 16px;
            background: #FFFFFF;
            font-size: 13px;
            font-weight: 500;
            color: #424242;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.2s;
            user-select: none;
        }

        .spark-filter-chip:hover {
            background: #F5F3FF;
            border-color: ${CONFIG.BRAND_COLOR};
        }

        .spark-filter-chip.active {
            background: ${CONFIG.BRAND_COLOR};
            border-color: ${CONFIG.BRAND_COLOR};
            color: #FFFFFF;
        }

        .spark-filter-chip-count {
            opacity: 0.7;
            font-size: 12px;
        }

        /* Content Area */
        .spark-drawer-content {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
        }

        .spark-drawer-content::-webkit-scrollbar {
            width: 8px;
        }

        .spark-drawer-content::-webkit-scrollbar-track {
            background: transparent;
        }

        .spark-drawer-content::-webkit-scrollbar-thumb {
            background: #D1D1D1;
            border-radius: 4px;
        }

        .spark-drawer-content::-webkit-scrollbar-thumb:hover {
            background: #999;
        }

        /* Section Headers */
        .spark-section {
            padding: 16px 20px 8px;
        }

        .spark-section-header {
            font-size: 12px;
            font-weight: 600;
            color: #616161;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        /* Prompt Cards */
        .spark-prompt-card {
            margin: 0 20px 12px;
            padding: 14px;
            border: 1px solid #E0E0E0;
            border-radius: 12px;
            background: #FFFFFF;
            cursor: pointer;
            transition: all 0.2s;
        }

        .spark-prompt-card:hover {
            background: #F5F3FF;
            border-color: ${CONFIG.BRAND_COLOR};
            transform: translateX(-2px);
            box-shadow: 0 2px 8px rgba(107, 71, 220, 0.1);
        }

        .spark-prompt-card:active {
            transform: scale(0.98);
        }

        .spark-prompt-card-header {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 8px;
        }

        .spark-prompt-icon {
            font-size: 20px;
            line-height: 1;
            flex-shrink: 0;
        }

        .spark-prompt-card-content {
            flex: 1;
            min-width: 0;
        }

        .spark-prompt-title {
            font-size: 14px;
            font-weight: 600;
            color: #242424;
            margin: 0 0 4px;
            line-height: 1.4;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }

        .spark-prompt-meta {
            font-size: 12px;
            color: #616161;
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
        }

        .spark-prompt-meta-item {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .spark-prompt-meta-dot {
            width: 3px;
            height: 3px;
            background: #999;
            border-radius: 50%;
        }

        /* Loading State */
        .spark-loading {
            padding: 40px 20px;
            text-align: center;
            color: #616161;
        }

        .spark-loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #E0E0E0;
            border-top-color: ${CONFIG.BRAND_COLOR};
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Empty State */
        .spark-empty {
            padding: 60px 20px;
            text-align: center;
            color: #616161;
        }

        .spark-empty-icon {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.3;
        }

        .spark-empty-text {
            font-size: 14px;
            line-height: 1.6;
        }

        /* Toast Notifications */
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
            opacity: 0;
            transform: translateX(100px);
            animation: slideInRight 0.3s ease-out forwards, fadeOut 0.3s ease-out 2.5s forwards;
        }

        @keyframes slideInRight {
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes fadeOut {
            to {
                opacity: 0;
                transform: translateX(100px);
            }
        }

        /* Utility Classes */
        .spark-hidden {
            display: none !important;
        }

        /* Keyboard Focus Styles */
        .spark-fab:focus-visible,
        .spark-drawer-close:focus-visible,
        .spark-filter-chip:focus-visible,
        .spark-prompt-card:focus-visible {
            outline: 2px solid ${CONFIG.BRAND_COLOR};
            outline-offset: 2px;
        }
    `);

    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================

    const state = {
        isDrawerOpen: false,
        allPrompts: [],
        filteredPrompts: [],
        recentPrompts: [],
        searchQuery: '',
        activeFilter: 'all',
        isLoading: false
    };

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showToast(message, icon = '✓') {
        const toast = document.createElement('div');
        toast.className = 'spark-toast';
        toast.innerHTML = `<span style="font-size: 18px;">${icon}</span> ${escapeHtml(message)}`;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }

    function saveRecentPrompt(promptId) {
        let recent = GM_getValue('spark_recent_prompts', []);
        recent = [promptId, ...recent.filter(id => id !== promptId)];
        recent = recent.slice(0, CONFIG.MAX_RECENT_PROMPTS);
        GM_setValue('spark_recent_prompts', recent);
        loadRecentPrompts();
    }

    function loadRecentPrompts() {
        const recentIds = GM_getValue('spark_recent_prompts', []);
        state.recentPrompts = state.allPrompts.filter(p => recentIds.includes(p.id));
    }

    // ============================================================================
    // API INTEGRATION
    // ============================================================================

    async function fetchPrompts() {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: `${CONFIG.API_BASE_URL}/api/prompts`,
                onload: (response) => {
                    try {
                        const data = JSON.parse(response.responseText);
                        resolve(data.prompts || []);
                    } catch (error) {
                        console.error('SPARK: Failed to parse prompts', error);
                        reject(error);
                    }
                },
                onerror: (error) => {
                    console.error('SPARK: Failed to fetch prompts', error);
                    reject(error);
                }
            });
        });
    }

    // ============================================================================
    // COPILOT INTEGRATION
    // ============================================================================

    function insertPromptIntoCopilot(promptText) {
        // Find the Copilot input field
        const input = document.querySelector('[role="combobox"]') ||
                      document.querySelector('textarea[placeholder*="Message"]') ||
                      document.querySelector('textarea[placeholder*="Copilot"]');

        if (!input) {
            console.error('SPARK: Could not find Copilot input field');
            showToast('Could not find input field', '⚠️');
            return false;
        }

        // Insert the text
        input.value = promptText;

        // Trigger input event to notify Copilot
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));

        // Focus the input
        input.focus();

        return true;
    }

    // ============================================================================
    // UI COMPONENTS
    // ============================================================================

    function createFAB() {
        const fab = document.createElement('button');
        fab.className = 'spark-fab';
        fab.setAttribute('aria-label', 'Open SPARK Prompt Library');
        fab.setAttribute('title', 'Open SPARK Prompt Library (⌘K)');

        fab.innerHTML = `
            <span class="spark-fab-icon">⚡</span>
            <span class="spark-fab-badge">2.4K+</span>
        `;

        fab.addEventListener('click', toggleDrawer);

        return fab;
    }

    function createBackdrop() {
        const backdrop = document.createElement('div');
        backdrop.className = 'spark-backdrop';
        backdrop.addEventListener('click', closeDrawer);
        return backdrop;
    }

    function createDrawer() {
        const drawer = document.createElement('div');
        drawer.className = 'spark-drawer';

        drawer.innerHTML = `
            <div class="spark-drawer-header">
                <div class="spark-drawer-title">
                    <h2>
                        <span>⚡</span>
                        <span>SPARK Library</span>
                    </h2>
                    <button class="spark-drawer-close" aria-label="Close drawer">×</button>
                </div>
                <div class="spark-search-bar">
                    <span class="spark-search-icon">🔍</span>
                    <input
                        type="text"
                        class="spark-search-input"
                        placeholder="Search 2,425 prompts..."
                        aria-label="Search prompts"
                    />
                </div>
            </div>
            <div class="spark-quick-filters"></div>
            <div class="spark-drawer-content"></div>
        `;

        // Event listeners
        drawer.querySelector('.spark-drawer-close').addEventListener('click', closeDrawer);
        drawer.querySelector('.spark-search-input').addEventListener('input', handleSearch);

        return drawer;
    }

    function renderQuickFilters() {
        const container = document.querySelector('.spark-quick-filters');
        if (!container) return;

        const departments = [
            { id: 'all', name: 'All', icon: '✨', count: state.allPrompts.length },
            { id: 'Business', name: 'Business', icon: '💼', count: state.allPrompts.filter(p => p.department === 'Business').length },
            { id: 'Marketing', name: 'Marketing', icon: '📢', count: state.allPrompts.filter(p => p.department === 'Marketing').length },
            { id: 'Sales', name: 'Sales', icon: '💰', count: state.allPrompts.filter(p => p.department === 'Sales').length },
            { id: 'Productivity', name: 'Productivity', icon: '⚡', count: state.allPrompts.filter(p => p.department === 'Productivity').length },
            { id: 'Writing', name: 'Writing', icon: '✍️', count: state.allPrompts.filter(p => p.department === 'Writing').length },
        ];

        container.innerHTML = departments.map(dept => `
            <button
                class="spark-filter-chip ${state.activeFilter === dept.id ? 'active' : ''}"
                data-filter="${dept.id}"
                aria-pressed="${state.activeFilter === dept.id}"
            >
                <span>${dept.icon}</span>
                <span>${dept.name}</span>
                <span class="spark-filter-chip-count">(${dept.count})</span>
            </button>
        `).join('');

        // Add click handlers
        container.querySelectorAll('.spark-filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                state.activeFilter = chip.dataset.filter;
                filterPrompts();
                renderQuickFilters();
            });
        });
    }

    function renderContent() {
        const container = document.querySelector('.spark-drawer-content');
        if (!container) return;

        if (state.isLoading) {
            container.innerHTML = `
                <div class="spark-loading">
                    <div class="spark-loading-spinner"></div>
                    <div>Loading prompts...</div>
                </div>
            `;
            return;
        }

        if (state.filteredPrompts.length === 0) {
            const emptyMessage = state.searchQuery
                ? `No prompts found for "${state.searchQuery}"`
                : 'No prompts found';

            container.innerHTML = `
                <div class="spark-empty">
                    <div class="spark-empty-icon">🔍</div>
                    <div class="spark-empty-text">${emptyMessage}<br>Try a different search or filter</div>
                </div>
            `;
            return;
        }

        let html = '';

        // Recent prompts section
        if (state.recentPrompts.length > 0 && state.activeFilter === 'all' && !state.searchQuery) {
            html += `
                <div class="spark-section">
                    <div class="spark-section-header">
                        <span>⚡</span>
                        <span>Recent Prompts</span>
                    </div>
                </div>
            `;
            state.recentPrompts.slice(0, 5).forEach(prompt => {
                html += renderPromptCard(prompt);
            });
        }

        // All prompts section
        const sectionTitle = state.searchQuery
            ? `Search Results (${state.filteredPrompts.length})`
            : state.activeFilter === 'all'
                ? 'All Prompts'
                : `${state.activeFilter} Prompts`;

        html += `
            <div class="spark-section">
                <div class="spark-section-header">
                    <span>📁</span>
                    <span>${sectionTitle}</span>
                </div>
            </div>
        `;

        // Render prompts (with virtual scrolling for performance)
        const visiblePrompts = state.filteredPrompts.slice(0, CONFIG.VIRTUAL_SCROLL_BUFFER);
        visiblePrompts.forEach(prompt => {
            html += renderPromptCard(prompt);
        });

        container.innerHTML = html;

        // Add click handlers to prompt cards
        container.querySelectorAll('.spark-prompt-card').forEach(card => {
            card.addEventListener('click', () => {
                const promptId = card.dataset.promptId;
                const prompt = state.allPrompts.find(p => p.id === promptId);
                if (prompt) {
                    handlePromptClick(prompt);
                }
            });
        });

        // Implement lazy loading for remaining prompts
        if (state.filteredPrompts.length > CONFIG.VIRTUAL_SCROLL_BUFFER) {
            implementLazyLoading(container);
        }
    }

    function renderPromptCard(prompt) {
        const departmentIcons = {
            'Business': '💼',
            'Marketing': '📢',
            'Sales': '💰',
            'SEO': '🔍',
            'Finance': '💵',
            'Education': '📚',
            'Writing': '✍️',
            'Productivity': '⚡',
            'Solopreneurs': '🚀'
        };

        const icon = departmentIcons[prompt.department] || '📄';
        const wordCount = prompt.word_count || 0;
        const complexity = prompt.complexity || 'Intermediate';

        return `
            <div class="spark-prompt-card" data-prompt-id="${prompt.id}" tabindex="0">
                <div class="spark-prompt-card-header">
                    <span class="spark-prompt-icon">${icon}</span>
                    <div class="spark-prompt-card-content">
                        <h3 class="spark-prompt-title">${escapeHtml(prompt.title)}</h3>
                        <div class="spark-prompt-meta">
                            <span class="spark-prompt-meta-item">${wordCount} words</span>
                            <span class="spark-prompt-meta-dot"></span>
                            <span class="spark-prompt-meta-item">${escapeHtml(prompt.department)}</span>
                            <span class="spark-prompt-meta-dot"></span>
                            <span class="spark-prompt-meta-item">${escapeHtml(complexity)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function implementLazyLoading(container) {
        let currentIndex = CONFIG.VIRTUAL_SCROLL_BUFFER;
        let isLoading = false;

        container.addEventListener('scroll', () => {
            if (isLoading) return;

            const scrollHeight = container.scrollHeight;
            const scrollTop = container.scrollTop;
            const clientHeight = container.clientHeight;

            if (scrollTop + clientHeight >= scrollHeight - 200) {
                isLoading = true;

                const nextBatch = state.filteredPrompts.slice(currentIndex, currentIndex + 20);
                if (nextBatch.length > 0) {
                    const fragment = document.createElement('div');
                    nextBatch.forEach(prompt => {
                        fragment.innerHTML += renderPromptCard(prompt);
                    });

                    container.appendChild(fragment);
                    currentIndex += 20;

                    // Add click handlers to new cards
                    container.querySelectorAll('.spark-prompt-card').forEach(card => {
                        if (!card.hasAttribute('data-click-handler')) {
                            card.setAttribute('data-click-handler', 'true');
                            card.addEventListener('click', () => {
                                const promptId = card.dataset.promptId;
                                const prompt = state.allPrompts.find(p => p.id === promptId);
                                if (prompt) {
                                    handlePromptClick(prompt);
                                }
                            });
                        }
                    });
                }

                setTimeout(() => { isLoading = false; }, 100);
            }
        });
    }

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    function toggleDrawer() {
        if (state.isDrawerOpen) {
            closeDrawer();
        } else {
            openDrawer();
        }
    }

    function openDrawer() {
        state.isDrawerOpen = true;
        const drawer = document.querySelector('.spark-drawer');
        const backdrop = document.querySelector('.spark-backdrop');

        if (drawer) drawer.classList.add('active');
        if (backdrop) backdrop.classList.add('active');

        // Focus search input
        setTimeout(() => {
            const searchInput = document.querySelector('.spark-search-input');
            if (searchInput) searchInput.focus();
        }, 400);

        // Load prompts if not already loaded
        if (state.allPrompts.length === 0) {
            loadPrompts();
        }
    }

    function closeDrawer() {
        state.isDrawerOpen = false;
        const drawer = document.querySelector('.spark-drawer');
        const backdrop = document.querySelector('.spark-backdrop');

        if (drawer) drawer.classList.remove('active');
        if (backdrop) backdrop.classList.remove('active');
    }

    const handleSearch = debounce((event) => {
        state.searchQuery = event.target.value.toLowerCase().trim();
        filterPrompts();
    }, CONFIG.SEARCH_DEBOUNCE);

    function filterPrompts() {
        let filtered = state.allPrompts;

        // Apply department filter
        if (state.activeFilter !== 'all') {
            filtered = filtered.filter(p => p.department === state.activeFilter);
        }

        // Apply search filter
        if (state.searchQuery) {
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(state.searchQuery) ||
                (p.description && p.description.toLowerCase().includes(state.searchQuery)) ||
                (p.department && p.department.toLowerCase().includes(state.searchQuery)) ||
                (p.tags && p.tags.some(tag => tag.toLowerCase().includes(state.searchQuery)))
            );
        }

        state.filteredPrompts = filtered;
        renderContent();
    }

    function handlePromptClick(prompt) {
        const success = insertPromptIntoCopilot(prompt.content);

        if (success) {
            showToast('Prompt inserted! ✨');
            saveRecentPrompt(prompt.id);
            closeDrawer();
        } else {
            showToast('Failed to insert prompt', '⚠️');
        }
    }

    async function loadPrompts() {
        state.isLoading = true;
        renderContent();

        try {
            const prompts = await fetchPrompts();
            state.allPrompts = prompts;
            state.filteredPrompts = prompts;
            loadRecentPrompts();

            state.isLoading = false;
            renderQuickFilters();
            renderContent();

            console.log(`SPARK: Loaded ${prompts.length} prompts`);
        } catch (error) {
            state.isLoading = false;
            console.error('SPARK: Failed to load prompts', error);

            const container = document.querySelector('.spark-drawer-content');
            if (container) {
                container.innerHTML = `
                    <div class="spark-empty">
                        <div class="spark-empty-icon">⚠️</div>
                        <div class="spark-empty-text">
                            Failed to load prompts<br>
                            Make sure SPARK API is running on localhost:3001
                        </div>
                    </div>
                `;
            }
        }
    }

    // ============================================================================
    // KEYBOARD SHORTCUTS
    // ============================================================================

    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ⌘K or Ctrl+K to toggle drawer
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                toggleDrawer();
            }

            // Escape to close drawer
            if (e.key === 'Escape' && state.isDrawerOpen) {
                closeDrawer();
            }
        });
    }

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    function waitForCopilot() {
        return new Promise((resolve) => {
            // Check if already loaded
            if (document.querySelector('[role="combobox"]') || document.querySelector('textarea')) {
                resolve();
                return;
            }

            // Use MutationObserver to wait for Copilot to load
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

            // Timeout after 30 seconds
            setTimeout(() => {
                observer.disconnect();
                resolve();
            }, 30000);
        });
    }

    async function init() {
        console.log('SPARK: Initializing integration...');

        // Wait for Copilot to be ready
        await waitForCopilot();

        console.log('SPARK: Copilot detected, injecting UI...');

        // Create and inject UI components
        const fab = createFAB();
        const backdrop = createBackdrop();
        const drawer = createDrawer();

        document.body.appendChild(fab);
        document.body.appendChild(backdrop);
        document.body.appendChild(drawer);

        // Setup keyboard shortcuts
        setupKeyboardShortcuts();

        console.log('SPARK: Integration ready! Press ⌘K or click the ⚡ button to open.');
    }

    // Start the integration
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
