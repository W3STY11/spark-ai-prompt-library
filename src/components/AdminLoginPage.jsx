import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
  Title1,
  Title2,
  Body1,
  Button,
  Input,
  Field,
  Toast,
  useToastController,
  useId,
  Spinner,
} from '@fluentui/react-components';
import {
  LockClosed24Regular,
  Key24Regular,
  Checkmark24Regular,
} from '@fluentui/react-icons';
import { glass } from '../ui/themeGlass';
import Header from './Header';

const useStyles = makeStyles({
  container: {
    minHeight: '100vh',
  },
  main: {
    maxWidth: '520px',
    margin: '0 auto',
    ...shorthands.padding('96px', '24px'),
  },
  loginCard: {
    ...shorthands.padding('48px', '32px'),
    ...glass.card,
    ...shorthands.borderRadius('12px'),
    textAlign: 'center',
  },
  loginCardDark: {
    ...glass.cardDark,
  },
  iconContainer: {
    width: '96px',
    height: '96px',
    margin: '0 auto 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.borderRadius('50%'),
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontSize: '48px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('24px'),
    marginTop: '32px',
  },
  submitButton: {
    marginTop: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
  },
  errorText: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: '14px',
    marginTop: '16px',
  },
});

export default function AdminLoginPage({ isDark, toggleTheme }) {
  const styles = useStyles();
  const navigate = useNavigate();
  const toasterId = useId('login-toaster');
  const { dispatchToast } = useToastController(toasterId);

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.success && data.token) {
        // Store token in localStorage
        localStorage.setItem('adminToken', data.token);

        dispatchToast(
          <Toast>
            <div>✅ Login successful!</div>
          </Toast>,
          { intent: 'success' }
        );

        // Navigate to admin dashboard
        setTimeout(() => {
          navigate('/admin');
        }, 500);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');

      dispatchToast(
        <Toast>
          <div>❌ {error.message || 'Login failed'}</div>
        </Toast>,
        { intent: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header isDark={isDark} toggleTheme={toggleTheme} />

      <main className={styles.main}>
        <div className={mergeClasses(styles.loginCard, isDark && styles.loginCardDark)}>
          <div className={styles.iconContainer}>
            🔐
          </div>

          <Title1 block style={{ marginBottom: '8px' }}>
            Admin Login
          </Title1>
          <Body1 block style={{ color: tokens.colorNeutralForeground2, marginBottom: '16px' }}>
            Enter your admin password to access the dashboard
          </Body1>

          <form onSubmit={handleSubmit} className={styles.form}>
            <Field
              label="Password"
              required
              validationMessage={error}
              validationState={error ? 'error' : undefined}
            >
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter admin password"
                contentBefore={<Key24Regular />}
                size="large"
                disabled={loading}
                autoFocus
              />
            </Field>

            <Button
              appearance="primary"
              size="large"
              type="submit"
              icon={loading ? <Spinner size="tiny" /> : <Checkmark24Regular />}
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {error && (
            <div className={styles.errorText}>
              <LockClosed24Regular /> {error}
            </div>
          )}

          <Body1 block style={{
            color: tokens.colorNeutralForeground3,
            marginTop: '32px',
            fontSize: '12px',
          }}>
            Default password: <code style={{
              background: isDark ? tokens.colorNeutralBackground3 : tokens.colorNeutralBackground2,
              padding: '2px 8px',
              borderRadius: '4px',
            }}>admin123</code>
          </Body1>
        </div>
      </main>
    </div>
  );
}
