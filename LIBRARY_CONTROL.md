# Library Control: Who Controls What?

## YOU Control Everything in the Library ✅

The M365 Copilot integration is **READ-ONLY**. You maintain FULL control through multiple methods:

---

## Method 1: Admin Dashboard (Web UI)

### Access:
```
http://localhost:3000/admin-login
Password: (Your ADMIN_PASSWORD from .env)
```

### What You Can Do:

✅ **Add New Prompts**
- Title, content, department, tags
- Upload images
- Set complexity level
- Add tips and examples

✅ **Edit Existing Prompts**
- Modify any field
- Update content
- Change department
- Add/remove tags
- **Auto-backup** before every edit

✅ **Delete Prompts**
- Remove unwanted prompts
- **Auto-backup** before deletion
- Permanent removal

✅ **Bulk Operations**
- Import CSV/JSON files
- Bulk delete by criteria
- Bulk update department/tags

✅ **Quality Control**
- Validate all prompts
- Find duplicates
- Check for missing fields
- View statistics

### Example: Adding a Prompt via Dashboard

```
1. Login to /admin
2. Click "Add New Prompt"
3. Fill form:
   - Title: "New Marketing Strategy"
   - Department: Marketing
   - Content: "#CONTEXT:..."
   - Tags: marketing, strategy
4. Click "Add Prompt"
5. ✅ Prompt saved to prompts_index.json
6. ✅ All users see it within 5 minutes (auto-refresh)
```

---

## Method 2: API Endpoints (Programmatic)

### Add Single Prompt:
```bash
curl -X POST http://localhost:3001/api/prompts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Prompt",
    "department": "Business",
    "content": "#CONTEXT:...",
    "tags": ["business", "analysis"]
  }'
```

### Bulk Import (JSON):
```bash
curl -X POST http://localhost:3001/api/prompts/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "prompts": [
      {"title": "Prompt 1", "content": "..."},
      {"title": "Prompt 2", "content": "..."}
    ]
  }'
```

### Update Prompt (Requires Admin Token):
```bash
# 1. Login to get token
TOKEN=$(curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password": "your-password"}' | jq -r .token)

# 2. Update prompt
curl -X PUT http://localhost:3001/api/prompts/abc123 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content"
  }'
```

### Delete Prompt (Requires Admin Token):
```bash
curl -X DELETE http://localhost:3001/api/prompts/abc123 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Method 3: Direct File Editing

### Edit prompts_index.json:
```bash
# 1. Open file
nano public/prompts_index.json

# 2. Add/edit/delete prompts directly
{
  "meta": {...},
  "departments": [...],
  "prompts": [
    {
      "id": "unique-id",
      "title": "Your Prompt",
      "content": "...",
      "department": "Business"
    }
  ]
}

# 3. Save and restart server
npm run api
```

**⚠️ Warning:** Manual edits bypass validation and backups. Use API or dashboard instead.

---

## Method 4: Build Script (Bulk Rebuild)

### Rebuild from HTML Source Files:
```bash
# Your source prompts in HTML format
ls "/home/aiwithnick/AI Prompts v5_BACKUP"

# Run build script
node scripts/build-index.mjs

# This will:
# 1. Scan all HTML files in source directory
# 2. Parse with Cheerio
# 3. Extract metadata (title, department, etc.)
# 4. Generate new prompts_index.json
# 5. Copy HTML files to public/prompts/
# 6. Copy images to public/thumbnails/

# Result:
# ✅ Fresh prompts_index.json created
# ✅ All prompts from source imported
```

### Source Directory Structure:
```
/home/aiwithnick/AI Prompts v5_BACKUP/
├── Business/
│   ├── prompt1.html
│   ├── prompt2.html
├── Marketing/
│   ├── prompt1.html
├── Sales/
...
```

---

## What Users CANNOT Control

### M365 Copilot Users (Via Userscript):

❌ **Cannot Add Prompts**
- Userscript is READ-ONLY
- No write access to library

❌ **Cannot Delete Prompts**
- No delete functionality
- Library remains unchanged

❌ **Cannot Edit Prompts**
- Customizations are client-side only
- Original prompts untouched

✅ **Can Only:**
- Read/browse prompts
- Search and filter
- Customize for their own use (temporary)
- Insert to M365 Copilot

### What Customization Actually Means:

```javascript
// User sees in library:
"#CONTEXT:...\n\n[MY BUSINESS]: [DESCRIBE YOUR BUSINESS]"

// User customizes:
"#CONTEXT:...\n\n[MY BUSINESS]: Tech Startup"

// Gets inserted to M365 Copilot:
"#CONTEXT:...\n\n[MY BUSINESS]: Tech Startup"

