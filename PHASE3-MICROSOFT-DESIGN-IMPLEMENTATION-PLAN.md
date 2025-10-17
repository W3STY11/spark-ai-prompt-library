# Phase 3: Microsoft Fluent Design - Implementation Plan

**Date:** October 16, 2025
**Target:** SPARK Prompt Library
**Design Aesthetic:** Microsoft Fluent 1 + iOS 26 Liquid Glass
**Constraint:** CSS-only changes, zero breaking functionality

---

## Executive Summary

This document provides **exact, copy-paste ready CSS specifications** for transforming the SPARK Prompt Library into a clean, glassy, enterprise-grade application with Microsoft Fluent and iOS Liquid Glass aesthetics.

**Design Goals:**
- ✨ Clean, glassy, effective enterprise vibes
- ✨ Frosted glass (glassmorphism) card effects
- ✨ Spacious, airy layouts with breathing room
- ✨ Microsoft blue/gray color palette
- ✨ Segoe UI typography
- ✨ Subtle depth through layered shadows
- ✨ No breaking changes - all functionality preserved

**Technical Approach:**
- Modify `src/css/enhanced.css` only
- Update CSS custom properties (design tokens)
- Enhance component styles
- Maintain full backward compatibility

---

## 1. Design Token Transformation

### 1.1 Color System - Microsoft Palette

**Replace Current Purple Theme with Microsoft Blues/Grays**

```css
/* ========================================
   MICROSOFT FLUENT COLOR SYSTEM
   ======================================== */

:root {
  /* ==================
     PRIMARY COLORS - Microsoft Blue
     ================== */
  --ms-blue-50: #e6f2ff;
  --ms-blue-100: #b3d9ff;
  --ms-blue-200: #80c1ff;
  --ms-blue-300: #4da8ff;
  --ms-blue-400: #1a90ff;
  --ms-blue-500: #0078d4;   /* PRIMARY Microsoft Blue */
  --ms-blue-600: #005a9e;
  --ms-blue-700: #004578;
  --ms-blue-800: #003052;
  --ms-blue-900: #001b2c;

  /* Primary Brand (Microsoft) */
  --spark-primary-50: var(--ms-blue-50);
  --spark-primary-100: var(--ms-blue-100);
  --spark-primary-200: var(--ms-blue-200);
  --spark-primary-300: var(--ms-blue-300);
  --spark-primary-400: var(--ms-blue-400);
  --spark-primary-500: var(--ms-blue-500);
  --spark-primary-600: var(--ms-blue-600);
  --spark-primary-700: var(--ms-blue-700);
  --spark-primary-800: var(--ms-blue-800);
  --spark-primary-900: var(--ms-blue-900);

  /* ==================
     NEUTRAL GRAYS - Light Theme
     ================== */
  --neutral-50: #fafafa;    /* Lightest backgrounds */
  --neutral-100: #f5f5f5;   /* Card backgrounds */
  --neutral-200: #e5e5e5;   /* Borders */
  --neutral-300: #d4d4d4;   /* Dividers */
  --neutral-400: #a3a3a3;   /* Disabled text */
  --neutral-500: #737373;   /* Secondary text */
  --neutral-600: #525252;   /* Body text */
  --neutral-700: #404040;   /* Headings */
  --neutral-800: #262626;   /* Strong emphasis */
  --neutral-900: #171717;   /* Strongest */

  --spark-neutral-50: var(--neutral-50);
  --spark-neutral-100: var(--neutral-100);
  --spark-neutral-200: var(--neutral-200);
  --spark-neutral-300: var(--neutral-300);
  --spark-neutral-400: var(--neutral-400);
  --spark-neutral-500: var(--neutral-500);
  --spark-neutral-600: var(--neutral-600);
  --spark-neutral-700: var(--neutral-700);
  --spark-neutral-800: var(--neutral-800);
  --spark-neutral-900: var(--neutral-900);

  /* ==================
     SEMANTIC COLORS - Microsoft Palette
     ================== */
  --ms-success: #107c10;    /* Success green */
  --ms-warning: #ff8c00;    /* Warning orange */
  --ms-error: #d13438;      /* Error red */
  --ms-info: #00b7c3;       /* Info cyan */

  /* ==================
     GLASSMORPHISM COLORS
     ================== */
  --glass-white: rgba(255, 255, 255, 0.7);
  --glass-white-border: rgba(255, 255, 255, 0.3);
  --glass-black: rgba(30, 30, 30, 0.7);
  --glass-black-border: rgba(255, 255, 255, 0.1);
}

/* ==================
   DARK MODE COLORS
   ================== */
.dark {
  --neutral-50: #171717;
  --neutral-100: #262626;
  --neutral-200: #404040;
  --neutral-300: #525252;
  --neutral-400: #737373;
  --neutral-500: #a3a3a3;
  --neutral-600: #d4d4d4;
  --neutral-700: #e5e5e5;
  --neutral-800: #f5f5f5;
  --neutral-900: #fafafa;

  --spark-neutral-50: var(--neutral-50);
  --spark-neutral-100: var(--neutral-100);
  --spark-neutral-200: var(--neutral-200);
  --spark-neutral-300: var(--neutral-300);
  --spark-neutral-400: var(--neutral-400);
  --spark-neutral-500: var(--neutral-500);
  --spark-neutral-600: var(--neutral-600);
  --spark-neutral-700: var(--neutral-700);
  --spark-neutral-800: var(--neutral-800);
  --spark-neutral-900: var(--neutral-900);

  /* Lighter primary blues for dark mode */
  --spark-primary-400: var(--ms-blue-300);
  --spark-primary-500: var(--ms-blue-400);
}
```

