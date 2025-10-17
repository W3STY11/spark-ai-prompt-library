// Admin Dashboard Logic

const API_URL = 'http://localhost:3001';

let allPrompts = [];
let filteredPrompts = [];
let selectedIds = new Set();
let currentPage = 1;
let rowsPerPage = 50;
let deleteTargetId = null;
let authToken = null;
let validationData = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  if (!checkAuth()) {
    return; // Will redirect to login
  }

  await loadPrompts();
  setupEventListeners();
  updateDisplay();
});

// Check if user is authenticated
function checkAuth() {
  authToken = sessionStorage.getItem('adminToken');
  const isAuthenticated = sessionStorage.getItem('adminAuth') === 'true';

  if (!isAuthenticated || !authToken) {
    // Redirect to login page
    window.location.href = 'admin-login.html';
    return false;
  }

  return true;
}

// Get auth headers for API requests
function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  };
}

// Load prompts from API
async function loadPrompts() {
  showLoading(true);
  try {
    // Load from API to get real-time updates
    const response = await fetch(`${API_URL}/api/prompts`);
    if (!response.ok) throw new Error('Failed to load prompts');
    const data = await response.json();
    allPrompts = data.prompts || [];
    filteredPrompts = [...allPrompts];
    updateStatistics();
    console.log(`✅ Loaded ${allPrompts.length} prompts`);
  } catch (error) {
    console.error('Error loading prompts:', error);
    alert('Failed to load prompts. Please refresh the page.');
  } finally {
    showLoading(false);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Search & Filter
  document.getElementById('searchInput').addEventListener('input', applyFilters);
  document.getElementById('departmentFilter').addEventListener('change', applyFilters);
  document.getElementById('sortBy').addEventListener('change', applyFilters);
  document.getElementById('clearFilters').addEventListener('click', clearFilters);

  // Bulk actions
  document.getElementById('selectAllBtn').addEventListener('click', selectAll);
  document.getElementById('deselectAllBtn').addEventListener('click', deselectAll);
  document.getElementById('bulkDeleteBtn').addEventListener('click', bulkDelete);
  document.getElementById('exportSelectedBtn').addEventListener('click', exportSelected);
  document.getElementById('exportAllBtn').addEventListener('click', exportAll);
  document.getElementById('selectAllCheckbox').addEventListener('change', toggleSelectAll);

  // Pagination
  document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
  document.getElementById('nextPage').addEventListener('click', () => changePage(1));
  document.getElementById('rowsPerPage').addEventListener('change', (e) => {
    rowsPerPage = parseInt(e.target.value);
    currentPage = 1;
    updateDisplay();
  });

  // Edit modal
  document.getElementById('cancelEdit').addEventListener('click', closeEditModal);
  document.getElementById('editForm').addEventListener('submit', saveEdit);

  // Delete modal
  document.getElementById('cancelDelete').addEventListener('click', closeDeleteModal);
  document.getElementById('confirmDelete').addEventListener('click', confirmDelete);

  // Backup button
  document.getElementById('backupBtn').addEventListener('click', manualBackup);

  // Validation button
  document.getElementById('validationBtn').addEventListener('click', runValidation);

  // Validation modal
  document.getElementById('closeValidation').addEventListener('click', closeValidationModal);
  document.getElementById('exportValidationReport').addEventListener('click', exportValidationReport);

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', logout);
}

// Apply filters and sorting
function applyFilters() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const department = document.getElementById('departmentFilter').value;
  const sortBy = document.getElementById('sortBy').value;

  // Filter
  filteredPrompts = allPrompts.filter(prompt => {
    const matchesSearch = !searchTerm ||
      prompt.title.toLowerCase().includes(searchTerm) ||
      prompt.description.toLowerCase().includes(searchTerm) ||
      (prompt.tags && prompt.tags.join(' ').toLowerCase().includes(searchTerm));

    const matchesDepartment = !department || prompt.department === department;

    return matchesSearch && matchesDepartment;
  });

  // Sort
  filteredPrompts.sort((a, b) => {
    switch(sortBy) {
      case 'date-desc':
        return (b.date || '').localeCompare(a.date || '');
      case 'date-asc':
        return (a.date || '').localeCompare(b.date || '');
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      case 'dept-asc':
        return a.department.localeCompare(b.department);
      default:
        return 0;
    }
  });

  currentPage = 1;
  updateDisplay();
}

