import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import HomePage from './components/HomePage';
import BrowsePage from './components/BrowsePage';
import ViewPage from './components/ViewPage';
import FavoritesPage from './components/FavoritesPage';
import AdminLoginPage from './components/AdminLoginPage';
import AdminDashboardPage from './components/AdminDashboardPage';
import CopilotIntegration from './components/CopilotIntegration';
import { gradients } from './ui/themeGlass';

const useStyles = makeStyles({
  appContainer: {
    minHeight: '100vh',
    width: '100%',
    position: 'relative',
  },
  lightMode: {
    background: gradients.light,
  },
  darkMode: {
    background: gradients.dark,
  },
  '@media (prefers-reduced-motion: reduce)': {
    '& *': {
      transition: 'none !important',
    },
  },
});

function App({ isDark, setIsDark }) {
  const styles = useStyles();

  useEffect(() => {
    // Apply theme class to html element for compatibility with existing CSS
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className={`${styles.appContainer} ${isDark ? styles.darkMode : styles.lightMode}`}>
      <Routes>
        <Route path="/" element={<HomePage isDark={isDark} toggleTheme={toggleTheme} />} />
        <Route path="/browse" element={<BrowsePage isDark={isDark} toggleTheme={toggleTheme} />} />
        <Route path="/view" element={<ViewPage isDark={isDark} toggleTheme={toggleTheme} />} />
        <Route path="/favorites" element={<FavoritesPage isDark={isDark} toggleTheme={toggleTheme} />} />
        <Route path="/admin-login" element={<AdminLoginPage isDark={isDark} toggleTheme={toggleTheme} />} />
        <Route path="/admin" element={<AdminDashboardPage isDark={isDark} toggleTheme={toggleTheme} />} />
      </Routes>
      <CopilotIntegration />
    </div>
  );
}

export default App;
