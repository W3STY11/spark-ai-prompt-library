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
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Target,
  Briefcase,
  Megaphone,
  DollarSign,
  Search,
  Calculator,
  BookOpen,
  FileText,
  ListTodo,
  UserCircle2,
} from 'lucide-react';
import { glass } from '../ui/themeGlass';
import Header from './Header';

// Enhanced floating animation keyframes (Best-in-class organic movement)
const floatingAnimation = `
  @keyframes float {
    0%, 100% {
      transform: translateY(0px) translateX(0px) scale(1);
    }
    25% {
      transform: translateY(-30px) translateX(10px) scale(1.05);
    }
    50% {
      transform: translateY(-50px) translateX(-5px) scale(1);
    }
    75% {
      transform: translateY(-25px) translateX(-12px) scale(0.98);
    }
  }

  @keyframes floatAlt {
    0%, 100% {
      transform: translateY(0px) translateX(0px) scale(1) rotate(0deg);
    }
    33% {
      transform: translateY(-40px) translateX(-15px) scale(1.08) rotate(2deg);
    }
    66% {
      transform: translateY(-20px) translateX(15px) scale(0.95) rotate(-2deg);
    }
  }

  @keyframes glow {
    0%, 100% {
      filter: blur(60px) brightness(1);
    }
    50% {
      filter: blur(75px) brightness(1.2);
    }
  }
`;

