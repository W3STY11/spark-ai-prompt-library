import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BLOB_ENDPOINTS } from '../config';
import {
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
  Title1,
  Title2,
  Title3,
  Subtitle1,
  Body1,
  Body2,
  Button,
  Card,
  CardHeader,
  CardFooter,
  Input,
  Dropdown,
  Option,
  Badge,
  Spinner,
  Toast,
  Toaster,
  useToastController,
  useId,
} from '@fluentui/react-components';
import {
  Search24Regular,
  Grid24Regular,
  List24Regular,
  Filter24Regular,
  ArrowRight24Regular,
  Sparkle24Filled,
  Dismiss24Regular,
  ArrowLeft24Regular,
  ArrowRight24Filled,
  Image24Regular,
  Checkmark24Filled,
  Add24Regular,
} from '@fluentui/react-icons';
import { glass } from '../ui/themeGlass';
import Header from './Header';
import AddPromptModal from './AddPromptModal';

const useStyles = makeStyles({
  container: {
    minHeight: '100vh',
  },
  main: {
    maxWidth: '1280px',
    margin: '0 auto',
    ...shorthands.padding('48px', '24px'),
  },
  filtersSection: {
    marginBottom: '32px',
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr auto',
    ...shorthands.gap('16px'),
    marginBottom: '16px',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
  searchInput: {
    width: '100%',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  viewButtons: {
    display: 'flex',
    ...shorthands.gap('8px'),
  },
  resultsInfo: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('16px'),
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    ...shorthands.gap('24px'),
    marginBottom: '48px',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('12px'),
    marginBottom: '48px',
  },
  promptCard: {
    height: '100%',
    cursor: 'pointer',
    ...glass.card,
    ...shorthands.borderRadius('8px'),
  },
  promptCardDark: {
    ...glass.cardDark,
  },
  promptListItem: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('16px'),
    ...shorthands.padding('20px'),
    ...glass.card,
    ...shorthands.borderRadius('8px'),
    cursor: 'pointer',
  },
  promptListItemDark: {
    ...glass.cardDark,
  },
  promptIcon: {
    fontSize: '36px',
  },
  promptContent: {
    flex: 1,
    minWidth: 0,
  },
  promptMeta: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
    flexShrink: 0,
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    ...shorthands.gap('8px'),
    marginTop: '12px',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ...shorthands.gap('8px'),
  },
  emptyState: {
    textAlign: 'center',
    ...shorthands.padding('96px', '24px'),
  },
  emptyIcon: {
    fontSize: '96px',
    marginBottom: '24px',
  },
});

const PROMPTS_PER_PAGE = 50;

