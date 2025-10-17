import { loadPromptsIndex, getFavorites, truncate } from './main.js';

async function init() {
  const index = await loadPromptsIndex();
  if (!index) {
    showError('Failed to load prompts');
    return;
  }

  const favoriteIds = getFavorites();
  if (favoriteIds.length === 0) {
    showEmpty();
    return;
  }

  const favoritePrompts = index.prompts.filter(p => favoriteIds.includes(p.id));
  renderFavorites(favoritePrompts);
}

function renderFavorites(prompts) {
  const grid = document.getElementById('favoritesGrid');

  grid.innerHTML = prompts.map(prompt => `
    <a href="/view.html?id=${prompt.id}" class="prompt-card group animate-fade-in">
      <div class="flex items-start gap-3 mb-3">
        <span class="text-3xl">${prompt.icon}</span>
        <div class="flex-1 min-w-0">
          <div class="badge badge-primary text-xs mb-2">
            ${prompt.department}
          </div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
            ${prompt.title}
          </h3>
        </div>
      </div>

      <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 text-sm leading-relaxed">
        ${truncate(prompt.description, 150)}
      </p>

      <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span class="text-yellow-500">★</span>
          <span>${prompt.word_count} words</span>
        </div>
        <span class="text-xl text-primary-600 dark:text-primary-400 transform group-hover:translate-x-1 transition-transform">
          →
        </span>
      </div>
    </a>
  `).join('');
}

function showEmpty() {
  document.getElementById('favoritesGrid').innerHTML = '';
  document.getElementById('emptyState').classList.remove('hidden');
}

function showError(message) {
  document.getElementById('favoritesGrid').innerHTML = `
    <div class="col-span-full text-center py-12">
      <div class="text-6xl mb-4">⚠️</div>
      <h3 class="text-2xl font-bold text-red-600 mb-2">Error</h3>
      <p class="text-gray-600 dark:text-gray-400">${message}</p>
    </div>
  `;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
