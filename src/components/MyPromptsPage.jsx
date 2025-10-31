import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config';
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
  Card,
  Badge,
  Spinner,
  Toast,
  Toaster,
  useToastController,
  useId,
} from '@fluentui/react-components';
import {
  Add24Regular,
  Edit24Regular,
  Delete24Regular,
  ArrowRight24Regular,
  Sparkle24Filled,
  Checkmark24Filled,
  Image24Regular,
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
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    ...shorthands.gap('24px'),
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
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  emptyState: {
    textAlign: 'center',
    ...shorthands.padding('96px', '24px'),
  },
  emptyIcon: {
    fontSize: '96px',
    marginBottom: '24px',
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    ...shorthands.gap('8px'),
    marginTop: '12px',
  },
});

export default function MyPromptsPage({ isDark, toggleTheme }) {
  const styles = useStyles();
  const navigate = useNavigate();

  const [myPrompts, setMyPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddPromptModalOpen, setIsAddPromptModalOpen] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState(null);

  const toasterId = useId('toaster');
  const { dispatchToast } = useToastController(toasterId);

  useEffect(() => {
    loadMyPrompts();
  }, []);

  const loadMyPrompts = async () => {
    try {
      // Fetch all prompts and filter by created_by = 'anonymous'
      // TODO: When auth is added, use actual user ID
      const response = await fetch(API_ENDPOINTS.PROMPTS);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (data) {
        const prompts = Array.isArray(data.prompts) ? data.prompts : Array.isArray(data.items) ? data.items : [];
        // Filter to only show prompts created by 'anonymous' (current user)
        const userPrompts = prompts.filter(p => p.created_by === 'anonymous');
        setMyPrompts(userPrompts);
      }
    } catch (error) {
      console.error('Failed to load my prompts:', error);
      setMyPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptClick = (promptId) => {
    navigate(`/view?id=${promptId}`);
  };

  const handleAddPrompt = async (newPrompt) => {
    try {
      await loadMyPrompts();
      dispatchToast(
        <Toast>
          <div>✅ Prompt "{newPrompt.title}" has been added successfully!</div>
        </Toast>,
        { intent: 'success' }
      );
    } catch (error) {
      console.error('Error reloading prompts:', error);
      dispatchToast(
        <Toast>
          <div>✅ Prompt added! Refresh the page to see it.</div>
        </Toast>,
        { intent: 'success' }
      );
    }
  };

  const handleDeletePrompt = async (event, promptId) => {
    event.stopPropagation();

    if (!confirm('Are you sure you want to delete this prompt?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/prompts/${promptId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete prompt');
      }

      dispatchToast(
        <Toast>
          <div>✅ Prompt deleted successfully!</div>
        </Toast>,
        { intent: 'success' }
      );

      // Reload prompts
      await loadMyPrompts();
    } catch (error) {
      console.error('Error deleting prompt:', error);
      dispatchToast(
        <Toast>
          <div>❌ Failed to delete prompt</div>
        </Toast>,
        { intent: 'error' }
      );
    }
  };

  const copyToCopilot = async (event, prompt) => {
    event.stopPropagation();

    if (!prompt?.content) return;

    try {
      const copilotText = `# AI Prompt: ${prompt.title}\n\n${prompt.content}\n\n---\nCopied from SPARK Prompt Library`;
      await navigator.clipboard.writeText(copilotText);

      setCopiedPromptId(prompt.id);

      dispatchToast(
        <Toast>
          <div>✨ Copied to clipboard!</div>
        </Toast>,
        { intent: 'success' }
      );

      setTimeout(() => setCopiedPromptId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      dispatchToast(
        <Toast>
          <div>Failed to copy</div>
        </Toast>,
        { intent: 'error' }
      );
    }
  };

  const renderCard = (prompt) => (
    <Card
      key={prompt.id}
      className={mergeClasses(styles.promptCard, isDark && styles.promptCardDark)}
      onClick={() => handlePromptClick(prompt.id)}
    >
      <div style={{ padding: '8px 12px', position: 'relative' }}>
        {(prompt?.has_image || (prompt?.images && prompt.images.length > 0)) && (
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
          {(prompt.description || '').substring(0, 120)}...
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
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: `1px solid ${tokens.colorNeutralStroke2}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              appearance="subtle"
              size="small"
              icon={<Edit24Regular />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/view?id=${prompt.id}`);
              }}
            >
              Edit
            </Button>
            <Button
              appearance="subtle"
              size="small"
              icon={<Delete24Regular />}
              onClick={(e) => handleDeletePrompt(e, prompt.id)}
              style={{ color: tokens.colorPaletteRedForeground1 }}
            >
              Delete
            </Button>
          </div>
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
              {copiedPromptId === prompt.id ? 'Copied!' : 'Copy'}
            </Button>
            <ArrowRight24Regular style={{ color: tokens.colorBrandForeground1 }} />
          </div>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className={styles.container}>
        <Header isDark={isDark} toggleTheme={toggleTheme} />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spinner size="huge" label="Loading your prompts..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header isDark={isDark} toggleTheme={toggleTheme} />
      <Toaster toasterId={toasterId} />

      <main className={styles.main}>
        <div style={{ marginBottom: '32px' }}>
          <Title1 block style={{ marginBottom: '8px' }}>My Prompts</Title1>
          <Body1>Prompts you've created</Body1>
        </div>

        <div className={styles.toolbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
              Create New Prompt
            </Button>
            <Body1 style={{ fontWeight: 600 }}>
              {myPrompts.length.toLocaleString()} {myPrompts.length === 1 ? 'prompt' : 'prompts'}
            </Body1>
          </div>
        </div>

        {myPrompts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <Title2 block style={{ marginBottom: '8px' }}>No prompts yet</Title2>
            <Body1 style={{ marginBottom: '24px' }}>Create your first AI prompt to get started</Body1>
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
              Create New Prompt
            </Button>
          </div>
        ) : (
          <div className={styles.gridContainer}>
            {myPrompts.map(renderCard)}
          </div>
        )}
      </main>

      <AddPromptModal
        isOpen={isAddPromptModalOpen}
        onClose={() => setIsAddPromptModalOpen(false)}
        onSubmit={handleAddPrompt}
      />
    </div>
  );
}
