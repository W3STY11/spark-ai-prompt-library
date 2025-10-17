# AI Prompt Library Version 3 - Architecture Document

## Vision
Create the absolute best, clean, high-end professional prompt library that beginners and people looking to adopt AI will love.

## Design Philosophy (2025 Best Practices)

### Core Principles
1. **Zero Wasted Space** - Every pixel serves a purpose
2. **Accessibility First** - WCAG 2.1 AA compliance
3. **Progressive Disclosure** - Simple at first, powerful when needed
4. **Mobile-First Responsive** - Beautiful on all devices
5. **Bold Minimalism** - Clean, focused, professional

### Visual Design
- **Color System**: Vibrant yet professional (primary: #6366f1)
- **Typography**: Inter font family (2025 standard for SaaS)
- **Spacing**: Research-based optimal spacing (no excessive padding)
- **Shadows**: Professional depth system
- **Dark Mode**: Built-in toggle (2025 necessity)

## Technology Stack

### Core
- **Vite 5.0** - Lightning-fast dev server and build tool
- **Vanilla JavaScript** - No framework overhead, pure performance
- **Tailwind CSS** - Utility-first CSS for maximum flexibility
- **HTML5** - Semantic markup for accessibility

### Build Pipeline
- **Node.js** - Build script execution
- **Cheerio** - HTML parsing for prompt extraction
- **Sharp** - Image optimization and thumbnail generation

## Information Architecture

### Pages
1. **Homepage** (`/`)
   - Hero section with stats
   - 9 department cards
   - Search bar
   - Feature highlights

2. **Browse** (`/browse`)
   - Filter by department
   - Search functionality
   - Sort options (newest, popular, alphabetical)
   - Pagination
   - Grid view of prompt cards

3. **Viewer** (`/view`)
   - Optimized prompt display (zero wasted space)
   - Copy to clipboard
   - Edit mode
   - Next/Previous navigation
   - Favorites toggle
   - Tags
   - AI Assistant panel

4. **Favorites** (`/favorites`)
   - Saved prompts
   - Local storage persistence

## Data Structure

### Prompt Object
```json
{
  "id": "unique-hash",
  "title": "Prompt Title",
  "department": "Business",
  "subcategory": "Analytics & Research",
  "description": "Brief description",
  "content": "Full prompt text",
  "date": "2024-01-15",
  "icon": "📊",
  "tips": "Usage tips",
  "example_input": "Example input",
  "example_output": "Example output",
  "images": ["thumb1.png", "thumb2.png"],
  "tags": ["analysis", "research", "data"],
  "word_count": 450,
  "complexity": "intermediate"
}
```

### Index Structure
```json
{
  "meta": {
    "total_prompts": 2445,
    "departments": 9,
    "last_updated": "2025-01-15",
    "version": "3.0.0"
  },
  "departments": [
    {
      "name": "Business",
      "icon": "💼",
      "count": 332,
      "description": "Business strategy and operations prompts"
    }
  ],
  "prompts": [...]
}
```

## Features

### Core Features (MVP)
- [x] Browse by department
- [x] Search functionality
- [x] Prompt viewer
- [x] Copy to clipboard
- [x] Responsive design
- [x] Professional UI

### Enhanced Features (Version 3)
- [ ] Dark mode toggle
- [ ] Favorites/bookmarks (localStorage)
- [ ] Tag-based filtering
- [ ] Advanced search (fuzzy matching)
- [ ] Sort options
- [ ] Keyboard shortcuts
- [ ] Print-friendly view
- [ ] Share prompt (URL with params)
- [ ] Recent prompts history
- [ ] Prompt complexity indicator

### AI Features (Optional)
- [ ] AI Assistant panel
- [ ] Prompt suggestions
- [ ] Related prompts
- [ ] Smart search

## UI Components

### Reusable Components
1. **PromptCard** - Grid item showing prompt preview
2. **SearchBar** - Global search with autocomplete
3. **FilterPanel** - Department/tag/sort filters
4. **PromptViewer** - Full prompt display
5. **Navigation** - Sticky header with nav
6. **Footer** - Credits and links
7. **DarkModeToggle** - Theme switcher
8. **CopyButton** - Copy with confirmation
9. **FavoriteButton** - Toggle favorite state
10. **TagBadge** - Category/tag display

## Build Process

### Input
- 9 folders with HTML files exported from Notion
- Each HTML file contains full prompt with images
- ~2445 total prompts

### Build Steps
1. Scan all 9 department folders
2. Parse each HTML file with Cheerio
3. Extract: title, description, content, subcategory, tips, examples
4. Copy images to `/public/thumbnails/`
5. Generate unique ID hash for each prompt
6. Build master index JSON
7. Generate department stats
8. Copy HTML files to `/public/prompts/`
9. Output: `prompts_index.json`

### Performance Optimizations
- Lazy load images
- Paginate results (50 per page)
- Minify CSS/JS
- Compress images (Sharp)
- Cache index in localStorage

## Responsive Breakpoints
- Mobile: 0-640px
- Tablet: 641-1024px
- Desktop: 1025px+

## Accessibility
- Semantic HTML5
- ARIA labels
- Keyboard navigation
- Focus indicators
- Color contrast 4.5:1+
- Screen reader support

## Color System

### Light Mode
```css
--primary: #6366f1;
--primary-hover: #5558e3;
--success: #10b981;
--bg-primary: #f8f9fa;
--bg-secondary: #f1f3f5;
--bg-elevated: #ffffff;
--text-primary: #0f172a;
--text-secondary: #64748b;
--border: #e2e8f0;
```

### Dark Mode
```css
--primary: #818cf8;
--primary-hover: #a5b4fc;
--success: #34d399;
--bg-primary: #0f172a;
--bg-secondary: #1e293b;
--bg-elevated: #334155;
--text-primary: #f8fafc;
--text-secondary: #cbd5e1;
--border: #475569;
```

## File Structure
```
prompt-library-site-v3/
├── public/
│   ├── prompts/           # Copied HTML files
│   ├── thumbnails/        # Optimized images
│   └── prompts_index.json # Master index
├── src/
│   ├── index.html         # Homepage
│   ├── browse.html        # Browse page
│   ├── view.html          # Viewer page
│   ├── favorites.html     # Favorites page
│   ├── css/
│   │   ├── main.css       # Global styles
│   │   ├── home.css       # Homepage styles
│   │   ├── browse.css     # Browse styles
│   │   └── view.css       # Viewer styles
│   └── js/
│       ├── main.js        # Global utilities
│       ├── home.js        # Homepage logic
│       ├── browse.js      # Browse logic
│       ├── view.js        # Viewer logic
│       └── favorites.js   # Favorites logic
├── scripts/
│   └── build-index.mjs    # Build script
├── package.json
├── vite.config.js
├── tailwind.config.js
└── ARCHITECTURE.md        # This file
```

## Key Improvements Over Version 2

1. **Spacing**: Zero wasted space from the start (learned from V2 feedback)
2. **Dark Mode**: Built-in toggle (2025 necessity)
3. **Favorites**: User can save prompts
4. **Tags**: Better organization beyond departments
5. **Advanced Search**: Fuzzy matching, filters
6. **Keyboard Shortcuts**: Power user features
7. **Mobile-First**: Better responsive design
8. **Performance**: Faster loading, lazy images
9. **Accessibility**: WCAG 2.1 AA compliance
10. **Modern Stack**: Tailwind CSS for flexibility

## Success Metrics

### User Experience
- Prompt visible within 1 second of page load
- < 3 clicks to find any prompt
- 100% of prompts accessible
- Mobile score 90+ on Lighthouse

### Technical
- Page load < 2 seconds
- Lighthouse score 95+
- Zero console errors
- Works offline (service worker)

## Timeline

1. **Setup** (30 min) - Initialize project, install dependencies
2. **Build Script** (1 hour) - Enhanced parsing, image optimization
3. **Homepage** (1.5 hours) - Hero, departments, search
4. **Browse** (1.5 hours) - Filtering, sorting, pagination
5. **Viewer** (2 hours) - Optimal layout, features
6. **Favorites** (1 hour) - localStorage integration
7. **Dark Mode** (1 hour) - Theme toggle, CSS variables
8. **Testing** (1 hour) - All features, all prompts
9. **Polish** (30 min) - Final touches, optimization

**Total: ~10 hours**

## Next Steps

1. Initialize Version 3 project structure
2. Configure Vite + Tailwind
3. Create enhanced build script
4. Build pages incrementally
5. Test with all 2445 prompts
6. Launch Version 3