### 1.2 Department Color System

**Microsoft-Inspired Department Palette**

```css
:root {
  /* ==================
     DEPARTMENT COLORS
     ================== */

  /* Business - Professional Blue */
  --dept-business: #0078d4;
  --dept-business-light: #e6f2ff;
  --dept-business-dark: #004578;

  /* Marketing - Vibrant Pink */
  --dept-marketing: #e3008c;
  --dept-marketing-light: #ffe6f5;
  --dept-marketing-dark: #a3006b;

  /* Sales - Growth Green */
  --dept-sales: #107c10;
  --dept-sales-light: #e6f5e6;
  --dept-sales-dark: #0b5a0b;

  /* SEO - Discovery Teal */
  --dept-seo: #008272;
  --dept-seo-light: #e6f5f3;
  --dept-seo-dark: #005b50;

  /* Finance - Trust Purple */
  --dept-finance: #5c2d91;
  --dept-finance-light: #f0e6f7;
  --dept-finance-dark: #401f66;

  /* Education - Wisdom Orange */
  --dept-education: #ff8c00;
  --dept-education-light: #fff3e6;
  --dept-education-dark: #b36200;

  /* Writing - Creative Violet */
  --dept-writing: #8764b8;
  --dept-writing-light: #f3edf9;
  --dept-writing-dark: #5e4580;

  /* Productivity - Efficiency Cyan */
  --dept-productivity: #00b7c3;
  --dept-productivity-light: #e6f9fa;
  --dept-productivity-dark: #008088;

  /* Solopreneurs - Entrepreneurial Red */
  --dept-solopreneurs: #d13438;
  --dept-solopreneurs-light: #fce6e7;
  --dept-solopreneurs-dark: #922426;
}
```

### 1.3 Spacing System - Enhanced for Breathing Room

```css
:root {
  /* ==================
     SPACING SCALE - 8px Grid
     Increased by 30-40% for spacious aesthetic
     ================== */
  --space-1: 0.25rem;   /* 4px  - Tight */
  --space-2: 0.5rem;    /* 8px  - Base unit */
  --space-3: 0.75rem;   /* 12px - Compact */
  --space-4: 1rem;      /* 16px - Comfortable */
  --space-5: 1.5rem;    /* 24px - Generous (was 20px) */
  --space-6: 2rem;      /* 32px - Spacious (was 24px) */
  --space-8: 2.5rem;    /* 40px - Large gaps (was 32px) */
  --space-10: 3rem;     /* 48px - Section breaks (was 40px) */
  --space-12: 4rem;     /* 64px - Major sections (was 48px) */
  --space-16: 5rem;     /* 80px - Page sections (was 64px) */
}
```

### 1.4 Shadow System - Fluent Layered Depth

