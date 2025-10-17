import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { FluentProvider, webLightTheme, webDarkTheme } from '@fluentui/react-components';
import App from './App';
import './css/main.css';
import './css/enhanced.css';

function Root() {
  const [theme, setTheme] = useState(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme') === 'dark' ? webDarkTheme : webLightTheme;
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return webDarkTheme;
    }
    return webLightTheme;
  });

  const [isDark, setIsDark] = useState(() => theme === webDarkTheme);

  useEffect(() => {
    setTheme(isDark ? webDarkTheme : webLightTheme);
  }, [isDark]);

  return (
    <FluentProvider theme={theme}>
      <BrowserRouter>
        <App isDark={isDark} setIsDark={setIsDark} />
      </BrowserRouter>
    </FluentProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