const useStyles = makeStyles({
  container: {
    minHeight: '100vh',
  },
  hero: {
    ...shorthands.padding('120px', '24px', '80px'),
    position: 'relative',
    overflow: 'hidden',
    '@media (max-width: 1024px)': {
      ...shorthands.padding('80px', '24px', '60px'),
    },
  },
  heroContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    ...shorthands.gap('64px'),
    alignItems: 'center',
    '@media (max-width: 1024px)': {
      gridTemplateColumns: '1fr',
      ...shorthands.gap('48px'),
    },
  },
  heroTextContent: {
    position: 'relative',
    zIndex: 2,
  },
  heroVideoContent: {
    position: 'relative',
    zIndex: 2,
    '@media (max-width: 1024px)': {
      order: -1,
    },
  },
  animatedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  floatingShape: {
    position: 'absolute',
    ...shorthands.borderRadius('50%'),
    opacity: 0.12,
    filter: 'blur(60px) saturate(150%)',
    willChange: 'transform, filter',
    animation: 'float 12s cubic-bezier(0.4, 0, 0.2, 1) infinite, glow 8s ease-in-out infinite',
    boxShadow: '0 0 120px rgba(99, 102, 241, 0.3)',
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none !important',
    },
  },
  floatingShapeDark: {
    opacity: 0.18,
    filter: 'blur(70px) saturate(180%)',
    boxShadow: '0 0 150px rgba(129, 140, 248, 0.4)',
  },
  heroTitle: {
    fontSize: '72px',
    fontWeight: 700,
    lineHeight: 1.1,
    marginBottom: '24px',
    color: tokens.colorNeutralForeground1,
    letterSpacing: '-0.03em',
    '@media (max-width: 1024px)': {
      fontSize: '56px',
    },
    '@media (max-width: 768px)': {
      fontSize: '44px',
    },
  },
  heroSubtitle: {
    fontSize: '24px',
    lineHeight: 1.5,
    marginBottom: '40px',
    color: tokens.colorNeutralForeground2,
    fontWeight: 400,
    maxWidth: '580px',
    '@media (max-width: 768px)': {
      fontSize: '20px',
    },
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    ...shorthands.borderRadius('20px'),
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
    background: isDark => isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    ...shorthands.border('1px', 'solid', isDark => isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
    transform: 'perspective(1200px) rotateY(-5deg)',
    ...shorthands.transition('transform', '500ms', 'cubic-bezier(0.34, 1.56, 0.64, 1)'),
    ':hover': {
      transform: 'perspective(1200px) rotateY(0deg) scale(1.02)',
    },
    '@media (prefers-reduced-motion: reduce)': {
      transform: 'none',
      ':hover': {
        transform: 'none',
      },
    },
  },
  video: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  videoFallback: {
    width: '100%',
    height: 'auto',
    objectFit: 'cover',
  },
  trustSignals: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('24px'),
    marginTop: '32px',
    fontSize: '15px',
    color: tokens.colorNeutralForeground2,
    flexWrap: 'wrap',
    '@media (max-width: 768px)': {
      ...shorthands.gap('16px'),
      fontSize: '14px',
    },
  },
  trustItem: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
  },
  trustCheckmark: {
    color: tokens.colorPaletteGreenForeground1,
    fontSize: '18px',
  },
  trustDivider: {
    color: tokens.colorNeutralForeground3,
    opacity: 0.5,
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

// Icon mapping for professional department icons (Lucide - Industry standard)
const getDepartmentIcon = (deptName) => {
  const iconMap = {
    'Business': <Briefcase size={24} strokeWidth={2} />,
    'Marketing': <Megaphone size={24} strokeWidth={2} />,
    'Sales': <DollarSign size={24} strokeWidth={2} />,
    'SEO': <Search size={24} strokeWidth={2} />,
    'Finance': <Calculator size={24} strokeWidth={2} />,
    'Education': <BookOpen size={24} strokeWidth={2} />,
    'Writing': <FileText size={24} strokeWidth={2} />,
    'Productivity': <ListTodo size={24} strokeWidth={2} />,
    'Solopreneurs': <UserCircle2 size={24} strokeWidth={2} />,
  };
  return iconMap[deptName] || <Briefcase size={24} strokeWidth={2} />;
};

export default function HomePage({ isDark, toggleTheme }) {
  const styles = useStyles();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [totalPrompts, setTotalPrompts] = useState('2000+');
  const [scrollY, setScrollY] = useState(0);

  // Track scroll for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll animations on element entry (Best-in-class implementation)
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1, // Trigger when 10% of element is visible
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0px)';
          entry.target.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
          // Optional: Unobserve after animation to improve performance
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Wait for DOM to be ready, then observe all sections with data-animate attribute
    const animateElements = () => {
      const elementsToAnimate = document.querySelectorAll('[data-animate]');

      elementsToAnimate.forEach((el) => {
        // Add initial state
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
      });

      return () => {
        elementsToAnimate.forEach((el) => observer.unobserve(el));
      };
    };

    // Delay to ensure DOM is ready
    const timeoutId = setTimeout(animateElements, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [departments]); // Re-run when departments load

  useEffect(() => {
    // Load departments from Azure SQL API
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.PROMPTS.replace('/prompts', '/departments')}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          // Transform API response to match expected format
          const depts = data.map(d => ({
            name: d.name,
            icon: d.icon,
            promptCount: d.prompt_count,
            description: `Browse ${d.prompt_count} prompts in ${d.name}`
          }));
          setDepartments(depts);

          // Calculate total prompts from all departments
          const total = depts.reduce((sum, d) => sum + (d.promptCount || 0), 0);
          setTotalPrompts(total > 0 ? total.toString() : '0');
        }
      } catch (err) {
        console.error('Failed to load departments from API:', err);
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

  // 3D Mouse Tracking Tilt Effect (Best-in-class implementation)
  const handle3DTilt = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // Mouse X position within the card
    const y = e.clientY - rect.top;  // Mouse Y position within the card
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation angles (-15 to +15 degrees for natural tilt)
    const rotateX = ((y - centerY) / centerY) * -8; // Vertical tilt
    const rotateY = ((x - centerX) / centerX) * 8;  // Horizontal tilt

    // Apply 3D transform with perspective
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
    card.style.transition = 'none'; // Remove transition during mouse move for smooth tracking
  };

  const handle3DReset = (e) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
    card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'; // Smooth return to original position
  };

  return (
    <div className={styles.container}>
      {/* Inject floating animation */}
      <style>{floatingAnimation}</style>

      <Header isDark={isDark} toggleTheme={toggleTheme} />

      {/* Hero Section */}
      <section className={styles.hero}>
        {/* Animated Background - Subtle Glass Orbs */}
        <div className={styles.animatedBackground}>
          {/* Orb 1 - Top Left - Purple/Blue */}
          <div
            className={mergeClasses(styles.floatingShape, isDark && styles.floatingShapeDark)}
            style={{
              width: '350px',
              height: '350px',
              background: `linear-gradient(135deg, ${tokens.colorBrandForeground1}, ${tokens.colorPaletteBlueForeground1})`,
              top: '-80px',
              left: '-100px',
              transform: `translateY(${scrollY * 0.12}px)`,
              animationDelay: '0s',
            }}
          />
          {/* Orb 2 - Top Right - Purple/Magenta */}
          <div
            className={mergeClasses(styles.floatingShape, isDark && styles.floatingShapeDark)}
            style={{
              width: '280px',
              height: '280px',
              background: `linear-gradient(135deg, ${tokens.colorPalettePurpleForeground1}, ${tokens.colorPaletteMagentaForeground1})`,
              top: '15%',
              right: '-60px',
              transform: `translateY(${scrollY * 0.18}px)`,
              animationDelay: '2s',
              animation: 'floatAlt 14s cubic-bezier(0.4, 0, 0.2, 1) infinite, glow 10s ease-in-out infinite',
            }}
          />
          {/* Orb 3 - Center Left - Teal/Blue */}
          <div
            className={mergeClasses(styles.floatingShape, isDark && styles.floatingShapeDark)}
            style={{
              width: '220px',
              height: '220px',
              background: `linear-gradient(135deg, ${tokens.colorPaletteTealForeground1}, ${tokens.colorPaletteBlueForeground1})`,
              top: '45%',
              left: '10%',
              transform: `translateY(${scrollY * 0.08}px)`,
              animationDelay: '4s',
            }}
          />
          {/* Orb 4 - Bottom Center - Blue/Purple */}
          <div
            className={mergeClasses(styles.floatingShape, isDark && styles.floatingShapeDark)}
            style={{
              width: '300px',
              height: '300px',
              background: `linear-gradient(135deg, ${tokens.colorPaletteBlueForeground1}, ${tokens.colorBrandForeground2})`,
              bottom: '-50px',
              left: '40%',
              transform: `translateY(${scrollY * 0.1}px)`,
              animationDelay: '6s',
            }}
          />
          {/* Orb 5 - Right Side - Purple */}
          <div
            className={mergeClasses(styles.floatingShape, isDark && styles.floatingShapeDark)}
            style={{
              width: '180px',
              height: '180px',
              background: `linear-gradient(135deg, ${tokens.colorPalettePurpleForeground1}, ${tokens.colorBrandForeground1})`,
              top: '55%',
              right: '15%',
              transform: `translateY(${scrollY * 0.15}px)`,
              animationDelay: '8s',
              animation: 'floatAlt 15s cubic-bezier(0.4, 0, 0.2, 1) infinite, glow 12s ease-in-out infinite',
            }}
          />
        </div>

        {/* Hero Content */}
        <div className={styles.heroContent}>
          {/* Text Content */}
          <div className={styles.heroTextContent}>
            <h1 className={styles.heroTitle}>
              Your AI Prompt<br />Library
            </h1>
            <p className={styles.heroSubtitle}>
              {totalPrompts}+ battle-tested prompts for ChatGPT, Claude, and other AI tools. Browse by department, copy instantly, and create better AI content.
            </p>

            <Button
              appearance="primary"
              size="large"
              icon={<ArrowRight size={20} strokeWidth={2.5} />}
              iconPosition="after"
              onClick={() => handleNavigate('/browse')}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontSize: '18px',
                padding: '16px 32px',
                height: 'auto',
              }}
            >
              Browse Library
            </Button>

            {/* Trust Signals */}
            <div className={styles.trustSignals}>
              <div className={styles.trustItem}>
                <span className={styles.trustCheckmark}>✓</span>
                <span>{totalPrompts}+ Prompts</span>
              </div>
              <span className={styles.trustDivider}>•</span>
              <div className={styles.trustItem}>
                <span className={styles.trustCheckmark}>✓</span>
                <span>{departments.length} Departments</span>
              </div>
              <span className={styles.trustDivider}>•</span>
              <div className={styles.trustItem}>
                <span className={styles.trustCheckmark}>✓</span>
                <span>100% Tested</span>
              </div>
            </div>
          </div>

          {/* Demo Placeholder */}
          <div className={styles.heroVideoContent}>
            <div
              className={styles.videoContainer}
              style={{ background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }}
            >
              {/* Enhanced Placeholder - Glassmorphic Design */}
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '16 / 9',
                    background: `linear-gradient(135deg,
                      ${isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)'},
                      ${isDark ? 'rgba(147, 51, 234, 0.15)' : 'rgba(147, 51, 234, 0.08)'})`,
                    backdropFilter: 'blur(20px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'}`,
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '24px',
                    padding: '48px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Background Pattern */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: `radial-gradient(circle at 50% 50%,
                        ${isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)'} 1px,
                        transparent 1px)`,
                      backgroundSize: '24px 24px',
                      opacity: 0.3,
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Play Icon */}
                  <div
                    style={{
                      width: '96px',
                      height: '96px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${tokens.colorBrandForeground1}, ${tokens.colorBrandForeground2})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 8px 32px rgba(99, 102, 241, 0.3)`,
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="white"
                      style={{ marginLeft: '4px' }}
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>

                  {/* Text Content */}
                  <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <h3
                      style={{
                        fontSize: '24px',
                        fontWeight: 600,
                        marginBottom: '8px',
                        color: tokens.colorNeutralForeground1,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      Product Demo Coming Soon
                    </h3>
                    <p
                      style={{
                        fontSize: '16px',
                        color: tokens.colorNeutralForeground2,
                        lineHeight: 1.6,
                      }}
                    >
                      See SPARK Prompt Library in action with our interactive demo
                    </p>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className={styles.section} data-animate>
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
                onMouseMove={handle3DTilt}
                onMouseLeave={handle3DReset}
                style={{ transformStyle: 'preserve-3d' }}
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
                        ? dept.description
                            .replace(/professional /gi, '')
                            .replace(/\d+\s+\w+\s+prompts/gi, '')
                            .trim()
                        : `${dept.count || 0} professional prompts`}
                    </Body2>
                  }
                />
                <CardFooter>
                  <Button
                    appearance="subtle"
                    icon={<ArrowRight size={18} strokeWidth={2.5} />}
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
      <section className={styles.section} data-animate>
        <div className={styles.sectionContent}>
          <div className={styles.featuresGrid}>
            <div
              className={mergeClasses(styles.featureCard, isDark && styles.featureCardDark)}
              onMouseMove={handle3DTilt}
              onMouseLeave={handle3DReset}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className={styles.featureIcon}>
                <Sparkles size={64} strokeWidth={2} style={{ color: tokens.colorBrandForeground1 }} />
              </div>
              <Title3 block style={{ marginBottom: '12px' }}>Ready to Use</Title3>
              <Body1>Copy and customize prompts in seconds</Body1>
            </div>
            <div
              className={mergeClasses(styles.featureCard, isDark && styles.featureCardDark)}
              onMouseMove={handle3DTilt}
              onMouseLeave={handle3DReset}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className={styles.featureIcon}>
                <CheckCircle2 size={64} strokeWidth={2} style={{ color: tokens.colorBrandForeground1 }} />
              </div>
              <Title3 block style={{ marginBottom: '12px' }}>Quality Tested</Title3>
              <Body1>Every prompt verified for effectiveness</Body1>
            </div>
            <div
              className={mergeClasses(styles.featureCard, isDark && styles.featureCardDark)}
              onMouseMove={handle3DTilt}
              onMouseLeave={handle3DReset}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className={styles.featureIcon}>
                <Target size={64} strokeWidth={2} style={{ color: tokens.colorBrandForeground1 }} />
              </div>
              <Title3 block style={{ marginBottom: '12px' }}>Organized</Title3>
              <Body1>Find exactly what you need quickly</Body1>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.section} data-animate>
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
            <Card className={mergeClasses(styles.teamCard, isDark && styles.teamCardDark)} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ flex: 1 }}>
                <Title2 block style={{ marginBottom: '8px' }}>Peter Wolf</Title2>
                <Subtitle1 block style={{ marginBottom: '16px', color: tokens.colorBrandForeground1 }}>
                  Managing Director Treasury Services
                </Subtitle1>
                <Body2 block style={{ marginBottom: '24px' }}>
                  Leading business automation and AI integration strategies
                </Body2>
              </div>
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
            <Card className={mergeClasses(styles.teamCard, isDark && styles.teamCardDark)} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ flex: 1 }}>
                <Title2 block style={{ marginBottom: '8px' }}>Nicholas Westburg</Title2>
                <Subtitle1 block style={{ marginBottom: '16px', color: tokens.colorBrandForeground1 }}>
                  AI Integration Architect
                </Subtitle1>
                <Body2 block style={{ marginBottom: '24px' }}>
                  Expert in prompt engineering and AI implementation
                </Body2>
              </div>
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
      <section className={mergeClasses(styles.quote, isDark && styles.quoteDark)} data-animate>
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
              <Sparkles size={24} strokeWidth={2} style={{ color: tokens.colorBrandForeground1 }} />
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
                <span className={styles.footerStatValue}>{departments.length}</span>
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