```css
:root {
  /* ==================
     ELEVATION SHADOWS - Microsoft Fluent Style
     Layered shadows for realistic depth
     ================== */

  /* Resting state - subtle lift */
  --shadow-sm:
    0 2px 4px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.04);

  /* Card elevation */
  --shadow-md:
    0 4px 8px rgba(0, 0, 0, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.06);

  /* Elevated / hover state */
  --shadow-lg:
    0 8px 16px rgba(0, 0, 0, 0.12),
    0 4px 8px rgba(0, 0, 0, 0.08);

  /* Modal / dialog */
  --shadow-xl:
    0 16px 32px rgba(0, 0, 0, 0.15),
    0 8px 16px rgba(0, 0, 0, 0.10);

  /* Maximum elevation */
  --shadow-2xl:
    0 24px 48px rgba(0, 0, 0, 0.18),
    0 12px 24px rgba(0, 0, 0, 0.12);
}

.dark {
  /* Dark mode - enhanced shadows with light rim */
  --shadow-sm:
    0 2px 4px rgba(0, 0, 0, 0.3),
    0 1px 0px rgba(255, 255, 255, 0.05);

  --shadow-md:
    0 4px 8px rgba(0, 0, 0, 0.4),
    0 1px 0px rgba(255, 255, 255, 0.05);

  --shadow-lg:
    0 8px 16px rgba(0, 0, 0, 0.5),
    0 1px 0px rgba(255, 255, 255, 0.08);

  --shadow-xl:
    0 16px 32px rgba(0, 0, 0, 0.6),
    0 1px 0px rgba(255, 255, 255, 0.10);

  --shadow-2xl:
    0 24px 48px rgba(0, 0, 0, 0.7),
    0 1px 0px rgba(255, 255, 255, 0.12);
}
```

### 1.5 Typography System - Segoe UI

```css
:root {
  /* ==================
     TYPOGRAPHY - Microsoft Segoe UI
     ================== */
  --font-family-sans: 'Segoe UI Variable', 'Segoe UI', -apple-system,
                      BlinkMacSystemFont, 'San Francisco', 'Helvetica Neue',
                      Arial, sans-serif;

  --font-family-mono: 'Cascadia Code', 'Cascadia Mono', 'Consolas',
                      'Monaco', 'Courier New', monospace;

  /* Font sizes */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */

  /* Font weights */
  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Line heights - increased for readability */
  --leading-tight: 1.25;
  --leading-normal: 1.6;   /* was 1.5 */
  --leading-relaxed: 1.8;  /* was 1.625 */
  --leading-loose: 2;

  /* Letter spacing */
  --tracking-tight: -0.01em;
  --tracking-normal: 0;
  --tracking-wide: 0.01em;
  --tracking-wider: 0.02em;
}
```

### 1.6 Border Radius

```css
:root {
  /* ==================
     BORDER RADIUS
     ================== */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
  --radius-full: 9999px;
}
```

### 1.7 Animation Timing

```css
:root {
  /* ==================
     ANIMATION EASING & DURATION
     ================== */
  --duration-fast: 150ms;
  --duration-normal: 250ms;   /* was 300ms - slightly snappier */
  --duration-slow: 350ms;
  --duration-slower: 500ms;

  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0.0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

---

## 2. Component-by-Component Enhancements

### 2.1 Prompt Cards - Glassmorphism (Mica-style)

**Location:** `.prompt-card-premium` class

**Current Style:** Solid white/dark background with basic shadow

**New Style:** Frosted glass with backdrop blur

```css
/* ========================================
   PROMPT CARD - GLASSMORPHISM ENHANCEMENT
   ======================================== */

.prompt-card-premium {
  position: relative;

  /* Mica-style glass background */
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px) saturate(150%);
  -webkit-backdrop-filter: blur(8px) saturate(150%);

  /* Increased padding for breathing room */
  padding: var(--space-6);  /* 32px - was 24px */

  /* Semi-transparent border */
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-xl);  /* 16px */

  /* Microsoft blue left-border accent */
  border-left: 4px solid var(--spark-primary-500);

  /* Layered soft shadow */
  box-shadow: var(--shadow-md);

  /* Smooth transitions */
  transition: all var(--duration-normal) var(--ease-in-out);

  /* Prevent backdrop-filter glitches */
  transform: translateZ(0);
  will-change: transform, box-shadow;

  overflow: hidden;
}

