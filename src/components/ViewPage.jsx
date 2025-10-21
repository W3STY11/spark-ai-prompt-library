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
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    ...shorthands.gap('48px'),
    alignItems: 'start',
    marginBottom: '24px',
    '@media (max-width: 1024px)': {
      gridTemplateColumns: '1fr',
      ...shorthands.gap('24px'),
    },
  },
  heroLeft: {
    display: 'flex',
    alignItems: 'start',
    ...shorthands.gap('24px'),
  },
  heroRight: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('12px'),
    minWidth: '280px',
  },
  compactCard: {
    ...glass.card,
    ...shorthands.padding('16px', '20px'),
    ...shorthands.borderRadius('8px'),
  },
  compactCardDark: {
    ...glass.cardDark,
  },
  compactTitle: {
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: tokens.colorNeutralForeground3,
    marginBottom: '12px',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    ...shorthands.gap('12px'),
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
    gridTemplateColumns: '60% 40%',
    ...shorthands.gap('32px'),
    alignItems: 'start',
    '@media (max-width: 1200px)': {
      gridTemplateColumns: '1fr',
    },
  },
  promptColumn: {
    position: 'sticky',
    top: '24px',
    minWidth: 0,
  },
  guidanceColumn: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('24px'),
  },
  sectionTitle: {
    marginBottom: '24px',
    fontSize: '22px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
    color: tokens.colorNeutralForeground1,
    letterSpacing: '-0.02em',
    '& > *:first-child': {
      fontSize: '26px',
    },
  },
  promptCard: {
    ...glass.card,
    ...shorthands.padding('28px', '32px'),
    ...shorthands.borderRadius('10px'),
    marginBottom: '0',
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
  },
  promptCardDark: {
    ...glass.cardDark,
  },
  promptText: {
    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
    fontSize: '14.5px',
    lineHeight: '26px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    color: tokens.colorNeutralForeground1,
    maxHeight: '600px',
    overflowY: 'auto',
    ...shorthands.padding('28px'),
    background: isDark => isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.04)',
    ...shorthands.borderRadius('10px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: tokens.colorNeutralStroke1,
      ...shorthands.borderRadius('4px'),
    },
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
  imageGallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    ...shorthands.gap('20px'),
    marginTop: '28px',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
  imageContainer: {
    position: 'relative',
    ...shorthands.borderRadius('12px'),
    ...shorthands.overflow('hidden'),
    aspectRatio: '16/9',
    background: tokens.colorNeutralBackground3,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ':hover': {
      opacity: 0.95,
      transform: 'scale(1.02)',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    },
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: isDark => isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
    color: tokens.colorNeutralForeground3,
    fontSize: '14px',
  },
  placeholderIcon: {
    fontSize: '48px',
    marginBottom: '12px',
    opacity: 0.5,
  },
  fullscreenOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    cursor: 'zoom-out',
    ...shorthands.padding('20px'),
  },
  fullscreenImage: {
    maxWidth: '95%',
    maxHeight: '95%',
    objectFit: 'contain',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    ...shorthands.borderRadius('8px'),
  },
  fullscreenClose: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    fontSize: '48px',
    color: 'white',
    cursor: 'pointer',
    background: 'rgba(0,0,0,0.5)',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.borderRadius('50%'),
    ':hover': {
      background: 'rgba(0,0,0,0.8)',
    },
  },
  metadataSection: {
    ...glass.card,
    ...shorthands.padding('28px', '32px'),
    ...shorthands.borderRadius('10px'),
    marginBottom: '0',
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
  },
  metadataSectionDark: {
    ...glass.cardDark,
  },
  metadataContent: {
    whiteSpace: 'pre-wrap',
    lineHeight: '1.75',
    fontSize: '15px',
    color: tokens.colorNeutralForeground2,
  },
  // Tips List Styles
  tipsList: {
    listStyleType: 'none',
    ...shorthands.padding('0'),
    ...shorthands.margin('0'),
    marginTop: '24px',
  },
  tipItem: {
    position: 'relative',
    paddingLeft: '36px',
    marginBottom: '20px',
    lineHeight: '1.75',
    fontSize: '15px',
    color: tokens.colorNeutralForeground2,
    '::before': {
      content: '"💡"',
      position: 'absolute',
      left: '0',
      top: '2px',
      fontSize: '18px',
    },
  },
  // Bullet List Styles
  bulletList: {
    listStyleType: 'none',
    ...shorthands.padding('0'),
    ...shorthands.margin('0'),
    marginTop: '24px',
  },
  bulletItem: {
    position: 'relative',
    paddingLeft: '32px',
    marginBottom: '16px',
    lineHeight: '1.75',
    fontSize: '15px',
    color: tokens.colorNeutralForeground2,
    '::before': {
      content: '"•"',
      position: 'absolute',
      left: '10px',
      top: '2px',
      fontSize: '18px',
      color: tokens.colorBrandForeground1,
      fontWeight: 'bold',
    },
  },
  // Instructions List
  instructionsList: {
    listStyleType: 'none',
    ...shorthands.padding('0'),
    ...shorthands.margin('0'),
    marginTop: '24px',
  },
  instructionItem: {
    position: 'relative',
    paddingLeft: '36px',
    marginBottom: '24px',
    lineHeight: '1.8',
    fontSize: '15px',
    color: tokens.colorNeutralForeground2,
    '::before': {
      content: '"▸"',
      position: 'absolute',
      left: '10px',
      top: '4px',
      fontSize: '18px',
      color: tokens.colorBrandForeground1,
      fontWeight: 'bold',
    },
    '&:last-child': {
      marginBottom: '0',
    },
  },
  // Example Content
  exampleContent: {
    marginTop: '24px',
    backgroundColor: isDark => isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
    ...shorthands.padding('24px'),
    ...shorthands.borderRadius('10px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
  },
  exampleItem: {
    marginBottom: '16px',
    paddingBottom: '16px',
    lineHeight: '1.75',
    fontSize: '15px',
    color: tokens.colorNeutralForeground2,
    ...shorthands.borderBottom('1px', 'dashed', tokens.colorNeutralStroke3),
    '&:last-child': {
      marginBottom: '0',
      paddingBottom: '0',
      ...shorthands.borderBottom('none'),
    },
  },
});

