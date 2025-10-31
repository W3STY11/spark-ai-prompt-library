import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
  Title1,
  Title2,
  Title3,
  Body1,
  Body2,
  Button,
  Input,
  Dropdown,
  Option,
  Badge,
  Spinner,
  Card,
  CardHeader,
  Toast,
  Toaster,
  useToastController,
  useId,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Textarea,
  Field,
} from '@fluentui/react-components';
import {
  Add24Regular,
  Delete24Regular,
  Edit24Regular,
  Search24Regular,
  ArrowDownload24Regular,
  ArrowUpload24Regular,
  CheckmarkCircle24Regular,
  DismissCircle24Regular,
  DatabaseCheckmark24Regular,
  Save24Regular,
  Filter24Regular,
  Dismiss24Regular,
} from '@fluentui/react-icons';
import { glass } from '../ui/themeGlass';
import Header from './Header';
import AdminNavigation from './AdminNavigation';
import EditPromptModal from './EditPromptModal';
// TEMPORARILY DISABLED - Missing backend endpoints
// import PendingPromptsSection from './PendingPromptsSection';
import { API_ENDPOINTS } from '../config';

const useStyles = makeStyles({
  container: {
    minHeight: '100vh',
  },
  main: {
    maxWidth: '1440px',
    margin: '0 auto',
    ...shorthands.padding('48px', '24px'),
  },
  header: {
    marginBottom: '32px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    ...shorthands.gap('16px'),
    marginBottom: '32px',
  },
  statCard: {
    ...glass.card,
    ...shorthands.padding('24px'),
    ...shorthands.borderRadius('8px'),
  },
  statCardDark: {
    ...glass.cardDark,
  },
  toolsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    ...shorthands.gap('12px'),
    marginBottom: '32px',
  },
  searchBar: {
    display: 'flex',
    ...shorthands.gap('12px'),
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: '1',
    minWidth: '280px',
  },
  tableContainer: {
    ...glass.card,
    ...shorthands.borderRadius('8px'),
    ...shorthands.padding('24px'),
    overflowX: 'auto',
  },
  tableContainerDark: {
    ...glass.cardDark,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    borderBottom: `2px solid ${tokens.colorNeutralStroke1}`,
    textAlign: 'left',
    ...shorthands.padding('12px'),
    fontWeight: 600,
  },
  tableRow: {
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  tableCell: {
    ...shorthands.padding('12px'),
  },
  actionButtons: {
    display: 'flex',
    ...shorthands.gap('8px'),
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '24px',
  },
  bulkActions: {
    display: 'flex',
    ...shorthands.gap('12px'),
    alignItems: 'center',
    marginBottom: '16px',
    ...shorthands.padding('12px'),
    ...shorthands.borderRadius('8px'),
    backgroundColor: tokens.colorBrandBackground2,
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('20px'),
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    ...shorthands.gap('16px'),
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
});

const DEPARTMENTS = [
  { name: 'Business', icon: '💼' },
  { name: 'Marketing', icon: '📢' },
  { name: 'Sales', icon: '💰' },
  { name: 'SEO', icon: '🔍' },
  { name: 'Finance', icon: '💵' },
  { name: 'Education', icon: '📚' },
  { name: 'Writing', icon: '✍️' },
  { name: 'Productivity', icon: '⚡' },
  { name: 'Solopreneurs', icon: '🚀' },
];

export default function AdminDashboardPage({ isDark, toggleTheme }) {
  const styles = useStyles();
  const navigate = useNavigate();
  const toasterId = useId('admin-toaster');
  const { dispatchToast } = useToastController(toasterId);

  // State
  const [prompts, setPrompts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredPrompts, setFilteredPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedPrompts, setSelectedPrompts] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    byDepartment: {},
    recentlyAdded: 0,
  });

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkImportModalOpen, setBulkImportModalOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [importData, setImportData] = useState('');
  const [importMode, setImportMode] = useState('json'); // 'json' or 'csv'
  const [csvFile, setCsvFile] = useState(null);

  const itemsPerPage = 20;

  useEffect(() => {
    loadPrompts();
  }, []);

  useEffect(() => {
    filterPrompts();
  }, [searchTerm, selectedDepartment, prompts]);

  const loadPrompts = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.PROMPTS);
      if (!response.ok) throw new Error('Failed to load prompts');
      const data = await response.json();

      const allPrompts = Array.isArray(data.prompts)
        ? data.prompts
        : Array.isArray(data.items)
        ? data.items
        : [];

      // Get departments from API response (includes departments with 0 prompts)
      const depts = data.departments || [];
      setDepartments(depts);

      setPrompts(allPrompts);
      calculateStats(allPrompts);
    } catch (error) {
      console.error('Error loading prompts:', error);
      dispatchToast(
        <Toast>❌ Failed to load prompts</Toast>,
        { intent: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (promptList) => {
    const byDept = {};
    departments.forEach(d => byDept[d.name] = 0);

    promptList.forEach(p => {
      if (p.department) {
        if (byDept[p.department] !== undefined) {
          byDept[p.department]++;
        } else {
          // Department not in our list, but exists in prompts - still count it
          byDept[p.department] = 1;
        }
      }
    });

    // Calculate recently added (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = promptList.filter(p => {
      if (!p.date) return false;
      const promptDate = new Date(p.date);
      return promptDate > thirtyDaysAgo;
    }).length;

    setStats({
      total: promptList.length,
      byDepartment: byDept,
      recentlyAdded: recent,
    });
  };

  const filterPrompts = () => {
    let filtered = prompts;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.department?.toLowerCase().includes(term) ||
        p.subcategory?.toLowerCase().includes(term)
      );
    }

    if (selectedDepartment !== 'All') {
      filtered = filtered.filter(p => p.department === selectedDepartment);
    }

    setFilteredPrompts(filtered);
    setCurrentPage(1);
  };

  const handleEdit = (prompt) => {
    setCurrentPrompt(prompt);
    setEditModalOpen(true);
  };

  const handleDelete = (prompt) => {
    setCurrentPrompt(prompt);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(API_ENDPOINTS.PROMPT_BY_ID(currentPrompt.id), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete prompt');

      dispatchToast(
        <Toast>✅ Prompt deleted successfully</Toast>,
        { intent: 'success' }
      );

      setDeleteModalOpen(false);
      loadPrompts();
    } catch (error) {
      console.error('Error deleting prompt:', error);
      dispatchToast(
        <Toast>❌ Failed to delete prompt</Toast>,
        { intent: 'error' }
      );
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const currentPagePrompts = getCurrentPagePrompts();
      const newSelected = new Set(selectedPrompts);
      currentPagePrompts.forEach(p => newSelected.add(p.id));
      setSelectedPrompts(newSelected);
    } else {
      setSelectedPrompts(new Set());
    }
  };

  const handleSelectPrompt = (promptId, checked) => {
    const newSelected = new Set(selectedPrompts);
    if (checked) {
      newSelected.add(promptId);
    } else {
      newSelected.delete(promptId);
    }
    setSelectedPrompts(newSelected);
  };

  const handleBulkDelete = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(API_ENDPOINTS.PROMPTS_BULK_DELETE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: Array.from(selectedPrompts) }),
      });

      if (!response.ok) throw new Error('Failed to delete prompts');

      dispatchToast(
        <Toast>✅ {selectedPrompts.size} prompts deleted successfully</Toast>,
        { intent: 'success' }
      );

      setBulkDeleteModalOpen(false);
      setSelectedPrompts(new Set());
      loadPrompts();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      dispatchToast(
        <Toast>❌ Failed to delete prompts</Toast>,
        { intent: 'error' }
      );
    }
  };

  // Helper function to parse CSV content with proper multi-line quoted field support
  const parseCSV = (csvText) => {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;

    // Parse character by character, building complete rows
    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote (double quote) - add single quote to field
          currentField += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state (start or end of quoted field)
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator (only outside quotes)
        currentRow.push(currentField);
        currentField = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        // Row separator (only outside quotes)
        // Skip \r in \r\n sequences
        if (char === '\r' && nextChar === '\n') {
          continue;
        }

        // Add the last field and complete the row
        currentRow.push(currentField);

        // Only add non-empty rows
        if (currentRow.some(field => field.trim())) {
          rows.push(currentRow);
        }

        // Reset for next row
        currentRow = [];
        currentField = '';
      } else {
        // Regular character - add to current field
        // Preserve newlines within quoted fields
        currentField += char;
      }
    }

    // Handle last field and row if file doesn't end with newline
    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField);
      if (currentRow.some(field => field.trim())) {
        rows.push(currentRow);
      }
    }

    return rows;
  };

  const handleBulkImport = async () => {
    try {
      let promptsData;

      if (importMode === 'json') {
        // Parse JSON data
        promptsData = JSON.parse(importData);
      } else {
        // Parse CSV file
        const fileContent = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (e) => reject(new Error('Failed to read CSV file'));
          reader.readAsText(csvFile);
        });

        const rows = parseCSV(fileContent);

        // Skip header row
        const dataRows = rows.slice(1);

        // Convert CSV rows to prompt objects
        promptsData = dataRows.map(row => {
          const [
            title,
            department,
            subcategory,
            description,
            content,
            tags,
            icon,
            word_count,
            complexity,
            date,
            last_modified,
            status
          ] = row;

          // Generate unique ID
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2, 11);
          const id = `prompt_${timestamp}_${random}`;

          // Convert tags from semicolon-separated string to array
          const tagsArray = tags
            ? tags.split(';').map(tag => tag.trim()).filter(tag => tag)
            : [];

          return {
            id,
            title: title || '',
            department: department || '',
            subcategory: subcategory || '',
            description: description || '',
            content: content || '',
            tags: tagsArray,
            icon: icon || '',
            word_count: word_count ? parseInt(word_count, 10) : 0,
            complexity: complexity || 'intermediate',
            date: date || new Date().toISOString().split('T')[0],
            last_modified: last_modified || '',
            status: status || 'approved',
            images: [],
            tips: []
          };
        });
      }

      const token = localStorage.getItem('adminToken');

      const response = await fetch(API_ENDPOINTS.PROMPTS_BULK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ prompts: promptsData }),
      });

      if (!response.ok) throw new Error('Failed to import prompts');

      const result = await response.json();

      dispatchToast(
        <Toast>✅ Successfully imported {result.count} prompts from {importMode.toUpperCase()}</Toast>,
        { intent: 'success' }
      );

      setBulkImportModalOpen(false);
      setImportData('');
      setCsvFile(null);
      loadPrompts();
    } catch (error) {
      console.error('Error bulk importing:', error);
      dispatchToast(
        <Toast>❌ Failed to import prompts: {error.message}</Toast>,
        { intent: 'error' }
      );
    }
  };

  const handleManualBackup = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(API_ENDPOINTS.ADMIN_BACKUP, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to create backup');

      dispatchToast(
        <Toast>✅ Backup created successfully</Toast>,
        { intent: 'success' }
      );
    } catch (error) {
      console.error('Error creating backup:', error);
      dispatchToast(
        <Toast>❌ Failed to create backup</Toast>,
        { intent: 'error' }
      );
    }
  };

  const handleValidate = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(API_ENDPOINTS.ADMIN_VALIDATE, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to validate data');

      const result = await response.json();

      dispatchToast(
        <Toast>
          ✅ Validation complete: {result.summary.totalIssues} issues found
        </Toast>,
        { intent: result.summary.totalIssues === 0 ? 'success' : 'warning' }
      );

      console.log('Validation results:', result);
    } catch (error) {
      console.error('Error validating:', error);
      dispatchToast(
        <Toast>❌ Failed to validate data</Toast>,
        { intent: 'error' }
      );
    }
  };

  const handleExportJSON = () => {
    try {
      // Get selected prompts
      const selectedPromptIds = Array.from(selectedPrompts);
      const promptsToExport = prompts.filter(p => selectedPromptIds.includes(p.id));

      if (promptsToExport.length === 0) {
        dispatchToast(
          <Toast>❌ No prompts selected for export</Toast>,
          { intent: 'error' }
        );
        return;
      }

      // Create JSON string with proper formatting
      const jsonData = JSON.stringify(promptsToExport, null, 2);

      // Create blob and download
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `prompts-export-${timestamp}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      dispatchToast(
        <Toast>✅ Exported {promptsToExport.length} prompts to JSON</Toast>,
        { intent: 'success' }
      );
    } catch (error) {
      console.error('Error exporting JSON:', error);
      dispatchToast(
        <Toast>❌ Failed to export JSON</Toast>,
        { intent: 'error' }
      );
    }
  };

  const handleExportCSV = () => {
    try {
      // Get selected prompts
      const selectedPromptIds = Array.from(selectedPrompts);
      const promptsToExport = prompts.filter(p => selectedPromptIds.includes(p.id));

      if (promptsToExport.length === 0) {
        dispatchToast(
          <Toast>❌ No prompts selected for export</Toast>,
          { intent: 'error' }
        );
        return;
      }

      // Define CSV headers with clean, descriptive names
      const headers = [
        'Title',
        'Department',
        'Subcategory',
        'Description',
        'Prompt Content',
        'Tags',
        'Icon',
        'Word Count',
        'Complexity',
        'Date Created',
        'Last Modified',
        'Status'
      ];

      // Helper function to escape CSV values
      const escapeCSV = (value) => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        // Escape quotes and wrap in quotes if contains comma, newline, or quote
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      // Create CSV rows
      const rows = promptsToExport.map(prompt => {
        return [
          escapeCSV(prompt.title || ''),
          escapeCSV(prompt.department || ''),
          escapeCSV(prompt.subcategory || ''),
          escapeCSV(prompt.description || ''),
          escapeCSV(prompt.content || ''),
          escapeCSV(Array.isArray(prompt.tags) ? prompt.tags.join('; ') : prompt.tags || ''),
          escapeCSV(prompt.icon || ''),
          escapeCSV(prompt.word_count || ''),
          escapeCSV(prompt.complexity || ''),
          escapeCSV(prompt.date || ''),
          escapeCSV(prompt.last_modified || ''),
          escapeCSV(prompt.status || 'approved')
        ].join(',');
      });

      // Combine headers and rows
      const csvContent = [headers.join(','), ...rows].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `prompts-export-${timestamp}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      dispatchToast(
        <Toast>✅ Exported {promptsToExport.length} prompts to CSV</Toast>,
        { intent: 'success' }
      );
    } catch (error) {
      console.error('Error exporting CSV:', error);
      dispatchToast(
        <Toast>❌ Failed to export CSV</Toast>,
        { intent: 'error' }
      );
    }
  };

  const getCurrentPagePrompts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPrompts.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = Math.ceil(filteredPrompts.length / itemsPerPage);

  if (loading) {
    return (
      <div className={styles.container}>
        <Header isDark={isDark} toggleTheme={toggleTheme} />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spinner size="huge" label="Loading admin dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header isDark={isDark} toggleTheme={toggleTheme} />
      <Toaster toasterId={toasterId} />

      <main className={styles.main}>
        <AdminNavigation />

        {/* Header */}
        <div className={styles.header}>
          <Title1 block style={{ marginBottom: '8px' }}>Admin Dashboard</Title1>
          <Body1 style={{ color: tokens.colorNeutralForeground2 }}>
            Manage all {stats.total} prompts across {departments.length} departments
          </Body1>
        </div>

        {/* Pending Approvals Section */}
        {/* TEMPORARILY DISABLED - Missing backend endpoints */}
        {/* <PendingPromptsSection isDark={isDark} onUpdate={loadPrompts} /> */}

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={mergeClasses(styles.statCard, isDark && styles.statCardDark)}>
            <Title3 block style={{ marginBottom: '8px' }}>Total Prompts</Title3>
            <Title1 block>{stats.total}</Title1>
          </div>

          <div className={mergeClasses(styles.statCard, isDark && styles.statCardDark)}>
            <Title3 block style={{ marginBottom: '8px' }}>Departments</Title3>
            <Title1 block>{departments.length}</Title1>
          </div>

          <div className={mergeClasses(styles.statCard, isDark && styles.statCardDark)}>
            <Title3 block style={{ marginBottom: '8px' }}>Recently Added</Title3>
            <Title1 block>{stats.recentlyAdded}</Title1>
            <Body2 style={{ color: tokens.colorNeutralForeground2 }}>Last 30 days</Body2>
          </div>

          <div className={mergeClasses(styles.statCard, isDark && styles.statCardDark)}>
            <Title3 block style={{ marginBottom: '8px' }}>Selected</Title3>
            <Title1 block>{selectedPrompts.size}</Title1>
            <Body2 style={{ color: tokens.colorNeutralForeground2 }}>
              {selectedPrompts.size > 0 ? 'Ready for bulk actions' : 'None selected'}
            </Body2>
          </div>
        </div>

        {/* Admin Tools */}
        <div className={styles.toolsGrid}>
          <Button
            appearance="primary"
            icon={<Add24Regular />}
            onClick={() => navigate('/browse')}
          >
            Add Prompt
          </Button>

          <Button
            appearance="secondary"
            icon={<ArrowUpload24Regular />}
            onClick={() => setBulkImportModalOpen(true)}
          >
            Bulk Import
          </Button>

          <Button
            appearance="secondary"
            icon={<Save24Regular />}
            onClick={handleManualBackup}
          >
            Create Backup
          </Button>

          <Button
            appearance="secondary"
            icon={<DatabaseCheckmark24Regular />}
            onClick={handleValidate}
          >
            Validate Data
          </Button>
        </div>

        {/* Search and Filter */}
        <div className={styles.searchBar}>
          <Input
            className={styles.searchInput}
            placeholder="Search prompts by title, description, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            contentBefore={<Search24Regular />}
          />

          <Dropdown
            placeholder="All Departments"
            value={selectedDepartment}
            onOptionSelect={(e, data) => setSelectedDepartment(data.optionValue || 'All')}
            style={{ minWidth: '200px' }}
          >
            <Option value="All">All Departments</Option>
            {departments.map(dept => (
              <Option key={dept.name} value={dept.name}>
                {dept.icon} {dept.name}
              </Option>
            ))}
          </Dropdown>

          {searchTerm || selectedDepartment !== 'All' ? (
            <Button
              appearance="subtle"
              onClick={() => {
                setSearchTerm('');
                setSelectedDepartment('All');
              }}
            >
              Clear Filters
            </Button>
          ) : null}
        </div>

        {/* Bulk Actions Bar */}
        {selectedPrompts.size > 0 && (
          <div className={styles.bulkActions}>
            <Checkbox
              checked={selectedPrompts.size === getCurrentPagePrompts().length}
              onChange={(e, data) => handleSelectAll(data.checked)}
              label={`${selectedPrompts.size} selected`}
            />
            <div style={{ flex: 1 }} />
            <Button
              appearance="secondary"
              icon={<ArrowDownload24Regular />}
              onClick={handleExportJSON}
            >
              Export JSON
            </Button>
            <Button
              appearance="secondary"
              icon={<ArrowDownload24Regular />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
            <Button
              appearance="primary"
              icon={<Delete24Regular />}
              onClick={() => setBulkDeleteModalOpen(true)}
            >
              Delete Selected
            </Button>
          </div>
        )}

        {/* Prompts Table */}
        <div className={mergeClasses(styles.tableContainer, isDark && styles.tableContainerDark)}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeader} style={{ width: '50px' }}>
                  <Checkbox
                    checked={selectedPrompts.size > 0 && selectedPrompts.size === getCurrentPagePrompts().length}
                    onChange={(e, data) => handleSelectAll(data.checked)}
                  />
                </th>
                <th className={styles.tableHeader}>Title</th>
                <th className={styles.tableHeader}>Department</th>
                <th className={styles.tableHeader}>Subcategory</th>
                <th className={styles.tableHeader}>Words</th>
                <th className={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentPagePrompts().map(prompt => (
                <tr key={prompt.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <Checkbox
                      checked={selectedPrompts.has(prompt.id)}
                      onChange={(e, data) => handleSelectPrompt(prompt.id, data.checked)}
                    />
                  </td>
                  <td className={styles.tableCell}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{prompt.icon}</span>
                      <span style={{ fontWeight: 500 }}>{prompt.title}</span>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <Badge appearance="filled" color="brand">
                      {prompt.department}
                    </Badge>
                  </td>
                  <td className={styles.tableCell}>
                    <Body2>{prompt.subcategory}</Body2>
                  </td>
                  <td className={styles.tableCell}>
                    <Body2>{prompt.word_count}</Body2>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.actionButtons}>
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<Edit24Regular />}
                        onClick={() => handleEdit(prompt)}
                      />
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<Delete24Regular />}
                        onClick={() => handleDelete(prompt)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <Body2>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredPrompts.length)} of {filteredPrompts.length} prompts
              </Body2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  appearance="secondary"
                  size="small"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <Body2 style={{ lineHeight: '32px', padding: '0 16px' }}>
                  Page {currentPage} of {totalPages}
                </Body2>
                <Button
                  appearance="secondary"
                  size="small"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteModalOpen} onOpenChange={(e, data) => !data.open && setDeleteModalOpen(false)}>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Delete Prompt</DialogTitle>
              <DialogContent>
                <Body1>
                  Are you sure you want to delete "{currentPrompt?.title}"? This action cannot be undone.
                </Body1>
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={() => setDeleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button appearance="primary" onClick={confirmDelete}>
                  Delete
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>

        {/* Bulk Delete Dialog */}
        <Dialog open={bulkDeleteModalOpen} onOpenChange={(e, data) => !data.open && setBulkDeleteModalOpen(false)}>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Bulk Delete Prompts</DialogTitle>
              <DialogContent>
                <Body1>
                  Are you sure you want to delete {selectedPrompts.size} selected prompts? This action cannot be undone.
                </Body1>
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={() => setBulkDeleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button appearance="primary" onClick={handleBulkDelete}>
                  Delete {selectedPrompts.size} Prompts
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>

        {/* Bulk Import Dialog */}
        <Dialog open={bulkImportModalOpen} onOpenChange={(e, data) => !data.open && setBulkImportModalOpen(false)}>
          <DialogSurface style={{ maxWidth: '600px' }}>
            <DialogBody>
              <DialogTitle>Bulk Import Prompts</DialogTitle>
              <DialogContent className={styles.dialogContent}>
                {/* Import Mode Selector */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <Button
                    appearance={importMode === 'json' ? 'primary' : 'secondary'}
                    onClick={() => setImportMode('json')}
                    style={{ flex: 1 }}
                  >
                    JSON Format
                  </Button>
                  <Button
                    appearance={importMode === 'csv' ? 'primary' : 'secondary'}
                    onClick={() => setImportMode('csv')}
                    style={{ flex: 1 }}
                  >
                    CSV Upload
                  </Button>
                </div>

                {importMode === 'json' ? (
                  <>
                    <Body1>
                      Paste your JSON array of prompts below. Each prompt should have: title, department, subcategory, description, content.
                    </Body1>
                    <Textarea
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      placeholder='[{"title": "...", "department": "Business", ...}]'
                      style={{ minHeight: '300px', fontFamily: 'monospace' }}
                    />
                  </>
                ) : (
                  <>
                    <Body1 style={{ marginBottom: '16px' }}>
                      Upload a CSV file with the following columns: Title, Department, Subcategory, Description, Prompt Content, Tags, Icon, Word Count, Complexity, Date Created, Last Modified, Status
                    </Body1>
                    <Field
                      label="Choose CSV File"
                      hint="Select a properly formatted CSV file exported from this system"
                    >
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setCsvFile(e.target.files[0])}
                      />
                    </Field>
                    {csvFile && (
                      <Body2 style={{ color: tokens.colorBrandForeground1, marginTop: '8px' }}>
                        ✅ Selected: {csvFile.name} ({(csvFile.size / 1024).toFixed(2)} KB)
                      </Body2>
                    )}
                  </>
                )}
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={() => {
                  setBulkImportModalOpen(false);
                  setImportData('');
                  setCsvFile(null);
                }}>
                  Cancel
                </Button>
                <Button
                  appearance="primary"
                  onClick={handleBulkImport}
                  disabled={importMode === 'json' ? !importData.trim() : !csvFile}
                >
                  Import Prompts
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>

        {/* Edit Prompt Modal */}
        <EditPromptModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          prompt={currentPrompt}
          onUpdate={() => loadPrompts()}
        />
      </main>
    </div>
  );
}