// Clear all filters
function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('departmentFilter').value = '';
  document.getElementById('sortBy').value = 'date-desc';
  applyFilters();
}

// Update table display
function updateDisplay() {
  const tbody = document.getElementById('promptsTableBody');
  tbody.innerHTML = '';

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pagePrompts = filteredPrompts.slice(start, end);

  pagePrompts.forEach(prompt => {
    const row = createTableRow(prompt);
    tbody.appendChild(row);
  });

  updatePagination();
  updateSelectionCount();
}

// Create table row
function createTableRow(prompt) {
  const tr = document.createElement('tr');
  tr.className = 'hover:bg-gray-50';

  const isSelected = selectedIds.has(prompt.id);

  tr.innerHTML = `
    <td class="px-4 py-3">
      <input type="checkbox" class="row-checkbox rounded" data-id="${prompt.id}" ${isSelected ? 'checked' : ''}>
    </td>
    <td class="px-4 py-3">
      <div class="font-medium text-gray-900">${escapeHtml(prompt.title)}</div>
      <div class="text-xs text-gray-500">${prompt.id}</div>
    </td>
    <td class="px-4 py-3">
      <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
        ${prompt.icon || ''} ${prompt.department}
      </span>
    </td>
    <td class="px-4 py-3 text-sm text-gray-600">${prompt.subcategory || '-'}</td>
    <td class="px-4 py-3">
      <div class="flex flex-wrap gap-1">
        ${(prompt.tags || []).slice(0, 3).map(tag =>
          `<span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">${escapeHtml(tag)}</span>`
        ).join('')}
        ${prompt.tags && prompt.tags.length > 3 ? `<span class="text-xs text-gray-500">+${prompt.tags.length - 3}</span>` : ''}
      </div>
    </td>
    <td class="px-4 py-3 text-sm text-gray-600">${prompt.date || '-'}</td>
    <td class="px-4 py-3 text-sm text-gray-600">${prompt.word_count || '-'}</td>
    <td class="px-4 py-3">
      <div class="flex gap-2">
        <button class="edit-btn bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm" data-id="${prompt.id}">
          Edit
        </button>
        <button class="delete-btn bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm" data-id="${prompt.id}">
          Delete
        </button>
      </div>
    </td>
  `;

  // Add event listeners
  tr.querySelector('.row-checkbox').addEventListener('change', (e) => {
    if (e.target.checked) {
      selectedIds.add(prompt.id);
    } else {
      selectedIds.delete(prompt.id);
    }
    updateSelectionCount();
  });

  tr.querySelector('.edit-btn').addEventListener('click', () => openEditModal(prompt.id));
  tr.querySelector('.delete-btn').addEventListener('click', () => openDeleteModal(prompt.id));

  return tr;
}

// Update pagination controls
function updatePagination() {
  const totalPages = Math.ceil(filteredPrompts.length / rowsPerPage);

  document.getElementById('currentPage').textContent = currentPage;
  document.getElementById('totalPages').textContent = totalPages;
  document.getElementById('showingCount').textContent = Math.min(filteredPrompts.length, rowsPerPage);
  document.getElementById('totalCount').textContent = filteredPrompts.length;

  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage === totalPages || totalPages === 0;
}

// Change page
function changePage(delta) {
  const totalPages = Math.ceil(filteredPrompts.length / rowsPerPage);
  const newPage = currentPage + delta;

  if (newPage >= 1 && newPage <= totalPages) {
    currentPage = newPage;
    updateDisplay();
  }
}

// Update statistics
function updateStatistics() {
  const total = allPrompts.length;
  const byDept = {};

  allPrompts.forEach(p => {
    byDept[p.department] = (byDept[p.department] || 0) + 1;
  });

  document.getElementById('statTotal').textContent = total.toLocaleString();
  document.getElementById('statBusiness').textContent = (byDept['Business'] || 0).toLocaleString();
  document.getElementById('statMarketing').textContent = (byDept['Marketing'] || 0).toLocaleString();
}

// Update selection count
function updateSelectionCount() {
  document.getElementById('statSelected').textContent = selectedIds.size.toLocaleString();
}

// Select all (current page or all)
function selectAll() {
  filteredPrompts.forEach(p => selectedIds.add(p.id));
  updateDisplay();
}

// Deselect all
function deselectAll() {
  selectedIds.clear();
  updateDisplay();
}

// Toggle select all checkbox
function toggleSelectAll(e) {
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pagePrompts = filteredPrompts.slice(start, end);

  if (e.target.checked) {
    pagePrompts.forEach(p => selectedIds.add(p.id));
  } else {
    pagePrompts.forEach(p => selectedIds.delete(p.id));
  }
  updateDisplay();
}

// Open edit modal
function openEditModal(promptId) {
  const prompt = allPrompts.find(p => p.id === promptId);
  if (!prompt) return;

  document.getElementById('editPromptId').value = prompt.id;
  document.getElementById('editTitle').value = prompt.title;
  document.getElementById('editDepartment').value = prompt.department;
  document.getElementById('editSubcategory').value = prompt.subcategory || '';
  document.getElementById('editDescription').value = prompt.description;
  document.getElementById('editContent').value = prompt.content;
  document.getElementById('editTags').value = (prompt.tags || []).join(', ');

  document.getElementById('editModal').classList.add('active');
}

// Close edit modal
function closeEditModal() {
  document.getElementById('editModal').classList.remove('active');
}

// Save edit
async function saveEdit(e) {
  e.preventDefault();
  showLoading(true);

  const promptId = document.getElementById('editPromptId').value;
  const updatedPrompt = {
    id: promptId,
    title: document.getElementById('editTitle').value.trim(),
    department: document.getElementById('editDepartment').value,
    subcategory: document.getElementById('editSubcategory').value.trim(),
    description: document.getElementById('editDescription').value.trim(),
    content: document.getElementById('editContent').value.trim(),
    tags: document.getElementById('editTags').value.split(',').map(t => t.trim()).filter(t => t)
  };

  try {
    const response = await fetch(`${API_URL}/api/prompts/${promptId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updatedPrompt)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update prompt');
    }

    await loadPrompts();
    applyFilters();
    closeEditModal();
    alert('✅ Prompt updated successfully!');
  } catch (error) {
    console.error('Error updating prompt:', error);
    alert(`❌ Failed to update prompt: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

// Open delete modal
function openDeleteModal(promptId) {
  const prompt = allPrompts.find(p => p.id === promptId);
  if (!prompt) return;

  deleteTargetId = promptId;
  document.getElementById('deletePromptTitle').textContent = prompt.title;
  document.getElementById('deleteModal').classList.add('active');
}

// Close delete modal
function closeDeleteModal() {
  deleteTargetId = null;
  document.getElementById('deleteModal').classList.remove('active');
}

// Confirm delete
async function confirmDelete() {
  if (!deleteTargetId) return;

  showLoading(true);
  try {
    const response = await fetch(`${API_URL}/api/prompts/${deleteTargetId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete prompt');
    }

    await loadPrompts();
    applyFilters();
    closeDeleteModal();
    alert('✅ Prompt deleted successfully!');
  } catch (error) {
    console.error('Error deleting prompt:', error);
    alert(`❌ Failed to delete prompt: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

// Bulk delete
async function bulkDelete() {
  if (selectedIds.size === 0) {
    alert('Please select prompts to delete');
    return;
  }

  const confirmed = confirm(`⚠️ Are you sure you want to delete ${selectedIds.size} prompts?\n\nThis action cannot be undone.`);
  if (!confirmed) return;

  showLoading(true);
  const ids = Array.from(selectedIds);

  try {
    const response = await fetch(`${API_URL}/api/prompts/bulk-delete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete prompts');
    }

    const result = await response.json();
    selectedIds.clear();
    await loadPrompts();
    applyFilters();
    alert(`✅ Deleted ${result.deleted} prompts successfully!`);
  } catch (error) {
    console.error('Error bulk deleting:', error);
    alert(`❌ Failed to delete prompts: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

// Export selected prompts
function exportSelected() {
  if (selectedIds.size === 0) {
    alert('Please select prompts to export');
    return;
  }

  const selected = allPrompts.filter(p => selectedIds.has(p.id));
  downloadJSON(selected, `prompts_export_selected_${Date.now()}.json`);
  alert(`✅ Exported ${selected.length} prompts`);
}

// Export all filtered prompts
function exportAll() {
  if (filteredPrompts.length === 0) {
    alert('No prompts to export');
    return;
  }

  downloadJSON(filteredPrompts, `prompts_export_all_${Date.now()}.json`);
  alert(`✅ Exported ${filteredPrompts.length} prompts`);
}

// Download JSON file
function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Show/hide loading indicator
function showLoading(show) {
  const loading = document.getElementById('loading');
  if (show) {
    loading.classList.remove('hidden');
  } else {
    loading.classList.add('hidden');
  }
}

// =============================================================================
// PHASE 2 FEATURES: BACKUP, VALIDATION, LOGOUT
// =============================================================================

// Manual backup
async function manualBackup() {
  showLoading(true);
  try {
    const response = await fetch(`${API_URL}/api/admin/backup`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Backup failed');

    const result = await response.json();
    showToast(`✅ Backup created: ${result.backup.filename}`, 'success');
  } catch (error) {
    console.error('Backup error:', error);
    showToast(`❌ Backup failed: ${error.message}`, 'error');
  } finally {
    showLoading(false);
  }
}

// Run data quality validation
async function runValidation() {
  showLoading(true);
  try {
    const response = await fetch(`${API_URL}/api/admin/validate`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Validation failed');

    validationData = await response.json();
    displayValidationResults();
    document.getElementById('validationModal').classList.add('active');
  } catch (error) {
    console.error('Validation error:', error);
    showToast(`❌ Validation failed: ${error.message}`, 'error');
  } finally {
    showLoading(false);
  }
}

// Display validation results
function displayValidationResults() {
  if (!validationData) return;

  const { summary, issues } = validationData;

  // Summary
  document.getElementById('validationSummary').innerHTML = `
    <div class="grid grid-cols-2 gap-4">
      <div>
        <div class="text-2xl font-bold">${summary.totalPrompts.toLocaleString()}</div>
        <div class="text-sm text-gray-600">Total Prompts</div>
      </div>
      <div>
        <div class="text-2xl font-bold ${summary.totalIssues > 0 ? 'text-red-600' : 'text-green-600'}">
          ${summary.totalIssues.toLocaleString()}
        </div>
        <div class="text-sm text-gray-600">Total Issues</div>
      </div>
    </div>
  `;

  // Duplicate titles
  document.getElementById('dupCount').textContent = issues.duplicateTitles.length;
  document.getElementById('duplicatesList').innerHTML = issues.duplicateTitles.length > 0
    ? issues.duplicateTitles.map(dup => `<div class="p-2 bg-red-50 mb-1 rounded">${escapeHtml(dup.title)}</div>`).join('')
    : '<div class="text-gray-500">No duplicates found</div>';

  // Missing descriptions
  document.getElementById('descCount').textContent = issues.missingDescriptions.length;
  document.getElementById('missingDescList').innerHTML = issues.missingDescriptions.length > 0
    ? issues.missingDescriptions.map(p => `<div class="p-2 bg-orange-50 mb-1 rounded">${escapeHtml(p.title)}</div>`).join('')
    : '<div class="text-gray-500">All prompts have descriptions</div>';

  // Missing tags
  document.getElementById('tagsCount').textContent = issues.missingTags.length;
  document.getElementById('missingTagsList').innerHTML = issues.missingTags.length > 0
    ? issues.missingTags.map(p => `<div class="p-2 bg-yellow-50 mb-1 rounded">${escapeHtml(p.title)}</div>`).join('')
    : '<div class="text-gray-500">All prompts have tags</div>';

  // Malformed entries
  document.getElementById('malCount').textContent = issues.malformedEntries.length;
  document.getElementById('malformedList').innerHTML = issues.malformedEntries.length > 0
    ? issues.malformedEntries.map(p => `<div class="p-2 bg-red-50 mb-1 rounded">${escapeHtml(p.title)} - ${escapeHtml(p.reason)}</div>`).join('')
    : '<div class="text-gray-500">No malformed entries</div>';
}

// Close validation modal
function closeValidationModal() {
  document.getElementById('validationModal').classList.remove('active');
}

// Export validation report
function exportValidationReport() {
  if (!validationData) return;

  const report = {
    generatedAt: new Date().toISOString(),
    summary: validationData.summary,
    issues: validationData.issues
  };

  downloadJSON(report, `validation_report_${Date.now()}.json`);
  showToast('✅ Validation report exported', 'success');
}

// Logout
async function logout() {
  try {
    await fetch(`${API_URL}/api/admin/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminAuth');
    window.location.href = 'admin-login.html';
  }
}

// Show toast notification
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `fixed top-4 right-4 px-6 py-3 rounded shadow-lg ${
    type === 'success' ? 'bg-green-600 text-white' :
    type === 'error' ? 'bg-red-600 text-white' :
    'bg-blue-600 text-white'
  }`;
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
