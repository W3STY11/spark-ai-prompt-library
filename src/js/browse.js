import { loadPromptsIndex, getUrlParam, setUrlParam, truncate } from './main.js';

let allPrompts = [];
let filteredPrompts = [];
let currentPage = 1;
const PROMPTS_PER_PAGE = 50;
let viewMode = 'card'; // 'card' or 'list'

async function init() {
  const index = await loadPromptsIndex();
  if (!index) {
    showError('Failed to load prompts');
    return;
  }

  allPrompts = index.prompts;

  // Populate department filter
  populateDepartmentFilter(index.departments);

  // Get initial filters from URL
  const department = getUrlParam('department');
  const search = getUrlParam('search');

  if (department) {
    document.getElementById('departmentFilter').value = department;
    updateCategoryContextUI(department);
  }
  if (search) {
    document.getElementById('searchInput').value = search;
  }

  // Apply filters
  applyFilters();

  // Event listeners
  document.getElementById('searchInput').addEventListener('input', handleSearch);
  document.getElementById('departmentFilter').addEventListener('change', handleDepartmentChange);
  document.getElementById('sortBy').addEventListener('change', applyFilters);
  document.getElementById('clearFilters').addEventListener('click', clearFilters);
  document.getElementById('viewCard').addEventListener('click', () => setViewMode('card'));
  document.getElementById('viewList').addEventListener('click', () => setViewMode('list'));
}

function populateDepartmentFilter(departments) {
  const select = document.getElementById('departmentFilter');
  departments.forEach(dept => {
    const option = document.createElement('option');
    option.value = dept.name;
    option.textContent = `${dept.icon} ${dept.name}`;
    select.appendChild(option);
  });
}

function handleSearch() {
  const query = document.getElementById('searchInput').value.trim();
  if (query) {
    setUrlParam('search', query);
  } else {
    const url = new URL(window.location);
    url.searchParams.delete('search');
    window.history.pushState({}, '', url);
  }
  currentPage = 1;
  applyFilters();
}

function handleDepartmentChange() {
  const dept = document.getElementById('departmentFilter').value;
  if (dept) {
    setUrlParam('department', dept);
  } else {
    const url = new URL(window.location);
    url.searchParams.delete('department');
    window.history.pushState({}, '', url);
  }
  currentPage = 1;
  applyFilters();
  updateCategoryContextUI(dept);
}

function updateCategoryContextUI(department) {
  const addPromptBtn = document.getElementById('addPromptBtn');

  if (department) {
    // Update button text to show category context
    addPromptBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5V19M5 12H19" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Add ${department} Prompt
    `;
  } else {
    // Reset to default text
    addPromptBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5V19M5 12H19" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Add New Prompt
    `;
  }
}

function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('departmentFilter').value = '';
  document.getElementById('sortBy').value = 'title';
  window.history.pushState({}, '', window.location.pathname);
  currentPage = 1;
  applyFilters();
  updateCategoryContextUI(''); // Reset button text
}

function applyFilters() {
  const search = document.getElementById('searchInput').value.toLowerCase().trim();
  const department = document.getElementById('departmentFilter').value;
  const sortBy = document.getElementById('sortBy').value;

  // Filter
  filteredPrompts = allPrompts.filter(prompt => {
    const matchesSearch = !search ||
      prompt.title.toLowerCase().includes(search) ||
      prompt.description.toLowerCase().includes(search) ||
      prompt.subcategory.toLowerCase().includes(search) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(search));

    const matchesDepartment = !department || prompt.department === department;

    return matchesSearch && matchesDepartment;
  });

  // Sort
  filteredPrompts.sort((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    } else if (sortBy === 'date') {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === 'department') {
      return a.department.localeCompare(b.department) || a.title.localeCompare(b.title);
    }
    return 0;
  });

  // Update UI
  updateResultsCount();
  renderPrompts();
  renderPagination();
}

function updateResultsCount() {
  const search = document.getElementById('searchInput').value.trim();
  const department = document.getElementById('departmentFilter').value;
  const isFiltered = search || department;

  // Show "2000+" when not filtered, otherwise show actual count
  document.getElementById('resultsCount').textContent = isFiltered
    ? filteredPrompts.length.toLocaleString()
    : '2000+';
}