// Library STILL has:
"#CONTEXT:...\n\n[MY BUSINESS]: [DESCRIBE YOUR BUSINESS]"
// ✅ Unchanged!
```

---

## Data Flow & Control

```
┌──────────────────────────────────────────────┐
│             YOU CONTROL                       │
│                                              │
│  1. Admin Dashboard                          │
│  2. API Endpoints                            │
│  3. Direct File Edits                        │
│  4. Build Script                             │
│                                              │
│         ↓ (WRITES)                           │
│                                              │
│  prompts_index.json                          │
│  (Single Source of Truth)                    │
│                                              │
│         ↓ (READS)                            │
│                                              │
│  M365 Copilot Userscript                     │
│  (READ-ONLY)                                 │
│                                              │
│         ↓ (DISPLAYS)                         │
│                                              │
│  End Users                                   │
│  (Can only read & customize client-side)     │
└──────────────────────────────────────────────┘
```

---

## Backup System (Protection)

### Automatic Backups:

Every time you edit or delete via API/Dashboard:

```
backups/
├── prompts_backup_20251020_143022_pre_edit.json
├── prompts_backup_20251020_143055_pre_delete.json
├── prompts_backup_20251020_144312_manual.json
└── ...
```

### Backup Retention:
```javascript
// In .env file
MAX_BACKUPS=100
BACKUP_RETENTION_DAYS=30
```

### Restore from Backup:
```bash
# 1. Find backup
ls backups/

# 2. Copy to main file
cp backups/prompts_backup_20251020_143022_pre_edit.json \
   public/prompts_index.json

# 3. Restart server
npm run api
```

---

## Access Control Matrix

| Action | You (Admin) | Users (M365) | Library |
|--------|------------|--------------|---------|
| **Add Prompt** | ✅ Dashboard/API | ❌ Read-only | ✅ Updated |
| **Edit Prompt** | ✅ Dashboard/API | ❌ Read-only | ✅ Updated |
| **Delete Prompt** | ✅ Dashboard/API | ❌ Read-only | ✅ Updated |
| **View Prompts** | ✅ | ✅ | ✅ Unchanged |
| **Search Prompts** | ✅ | ✅ | ✅ Unchanged |
| **Customize (temp)** | ✅ | ✅ | ✅ Unchanged |
| **Modify Library** | ✅ ONLY YOU | ❌ | ✅ |

---

## Security Measures

### 1. Admin Authentication:
```javascript
// Only you can modify library
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// All edit/delete endpoints require:
headers: {
  'Authorization': 'Bearer <token>'
}

// Token obtained via:
POST /api/admin/login
{ "password": "your-password" }
```

### 2. Rate Limiting (Recommended):
```javascript
// Prevent abuse of API endpoints
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. Read-Only Endpoints:
```javascript
// Public (no auth):
GET /api/prompts              // Read all
GET /prompts_index.json       // Read JSON

// Admin only (requires token):
POST /api/prompts             // Create
PUT /api/prompts/:id          // Update
DELETE /api/prompts/:id       // Delete
```

---

## Multi-User Workflow

### Your Role (Administrator):

```
1. Manage prompt library via dashboard
2. Add new prompts as needed
3. Edit/delete existing prompts
4. Bulk import from CSV/JSON
5. Monitor quality via validation endpoint
6. Review backups periodically
```

### Users' Role:

```
1. Browse prompts via M365 Copilot integration
2. Search for what they need
3. Customize prompts for their use (client-side)
4. Insert to M365 Copilot
5. ❌ Cannot modify library
```

### Sync Process:

```
You add prompt at 10:00
    ↓
prompts_index.json updated
    ↓
User A's cache refreshes at 10:05 → sees new prompt ✅
User B's cache refreshes at 10:06 → sees new prompt ✅
User C's cache refreshes at 10:10 → sees new prompt ✅
```

---

## Validation & Quality Control

### Run Validation:
```bash
# Via API
curl http://localhost:3001/api/admin/validate \
  -H "Authorization: Bearer $TOKEN"

# Response:
{
  "total": 2425,
  "issues": {
    "duplicateTitles": [],
    "missingDescriptions": 5,
    "missingTags": 12,
    "emptyContent": 0
  }
}
```

### Fix Issues:
```
1. Review validation report
2. Edit prompts via dashboard
3. Re-run validation
4. Repeat until clean ✅
```

---

## Summary

**Q: Who controls the prompt library?**
**A: YOU, 100%!**

✅ You add/edit/delete prompts
✅ You manage departments and categories
✅ You control access (admin password)
✅ You have automatic backups
✅ You can bulk import/export
✅ You validate quality

**Users can:**
- ✅ Read prompts
- ✅ Search prompts
- ✅ Customize for their use (temporary, client-side)
- ❌ NOT modify the library

**The M365 Copilot integration:**
- ✅ Reads from your library
- ✅ Auto-syncs when you make changes
- ✅ Displays prompts to users
- ❌ Never writes back to library
- ❌ Never modifies anything

**You have complete control. The integration is just a display layer!**
