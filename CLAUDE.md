# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SPARK AI Prompt Library - A comprehensive, self-hosted React application for managing and browsing 2,376+ professional AI prompts across 9 business departments. The project uses Microsoft Fluent UI components with a modern glass morphism design system.

## Architecture

### Frontend (React + Fluent UI)
- **Framework**: React 18 with React Router DOM for navigation
- **UI Library**: Microsoft Fluent UI (@fluentui/react-components v9.54.0)
- **Styling**: Custom glass morphism theme system in `src/ui/themeGlass.js` + Tailwind CSS
- **Build Tool**: Vite 5.0
- **Entry Point**: `src/main.jsx` wraps app in FluentProvider with theme support

### Backend (Express API)
- **Server**: Express.js (v5.1.0) on port 3001
- **Database**: JSON file-based (`public/prompts_index.json`)
- **Authentication**: Session-based token system for admin routes
- **API File**: `server/api.js`

### Build System
- **Index Builder**: `scripts/build-index.mjs` processes HTML files from source folders
- **Source**: Reads from `/home/aiwithnick/AI Prompts v5_BACKUP`
- **Output**: Generates `public/prompts_index.json`, copies HTML files to `public/prompts/`, and thumbnails to `public/thumbnails/`

### Key Routes
- `/` - Homepage with department cards
- `/browse` - Browse all prompts with filtering/search
- `/view?id=<prompt_id>` - Individual prompt viewer
- `/favorites` - User's saved prompts (localStorage)
- `/admin-login` - Admin authentication
- `/admin` - Admin dashboard (requires auth)

## Development Commands

### Local Development
```bash
# Install dependencies
npm install

# Start frontend dev server (port 3000)
npm run dev

# Start API server (port 3001)
npm run api

# Start both frontend and API together
npm start

# Build for production
npm run build

# Rebuild index from source files + build production
npm run dev:rebuild
```

### Docker Deployment
```bash
# Start both containers (frontend on :3000, API on :3001)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild containers from scratch
docker-compose build --no-cache
docker-compose up -d
```

### Build System
```bash
# Rebuild prompts index from source HTML files
node scripts/build-index.mjs

# This scans 9 department folders, parses HTML with Cheerio,
# extracts metadata, copies files, and generates the master JSON index
```

## Critical Files & Data Flow

### Data Index (`public/prompts_index.json`)
- **Structure**: `{ meta: {...}, departments: [...], prompts: [...] }`
- **Each Prompt**: Contains id, title, department, subcategory, description, content, date, icon, tips, images, tags, word_count, complexity
- **Backups**: Auto-created in `backups/` before edits/deletes
- **Size**: ~9MB with 2,376+ prompts

### API Endpoints
**Public (No Auth):**
- `GET /api/prompts` - Fetch all prompts
- `POST /api/prompts` - Create new prompt (accepts image upload)
- `POST /api/prompts/bulk` - Bulk import prompts

**Admin (Requires Auth Token):**
- `POST /api/admin/login` - Returns auth token
- `POST /api/admin/logout` - Invalidates token
- `PUT /api/prompts/:id` - Update prompt (auto-backups before edit)
- `DELETE /api/prompts/:id` - Delete prompt (auto-backups before delete)
- `POST /api/prompts/bulk-delete` - Bulk delete
- `GET /api/admin/backups` - List all backups
- `POST /api/admin/backup` - Manual backup
- `GET /api/admin/validate` - Data quality checks

### Authentication Flow
1. Admin password stored in `.env` as `ADMIN_PASSWORD` (default: admin123)
2. Login endpoint validates password and returns token
3. Token stored in-memory in `validTokens` Set
4. Admin routes check for `Authorization: Bearer <token>` header
5. Invalid/missing token returns 401

### Theme System
- Fluent UI themes: `webLightTheme` / `webDarkTheme` from `@fluentui/react-components`
- Custom glass morphism effects in `src/ui/themeGlass.js`
- Theme preference persisted in localStorage
- `isDark` prop passed to all page components

## Component Structure

### Key Components
- `src/App.jsx` - Main router, theme management, applies dark class to html
- `src/components/Header.jsx` - Navigation bar with theme toggle
- `src/components/HomePage.jsx` - Landing page with department cards
- `src/components/BrowsePage.jsx` - Main browse interface with filters, search, pagination
- `src/components/ViewPage.jsx` - Individual prompt viewer
- `src/components/FavoritesPage.jsx` - User's saved prompts (localStorage)
- `src/components/AdminLoginPage.jsx` - Admin login form
- `src/components/AdminDashboardPage.jsx` - Admin CRUD operations
- `src/components/AddPromptModal.jsx` - New prompt submission modal

### State Management
- No global state library (Redux, Zustand, etc.)
- Local component state with React hooks
- URL search params for filters/search (`useSearchParams`)
- localStorage for favorites and theme preference
- API token stored in component state after login

## Important Conventions

### Prompt ID Generation
- IDs are MD5 hashes of the file path for existing prompts
- New prompts get `prompt_${timestamp}_${random}` format
- IDs used for routing (`/view?id=<id>`), lookups, and file naming

