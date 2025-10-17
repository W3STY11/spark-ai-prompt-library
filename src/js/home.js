import { loadPromptsIndex } from './main.js';

async function init() {
  const index = await loadPromptsIndex();
  if (!index) {
    document.getElementById('departmentsGrid').innerHTML =
      '<div class="col-span-full text-center text-red-600">Failed to load prompts index</div>';
    return;
  }

  // Update total prompts count - keep it at 2000+ for cleaner look
  const totalCount = document.getElementById('totalPromptsCount');
  if (totalCount) {
    totalCount.textContent = '2000+';
  }

  // Render departments
  renderDepartments(index.departments);
}

function renderDepartments(departments) {
  const grid = document.getElementById('departmentsGrid');
  if (!grid) return;

  grid.innerHTML = departments.map((dept, index) => `
    <a href="/browse.html?department=${encodeURIComponent(dept.name)}"
       class="department-card department-card-premium group"
       style="--dept-gradient: var(--dept-${dept.name.toLowerCase()}-gradient); --dept-bg: var(--dept-${dept.name.toLowerCase()}-bg); --dept-border: var(--dept-${dept.name.toLowerCase()}-border); --dept-color: var(--dept-${dept.name.toLowerCase()});">
      <div class="relative">
        <div class="flex items-center gap-5 mb-5">
          <div class="text-6xl transform group-hover:scale-110 transition-transform duration-300">${dept.icon}</div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-gradient transition-all tracking-tight">
            ${dept.name}
          </h3>
        </div>
        <p class="text-gray-600 dark:text-gray-400 mb-6 text-lg leading-relaxed">
          ${dept.description.replace(/professional /gi, '').replace(/\d+\s+\w+\s+prompts/gi, '').trim()}
        </p>
        <div class="flex items-center justify-between pt-5 border-t border-gray-200 dark:border-gray-700">
          <span class="text-gray-600 dark:text-gray-400 font-medium">Browse</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="text-primary-600 dark:text-primary-400 transform group-hover:translate-x-2 transition-transform">
            <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </a>
  `).join('');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