export default function BrowsePage({ isDark, toggleTheme }) {
  const styles = useStyles();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [allPrompts, setAllPrompts] = useState([]);
  const [filteredPrompts, setFilteredPrompts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedDepartment, setSelectedDepartment] = useState(searchParams.get('department') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
  const [sortBy, setSortBy] = useState('title');
  const [viewMode, setViewMode] = useState('card');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedPromptId, setCopiedPromptId] = useState(null);
  const [isAddPromptModalOpen, setIsAddPromptModalOpen] = useState(false);

  const toasterId = useId('toaster');
  const { dispatchToast } = useToastController(toasterId);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedDepartment, selectedSubcategory, sortBy, allPrompts]);

  const loadData = async () => {
    try {
      // Fetch from Blob Storage FIRST (Azure Static Web Apps deployment)
      const response = await fetch(BLOB_ENDPOINTS.PROMPTS_INDEX);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (data) {
        // All prompts are already filtered (no status field needed)
        const prompts = Array.isArray(data.prompts) ? data.prompts : Array.isArray(data.items) ? data.items : [];
        setAllPrompts(prompts);
        setDepartments(data.departments || []);
      }
    } catch (error) {
      console.error('Failed to load prompts:', error);
      setAllPrompts([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allPrompts];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(prompt =>
        prompt.title.toLowerCase().includes(query) ||
        prompt.description.toLowerCase().includes(query) ||
        prompt.subcategory.toLowerCase().includes(query) ||
        (prompt.tags || []).some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Department filter
    if (selectedDepartment) {
      filtered = filtered.filter(prompt => prompt.department === selectedDepartment);
    }

    // Subcategory filter
    if (selectedSubcategory) {
      filtered = filtered.filter(prompt => prompt.subcategory === selectedSubcategory);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'department') {
        return a.department.localeCompare(b.department) || a.title.localeCompare(b.title);
      }
      return 0;
    });

    setFilteredPrompts(filtered);
    setCurrentPage(1);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    if (value) {
      searchParams.set('search', value);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const handleDepartmentChange = (value) => {
    setSelectedDepartment(value);
    setSelectedSubcategory(''); // Reset subcategory when department changes
    if (value) {
      searchParams.set('department', value);
    } else {
      searchParams.delete('department');
    }
    searchParams.delete('subcategory');
    setSearchParams(searchParams);
  };

  const handleSubcategoryChange = (value) => {
    setSelectedSubcategory(value);
    if (value) {
      searchParams.set('subcategory', value);
    } else {
      searchParams.delete('subcategory');
    }
    setSearchParams(searchParams);
  };

  // Get available subcategories based on selected department
  const getAvailableSubcategories = () => {
    if (!selectedDepartment) return [];

    const subcategoriesSet = new Set();
    allPrompts
      .filter(prompt => prompt.department === selectedDepartment)
      .forEach(prompt => {
        if (prompt.subcategory) {
          subcategoriesSet.add(prompt.subcategory);
        }
      });

    return Array.from(subcategoriesSet).sort();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('');
    setSelectedSubcategory('');
    setSortBy('title');
    setSearchParams({});
  };

  const handlePromptClick = (promptId) => {
    navigate(`/view?id=${promptId}`);
  };

  const handleAddPrompt = async (newPrompt) => {
    try {
      // Reload data from the API to get the latest persisted data
      await loadData();

      // Show success toast
      dispatchToast(
        <Toast>
          <div>✅ Prompt "{newPrompt.title}" has been added successfully!</div>
        </Toast>,
        { intent: 'success' }
      );
    } catch (error) {
      console.error('Error reloading prompts:', error);
      // Still show success since the save itself succeeded
      dispatchToast(
        <Toast>
          <div>✅ Prompt added! Refresh the page to see it.</div>
        </Toast>,
        { intent: 'success' }
      );
    }
  };

  const copyToCopilot = async (event, prompt) => {
    event.stopPropagation(); // Prevent card click navigation

    if (!prompt?.content) return;

    try {
      const copilotText = `# AI Prompt: ${prompt.title}\n\n${prompt.content}\n\n---\nCopied from SPARK Prompt Library`;

      // Copy to clipboard as fallback
      await navigator.clipboard.writeText(copilotText);

      // Send to Copilot tab via BroadcastChannel
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const channel = new BroadcastChannel('spark_copilot');
          channel.postMessage({
            type: 'INSERT_PROMPT',
            content: copilotText,
            title: prompt.title
          });
          channel.close();
        } catch (broadcastErr) {
          console.warn('BroadcastChannel not available:', broadcastErr);
        }
      }

      // Also try localStorage for cross-tab communication
      try {
        localStorage.setItem('spark_prompt_transfer', JSON.stringify({
          content: copilotText,
          timestamp: Date.now()
        }));
        // Clear after a moment to trigger storage event
        setTimeout(() => {
          localStorage.removeItem('spark_prompt_transfer');
        }, 100);
      } catch (storageErr) {
        console.warn('localStorage not available:', storageErr);
      }

      setCopiedPromptId(prompt.id);

      dispatchToast(
        <Toast>
          <div>✨ Sent to Copilot! Switch to your Copilot tab</div>
        </Toast>,
        { intent: 'success' }
      );

      setTimeout(() => setCopiedPromptId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      dispatchToast(
        <Toast>
          <div>Failed to send to Copilot</div>
        </Toast>,
        { intent: 'error' }
      );
    }
  };

  const getPagePrompts = () => {
    const start = (currentPage - 1) * PROMPTS_PER_PAGE;
    const end = start + PROMPTS_PER_PAGE;
    return filteredPrompts.slice(start, end);
  };

  const getTotalPages = () => {
    return Math.ceil(filteredPrompts.length / PROMPTS_PER_PAGE);
  };

  const renderCard = (prompt) => (
    <Card
      key={prompt.id}
      className={mergeClasses(styles.promptCard, isDark && styles.promptCardDark)}
      onClick={() => handlePromptClick(prompt.id)}
    >
      <div style={{ padding: '8px 12px', position: 'relative' }}>
        {/* Absolutely positioned image indicator - no layout impact */}
        {prompt.images && prompt.images.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            color: tokens.colorNeutralForeground3,
            pointerEvents: 'none',
            zIndex: 1
          }}>
            <Image24Regular />
          </div>
        )}

        {/* Single-line header: Icon · Title · WordCount · DepartmentBadge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <span style={{ fontSize: '24px', flexShrink: 0 }}>{prompt.icon}</span>
          <Title3
            block
            style={{
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginBottom: 0
            }}
          >
            {prompt.title}
          </Title3>
          <span style={{
            fontSize: '12px',
            color: tokens.colorNeutralForeground2,
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            {prompt.word_count}w
          </span>
          <Badge appearance="filled" color="brand" size="small" style={{ flexShrink: 0 }}>
            {prompt.department}
          </Badge>
        </div>

        <Body2 block style={{ marginBottom: '8px', color: tokens.colorNeutralForeground2 }}>
          {prompt.description.substring(0, 120)}...
        </Body2>

        {prompt.tags && prompt.tags.length > 0 && (
          <div className={styles.tagsContainer} style={{ marginTop: '8px' }}>
            {prompt.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} appearance="outline" size="small">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: `1px solid ${tokens.colorNeutralStroke2}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              appearance="subtle"
              size="small"
              icon={copiedPromptId === prompt.id ? <Checkmark24Filled /> : <Sparkle24Filled />}
              onClick={(e) => copyToCopilot(e, prompt)}
              style={{
                minWidth: 'auto',
                background: copiedPromptId === prompt.id ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: copiedPromptId === prompt.id ? tokens.colorBrandForeground1 : 'white',
              }}
            >
              {copiedPromptId === prompt.id ? 'Copied!' : 'Copy to Copilot'}
            </Button>
            <ArrowRight24Regular style={{ color: tokens.colorBrandForeground1 }} />
          </div>
        </div>
      </div>
    </Card>
  );

  const renderListItem = (prompt) => (
    <div
      key={prompt.id}
      className={mergeClasses(styles.promptListItem, isDark && styles.promptListItemDark)}
      onClick={() => handlePromptClick(prompt.id)}
    >
      <span className={styles.promptIcon}>{prompt.icon}</span>

      <div className={styles.promptContent}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <Badge appearance="filled" color="brand" size="small">
            {prompt.department}
          </Badge>
          <Title3>{prompt.title}</Title3>
        </div>
        <Body2 style={{ color: tokens.colorNeutralForeground2 }}>
          {prompt.description.substring(0, 100)}...
        </Body2>
      </div>

      <div className={styles.promptMeta}>
        {prompt.images && prompt.images.length > 0 && <Image24Regular />}
        <Body2>{prompt.word_count} words</Body2>
        <Button
          appearance="subtle"
          size="small"
          icon={copiedPromptId === prompt.id ? <Checkmark24Filled /> : <Sparkle24Filled />}
          onClick={(e) => copyToCopilot(e, prompt)}
          style={{
            minWidth: 'auto',
            background: copiedPromptId === prompt.id ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: copiedPromptId === prompt.id ? tokens.colorBrandForeground1 : 'white',
          }}
        >
          {copiedPromptId === prompt.id ? 'Copied!' : 'Copy to Copilot'}
        </Button>
        <ArrowRight24Regular style={{ color: tokens.colorBrandForeground1 }} />
      </div>
    </div>
  );

  const renderPagination = () => {
    const totalPages = getTotalPages();
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const startPage = Math.max(1, currentPage - 3);
    const endPage = Math.min(totalPages, startPage + 6);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className={styles.pagination}>
        <Button
          appearance="subtle"
          icon={<ArrowLeft24Regular />}
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </Button>

        {startPage > 1 && (
          <>
            <Button appearance="subtle" onClick={() => setCurrentPage(1)}>1</Button>
            {startPage > 2 && <span>...</span>}
          </>
        )}

        {pageNumbers.map(page => (
          <Button
            key={page}
            appearance={page === currentPage ? 'primary' : 'subtle'}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </Button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span>...</span>}
            <Button appearance="subtle" onClick={() => setCurrentPage(totalPages)}>{totalPages}</Button>
          </>
        )}

        <Button
          appearance="subtle"
          icon={<ArrowRight24Filled />}
          iconPosition="after"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header isDark={isDark} toggleTheme={toggleTheme} />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spinner size="huge" label="Loading prompts..." />
        </div>
      </div>
    );
  }

  const pagePrompts = getPagePrompts();
  const resultsCount = searchQuery || selectedDepartment ? filteredPrompts.length.toLocaleString() : '2000+';

  return (
    <div className={styles.container}>
      <Header isDark={isDark} toggleTheme={toggleTheme} />
      <Toaster toasterId={toasterId} />

      {/* Main Content */}
      <main className={styles.main}>
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <Title1 block style={{ marginBottom: '8px' }}>Browse Prompts</Title1>
          <Body1>Explore our collection of {resultsCount} AI prompts</Body1>
        </div>

        {/* Filters */}
        <div className={styles.filtersSection}>
          <div className={styles.filtersGrid}>
            <Input
              className={styles.searchInput}
              placeholder="Search prompts..."
              contentBefore={<Search24Regular />}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />

            <Dropdown
              placeholder="All Departments"
              value={selectedDepartment}
              onOptionSelect={(e, data) => handleDepartmentChange(data.optionValue || '')}
            >
              <Option value="">All Departments</Option>
              {departments.map(dept => (
                <Option key={dept.name} value={dept.name}>
                  {dept.icon} {dept.name}
                </Option>
              ))}
            </Dropdown>

            <Dropdown
              placeholder="All Subcategories"
              value={selectedSubcategory}
              onOptionSelect={(e, data) => handleSubcategoryChange(data.optionValue || '')}
              disabled={!selectedDepartment}
            >
              <Option value="">All Subcategories</Option>
              {getAvailableSubcategories().map(subcategory => (
                <Option key={subcategory} value={subcategory}>
                  {subcategory}
                </Option>
              ))}
            </Dropdown>

            <Dropdown
              placeholder="Sort by"
              value={sortBy}
              onOptionSelect={(e, data) => setSortBy(data.optionValue || 'title')}
            >
              <Option value="title">Title</Option>
              <Option value="date">Date</Option>
              <Option value="department">Department</Option>
            </Dropdown>

            <Button
              appearance="subtle"
              icon={<Dismiss24Regular />}
              onClick={clearFilters}
              disabled={!searchQuery && !selectedDepartment && !selectedSubcategory && sortBy === 'title'}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.resultsInfo}>
            <Button
              appearance="primary"
              icon={<Add24Regular />}
              onClick={() => setIsAddPromptModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontWeight: 600,
              }}
            >
              Add Prompt
            </Button>
            <Body1 style={{ fontWeight: 600 }}>
              {filteredPrompts.length.toLocaleString()} {filteredPrompts.length === 1 ? 'prompt' : 'prompts'}
            </Body1>
          </div>

          <div className={styles.viewButtons}>
            <Button
              appearance={viewMode === 'card' ? 'primary' : 'subtle'}
              icon={<Grid24Regular />}
              onClick={() => setViewMode('card')}
            >
              Card
            </Button>
            <Button
              appearance={viewMode === 'list' ? 'primary' : 'subtle'}
              icon={<List24Regular />}
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>

        {/* Results */}
        {pagePrompts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <Title2 block style={{ marginBottom: '8px' }}>No prompts found</Title2>
            <Body1>Try adjusting your filters</Body1>
          </div>
        ) : viewMode === 'card' ? (
          <div className={styles.gridContainer}>
            {pagePrompts.map(renderCard)}
          </div>
        ) : (
          <div className={styles.listContainer}>
            {pagePrompts.map(renderListItem)}
          </div>
        )}

        {/* Pagination */}
        {renderPagination()}
      </main>

      {/* Add Prompt Modal */}
      <AddPromptModal
        isOpen={isAddPromptModalOpen}
        onClose={() => setIsAddPromptModalOpen(false)}
        onSubmit={handleAddPrompt}
      />
    </div>
  );
}
