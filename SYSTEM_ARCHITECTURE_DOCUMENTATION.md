# 📚 SPARK PROMPT LIBRARY - COMPLETE SYSTEM ARCHITECTURE DOCUMENTATION

**Version:** 3.0.0
**Last Updated:** October 2025
**Purpose:** Complete technical onboarding documentation for developers

---

## 📂 **1. COMPLETE FILE STRUCTURE & PURPOSE**

### **Root Directory Files**
```
/spark-prompt-library/
├── .dockerignore             # Docker build exclusions (node_modules, .git, etc.)
├── .env                      # Environment variables (ADMIN_PASSWORD, etc.) - NOT in repo
├── .env.example              # Template for .env file (default password config)
├── .gitignore               # Git exclusions (.env, node_modules, etc.)
├── docker-compose.yml        # Container orchestration (frontend + API services)
├── Dockerfile.api           # API container build instructions
├── Dockerfile.frontend      # Frontend container build instructions
├── package.json             # Node.js dependencies and scripts
├── package-lock.json        # Dependency lock file
├── postcss.config.js        # PostCSS configuration for Tailwind
├── tailwind.config.js       # Tailwind CSS configuration
├── vite.config.js           # Vite bundler configuration
└── START.sh                 # Quick start script for Unix systems
```

### **Source Code Structure**
```
/src/
├── css/
│   └── main.css             # Tailwind directives and custom styles
├── js/
│   ├── main.js              # ⚡ CRITICAL: Global utilities, prompts loader
│   ├── admin.js             # ⚡ CRITICAL: Admin dashboard logic
│   ├── browse.js            # Browse library functionality
│   ├── view.js              # Individual prompt view logic
│   ├── favorites.js         # Favorites management
│   └── home.js              # Homepage logic
└── HTML Pages:
    ├── index.html           # Homepage
    ├── browse.html          # Browse library (public)
    ├── admin.html           # Admin dashboard
    ├── admin-login.html     # Admin authentication
    ├── view.html            # Single prompt view
    └── favorites.html       # User favorites page
```

### **Backend Structure**
```
/server/
└── api.js                   # ⚡ CRITICAL: Express.js API server
```

### **Public Assets & Database**
```
/public/
├── prompts_index.json       # ⚡ CRITICAL: Main database (9.2MB, 2376 prompts)
├── sample-bulk-import.json  # Example bulk import format
├── prompts/                 # HTML files from Notion export (2376 files)
│   ├── [id].html           # Individual prompt HTML pages
│   └── ...
├── images/                  # Prompt screenshots and images
└── thumbnails/             # Uploaded prompt thumbnails
```

### **Backup System**
```
/backups/
├── prompts_backup_YYYYMMDD_HHMMSS_edit.json     # Auto-backup before edits
├── prompts_backup_YYYYMMDD_HHMMSS_delete.json   # Auto-backup before deletes
├── prompts_backup_YYYYMMDD_HHMMSS_manual.json   # Manual backups
└── ...                                          # Max 100 backups (configurable)
```

---

## 🔄 **2. DATA FLOW ARCHITECTURE**

### **Critical Sync Issue (FIXED)**

#### **THE BUG:**
```javascript
// ❌ OLD - Frontend loaded from static cached file
const response = await fetch('/prompts_index.json');
```

#### **THE FIX:**
```javascript
// ✅ NEW - Frontend loads from API for real-time updates
const response = await fetch('http://localhost:3001/api/prompts');
```

