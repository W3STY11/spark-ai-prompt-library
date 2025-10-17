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
  Subtitle1,
  Body1,
  Body2,
  Button,
  Card,
  CardHeader,
  CardFooter,
  Avatar,
  Text,
} from '@fluentui/react-components';
import {
  ArrowRight24Regular,
  Sparkle24Filled,
  CheckmarkCircle24Regular,
  Target24Regular,
  Briefcase24Regular,
  Megaphone24Regular,
  MoneyHand24Regular,
  SearchInfo24Regular,
  Calculator24Regular,
  BookOpenGlobe24Regular,
  DocumentText24Regular,
  TaskListSquareLtr24Regular,
  PersonCircle24Regular,
} from '@fluentui/react-icons';
import { glass } from '../ui/themeGlass';
import Header from './Header';

const useStyles = makeStyles({
  container: {
    minHeight: '100vh',
  },
  hero: {
    ...shorthands.padding('64px', '24px'),
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    maxWidth: '768px',
    margin: '0 auto',
  },
  heroTitle: {
    fontSize: '68px',
    fontWeight: 600,
    lineHeight: '92px',
    marginBottom: '24px',
    color: tokens.colorNeutralForeground1,
    letterSpacing: '-0.02em',
    '@media (max-width: 768px)': {
      fontSize: '40px',
      lineHeight: '52px',
    },
  },
  heroSubtitle: {
    fontSize: '24px',
    lineHeight: 1.5,
    marginBottom: '32px',
    color: tokens.colorNeutralForeground2,
  },
  heroChips: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(160px, 1fr))',
    ...shorthands.gap('16px'),
    marginTop: '24px',
    maxWidth: '640px',
  },
  chip: {
    ...glass.card,
    ...shorthands.borderRadius('12px'),
    ...shorthands.padding('16px'),
    textAlign: 'center',
  },
  chipDark: {
    ...glass.cardDark,
  },
  chipValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: tokens.colorBrandForeground1,
    lineHeight: '32px',
  },
  chipLabel: {
    color: tokens.colorNeutralForeground2,
  },
  section: {
    ...shorthands.padding('64px', '24px'),
  },
  sectionContent: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  sectionHeader: {
    maxWidth: '768px',
    marginBottom: '56px',
  },
  departmentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    ...shorthands.gap('24px'),
  },
  departmentCard: {
    height: '100%',
    cursor: 'pointer',
    ...glass.card,
    ...shorthands.borderRadius('8px'),
  },
  departmentCardDark: {
    ...glass.cardDark,
  },
  departmentIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    ...shorthands.gap('24px'),
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
  featureCard: {
    ...glass.card,
    ...shorthands.padding('48px', '36px'),
    ...shorthands.borderRadius('8px'),
    textAlign: 'center',
  },
  featureCardDark: {
    ...glass.cardDark,
  },
  featureIcon: {
    fontSize: '64px',
    marginBottom: '24px',
  },
  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    ...shorthands.gap('24px'),
    maxWidth: '1024px',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
  teamCard: {
    ...glass.card,
    ...shorthands.padding('48px', '40px'),
    textAlign: 'center',
    ...shorthands.borderRadius('8px'),
  },
  teamCardDark: {
    ...glass.cardDark,
  },
  teamAvatar: {
    marginBottom: '16px',
  },
  quote: {
    ...glass.band,
    ...shorthands.padding('80px', '24px'),
    marginTop: '64px',
    textAlign: 'center',
    borderTop: '2px solid rgba(255,255,255,0.50)',
    borderBottom: '2px solid rgba(255,255,255,0.50)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 8px rgba(0,0,0,0.04)',
  },
  quoteDark: {
    ...glass.bandDark,
    borderTop: '2px solid rgba(255,255,255,0.25)',
    borderBottom: '2px solid rgba(255,255,255,0.25)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 12px rgba(0,0,0,0.3)',
  },
  quoteText: {
    fontSize: '32px',
    fontWeight: 600,
    lineHeight: '40px',
    maxWidth: '900px',
    margin: '0 auto 20px',
    color: tokens.colorNeutralForeground1,
    letterSpacing: '-0.01em',
    '@media (max-width: 768px)': {
      fontSize: '24px',
      lineHeight: '32px',
    },
  },
  footer: {
    ...glass.band,
    ...shorthands.padding('72px', '24px', '48px'),
    marginTop: '80px',
    borderTop: '2px solid rgba(255,255,255,0.50)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 -4px 16px rgba(0,0,0,0.04)',
  },
  footerDark: {
    ...glass.bandDark,
    borderTop: '2px solid rgba(255,255,255,0.25)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 -4px 24px rgba(0,0,0,0.3)',
  },
  footerContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr',
    ...shorthands.gap('48px'),
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      ...shorthands.gap('32px'),
    },
  },
  footerBrand: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('12px'),
  },
  footerTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: tokens.colorNeutralForeground1,
    marginBottom: '8px',
  },
  footerText: {
    fontSize: '14px',
    lineHeight: '22px',
    color: tokens.colorNeutralForeground2,
  },
  footerLinks: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('12px'),
  },
  footerLink: {
    fontSize: '15px',
    color: tokens.colorNeutralForeground2,
    textDecoration: 'none',
    ...shorthands.transition('color', '150ms', 'ease'),
    ':hover': {
      color: tokens.colorBrandForeground1,
    },
  },
  footerStats: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
  },
  footerStat: {
    display: 'flex',
    alignItems: 'baseline',
    ...shorthands.gap('8px'),
  },
  footerStatValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: tokens.colorBrandForeground1,
  },
  footerStatLabel: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground2,
  },
  footerCopyright: {
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid rgba(255,255,255,0.20)',
    textAlign: 'center',
    fontSize: '13px',
    color: tokens.colorNeutralForeground3,
  },
});

