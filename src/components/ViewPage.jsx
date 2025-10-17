import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
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
  Badge,
  Spinner,
  Toast,
  Toaster,
  useToastController,
  useId,
} from '@fluentui/react-components';
import {
  Copy24Regular,
  Checkmark24Filled,
  ArrowLeft24Regular,
  Heart24Regular,
  Heart24Filled,
  Share24Regular,
  ChevronRight24Regular,
  Sparkle24Filled,
} from '@fluentui/react-icons';
import { glass } from '../ui/themeGlass';
import Header from './Header';

const useStyles = makeStyles({
  container: {
    minHeight: '100vh',
  },
  main: {
    maxWidth: '1280px',
    margin: '0 auto',
    ...shorthands.padding('32px', '24px', '64px'),
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  breadcrumbLink: {
    color: tokens.colorNeutralForeground2,
    textDecoration: 'none',
    fontSize: '14px',
    ':hover': {
      color: tokens.colorBrandForeground1,
      textDecoration: 'underline',
    },
  },
  breadcrumbCurrent: {
    color: tokens.colorNeutralForeground1,
    fontSize: '14px',
    fontWeight: 600,
  },
  breadcrumbSeparator: {
    color: tokens.colorNeutralForeground3,
  },
  hero: {
    marginBottom: '48px',
  },
  heroHeader: {
    display: 'flex',
    alignItems: 'start',
    ...shorthands.gap('24px'),
    marginBottom: '24px',
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      ...shorthands.gap('16px'),
    },
  },
  heroIcon: {
    fontSize: '64px',
    color: tokens.colorBrandForeground1,
  },
  heroContent: {
    flex: 1,
    minWidth: 0,
  },
  heroTitle: {
    fontSize: '56px',
    fontWeight: 600,
    lineHeight: '64px',
    marginBottom: '16px',
    color: tokens.colorNeutralForeground1,
    '@media (max-width: 768px)': {
      fontSize: '36px',
      lineHeight: '44px',
    },
  },
  heroMeta: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('16px'),
    flexWrap: 'wrap',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    ...shorthands.gap('48px'),
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
  contentSection: {
    minWidth: 0,
  },
  sectionTitle: {
    marginBottom: '16px',
  },
  promptCard: {
    ...glass.card,
    ...shorthands.padding('32px'),
    ...shorthands.borderRadius('8px'),
    marginBottom: '24px',
  },
  promptCardDark: {
    ...glass.cardDark,
  },
  promptText: {
    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
    fontSize: '15px',
    lineHeight: '24px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    color: tokens.colorNeutralForeground1,
    maxHeight: '600px',
    overflowY: 'auto',
    ...shorthands.padding('24px'),
    background: isDark => isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
    ...shorthands.borderRadius('6px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
  },
  buttonGroup: {
    display: 'flex',
    ...shorthands.gap('12px'),
    marginTop: '24px',
    flexWrap: 'wrap',
  },
  copilotButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    ':hover': {
      background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
    },
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('24px'),
  },
  sidebarCard: {
    ...glass.card,
    ...shorthands.padding('24px'),
    ...shorthands.borderRadius('8px'),
  },
  sidebarCardDark: {
    ...glass.cardDark,
  },
  metaItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shorthands.padding('12px', '0'),
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
    ':last-child': {
      borderBottom: 'none',
    },
  },
  metaLabel: {
    color: tokens.colorNeutralForeground2,
    fontSize: '14px',
  },
  metaValue: {
    color: tokens.colorNeutralForeground1,
    fontSize: '14px',
    fontWeight: 600,
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    ...shorthands.gap('8px'),
  },
  actionButton: {
    width: '100%',
    justifyContent: 'flex-start',
  },
  emptyState: {
    ...glass.card,
    ...shorthands.padding('96px', '24px'),
    ...shorthands.borderRadius('8px'),
    textAlign: 'center',
  },
  emptyStateDark: {
    ...glass.cardDark,
  },
  emptyIcon: {
    fontSize: '96px',
    marginBottom: '24px',
  },
});

