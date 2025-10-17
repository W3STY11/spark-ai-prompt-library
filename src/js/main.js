// Global utilities and state management

// Dark mode management
export function initDarkMode() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (!darkModeToggle) return;

  // Check for saved preference or default to light mode
  const isDark = localStorage.getItem('darkMode') === 'true';
  if (isDark) {
    document.documentElement.classList.add('dark');
  }

  darkModeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDarkNow = document.documentElement.classList.contains('dark');
    localStorage.setItem('darkMode', isDarkNow);
  });
}

// Load prompts index
export async function loadPromptsIndex() {
  try {
    // Load from API to get real-time updates
    const response = await fetch('http://localhost:3001/api/prompts');
    if (!response.ok) throw new Error('Failed to load prompts index');
    return await response.json();
  } catch (error) {
    console.error('Error loading prompts:', error);
    return null;
  }
}

// Favorites management
export function getFavorites() {
  const favs = localStorage.getItem('favorites');
  return favs ? JSON.parse(favs) : [];
}

export function addFavorite(promptId) {
  const favorites = getFavorites();
  if (!favorites.includes(promptId)) {
    favorites.push(promptId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
}

export function removeFavorite(promptId) {
  const favorites = getFavorites();
  const updated = favorites.filter(id => id !== promptId);
  localStorage.setItem('favorites', JSON.stringify(updated));
}

export function isFavorite(promptId) {
  return getFavorites().includes(promptId);
}

// Copy to clipboard
export function copyToClipboard(text, button) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = button.textContent;
    button.textContent = '✓ Copied!';
    button.classList.add('bg-success', 'text-white');

    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('bg-success', 'text-white');
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Failed to copy to clipboard');
  });
}

// Format date
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// URL parameters
export function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

export function setUrlParam(param, value) {
  const url = new URL(window.location);
  url.searchParams.set(param, value);
  window.history.pushState({}, '', url);
}

// Truncate text
export function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Initialize dark mode on page load
initDarkMode();