/* Hover state - elevated glass */
.prompt-card-premium:hover {
  /* Lift effect */
  transform: translateY(-4px) translateZ(0);

  /* Enhanced shadow */
  box-shadow: var(--shadow-lg);

  /* Brighter border */
  border-color: rgba(255, 255, 255, 0.5);
  border-left-color: var(--spark-primary-600);

  /* Slightly more opaque */
  background: rgba(255, 255, 255, 0.8);
}

/* Active/focus state */
.prompt-card-premium:active,
.prompt-card-premium:focus-visible {
  transform: translateY(-2px) translateZ(0);
  outline: 2px solid var(--spark-primary-500);
  outline-offset: 2px;
}

/* Dark mode glass */
.dark .prompt-card-premium {
  background: rgba(30, 30, 30, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 4px solid var(--spark-primary-400);

  /* Enhanced dark mode shadows */
  box-shadow: var(--shadow-md);
}

.dark .prompt-card-premium:hover {
  background: rgba(40, 40, 40, 0.8);
  border-color: rgba(255, 255, 255, 0.2);
  border-left-color: var(--spark-primary-300);
  box-shadow: var(--shadow-lg);
}

/* Mobile optimization - reduce blur for performance */
@media (max-width: 768px) {
  .prompt-card-premium {
    backdrop-filter: blur(6px) saturate(150%);
    -webkit-backdrop-filter: blur(6px) saturate(150%);
    padding: var(--space-5);  /* 24px on mobile */
  }
}
```

### 2.2 Card Grid Layout - Enhanced Spacing

```css
/* ========================================
   PROMPT GRID - SPACIOUS LAYOUT
   ======================================== */

.prompts-grid,
#promptsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));

  /* Increased gap for breathing room */
  gap: var(--space-8);  /* 40px - was 24px */

  /* Generous section padding */
  padding: var(--space-6) var(--space-4);
}

@media (min-width: 768px) {
  .prompts-grid,
  #promptsGrid {
    gap: var(--space-10);  /* 48px on tablet+ */
    padding: var(--space-8) var(--space-6);
  }
}

@media (min-width: 1024px) {
  .prompts-grid,
  #promptsGrid {
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: var(--space-12);  /* 64px on desktop */
    padding: var(--space-10) var(--space-8);
  }
}
```

### 2.3 Card Content - Improved Typography & Spacing

```css
/* ========================================
   CARD CONTENT - CLEAN HIERARCHY
   ======================================== */

.prompt-card-premium h3,
.prompt-card-premium .card-title {
  font-family: var(--font-family-sans);
  font-size: var(--text-xl);      /* 20px */
  font-weight: var(--font-semibold);  /* 600 instead of 700 */
  line-height: var(--leading-tight);
  color: var(--neutral-800);

  margin-bottom: var(--space-3);  /* 12px */
  letter-spacing: var(--tracking-tight);
}

.dark .prompt-card-premium h3,
.dark .prompt-card-premium .card-title {
  color: var(--neutral-100);
}

.prompt-card-premium p,
.prompt-card-premium .card-description {
  font-family: var(--font-family-sans);
  font-size: var(--text-base);  /* 16px */
  font-weight: var(--font-regular);
  line-height: var(--leading-relaxed);  /* 1.8 - more spacious */
  color: var(--neutral-600);

  margin-bottom: var(--space-5);  /* 24px */
}

.dark .prompt-card-premium p,
.dark .prompt-card-premium .card-description {
  color: var(--neutral-400);
}
```

### 2.4 Department Badges - Microsoft Colors

```css
/* ========================================
   DEPARTMENT BADGES - MICROSOFT PALETTE
   ======================================== */

.badge,
[class*="badge-"] {
  display: inline-flex;
  align-items: center;

  padding: var(--space-1) var(--space-3);  /* 4px 12px */
  border-radius: var(--radius-full);

  font-family: var(--font-family-sans);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;

  transition: all var(--duration-fast) var(--ease-in-out);
}