### **Complete Data Flow Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    FRONTEND (Port 3000)                   │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────────┐  │  │
│  │  │ Browse  │ │  Admin  │ │  View   │ │ Add Prompt   │  │  │
│  │  │  Page   │ │Dashboard│ │  Page   │ │    Form      │  │  │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └──────┬───────┘  │  │
│  │       │           │           │              │           │  │
│  │       └───────────┴───────────┴──────────────┘           │  │
│  │                           │                               │  │
│  │                    main.js / admin.js                     │  │
│  │                           │                               │  │
│  └───────────────────────────┼───────────────────────────────┘  │
│                              │                                   │
│                    HTTP Requests (CORS enabled)                  │
│                              ↓                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────┐
│                    API SERVER (Port 3001)                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                     Express.js Routes                       │ │
│  │                                                             │ │
│  │  PUBLIC (No Auth):           ADMIN (Auth Required):        │ │
│  │  • GET  /api/prompts         • PUT    /api/prompts/:id     │ │
│  │  • POST /api/prompts         • DELETE /api/prompts/:id     │ │
│  │  • POST /api/prompts/bulk    • POST   /api/prompts/bulk-delete│
│  │  • GET  /api/health          • POST   /api/admin/backup    │ │
│  │                              • GET    /api/admin/validate  │ │
│  │                              • POST   /api/admin/login     │ │
│  └──────────────┬──────────────────────────┬──────────────────┘ │
│                  │                          │                     │
│          Read/Write                   Auto-Backup                 │
│                  │                          │                     │
│                  ↓                          ↓                     │
│  ┌───────────────────────────┐  ┌───────────────────────────┐   │
│  │   prompts_index.json      │  │      /backups/*.json      │   │
│  │   (Main Database)         │  │   (Timestamped Backups)   │   │
│  └───────────────────────────┘  └───────────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
```

### **Request Flow Examples**

#### **Adding a New Prompt:**
```
1. User fills form on browse.html
2. JavaScript calls POST /api/prompts
3. API validates data
4. API assigns unique ID (prompt_timestamp_random)
5. API adds to prompts_index.json
6. API returns success
7. Frontend reloads from API
8. New prompt appears immediately
```

#### **Admin Edit Flow:**
```
1. Admin clicks Edit in dashboard
2. JavaScript calls PUT /api/prompts/:id with auth token
3. API validates token
4. API creates auto-backup (prompts_backup_YYYYMMDD_HHMMSS_edit.json)
5. API updates prompt in prompts_index.json
6. API cleans old backups (keeps last 100)
7. Frontend reloads from API
8. Changes appear in real-time
```

---

## 🛠️ **3. COMPLETE TECH STACK ANALYSIS**

### **Frontend Technologies**

| Technology | Version | Purpose | Configuration File |
|------------|---------|---------|-------------------|
| **Vite** | 5.0.0 | Dev server & bundler | `vite.config.js` |
| **Tailwind CSS** | 3.4.0 | Utility-first styling | `tailwind.config.js` |
| **PostCSS** | 8.4.32 | CSS processing | `postcss.config.js` |
| **Vanilla JS** | ES6+ | No framework overhead | `/src/js/*.js` |
| **HTML5** | - | Semantic markup | `/src/*.html` |

### **Backend Technologies**

| Technology | Version | Purpose | Location |
|------------|---------|---------|----------|
| **Node.js** | 22 | JavaScript runtime | Docker base image |
| **Express.js** | 5.1.0 | Web framework | `server/api.js` |
| **CORS** | 2.8.5 | Cross-origin requests | Line 17 `api.js` |
| **Multer** | 2.0.2 | File uploads | Lines 255-276 `api.js` |
| **dotenv** | 17.2.3 | Environment vars | Line 1 `api.js` |
| **fs/promises** | Native | Async file operations | Throughout `api.js` |
| **crypto** | Native | Token generation | Lines 28-30 `api.js` |

### **Database Structure**

```json
{
  "meta": {
    "version": "3.0.0",
    "last_updated": "2025-10-15T17:15:02.683Z",
    "total_prompts": 2376,
    "departments": 9
  },
  "departments": [
    {
      "name": "Business",
      "icon": "💼",
      "description": "332 professional business prompts",
      "prompt_count": 332
    }
  ],
  "prompts": [
    {
      "id": "prompt_1234567890_abc123xyz",
      "title": "Strategic Business Plan Generator",
      "description": "Create comprehensive business plans",
      "content": "You are a business strategist...",
      "department": "Business",
      "subcategory": "Strategy",
      "icon": "💼",
      "complexity": "intermediate",
      "tags": ["strategy", "planning", "business"],
      "date": "2025-10-15",
      "word_count": 245,
      "images": [],
      "tips": ["Use specific industry details", "Include metrics"]
    }
  ]
}
```

### **Docker Architecture**

```yaml
# Container 1: API Server
api:
  Image: node:22-alpine
  Port: 3001
  Volumes:
    - ./public:/app/public     # Database access
    - ./backups:/app/backups    # Backup storage
    - ./.env:/app/.env         # Config (FIXED: was missing)

# Container 2: Frontend
frontend:
  Image: node:22-alpine
  Port: 3000
  Depends on: api
  Build: Vite production build
```

---

## 🎯 **4. FEATURE-TO-CODE MAPPING**

### **Browse Library (Public)**
| Feature | Files | Key Functions | API Endpoint |
|---------|-------|---------------|--------------|
| Load prompts | `browse.js:9-17` | `loadPromptsIndex()` | GET `/api/prompts` |
| Search | `browse.js:114-130` | `applyFilters()` | Client-side |
| Filter by dept | `browse.js:45-52` | `populateDepartmentFilter()` | Client-side |
| Sort | `browse.js:133-142` | Sort in `applyFilters()` | Client-side |
| Pagination | `browse.js:275-339` | `renderPagination()` | Client-side |
| Add prompt | `browse.js:362-500` | `handleAddPromptSubmit()` | POST `/api/prompts` |
| Bulk import | `browse.js:556-890` | `handleBulkImport()` | POST `/api/prompts/bulk` |

### **Admin Dashboard (Secure)**
| Feature | Files | Key Functions | API Endpoint |
|---------|-------|---------------|--------------|
| Authentication | `admin.js:26-38` | `checkAuth()` | POST `/api/admin/login` |
| Load prompts | `admin.js:49-66` | `loadPrompts()` | GET `/api/prompts` |
| Edit prompt | `admin.js:331-368` | `saveEdit()` | PUT `/api/prompts/:id` |
| Delete prompt | `admin.js:387-412` | `confirmDelete()` | DELETE `/api/prompts/:id` |
| Bulk delete | `admin.js:415-450` | `bulkDelete()` | POST `/api/prompts/bulk-delete` |
| Manual backup | `admin.js:504-522` | `manualBackup()` | POST `/api/admin/backup` |
| Data validation | `admin.js:525-543` | `runValidation()` | GET `/api/admin/validate` |
| Export | `admin.js:476-487` | `downloadJSON()` | Client-side |

### **Authentication Flow**
```javascript
// 1. Login (admin-login.html → api.js:44-61)
POST /api/admin/login
Body: { password: "YourPassword" }
Response: { token: "randomhex64chars" }

// 2. Store token (admin.js:28)
sessionStorage.setItem('adminToken', token)

// 3. Verify on requests (api.js:33-41)
Authorization: Bearer [token]

// 4. Token validation
validTokens.has(token) ? proceed : 401 Unauthorized
```

### **Microsoft Copilot Integration (Tampermonkey)**
| Component | Purpose | Key Features |
|-----------|---------|--------------|
| Floating button | Draggable launcher | Lines 36-152: Drag without opening |
| Sidecar panel | Display prompt details | Lines 155-323: Beautiful cards |
| Message listener | Receive from library | Lines 544-576: PostMessage API |
| Prompt insertion | Auto-fill Copilot | Lines 331-420: Format & insert |
| Fallback | Clipboard copy | Lines 411-418: If insertion fails |

---

## 🏗️ **5. VISUAL SYSTEM ARCHITECTURE**

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           SPARK PROMPT LIBRARY v3.0                        │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────┐         ┌──────────────────┐                       │
│  │                  │         │                  │                       │
│  │   USER BROWSER   │ ←──────→│   M365 COPILOT   │                       │
│  │                  │         │  (Tampermonkey)  │                       │
│  │                  │         │                  │                       │
│  └────────┬─────────┘         └──────────────────┘                       │
│           │                                                               │
│           │ HTTP/HTTPS                                                    │
│           ↓                                                               │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │                     DOCKER NETWORK (bridge)                   │        │
│  │  ┌────────────────────────┐  ┌────────────────────────────┐ │        │
│  │  │   FRONTEND CONTAINER    │  │     API CONTAINER          │ │        │
│  │  │                         │  │                            │ │        │
│  │  │   Vite Dev Server       │  │    Express.js Server      │ │        │
│  │  │   Port: 3000           │  │    Port: 3001             │ │        │
│  │  │                         │  │                            │ │        │
│  │  │   ┌─────────────┐      │  │    ┌──────────────┐       │ │        │
│  │  │   │   main.js   │──────┼──┼───→│   api.js     │       │ │        │
│  │  │   │  admin.js   │ AJAX │  │    │              │       │ │        │
│  │  │   │  browse.js  │      │  │    │  Auth Logic  │       │ │        │
│  │  │   └─────────────┘      │  │    │  CRUD Ops    │       │ │        │
│  │  │                         │  │    │  Validation  │       │ │        │
│  │  │   NO Volume Mount      │  │    │  Backups     │       │ │        │
│  │  │   (Build-time copy)    │  │    └──────┬───────┘       │ │        │
│  │  │                         │  │           │               │ │        │
│  │  └─────────────────────────┘  │           │               │ │        │
│  │                                │    Volume Mounts:        │ │        │
│  │                                │    ┌─────┴──────┐        │ │        │
│  │                                │    │            │        │ │        │
│  │                                │    ↓            ↓        │ │        │
│  └────────────────────────────────┼───────────────────────────┘        │
│                                   │                                     │
│           HOST FILE SYSTEM        │                                     │
│  ┌────────────────────────────────┼───────────────────────────────┐    │
│  │  ./public/                     │        ./backups/             │    │
│  │    prompts_index.json ←────────┘         ├── *_edit.json      │    │
│  │    (9.2MB Database)                      ├── *_delete.json    │    │
│  │                                          └── *_manual.json    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

Port Mappings:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Host:3000 ←→ Container:3000 (Frontend)
Host:3001 ←→ Container:3001 (API)

Data Flow Direction:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Browse Page   →→→  GET /api/prompts  →→→  prompts_index.json
Add Form      →→→  POST /api/prompts →→→  prompts_index.json
Admin Edit    →→→  PUT /api/prompts  →→→  backup → update → clean
Admin Delete  →→→  DELETE /api/prompts →→ backup → delete → clean
```

---

## 🔐 **6. CRITICAL FILES - DO NOT MODIFY**

### **Core System Files**
| File | Why Critical | Impact if Modified |
|------|--------------|-------------------|
| `prompts_index.json` | Main database | Data loss, app breaks |
| `server/api.js` | All backend logic | API failures |
| `src/js/main.js` | Prompt loading | Sync issues return |
| `src/js/admin.js` | Admin functionality | Dashboard breaks |
| `docker-compose.yml` | Container config | Deployment fails |
| `.env` | Passwords & config | Security breach |

### **Configuration Files**
| File | Purpose | Safe to Modify? |
|------|---------|-----------------|
| `.env.example` | Template | ✅ Yes (template only) |
| `package.json` | Dependencies | ⚠️ Careful (test after) |
| `vite.config.js` | Build config | ⚠️ Careful (affects build) |
| `tailwind.config.js` | Styles | ✅ Yes (just styling) |
| `postcss.config.js` | CSS processing | ✅ Yes (rarely needed) |

### **Volume Mount Paths**
```yaml
# CRITICAL - These paths must exist and be correct:
volumes:
  - ./public:/app/public      # Database access
  - ./backups:/app/backups    # Backup storage
  - ./.env:/app/.env         # Config (FIXED in commit 6f01857)
```

---

## 🚀 **7. SYSTEM COMMANDS**

### **Development Commands**

```bash
# Clone repository
git clone https://github.com/W3STY11/spark-prompt-library.git
cd spark-prompt-library

# Set up environment
cp .env.example .env
nano .env  # Set ADMIN_PASSWORD

# Start system
docker-compose up -d

# View logs
docker-compose logs -f
docker-compose logs api
docker-compose logs frontend

# Stop system
docker-compose down

# Restart (after config changes)
docker-compose down && docker-compose up -d

# Rebuild containers (after code changes)
docker-compose build --no-cache
docker-compose up -d
```

### **Production Commands**

```bash
# Start in production
NODE_ENV=production docker-compose up -d

# Create manual backup
curl -X POST http://localhost:3001/api/admin/backup \
  -H "Authorization: Bearer YOUR_TOKEN"

# Health check
curl http://localhost:3001/api/health

# View container stats
docker stats spark-api spark-frontend

# Clean old containers/images
docker system prune -a

# Emergency data recovery
cp backups/prompts_backup_LATEST.json public/prompts_index.json
docker-compose restart api
```

### **Database Commands**

```bash
# Count total prompts
cat public/prompts_index.json | jq '.prompts | length'

# Backup database
cp public/prompts_index.json backups/manual_$(date +%Y%m%d_%H%M%S).json

# Search for prompt
cat public/prompts_index.json | jq '.prompts[] | select(.title | contains("Business"))'

# Validate JSON
cat public/prompts_index.json | jq . > /dev/null && echo "Valid" || echo "Invalid"
```

### **Troubleshooting Commands**

```bash
# Check port availability
lsof -i :3000
lsof -i :3001

# Container shell access
docker exec -it spark-api sh
docker exec -it spark-frontend sh

# Reset everything
docker-compose down
docker system prune -a
rm -rf node_modules
docker-compose build --no-cache
docker-compose up -d

# Fix permissions
chmod 755 public/
chmod 644 public/prompts_index.json

# Check disk space
df -h
du -sh public/prompts_index.json
```

---

## 🐛 **8. CRITICAL BUG FIXES EXPLAINED**

### **Fix 1: Frontend-Backend Sync Issue**

**Problem:** Prompts added/edited/deleted didn't appear immediately
**Root Cause:** Frontend loaded from static cached file at build time
**Solution:** Load from API endpoint for real-time data

```javascript
// File: src/js/main.js (Line 24)
// File: src/js/admin.js (Line 53)

// ❌ BROKEN - Static file (cached at build)
const response = await fetch('/prompts_index.json');

// ✅ FIXED - API endpoint (real-time)
const response = await fetch('http://localhost:3001/api/prompts');
```

**Commits:**
- `3315843`: Fixed browse page sync
- `891244e`: Fixed admin dashboard sync

### **Fix 2: Missing .env Volume Mount**

**Problem:** Custom admin passwords weren't being used
**Root Cause:** `.env` file not mounted into container
**Solution:** Add volume mount in docker-compose.yml

```yaml
# File: docker-compose.yml (Line 16)

volumes:
  - ./public:/app/public
  - ./backups:/app/backups
  - ./.env:/app/.env  # ← THIS WAS MISSING
```

**Commit:** `6f01857`: Fixed .env configuration

### **Fix 3: Docker Build Failure**

**Problem:** Fresh clones failed with "/.env not found"
**Root Cause:** Dockerfile required .env which isn't in repo
**Solution:** Use .env.example as default

```dockerfile
# File: Dockerfile.api (Lines 27-28)

# ❌ BROKEN
COPY .env ./.env

# ✅ FIXED
COPY .env.example ./.env
```

**Commit:** `d9a79b4`: Fixed Docker build for new users

---

## 📋 **9. API ENDPOINTS REFERENCE**

### **Public Endpoints (No Auth)**

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| GET | `/api/prompts` | Get all prompts | - | Full database JSON |
| GET | `/api/health` | Health check | - | `{status: "ok"}` |
| POST | `/api/prompts` | Add single prompt | FormData with title, description, content, category, tags, image | New prompt object |
| POST | `/api/prompts/bulk` | Bulk import | `{prompts: [{...}]}` | Import results |

### **Admin Endpoints (Auth Required)**

| Method | Endpoint | Purpose | Headers | Request Body | Response |
|--------|----------|---------|---------|--------------|----------|
| POST | `/api/admin/login` | Login | - | `{password: "..."}` | `{token: "..."}` |
| POST | `/api/admin/logout` | Logout | Bearer token | - | `{success: true}` |
| PUT | `/api/prompts/:id` | Edit prompt | Bearer token | Prompt data | Updated prompt |
| DELETE | `/api/prompts/:id` | Delete prompt | Bearer token | - | `{deleted: "title"}` |
| POST | `/api/prompts/bulk-delete` | Bulk delete | Bearer token | `{ids: [...]}` | Delete count |
| POST | `/api/admin/backup` | Manual backup | Bearer token | - | Backup filename |
| GET | `/api/admin/validate` | Data validation | Bearer token | - | Validation report |
| GET | `/api/admin/backups` | List backups | Bearer token | - | Backup list |

---

## 🎮 **10. DEVELOPMENT WORKFLOW**

### **Setting Up Development Environment**

```bash
# 1. Clone and setup
git clone https://github.com/W3STY11/spark-prompt-library.git
cd spark-prompt-library
cp .env.example .env
nano .env  # Set ADMIN_PASSWORD

# 2. Start containers
docker-compose up -d

# 3. Watch logs
docker-compose logs -f

# 4. Access application
# Browse: http://localhost:3000/browse.html
# Admin: http://localhost:3000/admin-login.html
```

### **Making Code Changes**

#### **Frontend Changes:**
```bash
# Edit files in src/js/
nano src/js/browse.js

# Frontend container needs rebuild
docker-compose build frontend
docker-compose up -d frontend
```

#### **Backend Changes:**
```bash
# Edit API
nano server/api.js

# API container needs rebuild
docker-compose build api
docker-compose up -d api
```

#### **Style Changes:**
```bash
# Edit Tailwind config
nano tailwind.config.js

# Or custom CSS
nano src/css/main.css

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

### **Testing Changes**

```bash
# 1. Add test prompt via UI
# 2. Check it appears in browse
# 3. Login to admin, verify it's there
# 4. Edit the prompt
# 5. Verify changes sync
# 6. Delete the prompt
# 7. Verify deletion syncs

# Check API directly
curl http://localhost:3001/api/health
curl http://localhost:3001/api/prompts | jq '.prompts | length'
```

---

## 🔒 **11. SECURITY CONSIDERATIONS**

### **Current Security Model**

| Component | Security Measure | Location |
|-----------|-----------------|----------|
| Admin Password | Environment variable | `.env` file |
| Token Generation | Crypto.randomBytes(32) | `api.js:28-30` |
| Token Storage | In-memory Set | `api.js:25` |
| Auth Check | Bearer token validation | `api.js:33-41` |
| CORS | Enabled for all origins | `api.js:17` |
| File Upload | PNG only, Multer filter | `api.js:268-276` |

### **Security Recommendations**

```javascript
// 1. Restrict CORS (api.js:17)
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com']
}));

// 2. Add rate limiting
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests
});
app.use('/api/', limiter);

// 3. Input validation
if (title.length > 200 || content.length > 10000) {
  return res.status(400).json({error: 'Input too long'});
}

// 4. Use HTTPS in production
// Update all fetch() calls to use HTTPS
```

---

## 📊 **12. PERFORMANCE METRICS**

### **Current Performance**

| Metric | Value | Location |
|--------|-------|----------|
| Database Size | 9.2MB | `prompts_index.json` |
| Total Prompts | 2,376 | Database |
| Avg Response Time | <100ms | API endpoints |
| Frontend Bundle | ~500KB | Vite build |
| Docker Image Size | ~180MB | Each container |
| Memory Usage | ~100MB | Per container |
| Startup Time | 2-3 min | First build |
| Restart Time | 10-15 sec | Container restart |

### **Optimization Opportunities**

1. **Database:** Consider pagination API for large datasets
2. **Images:** Lazy load prompt images
3. **Search:** Add server-side search for better performance
4. **Caching:** Implement Redis for token storage
5. **Build:** Optimize Docker layers for faster builds

---

## 🚨 **13. EMERGENCY PROCEDURES**

### **Data Recovery**

```bash
# If database corrupted
cp backups/prompts_backup_LATEST.json public/prompts_index.json
docker-compose restart api

# If no backups exist
# Check for prompts in HTML files
find public/prompts -name "*.html" | wc -l  # Count
# Manual reconstruction needed
```

### **Container Recovery**

```bash
# Complete reset
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

### **Port Conflicts**

```bash
# Find what's using ports
lsof -i :3000
lsof -i :3001

# Kill processes
kill -9 [PID]

# Or change ports in docker-compose.yml
ports:
  - "8080:3000"  # Change to 8080
```

---

## 📝 **14. SUMMARY**

### **Key Takeaways**

1. **Architecture:** Two-container Docker setup with Express API and Vite frontend
2. **Database:** File-based JSON (9.2MB) with automatic backups
3. **Critical Fix:** Frontend must load from API, not static files
4. **Authentication:** Session-based with Bearer tokens
5. **Real-time Sync:** All changes reflect immediately across UI
6. **Backup Strategy:** Auto-backup before edits/deletes, max 100 files

### **Most Important Files**

1. `server/api.js` - All backend logic
2. `src/js/main.js` - Frontend prompt loading
3. `src/js/admin.js` - Admin dashboard
4. `docker-compose.yml` - Container orchestration
5. `public/prompts_index.json` - Database

### **Common Tasks Quick Reference**

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Rebuild after changes
docker-compose build --no-cache && docker-compose up -d

# Check logs
docker-compose logs -f

# Access
Browse: http://localhost:3000/browse.html
Admin: http://localhost:3000/admin-login.html
```

---

**Document Generated:** October 16, 2025
**Author:** SPARK Development Team
**Status:** Production Ready