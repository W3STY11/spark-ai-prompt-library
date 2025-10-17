import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
  Button,
} from '@fluentui/react-components';
import {
  Sparkle24Filled,
  WeatherMoon24Regular,
  WeatherSunny24Regular,
} from '@fluentui/react-icons';
import { glass } from '../ui/themeGlass';

const useStyles = makeStyles({
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    ...glass.header,
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalL),
  },
  headerDark: {
    ...glass.headerDark,
  },
  headerContent: {
    maxWidth: '1280px',
    ...shorthands.margin('0', 'auto'),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalS),
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 150ms cubic-bezier(0.1,0.9,0.2,1)',
    ':hover': {
      color: tokens.colorBrandForeground1,
      transform: 'translateY(-1px)',
    },
    ':focus-visible': {
      outlineStyle: 'auto',
      outlineOffset: '2px',
    },
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalL),
  },
  navLink: {
    color: tokens.colorNeutralForeground2,
    textDecoration: 'none',
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
    cursor: 'pointer',
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    transition: 'all 150ms cubic-bezier(0.1,0.9,0.2,1)',
    position: 'relative',
    ':hover': {
      color: tokens.colorBrandForeground1,
      transform: 'translateY(-1px)',
    },
    ':focus-visible': {
      outlineStyle: 'auto',
      outlineOffset: '2px',
    },
  },
  navLinkActive: {
    color: tokens.colorBrandForeground1,
    ':after': {
      content: '""',
      position: 'absolute',
      left: '50%',
      bottom: '-6px',
      transform: 'translateX(-50%)',
      width: '28px',
      height: '2px',
      background: tokens.colorBrandForeground1,
      ...shorthands.borderRadius('1px'),
    },
  },
});

export default function Header({ isDark, toggleTheme }) {
  const styles = useStyles();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className={mergeClasses(styles.header, isDark && styles.headerDark)}>
      <div className={styles.headerContent}>
        <div className={styles.logo} onClick={() => navigate('/')}>
          <Sparkle24Filled />
          <span>SPARK Prompt Library</span>
        </div>
        <nav className={styles.nav}>
          <span
            className={`${styles.navLink} ${isActive('/') ? styles.navLinkActive : ''}`}
            onClick={() => navigate('/')}
          >
            Home
          </span>
          <span
            className={`${styles.navLink} ${isActive('/browse') ? styles.navLinkActive : ''}`}
            onClick={() => navigate('/browse')}
          >
            Browse
          </span>
          <span
            className={`${styles.navLink} ${isActive('/favorites') ? styles.navLinkActive : ''}`}
            onClick={() => navigate('/favorites')}
          >
            Favorites
          </span>
          <Button
            appearance="subtle"
            icon={isDark ? <WeatherSunny24Regular /> : <WeatherMoon24Regular />}
            onClick={toggleTheme}
            style={{ minWidth: 'auto' }}
          />
        </nav>
      </div>
    </header>
  );
}