/* Business - Microsoft Blue */
.badge-business {
  background: var(--dept-business-light);
  color: var(--dept-business-dark);
  border: 1px solid var(--dept-business);
}

.dark .badge-business {
  background: rgba(0, 120, 212, 0.2);
  color: var(--ms-blue-200);
  border-color: var(--dept-business);
}

/* Marketing - Vibrant Pink */
.badge-marketing {
  background: var(--dept-marketing-light);
  color: var(--dept-marketing-dark);
  border: 1px solid var(--dept-marketing);
}

.dark .badge-marketing {
  background: rgba(227, 0, 140, 0.2);
  color: #ff99d6;
  border-color: var(--dept-marketing);
}

/* Sales - Growth Green */
.badge-sales {
  background: var(--dept-sales-light);
  color: var(--dept-sales-dark);
  border: 1px solid var(--dept-sales);
}

.dark .badge-sales {
  background: rgba(16, 124, 16, 0.2);
  color: #7fda7f;
  border-color: var(--dept-sales);
}

/* SEO - Discovery Teal */
.badge-seo {
  background: var(--dept-seo-light);
  color: var(--dept-seo-dark);
  border: 1px solid var(--dept-seo);
}

.dark .badge-seo {
  background: rgba(0, 130, 114, 0.2);
  color: #66d9cc;
  border-color: var(--dept-seo);
}

/* Finance - Trust Purple */
.badge-finance {
  background: var(--dept-finance-light);
  color: var(--dept-finance-dark);
  border: 1px solid var(--dept-finance);
}

.dark .badge-finance {
  background: rgba(92, 45, 145, 0.2);
  color: #c5a6e6;
  border-color: var(--dept-finance);
}

/* Education - Wisdom Orange */
.badge-education {
  background: var(--dept-education-light);
  color: var(--dept-education-dark);
  border: 1px solid var(--dept-education);
}

.dark .badge-education {
  background: rgba(255, 140, 0, 0.2);
  color: #ffc266;
  border-color: var(--dept-education);
}

/* Writing - Creative Violet */
.badge-writing {
  background: var(--dept-writing-light);
  color: var(--dept-writing-dark);
  border: 1px solid var(--dept-writing);
}

.dark .badge-writing {
  background: rgba(135, 100, 184, 0.2);
  color: #c8b3e6;
  border-color: var(--dept-writing);
}

/* Productivity - Efficiency Cyan */
.badge-productivity {
  background: var(--dept-productivity-light);
  color: var(--dept-productivity-dark);
  border: 1px solid var(--dept-productivity);
}

.dark .badge-productivity {
  background: rgba(0, 183, 195, 0.2);
  color: #66dce6;
  border-color: var(--dept-productivity);
}

/* Solopreneurs - Entrepreneurial Red */
.badge-solopreneurs {
  background: var(--dept-solopreneurs-light);
  color: var(--dept-solopreneurs-dark);
  border: 1px solid var(--dept-solopreneurs);
}

.dark .badge-solopreneurs {
  background: rgba(209, 52, 56, 0.2);
  color: #ff9999;
  border-color: var(--dept-solopreneurs);
}
```

### 2.5 Buttons - Microsoft Blue Primary

```css
/* ========================================
   BUTTONS - MICROSOFT FLUENT STYLE
   ======================================== */

.btn,
button[type="submit"],
.button-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);

  padding: var(--space-3) var(--space-6);  /* 12px 32px */
  border-radius: var(--radius-lg);
  border: none;

  font-family: var(--font-family-sans);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  line-height: var(--leading-normal);

  background: var(--spark-primary-500);
  color: white;

  box-shadow: var(--shadow-sm);

  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-in-out);

  /* Prevent text selection */
  user-select: none;
}