### Backup System
- **Automatic**: Before every edit/delete operation
- **Manual**: Via admin dashboard
- **Retention**: Configurable via `MAX_BACKUPS` env var (default: 100)
- **Format**: `prompts_backup_YYYYMMDD_HHMMSS_<reason>.json`
- **Location**: `backups/` directory (mounted volume in Docker)

### Department Configuration
Defined in both `scripts/build-index.mjs` and `server/api.js`:
- Business (💼), Marketing (📢), Sales (💰), SEO (🔍), Finance (💵)
- Education (📚), Writing (✍️), Productivity (⚡), Solopreneurs (🚀)

### Image Handling
- **Format**: PNG only
- **Upload**: Multer middleware in API
- **Storage**: `public/thumbnails/`
- **Naming**: `${promptId}_${filename}.png` or `prompt_${timestamp}_${random}.png`
- **Display**: Referenced via `images` array in prompt object

## Testing & Quality

### Browser Testing
- Playwright tests defined in `@playwright/test` dependency
- No config file present yet (would be `playwright.config.js`)
- Manual testing via browser at localhost:3000

### Data Validation
- Admin endpoint: `GET /api/admin/validate`
- Checks: duplicate titles, missing descriptions/tags/content, malformed entries, empty fields
- Returns summary with counts and detailed issue arrays

## Common Development Tasks

### Adding a New Prompt Page
1. Create component in `src/components/`
2. Import Fluent UI components from `@fluentui/react-components`
3. Use `makeStyles` for styling with glass morphism from `src/ui/themeGlass.js`
4. Accept `isDark` and `toggleTheme` props
5. Add route in `src/App.jsx`
6. Add navigation link in `Header.jsx`

### Modifying the Build Script
- Edit `scripts/build-index.mjs`
- Update source path (`SOURCE_ROOT`) or department configurations
- Modify parsing logic (Cheerio selectors) for HTML extraction
- Run `node scripts/build-index.mjs` to test
- Check output in `public/prompts_index.json`

### Changing Authentication
- Update `ADMIN_PASSWORD` in `.env` file
- Restart containers: `docker-compose down && docker-compose up -d`
- Note: `docker-compose restart` won't reload env vars
- Token system in `server/api.js` using in-memory Set

### Adding API Endpoints
- Edit `server/api.js`
- Use `requireAuth` middleware for protected routes
- Call `createBackup('reason')` before destructive operations
- Update CORS settings if needed (currently allows all origins)

### Styling Guidelines
- Use Fluent UI components first (Button, Card, Input, etc.)
- Apply glass morphism via `glass.card`, `glass.cardDark` from `src/ui/themeGlass.js`
- Use `makeStyles` from Fluent UI, not styled-components
- Use `tokens` from Fluent UI for colors (e.g., `tokens.colorBrandForeground1`)
- Support both light and dark themes in all components

## Troubleshooting

### Prompts Not Loading
1. Check `public/prompts_index.json` exists and is valid JSON
2. Verify file size (~9MB expected)
3. Check console for fetch errors
4. Try backup endpoint: `/prompts_index_backup.json`

### Admin Login Fails
1. Verify `ADMIN_PASSWORD` in `.env` file
2. Check server logs for "Failed login attempt"
3. Ensure API server is running on port 3001
4. Check browser network tab for 401 responses

### Build Issues
1. Delete `node_modules` and run `npm install`
2. Clear build cache: `rm -rf dist/`
3. Check Node version (requires modern Node for ES modules)
4. Verify source path exists: `/home/aiwithnick/AI Prompts v5_BACKUP`

### Docker Issues
1. Check Docker daemon is running: `docker info`
2. View container logs: `docker-compose logs`
3. Ensure ports 3000/3001 are available
4. Rebuild from scratch: `docker-compose down && docker system prune -a`

## Environment Variables

Required in `.env` file:
```env
ADMIN_PASSWORD=YourSecurePasswordHere  # Change from default!
NODE_ENV=production
PORT=3001
BACKUP_RETENTION_DAYS=30
MAX_BACKUPS=100
```

## Port Configuration

- **Frontend Dev**: 3000 (Vite dev server)
- **Frontend Prod**: 80 (Nginx in Docker, mapped to host :3000)
- **API Server**: 3001 (Express, same in dev and prod)

## Key Dependencies

- `@fluentui/react-components` - Microsoft's React UI library
- `@fluentui/react-icons` - Icon set for Fluent UI
- `react-router-dom` - Client-side routing
- `vite` - Build tool and dev server
- `express` - API server
- `cheerio` - HTML parsing for build script
- `multer` - File upload handling
- `sharp` - Image processing (installed but not actively used)

## Design Philosophy

- **Zero Wasted Space**: Efficient layouts, no excessive padding
- **Accessibility First**: WCAG 2.1 AA compliance goals
- **Progressive Disclosure**: Simple by default, powerful features available
- **Mobile-First Responsive**: Works on all screen sizes
- **Glass Morphism**: Modern translucent UI effects for depth

## Notes for Future Development

- Consider adding Playwright test suite with config
- Service worker for offline support mentioned in ARCHITECTURE.md but not implemented
- Advanced search with RegEx mentioned in roadmap
- Multi-user support would require database migration from JSON
- Prompt versioning/history not yet implemented
- Analytics dashboard planned but not built
