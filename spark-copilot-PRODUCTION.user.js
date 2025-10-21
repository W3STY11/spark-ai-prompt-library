// ==UserScript==
// @name         SPARK → M365 Copilot Integration (PRODUCTION)
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  Complete integration with ALL 2,425+ prompts, auto-sync, and dual-mode support
// @author       SPARK Library
// @match        https://m365.cloud.microsoft/chat*
// @match        https://www.microsoft365.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      localhost
// @connect      your-spark-domain.com
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // ========================================
    // CONFIGURATION
    // ========================================

    const CONFIG = {
        // Your SPARK library URL (change this in production!)
        LIBRARY_URL: 'http://localhost:3000',
        API_URL: 'http://localhost:3001/api/prompts',

        // Or use the JSON file directly
        JSON_URL: 'http://localhost:3000/prompts_index.json',

        // Auto-refresh settings
        AUTO_REFRESH_INTERVAL: 300000, // 5 minutes

        // Mode selection
        MODE: 'INLINE', // 'INLINE' or 'EXTERNAL' or 'BOTH'

        // Cache settings
        CACHE_KEY: 'spark_prompts_cache',
        CACHE_DURATION: 3600000 // 1 hour
    };

    // ========================================
    // GLOBAL SPARK SYSTEM
    // ========================================

    window.SPARK = window.SPARK || {
        prompts: [],
        mode: CONFIG.MODE,
        loading: false,
        lastUpdate: null,
        autoRefreshTimer: null
    };

    // ========================================
    // LOAD PROMPTS FROM JSON FILE
    // ========================================

    async function loadPromptsFromJSON() {
        console.log('📡 Loading prompts from JSON file...');

        try {
            const response = await fetch(CONFIG.JSON_URL);
            const data = await response.json();

            window.SPARK.prompts = data.prompts || [];
            window.SPARK.meta = data.meta || {};
            window.SPARK.departments = data.departments || [];
            window.SPARK.lastUpdate = new Date();

            // Cache the data
            try {
                GM_setValue(CONFIG.CACHE_KEY, JSON.stringify({
                    prompts: window.SPARK.prompts,
                    meta: window.SPARK.meta,
                    departments: window.SPARK.departments,
                    timestamp: Date.now()
                }));
            } catch (e) {
                console.warn('Failed to cache prompts:', e);
            }

            console.log(`✅ Loaded ${window.SPARK.prompts.length} prompts from JSON`);
            updateUI();

            return true;
        } catch (error) {
            console.error('❌ Failed to load from JSON:', error);
            return loadFromCache();
        }
    }

    // ========================================
    // LOAD FROM CACHE
    // ========================================

    function loadFromCache() {
        try {
            const cached = GM_getValue(CONFIG.CACHE_KEY);
            if (!cached) return false;

            const data = JSON.parse(cached);

            // Check if cache is still valid
            if (Date.now() - data.timestamp > CONFIG.CACHE_DURATION) {
                console.log('⚠️ Cache expired');
                return false;
            }

            window.SPARK.prompts = data.prompts || [];
            window.SPARK.meta = data.meta || {};
            window.SPARK.departments = data.departments || [];
            window.SPARK.lastUpdate = new Date(data.timestamp);

            console.log(`✅ Loaded ${window.SPARK.prompts.length} prompts from cache`);
            updateUI();

            return true;
        } catch (error) {
            console.error('Failed to load from cache:', error);
            return false;
        }
    }

    // ========================================
    // AUTO-REFRESH SYSTEM
    // ========================================

    function startAutoRefresh() {
        if (window.SPARK.autoRefreshTimer) {
            clearInterval(window.SPARK.autoRefreshTimer);
        }

        window.SPARK.autoRefreshTimer = setInterval(async () => {
            console.log('🔄 Auto-refreshing prompt library...');
            await loadPromptsFromJSON();
        }, CONFIG.AUTO_REFRESH_INTERVAL);

        console.log(`✅ Auto-refresh enabled (every ${CONFIG.AUTO_REFRESH_INTERVAL / 60000} minutes)`);
    }

    // ========================================
    // VARIABLE DETECTION
    // ========================================

    window.SPARK.detectVariables = function(content) {
        if (!content) return [];

        const matches = [];
        const patterns = [
            /\[INSERT\s+([^\]]+)\]/g,
            /\[(?!INSERT\s)([^\]]+)\]/g,
            /\{([^\}]+)\}/g,
            /<([^>]+)>/g
        ];

        patterns.forEach(pattern => {
            let match;
            const regex = new RegExp(pattern);
            while ((match = regex.exec(content)) !== null) {
                matches.push({
                    full: match[0],
                    name: match[1],
                    type: pattern.toString()
                });
            }
        });

        // Remove duplicates
        const unique = [];
        const seen = new Set();
        matches.forEach(m => {
            if (!seen.has(m.full)) {
                seen.add(m.full);
                unique.push(m);
            }
        });

        return unique;
    };

    // ========================================
    // INSERTION REQUEST (PLAYWRIGHT BRIDGE)
    // ========================================

    window.SPARK.requestInsertion = function(content) {
        const input = document.querySelector('[role="combobox"]');
        if (!input) {
            console.error('❌ M365 Copilot input not found');
            return false;
        }

        input.setAttribute('data-spark-content-ready', 'true');
        input.setAttribute('data-spark-content', content);
        input.focus();

        console.log('📤 Insertion requested:', content.length, 'chars');
        return true;
    };

    // ========================================
    // FLOATING ACTION BUTTON
    // ========================================

    function createFloatingButton() {
        // Remove existing button
        const existing = document.getElementById('spark-fab');
        if (existing) existing.remove();

        const fab = document.createElement('button');
        fab.id = 'spark-fab';
        fab.innerHTML = `⚡ ${window.SPARK.prompts.length.toLocaleString()}+`;
        fab.title = 'SPARK Prompt Library';

        fab.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #6264A7 0%, #8b5cf6 100%);
            color: white;
            border: none;
            border-radius: 50px;
            padding: 14px 28px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(98, 100, 167, 0.4);
            z-index: 10000;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;

        fab.addEventListener('mouseenter', () => {
            fab.style.transform = 'translateY(-2px)';
            fab.style.boxShadow = '0 6px 30px rgba(98, 100, 167, 0.6)';
        });

        fab.addEventListener('mouseleave', () => {
            fab.style.transform = 'translateY(0)';
            fab.style.boxShadow = '0 4px 20px rgba(98, 100, 167, 0.4)';
        });

        fab.addEventListener('click', () => {
            console.log('🎯 User clicked floating button');

            if (CONFIG.MODE === 'INLINE' || CONFIG.MODE === 'BOTH') {
                window.SPARK.openSearch();
            } else if (CONFIG.MODE === 'EXTERNAL') {
                window.open(CONFIG.LIBRARY_URL, '_blank');
            }
        });

        document.body.appendChild(fab);
        console.log('✅ Floating button created');
    }

    // ========================================
    // INLINE SEARCH PANEL
    // ========================================

    window.SPARK.openSearch = function() {
        const existing = document.getElementById('spark-search-panel');
        if (existing) existing.remove();

        const panel = document.createElement('div');
        panel.id = 'spark-search-panel';
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 700px;
            max-width: 90vw;
            max-height: 80vh;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            z-index: 10001;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        `;

        panel.innerHTML = `
            <div style="padding: 24px; background: linear-gradient(135deg, #6264A7 0%, #8b5cf6 100%); color: white;">
                <h2 style="margin: 0; font-size: 24px; font-weight: 700;">SPARK Prompt Library</h2>
                <p style="margin: 10px 0 0 0; opacity: 0.95; font-size: 15px;">
                    ${window.SPARK.prompts.length.toLocaleString()} professional prompts •
                    ${window.SPARK.departments ? window.SPARK.departments.length : 9} departments
                </p>
            </div>

            <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
                <input
                    id="spark-search-input"
                    type="text"
                    placeholder="Search by title, department, or keyword..."
                    style="width: 100%; padding: 14px 18px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 15px; transition: all 0.2s;"
                >
            </div>

            <div id="spark-results" style="flex: 1; overflow-y: auto; padding: 20px;"></div>

            <div style="padding: 16px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; background: #f9fafb;">
                <span style="font-size: 13px; color: #6b7280;">
                    Last updated: ${window.SPARK.lastUpdate ? window.SPARK.lastUpdate.toLocaleTimeString() : 'Just now'}
                </span>
                <button id="spark-close-panel" style="padding: 10px 20px; background: white; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    Close
                </button>
            </div>
        `;

        document.body.appendChild(panel);

        // Close button
        panel.querySelector('#spark-close-panel').addEventListener('click', () => {
            panel.remove();
        });

        // Search functionality
        const searchInput = panel.querySelector('#spark-search-input');
        const resultsDiv = panel.querySelector('#spark-results');

        function displayPrompts(promptsToShow) {
            resultsDiv.innerHTML = '';

            if (promptsToShow.length === 0) {
                resultsDiv.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 40px;">No prompts found</p>';
                return;
            }

            promptsToShow.slice(0, 100).forEach(prompt => {
                const card = document.createElement('div');
                card.style.cssText = `
                    padding: 18px;
                    margin-bottom: 12px;
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: white;
                `;

                const variables = window.SPARK.detectVariables(prompt.content);

                card.innerHTML = `
                    <div style="font-weight: 700; font-size: 16px; margin-bottom: 6px; color: #111827;">
                        ${prompt.title}
                    </div>
                    <div style="display: flex; gap: 12px; align-items: center; font-size: 13px; color: #6b7280;">
                        <span style="padding: 4px 10px; background: #f3f4f6; border-radius: 6px; font-weight: 600;">
                            ${prompt.department || 'General'}
                        </span>
                        ${variables.length > 0 ? `
                            <span style="color: #8b5cf6;">
                                ${variables.length} variable${variables.length > 1 ? 's' : ''}
                            </span>
                        ` : ''}
                    </div>
                `;

                card.addEventListener('mouseenter', () => {
                    card.style.borderColor = '#6264A7';
                    card.style.boxShadow = '0 4px 12px rgba(98, 100, 167, 0.15)';
                });

                card.addEventListener('mouseleave', () => {
                    card.style.borderColor = '#e5e7eb';
                    card.style.boxShadow = 'none';
                });

                card.addEventListener('click', () => {
                    if (variables.length > 0) {
                        window.SPARK.showCustomization(prompt);
                    } else {
                        window.SPARK.requestInsertion(prompt.content);
                        panel.remove();
                    }
                });

                resultsDiv.appendChild(card);
            });

            if (promptsToShow.length > 100) {
                resultsDiv.innerHTML += `<p style="text-align: center; color: #6b7280; padding: 20px;">Showing first 100 of ${promptsToShow.length} results. Use search to narrow down.</p>`;
            }
        }

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();

            if (!query) {
                displayPrompts(window.SPARK.prompts);
                return;
            }

            const filtered = window.SPARK.prompts.filter(p =>
                p.title.toLowerCase().includes(query) ||
                (p.department && p.department.toLowerCase().includes(query)) ||
                (p.content && p.content.toLowerCase().includes(query))
            );

            displayPrompts(filtered);
        });

        // Initial display
        displayPrompts(window.SPARK.prompts);
        searchInput.focus();
    };

    // ========================================
    // CUSTOMIZATION MODAL
    // ========================================

    window.SPARK.showCustomization = function(prompt) {
        const variables = window.SPARK.detectVariables(prompt.content);

        const existing = document.getElementById('spark-customize-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'spark-customize-modal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 650px;
            max-width: 90vw;
            max-height: 80vh;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            z-index: 10002;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        `;

        modal.innerHTML = `
            <div style="padding: 24px; background: linear-gradient(135deg, #6264A7 0%, #8b5cf6 100%); color: white;">
                <h2 style="margin: 0; font-size: 22px; font-weight: 700;">Customize: ${prompt.title}</h2>
                <p style="margin: 10px 0 0 0; opacity: 0.95; font-size: 14px;">${variables.length} variable${variables.length > 1 ? 's' : ''} detected</p>
            </div>

            <div style="flex: 1; overflow-y: auto; padding: 24px;">
                ${variables.map((v, i) => `
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; font-size: 14px; color: #374151;">
                            ${v.name}
                        </label>
                        <input
                            id="var-${i}"
                            type="text"
                            placeholder="Enter ${v.name.toLowerCase()}"
                            style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 14px; transition: all 0.2s;"
                            onfocus="this.style.borderColor='#6264A7'"
                            onblur="this.style.borderColor='#e5e7eb'"
                        >
                    </div>
                `).join('')}
            </div>

            <div style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; gap: 12px; justify-content: flex-end; background: #f9fafb;">
                <button id="cancel-custom" style="padding: 12px 24px; border: 2px solid #d1d5db; background: white; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s;">
                    Cancel
                </button>
                <button id="insert-custom" style="padding: 12px 32px; border: none; background: linear-gradient(135deg, #6264A7 0%, #8b5cf6 100%); color: white; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 700; transition: all 0.2s; box-shadow: 0 4px 12px rgba(98, 100, 167, 0.3);">
                    Insert Customized Prompt
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        // Cancel button
        modal.querySelector('#cancel-custom').addEventListener('click', () => {
            modal.remove();
        });

        // Insert button
        modal.querySelector('#insert-custom').addEventListener('click', () => {
            let customContent = prompt.content;

            variables.forEach((variable, index) => {
                const input = modal.querySelector(`#var-${index}`);
                const value = input.value.trim();
                if (value) {
                    customContent = customContent.split(variable.full).join(value);
                }
            });

            window.SPARK.requestInsertion(customContent);
            modal.remove();

            const panel = document.getElementById('spark-search-panel');
            if (panel) panel.remove();
        });

        // Focus first input
        setTimeout(() => {
            modal.querySelector('#var-0')?.focus();
        }, 100);
    };

    // ========================================
    // UPDATE UI
    // ========================================

    function updateUI() {
        // Update floating button count
        const fab = document.getElementById('spark-fab');
        if (fab) {
            fab.innerHTML = `⚡ ${window.SPARK.prompts.length.toLocaleString()}+`;
        }

        // Update any open panels
        const panel = document.getElementById('spark-search-panel');
        if (panel) {
            const header = panel.querySelector('p');
            if (header) {
                header.textContent = `${window.SPARK.prompts.length.toLocaleString()} professional prompts • ${window.SPARK.departments ? window.SPARK.departments.length : 9} departments`;
            }
        }
    }

    // ========================================
    // INITIALIZATION
    // ========================================

    async function initialize() {
        console.log('🚀 SPARK → M365 Copilot Integration (PRODUCTION) v2.0.0');
        console.log('📍 Page:', window.location.href);

        // Wait for page to be ready
        await new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });

        // Additional delay for M365 Copilot to fully load
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Try cache first, then load from JSON
        const cacheLoaded = loadFromCache();

        if (!cacheLoaded) {
            await loadPromptsFromJSON();
        } else {
            // Refresh in background
            setTimeout(loadPromptsFromJSON, 1000);
        }

        // Create UI
        createFloatingButton();

        // Start auto-refresh
        startAutoRefresh();

        console.log('✅ SPARK integration ready!');
        console.log(`📊 ${window.SPARK.prompts.length} prompts loaded`);
        console.log(`🔄 Auto-refresh: Every ${CONFIG.AUTO_REFRESH_INTERVAL / 60000} minutes`);
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
