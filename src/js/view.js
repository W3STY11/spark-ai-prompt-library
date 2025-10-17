import { loadPromptsIndex, getUrlParam, copyToClipboard, isFavorite, addFavorite, removeFavorite, formatDate } from './main.js';

let allPrompts = [];
let currentPrompt = null;
let currentIndex = -1;

async function init() {
  const promptId = getUrlParam('id');
  if (!promptId) {
    showError();
    return;
  }

  const index = await loadPromptsIndex();
  if (!index) {
    showError();
    return;
  }

  allPrompts = index.prompts;
  currentPrompt = allPrompts.find(p => p.id === promptId);

  if (!currentPrompt) {
    showError();
    return;
  }

  currentIndex = allPrompts.indexOf(currentPrompt);
  renderPrompt();

  // Event listeners
  document.getElementById('copyBtn').addEventListener('click', handleCopy);
  document.getElementById('sendToCopilotBtn').addEventListener('click', handleSendToCopilot);
  document.getElementById('favoriteBtn').addEventListener('click', handleFavorite);
  document.getElementById('prevBtn').addEventListener('click', goToPrevious);
  document.getElementById('nextBtn').addEventListener('click', goToNext);

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard);
}

function renderPrompt() {
  // Show content, hide loading
  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('promptContent').classList.remove('hidden');

  // Header - Department first, then title
  document.getElementById('promptIcon').textContent = currentPrompt.icon;
  document.getElementById('promptDepartment').textContent = currentPrompt.department;
  document.getElementById('promptTitle').textContent = currentPrompt.title;
  document.getElementById('promptSubcategory').textContent = currentPrompt.subcategory || '';

  // Complexity badge
  const complexityBadge = document.getElementById('promptComplexity');
  const complexityColors = {
    beginner: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
    intermediate: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
    advanced: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
  };
  complexityBadge.textContent = currentPrompt.complexity;
  complexityBadge.className = `badge text-xs ${complexityColors[currentPrompt.complexity] || complexityColors.intermediate}`;

  // Favorite button
  updateFavoriteButton();

  // Description
  document.getElementById('promptDescription').textContent = currentPrompt.description;

  // Main prompt content
  document.getElementById('promptText').textContent = currentPrompt.content;

  // Tips
  if (currentPrompt.tips && currentPrompt.tips.length > 0) {
    document.getElementById('tipsSection').classList.remove('hidden');
    document.getElementById('promptTips').innerHTML = currentPrompt.tips
      .map(tip => `<li class="flex gap-2"><span class="text-primary-600 dark:text-primary-400">•</span><span>${tip}</span></li>`)
      .join('');
  } else {
    document.getElementById('tipsSection').classList.add('hidden');
  }

  // Tags
  if (currentPrompt.tags && currentPrompt.tags.length > 0) {
    document.getElementById('tagsSection').classList.remove('hidden');
    document.getElementById('promptTags').innerHTML = currentPrompt.tags
      .map(tag => `<span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold">${tag}</span>`)
      .join('');
  } else {
    document.getElementById('tagsSection').classList.add('hidden');
  }

  // Images
  if (currentPrompt.images && currentPrompt.images.length > 0) {
    document.getElementById('imagesSection').classList.remove('hidden');
    document.getElementById('promptImages').innerHTML = currentPrompt.images
      .map(img => `
        <img src="/thumbnails/${img}" alt="Example" class="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700" loading="lazy">
      `)
      .join('');
  } else {
    document.getElementById('imagesSection').classList.add('hidden');
  }

  // Navigation buttons
  document.getElementById('prevBtn').disabled = currentIndex === 0;
  document.getElementById('nextBtn').disabled = currentIndex === allPrompts.length - 1;

  // Update page title
  document.title = `${currentPrompt.title} | AI Prompt Library`;
}

function updateFavoriteButton() {
  const btn = document.getElementById('favoriteIcon');
  const isLiked = isFavorite(currentPrompt.id);
  btn.textContent = isLiked ? '★' : '☆';
  btn.style.color = isLiked ? '#f59e0b' : '';
}

function handleCopy() {
  const content = currentPrompt.content;
  const button = document.getElementById('copyBtn');
  copyToClipboard(content, button);
}

function handleSendToCopilot() {
  const button = document.getElementById('sendToCopilotBtn');
  const originalText = button.innerHTML;

  try {
    // Prepare the message data
    const messageData = {
      type: 'SPARK_SEND_TO_COPILOT',
      promptText: currentPrompt.content,
      promptDetails: {
        id: currentPrompt.id,
        title: currentPrompt.title,
        icon: currentPrompt.icon,
        department: currentPrompt.department,
        subcategory: currentPrompt.subcategory,
        description: currentPrompt.description,
        complexity: currentPrompt.complexity,
        tips: currentPrompt.tips || [],
        tags: currentPrompt.tags || [],
        images: currentPrompt.images || [],
        word_count: currentPrompt.word_count
      }
    };

    // Try to find Copilot window
    // First check if we were opened by Copilot (window.opener)
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(messageData, 'https://m365.cloud.microsoft');
      button.innerHTML = '✓ Sent!';
      button.classList.add('bg-green-600');
      setTimeout(() => {
        button.innerHTML = originalText;
        button.classList.remove('bg-green-600');
      }, 2000);
    } else {
      // Fallback: try to broadcast to all windows (for manual tab opening)
      // This won't work across origins, but we'll try
      // Show instruction to user
      button.innerHTML = '⚠️ Open from Copilot first';
      setTimeout(() => {
        button.innerHTML = originalText;
      }, 3000);

      // Also copy to clipboard as fallback
      copyToClipboard(currentPrompt.content, button);

      // Show helpful message
      setTimeout(() => {
        alert('Tip: Click the ⚡ button in Copilot Chat to open this library, then prompts will be sent automatically!');
      }, 100);
    }
  } catch (error) {
    console.error('Error sending to Copilot:', error);
    button.innerHTML = '❌ Error';
    setTimeout(() => {
      button.innerHTML = originalText;
    }, 2000);
  }
}

function handleFavorite() {
  if (isFavorite(currentPrompt.id)) {
    removeFavorite(currentPrompt.id);
  } else {
    addFavorite(currentPrompt.id);
  }
  updateFavoriteButton();
}

function goToPrevious() {
  if (currentIndex > 0) {
    const prevPrompt = allPrompts[currentIndex - 1];
    window.location.href = `/view.html?id=${prevPrompt.id}`;
  }
}

function goToNext() {
  if (currentIndex < allPrompts.length - 1) {
    const nextPrompt = allPrompts[currentIndex + 1];
    window.location.href = `/view.html?id=${nextPrompt.id}`;
  }
}

function handleKeyboard(e) {
  // Don't handle if user is typing in an input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  switch(e.key) {
    case 'c':
    case 'C':
      handleCopy();
      break;
    case 'f':
    case 'F':
      handleFavorite();
      break;
    case 'ArrowLeft':
      goToPrevious();
      break;
    case 'ArrowRight':
      goToNext();
      break;
  }
}

function showError() {
  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('errorState').classList.remove('hidden');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