function setViewMode(mode) {
  viewMode = mode;

  // Update button states
  document.getElementById('viewCard').classList.toggle('active', mode === 'card');
  document.getElementById('viewList').classList.toggle('active', mode === 'list');

  // Update grid classes
  const grid = document.getElementById('promptsGrid');
  if (mode === 'list') {
    grid.classList.remove('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6');
    grid.classList.add('flex', 'flex-col', 'gap-3');
  } else {
    grid.classList.remove('flex', 'flex-col', 'gap-3');
    grid.classList.add('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6');
  }

  // Re-render prompts with new view
  renderPrompts();
}

function renderPrompts() {
  const grid = document.getElementById('promptsGrid');
  const start = (currentPage - 1) * PROMPTS_PER_PAGE;
  const end = start + PROMPTS_PER_PAGE;
  const pagePrompts = filteredPrompts.slice(start, end);

  if (pagePrompts.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-12">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">No prompts found</h3>
        <p class="text-gray-600 dark:text-gray-400">Try adjusting your filters</p>
      </div>
    `;
    return;
  }

  if (viewMode === 'list') {
    grid.innerHTML = pagePrompts.map((prompt, index) => `
      <a href="/view.html?id=${prompt.id}" class="prompt-list-item group">
        <div class="flex items-center gap-4">
          <span class="text-3xl transform group-hover:scale-110 transition-transform">${prompt.icon}</span>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-1">
              <span class="badge badge-${prompt.department.toLowerCase()} badge-premium text-xs flex-shrink-0">
                ${prompt.department}
              </span>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white group-hover:text-gradient transition-all truncate">
                ${prompt.title}
              </h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
              ${truncate(prompt.description, 100)}
            </p>
          </div>

          <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
            ${prompt.images.length > 0 ? '<span class="text-lg">📷</span>' : ''}
            <span class="font-medium">${prompt.word_count} words</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="text-primary-600 dark:text-primary-400 transform group-hover:translate-x-2 transition-transform">
              <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </a>
    `).join('');
  } else {
    // Card view
    grid.innerHTML = pagePrompts.map((prompt, index) => `
      <a href="/view.html?id=${prompt.id}" class="prompt-card prompt-card-premium group">
        <div class="relative">
          <div class="flex items-start gap-4 mb-4">
            <span class="text-4xl transform group-hover:scale-110 transition-transform">${prompt.icon}</span>
            <div class="flex-1 min-w-0">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-gradient transition-all line-clamp-2 tracking-tight mb-2">
                ${prompt.title}
              </h3>
              <div class="badge badge-${prompt.department.toLowerCase()} badge-premium text-xs">
                ${prompt.department}
              </div>
            </div>
          </div>

          <p class="text-gray-600 dark:text-gray-400 mb-5 line-clamp-3 leading-relaxed">
            ${truncate(prompt.description, 150)}
          </p>

          ${prompt.tags.length > 0 ? `
            <div class="flex flex-wrap gap-2 mb-5">
              ${prompt.tags.slice(0, 3).map(tag => `
                <span class="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100 text-xs rounded-lg font-medium border border-gray-200 dark:border-gray-600">
                  ${tag}
                </span>
              `).join('')}
            </div>
          ` : ''}

          <div class="flex items-center justify-between pt-5 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
              ${prompt.images.length > 0 ? '<span class="pulse">📷</span>' : ''}
              <span>${prompt.word_count} words</span>
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="text-primary-600 dark:text-primary-400 transform group-hover:translate-x-2 transition-transform">
              <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </a>
    `).join('');
  }
}

function renderPagination() {
  const pagination = document.getElementById('pagination');
  const totalPages = Math.ceil(filteredPrompts.length / PROMPTS_PER_PAGE);

  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  let buttons = [];

  // Previous button
  buttons.push(`
    <button class="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold
                   ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-500 dark:hover:border-primary-400'}
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            ${currentPage === 1 ? 'disabled' : ''}
            onclick="window.goToPage(${currentPage - 1})">
      ← Previous
    </button>
  `);

  // Page numbers (show max 7)
  let startPage = Math.max(1, currentPage - 3);
  let endPage = Math.min(totalPages, startPage + 6);

  if (endPage - startPage < 6) {
    startPage = Math.max(1, endPage - 6);
  }

  if (startPage > 1) {
    buttons.push(`<button class="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-primary-500 dark:hover:border-primary-400" onclick="window.goToPage(1)">1</button>`);
    if (startPage > 2) buttons.push('<span class="px-2 text-gray-500">...</span>');
  }

  for (let i = startPage; i <= endPage; i++) {
    buttons.push(`
      <button class="px-4 py-2 border-2 rounded-lg font-semibold transition-colors
                     ${i === currentPage
                       ? 'bg-primary-600 dark:bg-primary-500 border-primary-600 dark:border-primary-500 text-white'
                       : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-primary-500 dark:hover:border-primary-400'}"
              onclick="window.goToPage(${i})">
        ${i}
      </button>
    `);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) buttons.push('<span class="px-2 text-gray-500">...</span>');
    buttons.push(`<button class="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-primary-500 dark:hover:border-primary-400" onclick="window.goToPage(${totalPages})">${totalPages}</button>`);
  }

  // Next button
  buttons.push(`
    <button class="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold
                   ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-500 dark:hover:border-primary-400'}
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            ${currentPage === totalPages ? 'disabled' : ''}
            onclick="window.goToPage(${currentPage + 1})">
      Next →
    </button>
  `);

  pagination.innerHTML = buttons.join('');
}

window.goToPage = function(page) {
  currentPage = page;
  renderPrompts();
  renderPagination();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

function showError(message) {
  document.getElementById('promptsGrid').innerHTML = `
    <div class="col-span-full text-center py-12">
      <div class="text-6xl mb-4">⚠️</div>
      <h3 class="text-2xl font-bold text-red-600 mb-2">Error</h3>
      <p class="text-gray-600 dark:text-gray-400">${message}</p>
    </div>
  `;
}

// ===== ADD NEW PROMPT MODAL FUNCTIONALITY =====

let departmentsData = [];

function openAddPromptModal(preselectedCategory = null) {
  const modal = document.getElementById('addPromptModal');
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden'; // Prevent background scrolling

  // Populate category dropdown if not already populated
  populateCategoryDropdown();

  // Auto-populate category if one is currently filtered or passed
  const currentDepartment = preselectedCategory || document.getElementById('departmentFilter').value;
  if (currentDepartment) {
    const categorySelect = document.getElementById('promptCategory');
    categorySelect.value = currentDepartment;

    // Highlight that the category was auto-populated
    const modalTitle = document.querySelector('#addPromptModal h2');
    if (modalTitle && currentDepartment) {
      modalTitle.innerHTML = `Add New Prompt to <span class="text-primary-600 dark:text-primary-400">${currentDepartment}</span>`;
    }
  }
}

function closeAddPromptModal() {
  const modal = document.getElementById('addPromptModal');
  modal.classList.add('hidden');
  document.body.style.overflow = 'auto';

  // Reset form
  document.getElementById('addPromptForm').reset();
  document.getElementById('imageFileName').textContent = 'No file selected';

  // Reset modal title
  const modalTitle = document.querySelector('#addPromptModal h2');
  if (modalTitle) {
    modalTitle.textContent = 'Add New Prompt';
  }
}

function populateCategoryDropdown() {
  const select = document.getElementById('promptCategory');

  // Only populate if empty
  if (select.options.length > 1) return;

  // Get departments from the existing filter dropdown
  const departmentFilter = document.getElementById('departmentFilter');
  const options = Array.from(departmentFilter.options).slice(1); // Skip "All Departments"

  options.forEach(option => {
    const newOption = document.createElement('option');
    newOption.value = option.value;
    newOption.textContent = option.textContent;
    select.appendChild(newOption);
  });
}

function handleFileSelection(event) {
  const fileInput = event.target;
  const fileNameSpan = document.getElementById('imageFileName');

  if (fileInput.files.length > 0) {
    const fileName = fileInput.files[0].name;
    fileNameSpan.textContent = fileName;
    fileNameSpan.classList.remove('italic');
    fileNameSpan.classList.add('font-medium', 'text-primary-600', 'dark:text-primary-400');
  } else {
    fileNameSpan.textContent = 'No file selected';
    fileNameSpan.classList.add('italic');
    fileNameSpan.classList.remove('font-medium', 'text-primary-600', 'dark:text-primary-400');
  }
}

async function handleAddPromptSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = document.getElementById('submitPromptBtn');

  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Saving...
  `;

  try {
    // Create FormData object to handle file upload
    const formData = new FormData();
    formData.append('category', form.category.value);
    formData.append('title', form.title.value);
    formData.append('description', form.description.value);
    formData.append('prompt', form.prompt.value);
    formData.append('tags', form.tags.value);

    // Add image if present
    if (form.image.files[0]) {
      formData.append('image', form.image.files[0]);
    }

    // Send to API
    const response = await fetch('http://localhost:3001/api/prompts', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save prompt');
    }

    const result = await response.json();
    console.log('Prompt saved:', result);

    // Show success message
    alert('✅ Prompt saved successfully!\n\nYour new prompt has been added to the library.');

    // Close modal
    closeAddPromptModal();

    // Refresh the prompts list
    await init();

  } catch (error) {
    console.error('Error saving prompt:', error);
    alert(`❌ Error saving prompt: ${error.message}\n\nMake sure the API server is running (npm run api)`);
  } finally {
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      Save Prompt
    `;
  }
}

function setupModalEventListeners() {
  // Open modal button
  const addPromptBtn = document.getElementById('addPromptBtn');
  if (addPromptBtn) {
    addPromptBtn.addEventListener('click', openAddPromptModal);
  }

  // Close modal buttons
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeAddPromptModal);
  }

  if (cancelModalBtn) {
    cancelModalBtn.addEventListener('click', closeAddPromptModal);
  }

  // Close on backdrop click
  const modal = document.getElementById('addPromptModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAddPromptModal();
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('addPromptModal');
      if (modal && !modal.classList.contains('hidden')) {
        closeAddPromptModal();
      }
    }
  });

  // File input handler
  const fileInput = document.getElementById('promptImage');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelection);
  }

  // Form submission
  const form = document.getElementById('addPromptForm');
  if (form) {
    form.addEventListener('submit', handleAddPromptSubmit);
  }
}

// ===== BULK IMPORT MODAL FUNCTIONALITY =====

let bulkImportData = null;

function openBulkImportModal() {
  const modal = document.getElementById('bulkImportModal');
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Reset to upload view
  showUploadArea();
}

function closeBulkImportModal() {
  const modal = document.getElementById('bulkImportModal');
  modal.classList.add('hidden');
  document.body.style.overflow = 'auto';

  // Reset state
  bulkImportData = null;
  document.getElementById('bulkImportFile').value = '';
  showUploadArea();
}

function showUploadArea() {
  document.getElementById('uploadArea').classList.remove('hidden');
  document.getElementById('previewArea').classList.add('hidden');
  document.getElementById('progressArea').classList.add('hidden');
  document.getElementById('resultsArea').classList.add('hidden');
  document.getElementById('importPromptsBtn').classList.add('hidden');
  document.getElementById('doneImportBtn').classList.add('hidden');
}

function showPreviewArea() {
  document.getElementById('uploadArea').classList.add('hidden');
  document.getElementById('previewArea').classList.remove('hidden');
  document.getElementById('progressArea').classList.add('hidden');
  document.getElementById('resultsArea').classList.add('hidden');
  document.getElementById('importPromptsBtn').classList.remove('hidden');
  document.getElementById('doneImportBtn').classList.add('hidden');
}

function showProgressArea() {
  document.getElementById('uploadArea').classList.add('hidden');
  document.getElementById('previewArea').classList.add('hidden');
  document.getElementById('progressArea').classList.remove('hidden');
  document.getElementById('resultsArea').classList.add('hidden');
  document.getElementById('importPromptsBtn').classList.add('hidden');
  document.getElementById('doneImportBtn').classList.add('hidden');
}

function showResultsArea() {
  document.getElementById('uploadArea').classList.add('hidden');
  document.getElementById('previewArea').classList.add('hidden');
  document.getElementById('progressArea').classList.add('hidden');
  document.getElementById('resultsArea').classList.remove('hidden');
  document.getElementById('importPromptsBtn').classList.add('hidden');
  document.getElementById('doneImportBtn').classList.remove('hidden');
}

async function handleBulkFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // Validate structure
    if (!data.prompts || !Array.isArray(data.prompts)) {
      throw new Error('Invalid JSON structure: expected { prompts: [...] }');
    }

    bulkImportData = data;

    // Show file info
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileStats').textContent = `${data.prompts.length} prompts • ${(file.size / 1024).toFixed(1)} KB`;

    // Validate prompts
    const validationResults = validateBulkPrompts(data.prompts);
    displayValidationResults(validationResults);

    // Show preview table
    displayPromptsPreview(data.prompts, validationResults);

    // Switch to preview
    showPreviewArea();

  } catch (error) {
    alert(`❌ Error reading file: ${error.message}`);
    event.target.value = '';
  }
}

function validateBulkPrompts(prompts) {
  const validDepartments = ['Business', 'Marketing', 'Sales', 'SEO', 'Finance', 'Education', 'Writing', 'Productivity', 'Solopreneurs'];
  const validComplexities = ['beginner', 'intermediate', 'advanced'];
  const results = [];

  prompts.forEach((prompt, index) => {
    const errors = [];

    if (!prompt.title) errors.push('Missing title');
    if (!prompt.description) errors.push('Missing description');
    if (!prompt.content) errors.push('Missing content');
    if (!prompt.department) {
      errors.push('Missing department');
    } else if (!validDepartments.includes(prompt.department)) {
      errors.push(`Invalid department: ${prompt.department}`);
    }
    if (prompt.complexity && !validComplexities.includes(prompt.complexity)) {
      errors.push(`Invalid complexity: ${prompt.complexity}`);
    }

    results.push({
      index,
      isValid: errors.length === 0,
      errors
    });
  });

  return results;
}

function displayValidationResults(results) {
  const container = document.getElementById('validationResults');
  const validCount = results.filter(r => r.isValid).length;
  const invalidCount = results.length - validCount;

  if (invalidCount === 0) {
    container.innerHTML = `
      <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
        <svg class="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm font-medium text-green-800 dark:text-green-200">
          ✅ All ${validCount} prompts are valid and ready to import
        </p>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-center gap-3">
        <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          ⚠️ ${validCount} valid, ${invalidCount} invalid (invalid prompts will be skipped)
        </p>
      </div>
    `;
  }
}

function displayPromptsPreview(prompts, validationResults) {
  const tbody = document.getElementById('promptsPreviewTable');

  tbody.innerHTML = prompts.map((prompt, index) => {
    const validation = validationResults[index];
    const statusIcon = validation.isValid
      ? '<svg class="w-5 h-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>'
      : '<svg class="w-5 h-5 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';

    return `
      <tr class="${validation.isValid ? '' : 'bg-red-50 dark:bg-red-900/10'}">
        <td class="px-4 py-3 text-gray-900 dark:text-white font-medium">${index + 1}</td>
        <td class="px-4 py-3">
          <div class="text-gray-900 dark:text-white font-medium">${prompt.title || '(missing)'}</div>
          ${!validation.isValid ? `<div class="text-xs text-red-600 dark:text-red-400 mt-1">${validation.errors.join(', ')}</div>` : ''}
        </td>
        <td class="px-4 py-3 text-gray-600 dark:text-gray-400">${prompt.department || '(missing)'}</td>
        <td class="px-4 py-3">
          ${Array.isArray(prompt.tags) && prompt.tags.length > 0
            ? `<div class="flex flex-wrap gap-1">${prompt.tags.slice(0, 2).map(tag => `<span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">${tag}</span>`).join('')}</div>`
            : '<span class="text-gray-400 text-xs">none</span>'
          }
        </td>
        <td class="px-4 py-3 text-center">${statusIcon}</td>
      </tr>
    `;
  }).join('');
}

async function handleBulkImport() {
  if (!bulkImportData || !bulkImportData.prompts) {
    alert('No data to import');
    return;
  }

  // Show progress
  showProgressArea();

  const prompts = bulkImportData.prompts;
  let processed = 0;

  // Update progress text
  const updateProgress = () => {
    const percent = Math.round((processed / prompts.length) * 100);
    document.getElementById('progressText').textContent = `Processing ${processed} of ${prompts.length} prompts`;
    document.getElementById('progressBar').style.width = `${percent}%`;
  };

  updateProgress();

  try {
    // Send to API
    const response = await fetch('http://localhost:3001/api/prompts/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompts })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to import prompts');
    }

    const results = await response.json();

    // Simulate progress for better UX
    for (let i = processed; i <= prompts.length; i++) {
      processed = i;
      updateProgress();
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Show results
    displayImportResults(results);
    showResultsArea();

    // Refresh prompts list
    await init();

  } catch (error) {
    console.error('Error importing prompts:', error);
    alert(`❌ Error importing prompts: ${error.message}\n\nMake sure the API server is running (npm run api)`);
    showPreviewArea();
  }
}

function displayImportResults(results) {
  document.getElementById('successCount').textContent = results.successful.length;
  document.getElementById('failedCount').textContent = results.failed.length;
  document.getElementById('totalCount').textContent = results.total;
  document.getElementById('resultsText').textContent = `Successfully imported ${results.successful.length} of ${results.total} prompts`;

  // Show error details if any
  if (results.failed.length > 0) {
    const errorDetails = document.getElementById('errorDetails');
    const errorList = document.getElementById('errorList');

    errorDetails.classList.remove('hidden');
    errorList.innerHTML = results.failed.map(failed => `
      <li>Prompt ${failed.index + 1} (${failed.title}): ${failed.error}</li>
    `).join('');
  }
}

function setupBulkImportListeners() {
  // Open bulk import button
  const bulkImportBtn = document.getElementById('bulkImportBtn');
  if (bulkImportBtn) {
    bulkImportBtn.addEventListener('click', openBulkImportModal);
  }

  // Close modal
  const closeBulkModalBtn = document.getElementById('closeBulkModalBtn');
  const cancelBulkBtn = document.getElementById('cancelBulkBtn');
  const doneImportBtn = document.getElementById('doneImportBtn');

  if (closeBulkModalBtn) closeBulkModalBtn.addEventListener('click', closeBulkImportModal);
  if (cancelBulkBtn) cancelBulkBtn.addEventListener('click', closeBulkImportModal);
  if (doneImportBtn) doneImportBtn.addEventListener('click', closeBulkImportModal);

  // File upload
  const bulkImportFile = document.getElementById('bulkImportFile');
  if (bulkImportFile) {
    bulkImportFile.addEventListener('change', handleBulkFileUpload);
  }

  // Clear file button
  const clearFileBtn = document.getElementById('clearFileBtn');
  if (clearFileBtn) {
    clearFileBtn.addEventListener('click', () => {
      bulkImportData = null;
      document.getElementById('bulkImportFile').value = '';
      showUploadArea();
    });
  }

  // Import button
  const importPromptsBtn = document.getElementById('importPromptsBtn');
  if (importPromptsBtn) {
    importPromptsBtn.addEventListener('click', handleBulkImport);
  }

  // Close on backdrop click
  const modal = document.getElementById('bulkImportModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeBulkImportModal();
      }
    });
  }

  // Drag and drop support
  const uploadArea = document.getElementById('uploadArea');
  if (uploadArea) {
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.add('border-purple-500');
    });

    uploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.remove('border-purple-500');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.remove('border-purple-500');

      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].type === 'application/json') {
        document.getElementById('bulkImportFile').files = files;
        handleBulkFileUpload({ target: { files } });
      }
    });
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  init();
  setupModalEventListeners();
  setupBulkImportListeners();
});