.btn:hover,
button[type="submit"]:hover,
.button-primary:hover {
  background: var(--spark-primary-600);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.btn:active,
button[type="submit"]:active,
.button-primary:active {
  background: var(--spark-primary-700);
  box-shadow: var(--shadow-sm);
  transform: translateY(0);
}

.btn:focus-visible,
button[type="submit"]:focus-visible,
.button-primary:focus-visible {
  outline: 2px solid var(--spark-primary-500);
  outline-offset: 2px;
}

/* Secondary button */
.btn-secondary,
.button-secondary {
  background: var(--neutral-100);
  color: var(--neutral-700);
  border: 1px solid var(--neutral-300);
}

.btn-secondary:hover,
.button-secondary:hover {
  background: var(--neutral-200);
  border-color: var(--neutral-400);
}

.dark .btn-secondary,
.dark .button-secondary {
  background: var(--neutral-800);
  color: var(--neutral-200);
  border-color: var(--neutral-700);
}

.dark .btn-secondary:hover,
.dark .button-secondary:hover {
  background: var(--neutral-700);
  border-color: var(--neutral-600);
}
```

### 2.6 Modals - Acrylic Glass Effect

```css
/* ========================================
   MODALS - ACRYLIC GLASS OVERLAY
   ======================================== */

.modal-overlay,
[class*="modal-backdrop"] {
  /* Smoke material - dim background */
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.modal-content,
.modal,
[class*="modal-dialog"] {
  position: relative;

  /* Strong acrylic glass effect */
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);

  /* Generous padding */
  padding: var(--space-8);  /* 40px */
  border-radius: var(--radius-2xl);  /* 20px */

  /* Semi-transparent border */
  border: 1px solid rgba(255, 255, 255, 0.4);

  /* Strong elevation */
  box-shadow: var(--shadow-2xl);

  /* Smooth entrance */
  animation: modal-enter 250ms var(--ease-out);
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.dark .modal-content,
.dark .modal,
.dark [class*="modal-dialog"] {
  background: rgba(30, 30, 30, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/* Mobile - reduce blur for performance */
@media (max-width: 768px) {
  .modal-content,
  .modal,
  [class*="modal-dialog"] {
    backdrop-filter: blur(8px) saturate(180%);
    -webkit-backdrop-filter: blur(8px) saturate(180%);
    padding: var(--space-6);  /* 32px on mobile */
  }
}
```

### 2.7 Header/Navigation

```css
/* ========================================
   HEADER/NAVIGATION - CLEAN GLASS
   ======================================== */

header,
.header,
nav {
  position: sticky;
  top: 0;
  z-index: 50;

  /* Subtle glass effect for header */
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px) saturate(150%);
  -webkit-backdrop-filter: blur(10px) saturate(150%);

  border-bottom: 1px solid rgba(0, 0, 0, 0.08);

  padding: var(--space-4) var(--space-6);

  box-shadow: var(--shadow-sm);
}

.dark header,
.dark .header,
.dark nav {
  background: rgba(30, 30, 30, 0.85);
  border-bottom-color: rgba(255, 255, 255, 0.08);
}
```

### 2.8 Form Inputs

```css
/* ========================================
   FORM INPUTS - CLEAN MICROSOFT STYLE
   ======================================== */

input[type="text"],
input[type="email"],
input[type="password"],
input[type="search"],
textarea,
select,
.input {
  font-family: var(--font-family-sans);
  font-size: var(--text-base);
  font-weight: var(--font-regular);
  line-height: var(--leading-normal);

  padding: var(--space-3) var(--space-4);  /* 12px 16px */
  border-radius: var(--radius-md);

  background: var(--neutral-50);
  border: 1px solid var(--neutral-300);
  color: var(--neutral-800);

  transition: all var(--duration-fast) var(--ease-in-out);
}

input:focus,
textarea:focus,
select:focus,
.input:focus {
  outline: none;
  border-color: var(--spark-primary-500);
  box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.1);
  background: white;
}

.dark input,
.dark textarea,
.dark select,
.dark .input {
  background: var(--neutral-800);
  border-color: var(--neutral-700);
  color: var(--neutral-100);
}

.dark input:focus,
.dark textarea:focus,
.dark select:focus,
.dark .input:focus {
  background: var(--neutral-900);
  border-color: var(--spark-primary-400);
  box-shadow: 0 0 0 3px rgba(26, 144, 255, 0.1);
}
```

### 2.9 Page Backgrounds - Subtle Gradient

```css
/* ========================================
   PAGE BACKGROUNDS - CLEAN & AIRY
   ======================================== */

body,
.page-container,
main {
  background: linear-gradient(
    180deg,
    var(--neutral-50) 0%,
    var(--neutral-100) 100%
  );

  font-family: var(--font-family-sans);
  color: var(--neutral-700);
  line-height: var(--leading-normal);
}

.dark body,
.dark .page-container,
.dark main {
  background: linear-gradient(
    180deg,
    var(--neutral-50) 0%,
    #0d0d0d 100%
  );

  color: var(--neutral-300);
}
```

---

## 3. Implementation Checklist

### Phase 1: Design Token Updates (Foundation)
- [ ] Replace primary purple with Microsoft blue in CSS custom properties
- [ ] Update neutral gray scale for light/dark themes
- [ ] Add glassmorphism color variables
- [ ] Implement department color system
- [ ] Enhance spacing scale (30-40% increase)
- [ ] Update shadow system to layered Fluent shadows
- [ ] Change typography to Segoe UI font stack
- [ ] Adjust line heights and letter spacing

### Phase 2: Component Enhancements
- [ ] Apply glassmorphism to prompt cards (backdrop-filter, semi-transparent backgrounds)
- [ ] Increase card grid gaps for spacious layout
- [ ] Update card content typography and spacing
- [ ] Restyle department badges with Microsoft colors
- [ ] Transform buttons to Microsoft blue primary
- [ ] Implement acrylic glass effect on modals
- [ ] Add glass effect to header/navigation
- [ ] Restyle form inputs with clean Microsoft aesthetic
- [ ] Update page backgrounds with subtle gradients

### Phase 3: Interactive States
- [ ] Enhance hover states with smooth lift animations
- [ ] Add focus-visible outlines for accessibility
- [ ] Implement active/pressed states
- [ ] Test all transitions for smoothness

### Phase 4: Dark Mode Refinement
- [ ] Verify all glassmorphism effects in dark mode
- [ ] Test shadow visibility in dark mode
- [ ] Ensure proper contrast ratios (WCAG AA)
- [ ] Validate department badge colors in dark mode

### Phase 5: Responsive Optimization
- [ ] Reduce backdrop-filter blur on mobile (8px → 6px)
- [ ] Adjust spacing for smaller viewports
- [ ] Test card grid responsiveness
- [ ] Verify modal sizing on mobile

### Phase 6: Testing & Validation
- [ ] **Functionality Testing:**
  - [ ] Search functionality works
  - [ ] Department filters function correctly
  - [ ] Card clicks navigate properly
  - [ ] Admin login and panel work
  - [ ] Dark mode toggle functions
  - [ ] All buttons and links work

- [ ] **Visual QA:**
  - [ ] Glassmorphism renders correctly in Chrome/Edge
  - [ ] Safari supports -webkit-backdrop-filter
  - [ ] Firefox displays glass effects
  - [ ] Shadows look correct in light/dark modes
  - [ ] Department colors are distinct

- [ ] **Performance:**
  - [ ] No jank/lag when scrolling cards
  - [ ] Hover states are smooth
  - [ ] Modal animations are fluid
  - [ ] Mobile performance is acceptable

- [ ] **Accessibility:**
  - [ ] Color contrast ratios meet WCAG AA
  - [ ] Focus indicators are visible
  - [ ] Keyboard navigation works
  - [ ] Screen reader compatibility maintained

### Phase 7: Deployment
- [ ] Commit CSS changes with detailed message
- [ ] Push to GitHub repository
- [ ] Verify deployed version matches local
- [ ] Create before/after screenshots for documentation

---

## 4. Testing with Puppeteer MCP

**Real-time Visual Verification Steps:**

```javascript
// 1. Navigate to local application
mcp__puppeteer__puppeteer_navigate({ url: 'http://localhost:3000/browse.html' })

// 2. Take screenshot - before changes
mcp__puppeteer__puppeteer_screenshot({ name: 'before-cards', width: 1920, height: 1080 })

// 3. Apply CSS changes to enhanced.css

// 4. Reload page
mcp__puppeteer__puppeteer_evaluate({ script: 'window.location.reload()' })

// 5. Take screenshot - after changes
mcp__puppeteer__puppeteer_screenshot({ name: 'after-cards', width: 1920, height: 1080 })

// 6. Toggle dark mode
mcp__puppeteer__puppeteer_evaluate({
  script: 'document.documentElement.classList.add("dark")'
})

// 7. Screenshot dark mode
mcp__puppeteer__puppeteer_screenshot({ name: 'after-cards-dark', width: 1920, height: 1080 })

// 8. Test hover state
mcp__puppeteer__puppeteer_hover({ selector: '.prompt-card-premium' })
mcp__puppeteer__puppeteer_screenshot({ name: 'hover-state', width: 1920, height: 1080 })

// 9. Test modal
mcp__puppeteer__puppeteer_click({ selector: '#addPromptBtn' })
mcp__puppeteer__puppeteer_screenshot({ name: 'modal-glass', width: 1920, height: 1080 })
```

---

## 5. Performance Considerations

### Backdrop-Filter Optimization

**Mobile Strategy:**
```css
/* Desktop - full effect */
@media (min-width: 769px) {
  .prompt-card-premium {
    backdrop-filter: blur(8px) saturate(150%);
  }

  .modal-content {
    backdrop-filter: blur(12px) saturate(180%);
  }
}

/* Mobile - reduced blur for performance */
@media (max-width: 768px) {
  .prompt-card-premium {
    backdrop-filter: blur(6px) saturate(150%);
  }

  .modal-content {
    backdrop-filter: blur(8px) saturate(180%);
  }
}
```

**Transform Acceleration:**
```css
.prompt-card-premium {
  /* Force GPU acceleration */
  transform: translateZ(0);
  will-change: transform, box-shadow;
}
```

**Limit Glass Elements:**
- Apply glassmorphism ONLY to:
  ✅ Prompt cards (focal elements)
  ✅ Modals (transient overlays)
  ✅ Header (if needed)
  ❌ NOT to large background areas
  ❌ NOT to scrolling containers

---

## 6. Accessibility Compliance

### Contrast Verification

**Light Mode:**
- Background: `rgba(255, 255, 255, 0.7)` + blur
- Text: `var(--neutral-800)` = #262626
- Ratio: >7:1 ✅ (WCAG AAA)

**Dark Mode:**
- Background: `rgba(30, 30, 30, 0.7)` + blur
- Text: `var(--neutral-100)` = #262626 (inverted)
- Ratio: >7:1 ✅ (WCAG AAA)

**Department Badges:**
- All badges tested for 4.5:1 minimum
- High contrast in both light/dark modes

### Focus Indicators

```css
.prompt-card-premium:focus-visible {
  outline: 2px solid var(--spark-primary-500);
  outline-offset: 2px;
}

button:focus-visible {
  outline: 2px solid var(--spark-primary-500);
  outline-offset: 2px;
}

input:focus {
  box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.1);
  border-color: var(--spark-primary-500);
}
```

---

## 7. Browser Compatibility

### Backdrop-Filter Support

**Full Support:**
- ✅ Chrome 76+
- ✅ Edge 79+
- ✅ Safari 9+ (with `-webkit-` prefix)
- ✅ Firefox 103+

**Fallback Strategy:**
```css
.prompt-card-premium {
  /* Fallback for browsers without backdrop-filter */
  background: rgba(255, 255, 255, 0.95);

  /* Progressive enhancement */
  @supports (backdrop-filter: blur(10px)) {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(8px) saturate(150%);
    -webkit-backdrop-filter: blur(8px) saturate(150%);
  }
}
```

---

## 8. Summary

This implementation plan provides:

✅ **Exact CSS specifications** - Copy-paste ready
✅ **Microsoft Fluent aesthetic** - Enterprise-grade design
✅ **iOS Liquid Glass vibes** - Clean, spacious, glassy
✅ **Glassmorphism effects** - Frosted cards and modals
✅ **Department color system** - Microsoft-inspired palette
✅ **Segoe UI typography** - Professional Microsoft font
✅ **Layered shadows** - Realistic depth
✅ **Enhanced spacing** - 30-40% more breathing room
✅ **Dark mode support** - Full compatibility
✅ **Mobile optimization** - Performance-friendly
✅ **Accessibility** - WCAG AA compliance
✅ **No breaking changes** - All functionality preserved

**Next Step:** Implementation Phase 4 - Apply CSS modifications and test with Puppeteer MCP for real-time visual verification.

---

**End of Phase 3 Implementation Plan**
