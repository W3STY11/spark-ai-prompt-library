import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  makeStyles,
  tokens,
  Button,
  shorthands,
} from '@fluentui/react-components';
import {
  Database24Regular,
  Building24Regular,
  Folder24Regular,
  Tag24Regular,
  AppGeneric24Regular,
  ArrowLeft24Regular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  nav: {
    display: 'flex',
    ...shorthands.gap('8px'),
    ...shorthands.padding('16px', '0'),
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  navButton: {
    minWidth: '140px',
  },
  activeButton: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    ':hover': {
      backgroundColor: tokens.colorBrandBackgroundHover,
    },
  },
  backButton: {
    marginRight: 'auto',
  },
});

export default function AdminNavigation() {
  const styles = useStyles();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.nav}>
      <Button
        appearance="subtle"
        icon={<ArrowLeft24Regular />}
        onClick={() => navigate('/browse')}
        className={styles.backButton}
      >
        Back to Browse
      </Button>

      <Button
        appearance={isActive('/admin') ? 'primary' : 'subtle'}
        icon={<Database24Regular />}
        onClick={() => navigate('/admin')}
        className={isActive('/admin') ? styles.activeButton : styles.navButton}
      >
        All Prompts
      </Button>

      <Button
        appearance={isActive('/admin/departments') ? 'primary' : 'subtle'}
        icon={<Building24Regular />}
        onClick={() => navigate('/admin/departments')}
        className={isActive('/admin/departments') ? styles.activeButton : styles.navButton}
      >
        Departments
      </Button>

      <Button
        appearance={isActive('/admin/subcategories') ? 'primary' : 'subtle'}
        icon={<Folder24Regular />}
        onClick={() => navigate('/admin/subcategories')}
        className={isActive('/admin/subcategories') ? styles.activeButton : styles.navButton}
      >
        Subcategories
      </Button>

      <Button
        appearance={isActive('/admin/prompt-categories') ? 'primary' : 'subtle'}
        icon={<Tag24Regular />}
        onClick={() => navigate('/admin/prompt-categories')}
        className={isActive('/admin/prompt-categories') ? styles.activeButton : styles.navButton}
      >
        Categories
      </Button>

      <Button
        appearance={isActive('/admin/works-in') ? 'primary' : 'subtle'}
        icon={<AppGeneric24Regular />}
        onClick={() => navigate('/admin/works-in')}
        className={isActive('/admin/works-in') ? styles.activeButton : styles.navButton}
      >
        Works In
      </Button>
    </nav>
  );
}
