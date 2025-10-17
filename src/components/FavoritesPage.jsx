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
  Badge,
  Spinner,
} from '@fluentui/react-components';
import {
  Heart24Filled,
  Image24Regular,
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
    ...shorthands.padding('48px', '24px'),
  },
  header: {
    marginBottom: '48px',
  },
  title: {
    fontSize: '56px',
    fontWeight: 600,
    marginBottom: '16px',
    color: tokens.colorNeutralForeground1,
  },
  subtitle: {
    fontSize: '18px',
    color: tokens.colorNeutralForeground2,
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
  promptIcon: {
    fontSize: '36px',
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    ...shorthands.gap('8px'),
    marginTop: '12px',
  },
  emptyState: {
    textAlign: 'center',
    ...shorthands.padding('96px', '24px'),
    ...glass.card,
    ...shorthands.borderRadius('8px'),
  },
  emptyStateDark: {
    ...glass.cardDark,
  },
  emptyIcon: {
    fontSize: '96px',
    marginBottom: '24px',
  },
});

export default function FavoritesPage({ isDark, toggleTheme }) {
  const styles = useStyles();
  const navigate = useNavigate();

  const [favoritePrompts, setFavoritePrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      // Get favorite IDs from localStorage
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

      if (favorites.length === 0) {
        setFavoritePrompts([]);
        setLoading(false);
        return;
      }

      // Fetch all prompts
      const response = await fetch('/prompts_index.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      // Filter to only favorite prompts
      const allPrompts = Array.isArray(data.prompts) ? data.prompts : Array.isArray(data.items) ? data.items : [];
      const favPrompts = allPrompts.filter(p => favorites.includes(p.id));

      setFavoritePrompts(favPrompts);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptClick = (promptId) => {
    navigate(`/view?id=${promptId}`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header isDark={isDark} toggleTheme={toggleTheme} />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spinner size="huge" label="Loading favorites..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header isDark={isDark} toggleTheme={toggleTheme} />

      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.title}>
            <Heart24Filled style={{ marginRight: '16px' }} />
            Favorites
          </div>
          <div className={styles.subtitle}>
            {favoritePrompts.length === 0
              ? "You haven't added any prompts to your favorites yet."
              : `${favoritePrompts.length} saved ${favoritePrompts.length === 1 ? 'prompt' : 'prompts'}`
            }
          </div>
        </div>

        {favoritePrompts.length === 0 ? (
          <div className={mergeClasses(styles.emptyState, isDark && styles.emptyStateDark)}>
            <div className={styles.emptyIcon}>❤️</div>
            <Title2 block style={{ marginBottom: '8px' }}>No favorites yet</Title2>
            <Body1 style={{ marginBottom: '24px', color: tokens.colorNeutralForeground2 }}>
              Browse prompts and click the heart icon to add them to your favorites.
            </Body1>
            <Button
              appearance="primary"
              size="large"
              onClick={() => navigate('/browse')}
            >
              Browse Prompts
            </Button>
          </div>
        ) : (
          <div className={styles.gridContainer}>
            {favoritePrompts.map((prompt) => (
              <div
                key={prompt.id}
                className={mergeClasses(styles.promptCard, isDark && styles.promptCardDark)}
                onClick={() => handlePromptClick(prompt.id)}
              >
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '16px', marginBottom: '16px' }}>
                    <span className={styles.promptIcon}>{prompt.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Title3 block style={{ marginBottom: '8px' }}>
                        {prompt.title}
                      </Title3>
                      <Badge appearance="filled" color="brand">
                        {prompt.department}
                      </Badge>
                    </div>
                  </div>

                  <Body2 block style={{ marginBottom: '16px', color: tokens.colorNeutralForeground2 }}>
                    {prompt.description && prompt.description.length > 150
                      ? `${prompt.description.substring(0, 150)}...`
                      : prompt.description
                    }
                  </Body2>

                  {prompt.tags && prompt.tags.length > 0 && (
                    <div className={styles.tagsContainer}>
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
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: `1px solid ${tokens.colorNeutralStroke2}`
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '14px',
                      color: tokens.colorNeutralForeground2
                    }}>
                      {prompt.images && prompt.images.length > 0 && <Image24Regular />}
                      <span>{prompt.word_count} words</span>
                    </div>
                    <Heart24Filled style={{ color: tokens.colorPaletteRedForeground1 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