// Icon mapping for professional department icons
const getDepartmentIcon = (deptName) => {
  const iconMap = {
    'Business': <Briefcase24Regular />,
    'Marketing': <Megaphone24Regular />,
    'Sales': <MoneyHand24Regular />,
    'SEO': <SearchInfo24Regular />,
    'Finance': <Calculator24Regular />,
    'Education': <BookOpenGlobe24Regular />,
    'Writing': <DocumentText24Regular />,
    'Productivity': <TaskListSquareLtr24Regular />,
    'Solopreneurs': <PersonCircle24Regular />,
  };
  return iconMap[deptName] || <Briefcase24Regular />;
};

export default function HomePage({ isDark, toggleTheme }) {
  const styles = useStyles();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [totalPrompts, setTotalPrompts] = useState('2000+');

  useEffect(() => {
    // Load prompts index with fallback
    const fetchData = async () => {
      try {
        const res = await fetch('/prompts_index.json');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (data && data.departments) {
          setDepartments(data.departments);
        }
      } catch (err) {
        console.error('Failed to load from primary index, trying backup:', err);
        try {
          const res = await fetch('/prompts_index_backup.json');
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const data = await res.json();
          if (data && data.departments) {
            setDepartments(data.departments);
          }
        } catch (err2) {
          console.error('Failed to load departments from backup:', err2);
        }
      }
    };
    fetchData();
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleDepartmentClick = (deptName) => {
    navigate(`/browse?department=${encodeURIComponent(deptName)}`);
  };

  return (
    <div className={styles.container}>
      <Header isDark={isDark} toggleTheme={toggleTheme} />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Prompt<br />Library
          </h1>
          <p className={styles.heroSubtitle}>
            Curated prompts across 9 departments.<br />
            Clean, tested, ready to use.
          </p>
          <Button
            appearance="primary"
            size="large"
            icon={<ArrowRight24Regular />}
            iconPosition="after"
            onClick={() => handleNavigate('/browse')}
          >
            Browse Library
          </Button>

          <div className={styles.heroChips}>
            <div className={mergeClasses(styles.chip, isDark && styles.chipDark)}>
              <div className={styles.chipValue}>{totalPrompts}</div>
              <div className={styles.chipLabel}>Prompts</div>
            </div>
            <div className={mergeClasses(styles.chip, isDark && styles.chipDark)}>
              <div className={styles.chipValue}>9</div>
              <div className={styles.chipLabel}>Departments</div>
            </div>
            <div className={mergeClasses(styles.chip, isDark && styles.chipDark)}>
              <div className={styles.chipValue}>100%</div>
              <div className={styles.chipLabel}>Tested</div>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className={styles.section}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionHeader}>
            <Title1 as="h2" block style={{ marginBottom: '16px' }}>
              Browse by Department
            </Title1>
            <Body1>
              Select a department to explore prompts tailored to your needs
            </Body1>
          </div>
          <div className={styles.departmentsGrid}>
            {departments.map((dept, index) => (
              <Card
                key={index}
                className={mergeClasses(styles.departmentCard, isDark && styles.departmentCardDark)}
                onClick={() => handleDepartmentClick(dept.name)}
              >
                <CardHeader
                  image={
                    <div className={styles.departmentIcon} style={{ color: tokens.colorBrandForeground1 }}>
                      {getDepartmentIcon(dept.name)}
                    </div>
                  }
                  header={<Title3>{dept.name}</Title3>}
                  description={
                    <Body2>
                      {dept.description
                        .replace(/professional /gi, '')
                        .replace(/\d+\s+\w+\s+prompts/gi, '')
                        .trim()}
                    </Body2>
                  }
                />
                <CardFooter>
                  <Button
                    appearance="subtle"
                    icon={<ArrowRight24Regular />}
                    iconPosition="after"
                  >
                    Browse
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.section}>
        <div className={styles.sectionContent}>
          <div className={styles.featuresGrid}>
            <div className={mergeClasses(styles.featureCard, isDark && styles.featureCardDark)}>
              <div className={styles.featureIcon}>
                <Sparkle24Filled style={{ fontSize: '64px', color: tokens.colorBrandForeground1 }} />
              </div>
              <Title3 block style={{ marginBottom: '12px' }}>Ready to Use</Title3>
              <Body1>Copy and customize prompts in seconds</Body1>
            </div>
            <div className={mergeClasses(styles.featureCard, isDark && styles.featureCardDark)}>
              <div className={styles.featureIcon}>
                <CheckmarkCircle24Regular style={{ fontSize: '64px', color: tokens.colorBrandForeground1 }} />
              </div>
              <Title3 block style={{ marginBottom: '12px' }}>Quality Tested</Title3>
              <Body1>Every prompt verified for effectiveness</Body1>
            </div>
            <div className={mergeClasses(styles.featureCard, isDark && styles.featureCardDark)}>
              <div className={styles.featureIcon}>
                <Target24Regular style={{ fontSize: '64px', color: tokens.colorBrandForeground1 }} />
              </div>
              <Title3 block style={{ marginBottom: '12px' }}>Organized</Title3>
              <Body1>Find exactly what you need quickly</Body1>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.section}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionHeader}>
            <Title1 as="h2" block style={{ marginBottom: '16px' }}>
              Meet the Team
            </Title1>
            <Body1>
              The experts behind the prompts
            </Body1>
          </div>
          <div className={styles.teamGrid}>
            <Card className={mergeClasses(styles.teamCard, isDark && styles.teamCardDark)}>
              <div className={styles.teamAvatar}>
                <Avatar
                  size={96}
                  image={{ src: '/images/peter.jpg' }}
                  name="Peter Wolf"
                />
              </div>
              <Title2 block style={{ marginBottom: '8px' }}>Peter Wolf</Title2>
              <Subtitle1 block style={{ marginBottom: '16px', color: tokens.colorBrandForeground1 }}>
                Managing Director Treasury Services
              </Subtitle1>
              <Body2 block style={{ marginBottom: '24px' }}>
                Leading business automation and AI integration strategies
              </Body2>
              <Button
                as="a"
                href="https://www.linkedin.com/in/peter-wolf-mba-24688611/"
                target="_blank"
                rel="noopener noreferrer"
                appearance="primary"
              >
                View LinkedIn
              </Button>
            </Card>
            <Card className={mergeClasses(styles.teamCard, isDark && styles.teamCardDark)}>
              <div className={styles.teamAvatar}>
                <Avatar
                  size={96}
                  image={{ src: '/images/nick.jpg' }}
                  name="Nicholas Westburg"
                />
              </div>
              <Title2 block style={{ marginBottom: '8px' }}>Nicholas Westburg</Title2>
              <Subtitle1 block style={{ marginBottom: '16px', color: tokens.colorBrandForeground1 }}>
                AI Integration Architect
              </Subtitle1>
              <Body2 block style={{ marginBottom: '24px' }}>
                Expert in prompt engineering and AI implementation
              </Body2>
              <Button
                as="a"
                href="https://www.linkedin.com/in/nwestburg/"
                target="_blank"
                rel="noopener noreferrer"
                appearance="primary"
              >
                View LinkedIn
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className={mergeClasses(styles.quote, isDark && styles.quoteDark)}>
        <blockquote className={styles.quoteText}>
          The quality of your prompts determines the quality of your results
        </blockquote>
        <Body1 style={{ color: tokens.colorNeutralForeground2 }}>
          Start with the best
        </Body1>
      </section>

      {/* Footer */}
      <footer className={mergeClasses(styles.footer, isDark && styles.footerDark)}>
        <div className={styles.footerContent}>
          {/* Brand Column */}
          <div className={styles.footerBrand}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Sparkle24Filled style={{ fontSize: '24px', color: tokens.colorBrandForeground1 }} />
              <div className={styles.footerTitle}>SPARK</div>
            </div>
            <div className={styles.footerText}>
              Serrala Program for AI Research & Knowledge
            </div>
            <div className={styles.footerText} style={{ marginTop: '8px' }}>
              Curated prompts for every business need. Clean, tested, ready to use.
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <div className={styles.footerTitle}>Quick Links</div>
            <nav className={styles.footerLinks}>
              <a href="/" className={styles.footerLink} onClick={(e) => { e.preventDefault(); handleNavigate('/'); }}>
                Home
              </a>
              <a href="/browse" className={styles.footerLink} onClick={(e) => { e.preventDefault(); handleNavigate('/browse'); }}>
                Browse Prompts
              </a>
              <a href="/favorites" className={styles.footerLink} onClick={(e) => { e.preventDefault(); handleNavigate('/favorites'); }}>
                Favorites
              </a>
            </nav>
          </div>

          {/* Stats Column */}
          <div>
            <div className={styles.footerTitle}>Our Library</div>
            <div className={styles.footerStats}>
              <div className={styles.footerStat}>
                <span className={styles.footerStatValue}>{totalPrompts}</span>
                <span className={styles.footerStatLabel}>Prompts</span>
              </div>
              <div className={styles.footerStat}>
                <span className={styles.footerStatValue}>9</span>
                <span className={styles.footerStatLabel}>Departments</span>
              </div>
              <div className={styles.footerStat}>
                <span className={styles.footerStatValue}>100%</span>
                <span className={styles.footerStatLabel}>Tested</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className={styles.footerCopyright}>
          © 2025 SPARK Serrala Program for AI Research & Knowledge. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