export default function ViewPage({ isDark, toggleTheme }) {
  const styles = useStyles();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const promptId = searchParams.get('id');

  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedType, setCopiedType] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const toasterId = useId('toaster');
  const { dispatchToast } = useToastController(toasterId);

  useEffect(() => {
    loadPrompt();
    checkFavorite();
  }, [promptId]);

  const loadPrompt = async () => {
    if (!promptId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch from API server - automatically filters to approved prompts only for public users
      const response = await fetch('http://localhost:3001/api/prompts');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      const foundPrompt = data.prompts?.find(p => p.id === promptId);

      if (foundPrompt) {
        setPrompt(foundPrompt);
      }
    } catch (error) {
      console.error('Failed to load from API, trying static index:', error);
      try {
        // Fallback to static JSON file
        const response = await fetch('/prompts_index.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        // Find prompt and check if it's approved (or no status for backward compatibility)
        const foundPrompt = data.prompts?.find(p => p.id === promptId);

        if (foundPrompt && (foundPrompt.status === 'approved' || !foundPrompt.status)) {
          setPrompt(foundPrompt);
        }
        // If prompt is pending or rejected, don't set it (will show "not found")
      } catch (error2) {
        console.error('Failed to load prompt from static file:', error2);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(promptId));
  };

  const copyToClipboard = async (type) => {
    if (!prompt?.content) return;

    try {
      let textToCopy = prompt.content;

      if (type === 'copilot') {
        textToCopy = `# AI Prompt: ${prompt.title}\n\n${prompt.content}\n\n---\nCopied from SPARK Prompt Library`;
      }

      await navigator.clipboard.writeText(textToCopy);

      setCopiedType(type);

      dispatchToast(
        <Toast>
          <div>✓ {type === 'copilot' ? 'Copied to Copilot format!' : 'Copied to clipboard!'}</div>
        </Toast>,
        { intent: 'success' }
      );

      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      dispatchToast(
        <Toast>
          <div>Failed to copy to clipboard</div>
        </Toast>,
        { intent: 'error' }
      );
    }
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    if (isFavorite) {
      const newFavorites = favorites.filter(id => id !== promptId);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      setIsFavorite(false);
      dispatchToast(
        <Toast>
          <div>Removed from favorites</div>
        </Toast>,
        { intent: 'info' }
      );
    } else {
      favorites.push(promptId);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(true);
      dispatchToast(
        <Toast>
          <div>Added to favorites</div>
        </Toast>,
        { intent: 'success' }
      );
    }
  };

  const sharePrompt = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      dispatchToast(
        <Toast>
          <div>Link copied to clipboard</div>
        </Toast>,
        { intent: 'success' }
      );
    } catch (err) {
      dispatchToast(
        <Toast>
          <div>Failed to copy link</div>
        </Toast>,
        { intent: 'error' }
      );
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header isDark={isDark} toggleTheme={toggleTheme} />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spinner size="huge" label="Loading prompt..." />
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className={styles.container}>
        <Header isDark={isDark} toggleTheme={toggleTheme} />
        <main className={styles.main}>
          <div className={mergeClasses(styles.emptyState, isDark && styles.emptyStateDark)}>
            <div className={styles.emptyIcon}>🔍</div>
            <Title2 block style={{ marginBottom: '8px' }}>Prompt not found</Title2>
            <Body1 style={{ marginBottom: '24px' }}>The prompt you're looking for doesn't exist.</Body1>
            <Button
              appearance="primary"
              icon={<ArrowLeft24Regular />}
              onClick={() => navigate('/browse')}
            >
              Back to Browse
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header isDark={isDark} toggleTheme={toggleTheme} />
      <Toaster toasterId={toasterId} />

      <main className={styles.main}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSeparator}>
            <ChevronRight24Regular />
          </span>
          <Link to="/browse" className={styles.breadcrumbLink}>Browse</Link>
          <span className={styles.breadcrumbSeparator}>
            <ChevronRight24Regular />
          </span>
          <Link
            to={`/browse?department=${encodeURIComponent(prompt.department)}`}
            className={styles.breadcrumbLink}
          >
            {prompt.department}
          </Link>
          <span className={styles.breadcrumbSeparator}>
            <ChevronRight24Regular />
          </span>
          <span className={styles.breadcrumbCurrent}>{prompt.title}</span>
        </nav>

        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroHeader}>
            <div className={styles.heroIcon}>{prompt.icon}</div>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>{prompt.title}</h1>
              <div className={styles.heroMeta}>
                <Badge appearance="filled" color="brand" size="large">
                  {prompt.department}
                </Badge>
                {prompt.subcategory && (
                  <Badge appearance="outline" size="large">
                    {prompt.subcategory}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {prompt.description && (
            <Body1 style={{ fontSize: '18px', lineHeight: '28px', color: tokens.colorNeutralForeground2 }}>
              {prompt.description}
            </Body1>
          )}
        </div>

        {/* Two-column layout */}
        <div className={styles.layout}>
          {/* Main Content */}
          <div className={styles.contentSection}>
            <div className={mergeClasses(styles.promptCard, isDark && styles.promptCardDark)}>
              <Title3 className={styles.sectionTitle}>Prompt</Title3>
              <div
                className={styles.promptText}
                style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)' }}
              >
                {prompt.content}
              </div>

              <div className={styles.buttonGroup}>
                <Button
                  appearance="primary"
                  size="large"
                  icon={copiedType === 'regular' ? <Checkmark24Filled /> : <Copy24Regular />}
                  onClick={() => copyToClipboard('regular')}
                >
                  {copiedType === 'regular' ? 'Copied!' : 'Copy Prompt'}
                </Button>
                <Button
                  appearance="primary"
                  size="large"
                  className={styles.copilotButton}
                  icon={copiedType === 'copilot' ? <Checkmark24Filled /> : <Sparkle24Filled />}
                  onClick={() => copyToClipboard('copilot')}
                >
                  {copiedType === 'copilot' ? 'Copied!' : 'Copy to Copilot'}
                </Button>
              </div>
            </div>

            {/* Tips Section */}
            {prompt.tips && prompt.tips.length > 0 && (
              <div className={mergeClasses(styles.promptCard, isDark && styles.promptCardDark)}>
                <Title3 className={styles.sectionTitle}>Tips</Title3>
                {prompt.tips.map((tip, index) => (
                  <Body1 key={index} style={{ marginBottom: index < prompt.tips.length - 1 ? '12px' : '0' }}>
                    • {tip}
                  </Body1>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className={styles.sidebar}>
            {/* Quick Actions */}
            <div className={mergeClasses(styles.sidebarCard, isDark && styles.sidebarCardDark)}>
              <Title3 style={{ marginBottom: '16px' }}>Quick Actions</Title3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Button
                  appearance="subtle"
                  icon={isFavorite ? <Heart24Filled /> : <Heart24Regular />}
                  onClick={toggleFavorite}
                  className={styles.actionButton}
                >
                  {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
                <Button
                  appearance="subtle"
                  icon={<Share24Regular />}
                  onClick={sharePrompt}
                  className={styles.actionButton}
                >
                  Share Link
                </Button>
              </div>
            </div>

            {/* Details */}
            <div className={mergeClasses(styles.sidebarCard, isDark && styles.sidebarCardDark)}>
              <Title3 style={{ marginBottom: '16px' }}>Details</Title3>
              <div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Word Count</span>
                  <span className={styles.metaValue}>{prompt.word_count}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Date Added</span>
                  <span className={styles.metaValue}>{prompt.date}</span>
                </div>
                {prompt.images && prompt.images.length > 0 && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Images</span>
                    <span className={styles.metaValue}>{prompt.images.length}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {prompt.tags && prompt.tags.length > 0 && (
              <div className={mergeClasses(styles.sidebarCard, isDark && styles.sidebarCardDark)}>
                <Title3 style={{ marginBottom: '16px' }}>Tags</Title3>
                <div className={styles.tagsContainer}>
                  {prompt.tags.map((tag, index) => (
                    <Badge key={index} appearance="outline" size="medium">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