// Helper function to highlight placeholders in prompt text
const highlightPlaceholders = (text, isDark) => {
  if (!text) return null;

  const parts = [];
  let lastIndex = 0;
  const placeholderRegex = /\[([^\]]+)\]/g;
  let match;

  while ((match = placeholderRegex.exec(text)) !== null) {
    // Add text before placeholder
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add highlighted placeholder
    parts.push(
      <span
        key={match.index}
        style={{
          backgroundColor: isDark ? 'rgba(96, 94, 255, 0.2)' : 'rgba(96, 94, 255, 0.15)',
          color: isDark ? '#a6a4ff' : '#6250ea',
          padding: '2px 6px',
          borderRadius: '4px',
          fontWeight: 600,
          border: isDark ? '1px solid rgba(96, 94, 255, 0.3)' : '1px solid rgba(96, 94, 255, 0.2)',
        }}
      >
        [{match[1]}]
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

export default function ViewPage({ isDark, toggleTheme }) {
  const styles = useStyles();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const promptId = searchParams.get('id');

  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedType, setCopiedType] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());
  const [fullscreenImage, setFullscreenImage] = useState(null);

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
      const response = await fetch('/api/prompts');
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

        // Send to Copilot tab via BroadcastChannel
        if (typeof BroadcastChannel !== 'undefined') {
          try {
            const channel = new BroadcastChannel('spark_copilot');
            channel.postMessage({
              type: 'INSERT_PROMPT',
              content: textToCopy,
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
            content: textToCopy,
            timestamp: Date.now()
          }));
          // Clear after a moment to trigger storage event
          setTimeout(() => {
            localStorage.removeItem('spark_prompt_transfer');
          }, 100);
        } catch (storageErr) {
          console.warn('localStorage not available:', storageErr);
        }
      }

      await navigator.clipboard.writeText(textToCopy);

      setCopiedType(type);

      dispatchToast(
        <Toast>
          <div>✨ {type === 'copilot' ? 'Sent to Copilot! Switch to your Copilot tab' : 'Copied to clipboard!'}</div>
        </Toast>,
        { intent: 'success' }
      );

      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      dispatchToast(
        <Toast>
          <div>Failed to {type === 'copilot' ? 'send to Copilot' : 'copy to clipboard'}</div>
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
            {/* LEFT: Title & Badges */}
            <div className={styles.heroLeft}>
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
                  {prompt.complexity && (
                    <Badge
                      appearance="tint"
                      color={
                        prompt.complexity === 'advanced' ? 'danger' :
                        prompt.complexity === 'intermediate' ? 'warning' :
                        'success'
                      }
                      size="large"
                    >
                      {prompt.complexity.charAt(0).toUpperCase() + prompt.complexity.slice(1)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: Quick Actions & Metadata */}
            <div className={styles.heroRight}>
              {/* Quick Actions */}
              <div className={mergeClasses(styles.compactCard, isDark && styles.compactCardDark)}>
                <div className={styles.compactTitle}>Actions</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    appearance="subtle"
                    size="small"
                    icon={isFavorite ? <Heart24Filled /> : <Heart24Regular />}
                    onClick={toggleFavorite}
                  >
                    {isFavorite ? 'Saved' : 'Save'}
                  </Button>
                  <Button
                    appearance="subtle"
                    size="small"
                    icon={<Share24Regular />}
                    onClick={sharePrompt}
                  >
                    Share
                  </Button>
                </div>
              </div>

              {/* Details */}
              <div className={mergeClasses(styles.compactCard, isDark && styles.compactCardDark)}>
                <div className={styles.compactTitle}>Details</div>
                <div className={styles.metaGrid}>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 600, color: tokens.colorBrandForeground1 }}>{prompt.word_count}</div>
                    <div style={{ fontSize: '11px', color: tokens.colorNeutralForeground3 }}>Words</div>
                  </div>
                  {prompt.images && prompt.images.length > 0 && (
                    <div>
                      <div style={{ fontSize: '24px', fontWeight: 600, color: tokens.colorBrandForeground1 }}>{prompt.images.length}</div>
                      <div style={{ fontSize: '11px', color: tokens.colorNeutralForeground3 }}>Images</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {prompt.tags && prompt.tags.length > 0 && (
                <div className={mergeClasses(styles.compactCard, isDark && styles.compactCardDark)}>
                  <div className={styles.compactTitle}>Tags</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {prompt.tags.slice(0, 4).map((tag, index) => (
                      <Badge key={index} appearance="outline" size="small">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {prompt.description && (
            <Body1 style={{ fontSize: '18px', lineHeight: '28px', color: tokens.colorNeutralForeground2 }}>
              {prompt.description}
            </Body1>
          )}
        </div>

        {/* New Two-column layout: Prompt LEFT, Guidance RIGHT */}
        <div className={styles.layout}>
          {/* LEFT COLUMN: THE PROMPT - Sticky */}
          <div className={styles.promptColumn}>
            <div className={mergeClasses(styles.promptCard, isDark && styles.promptCardDark)}>
              <Title3 className={styles.sectionTitle}>📋 The Prompt</Title3>
              <div
                className={styles.promptText}
                style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)' }}
              >
                {highlightPlaceholders(prompt.content, isDark)}
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
          </div>

          {/* RIGHT COLUMN: All Guidance */}
          <div className={styles.guidanceColumn}>
            {/* What It Does Section */}
            {prompt.metadata?.whatItDoes && (
              <div className={mergeClasses(styles.metadataSection, isDark && styles.metadataSectionDark)}>
                <Title3 className={styles.sectionTitle}>⚙️ What This Prompt Does</Title3>
                <ul className={styles.bulletList}>
                  {prompt.metadata.whatItDoes.split('\\n').filter(line => line.trim()).map((line, index) => (
                    <li key={index} className={styles.bulletItem}>
                      <Body1>{line.trim()}</Body1>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tips Section - SECOND */}
            {prompt.tips && prompt.tips.length > 0 && (
              <div className={mergeClasses(styles.promptCard, isDark && styles.promptCardDark)}>
                <Title3 className={styles.sectionTitle}>💡 Tips</Title3>
                <ul className={styles.tipsList}>
                  {prompt.tips.map((tip, index) => (
                    <li key={index} className={styles.tipItem}>
                      <Body1>{tip}</Body1>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* How To Use Section - THIRD */}
            {prompt.metadata?.howToUse && (
              <div className={mergeClasses(styles.metadataSection, isDark && styles.metadataSectionDark)}>
                <Title3 className={styles.sectionTitle}>❓ How To Use This Prompt</Title3>
                <ul className={styles.instructionsList}>
                  {prompt.metadata.howToUse.split(/[●•]/).filter(item => item.trim()).map((instruction, index) => (
                    <li key={index} className={styles.instructionItem}>
                      <Body1>{instruction.trim()}</Body1>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Example Input Section - FOURTH */}
            {prompt.metadata?.exampleInput && (
              <div className={mergeClasses(styles.metadataSection, isDark && styles.metadataSectionDark)}>
                <Title3 className={styles.sectionTitle}>📥 Example Input</Title3>
                <div className={styles.exampleContent}>
                  {prompt.metadata.exampleInput.split(/[●•]/).filter(item => item.trim()).map((line, index) => (
                    <div key={index} className={styles.exampleItem}>
                      <Body1>{line.trim()}</Body1>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Example Output Images - FIFTH */}
            {prompt.images && prompt.images.length > 0 && (
              <div className={mergeClasses(styles.promptCard, isDark && styles.promptCardDark)}>
                <Title3 className={styles.sectionTitle}>📤 Example Output</Title3>
                <div className={styles.imageGallery}>
                  {prompt.images.map((image, index) => (
                    <div key={index} className={styles.imageContainer}>
                      {failedImages.has(index) ? (
                        <div
                          className={styles.imagePlaceholder}
                          style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
                        >
                          <div className={styles.placeholderIcon}>🖼️</div>
                          <div>Example Output {index + 1}</div>
                          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.6 }}>
                            {image}
                          </div>
                        </div>
                      ) : (
                        <img
                          src={`/thumbnails/${image}`}
                          alt={`Example output ${index + 1}`}
                          className={styles.galleryImage}
                          onClick={() => setFullscreenImage({ src: `/thumbnails/${image}`, alt: `Example output ${index + 1}`, fallbackSrc: `/prompts/${prompt.department}/${prompt.title.replace(/[^a-zA-Z0-9 ]/g, '')}_${prompt.id.slice(0, 8)}/${image}` })}
                          onError={(e) => {
                            // Try fallback path once, then show placeholder
                            if (!e.target.dataset.fallbackAttempted) {
                              e.target.dataset.fallbackAttempted = 'true';
                              e.target.src = `/prompts/${prompt.department}/${prompt.title.replace(/[^a-zA-Z0-9 ]/g, '')}_${prompt.id.slice(0, 8)}/${image}`;
                            } else {
                              // Both paths failed, mark as failed to show placeholder
                              setFailedImages(prev => new Set([...prev, index]));
                            }
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div
          className={styles.fullscreenOverlay}
          onClick={() => setFullscreenImage(null)}
        >
          <div className={styles.fullscreenClose}>×</div>
          <img
            src={fullscreenImage.src}
            alt={fullscreenImage.alt}
            className={styles.fullscreenImage}
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              if (!e.target.dataset.fallbackAttempted && fullscreenImage.fallbackSrc) {
                e.target.dataset.fallbackAttempted = 'true';
                e.target.src = fullscreenImage.fallbackSrc;
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
