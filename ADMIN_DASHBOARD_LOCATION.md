# ADMIN DASHBOARD - ACCESS & FEATURES

## PRIMARY ADMIN LOCATION

**Admin Dashboard URL:** https://gray-ocean-059c8510f.3.azurestaticapps.net/admin-login

**Login Credentials:**
- Password: `admin123`

**After Login:** Automatically redirects to https://gray-ocean-059c8510f.3.azurestaticapps.net/admin

---

## ADMIN DASHBOARD FEATURES

### 1. View All Prompts
- **Description**: Browse all 2,423 prompts in a paginated table
- **Features**: Sort, search, filter by department
- **Location**: Main admin dashboard page

### 2. Add New Prompt
- **Button**: "+ Add Prompt" (top right)
- **Features**:
  - Title, description, content
  - Department and subcategory selection
  - Tags, complexity level
  - Tips and example images
  - Word count auto-calculation
- **Data Sync**: Immediately synced with library after save

### 3. Edit Existing Prompt
- **Action**: Click "Edit" button on any prompt row
- **Features**:
  - Full metadata editing
  - Auto-backup before save
  - Real-time validation
- **Data Sync**: Changes reflect in library immediately

### 4. Delete Prompt(s)
- **Single Delete**: Click "Delete" button on prompt row
- **Bulk Delete**: Select multiple prompts + "Bulk Delete" button
- **Safety**: Auto-backup created before deletion
- **Data Sync**: Deletions reflect in library immediately

### 5. Bulk Import
- **Formats Supported**:
  - JSON file upload
  - CSV file upload
- **Features**:
  - Validates data structure
  - Shows preview before import
  - Merge with existing or replace
- **Location**: "Import" button in admin toolbar
- **Data Sync**: Imported prompts appear in library immediately

### 6. Bulk Export
- **Formats Available**:
  - Export to JSON
  - Export to CSV
- **Options**:
  - Export all prompts
  - Export filtered prompts
  - Export selected prompts
- **Location**: "Export" button in admin toolbar

### 7. Manual Backup
- **Action**: Click "Create Backup" button
- **Format**: JSON file with timestamp
- **Naming**: `prompts_backup_YYYYMMDD_HHMMSS_manual.json`
- **Location**: Stored in container filesystem at `/app/backups/`
- **Retention**: Last 100 backups (configurable)

### 8. Data Validation
- **Action**: Click "Validate Data" button
- **Checks**:
  - Duplicate titles
  - Missing descriptions
  - Missing tags
  - Missing content
  - Malformed entries
  - Empty fields
- **Output**: Summary report with issue counts and details

### 9. Auto-Backup System
- **Triggers**:
  - Before any edit operation
  - Before any delete operation
  - Before bulk delete
- **Format**: `prompts_backup_YYYYMMDD_HHMMSS_<reason>.json`
- **Reasons**: `before_edit`, `before_delete`, `before_bulk_delete`

---

## DATA SYNCHRONIZATION

### How Admin Changes Sync with Library

**Real-Time Sync:**
All admin operations (add, edit, delete, bulk import) update the master `prompts_index.json` file immediately. The library reads from this same file, so changes are reflected instantly.

**Sync Flow:**
```
Admin Dashboard (Edit/Add/Delete)
         ↓
API Backend (POST/PUT/DELETE to /api/prompts)
         ↓
Updates prompts_index.json
         ↓
Library reads updated prompts_index.json
         ↓
Changes visible in library immediately
```

**No Cache Issues:**
- Frontend refreshes data from API on page load
- No caching of prompt data
- Admin changes are instant

---

## BACKEND API (What Powers the Admin)

**API Base URL:** http://20.75.218.182:3001

**Admin API Endpoints:**

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/admin/login` | POST | Login and get auth token | No |
| `/api/admin/logout` | POST | Invalidate auth token | Yes |
| `/api/prompts` | POST | Create new prompt | No (but admin uses it) |
| `/api/prompts/:id` | GET | Get single prompt | No |
| `/api/prompts/:id` | PUT | Update prompt | Yes |
| `/api/prompts/:id` | DELETE | Delete prompt | Yes |
| `/api/prompts/bulk` | POST | Bulk import prompts | No (but admin uses it) |
| `/api/prompts/bulk-delete` | POST | Bulk delete prompts | Yes |
| `/api/admin/backup` | POST | Create manual backup | Yes |
| `/api/admin/backups` | GET | List all backups | Yes |
| `/api/admin/validate` | GET | Validate data quality | Yes |

**Authentication:**
- Token-based authentication
- Token stored in localStorage after login
- Token sent in `Authorization: Bearer <token>` header
- Tokens stored in-memory on API server (not persisted)

---

## ACCESSING ADMIN LOCALLY

**For Local Development:**

1. Start API server:
   ```bash
   npm run api
   # or
   node server/api.js
   ```

2. Start frontend dev server:
   ```bash
   npm run dev
   ```

3. Access admin at:
   - Login: http://localhost:3000/admin-login
   - Dashboard: http://localhost:3000/admin

4. Update API config for local dev:
   ```javascript
   // src/config.js
   export const API_BASE_URL = 'http://localhost:3001';
   ```

---

## ADMIN DASHBOARD ARCHITECTURE

### Frontend Components
- `src/components/AdminLoginPage.jsx` - Login form and authentication
- `src/components/AdminDashboardPage.jsx` - Main admin interface with all features

### API Configuration
- `src/config.js` - Centralized API endpoint configuration
- Points to: `http://20.75.218.182:3001` (Azure Container Instance)

### Data Storage
- **Primary**: `public/prompts_index.json` (9MB, 2,423 prompts)
- **Backups**: `backups/` directory in API container
- **Format**: JSON with full metadata for each prompt

---

## ADMIN DASHBOARD FEATURES IN DETAIL

### Add Prompt Modal

**Fields:**
- Title (required)
- Department (dropdown: Business, Marketing, Sales, etc.)
- Subcategory (text input)
- Description (textarea, required)
- Content/Prompt Template (textarea, required)
- Tags (comma-separated)
- Complexity (dropdown: Basic, Intermediate, Advanced)
- Tips (textarea, markdown supported)
- Images (file upload, PNG only)

**Validation:**
- All required fields must be filled
- Word count auto-calculated from content
- Unique ID auto-generated

### Edit Prompt Modal

**Same fields as Add Prompt, pre-filled with existing data**

**Additional Features:**
- Preview changes before saving
- Cancel to discard changes
- Auto-backup before save

### Bulk Import Interface

**Upload Methods:**
- Drag & drop JSON/CSV file
- Click to browse and select file

**JSON Format Expected:**
```json
{
  "prompts": [
    {
      "title": "Prompt Title",
      "department": "Business",
      "subcategory": "Strategy",
      "description": "Brief description",
      "content": "Full prompt template",
      "tags": ["tag1", "tag2"],
      "complexity": "Intermediate",
      "tips": "Usage tips here",
      "images": []
    }
  ]
}
```

**CSV Format Expected:**
```csv
title,department,subcategory,description,content,tags,complexity,tips
"Prompt Title","Business","Strategy","Description","Content","tag1,tag2","Intermediate","Tips"
```

**Import Options:**
- Merge with existing prompts
- Replace all prompts
- Skip duplicates
- Validate before import

### Bulk Export Interface

**Export Formats:**
- JSON (full metadata)
- CSV (spreadsheet format)

**Export Options:**
- All prompts (2,423)
- Current filtered view
- Selected prompts only

**File Naming:**
- JSON: `spark_prompts_export_YYYYMMDD.json`
- CSV: `spark_prompts_export_YYYYMMDD.csv`

---

## TROUBLESHOOTING

### Can't Access Admin Login Page

**Problem**: 404 error at `/admin-login`

**Solution**:
1. Verify deployment includes `index.html`
2. Check `staticwebapp.config.json` has navigation fallback
3. Clear browser cache
4. Try accessing via direct URL: https://gray-ocean-059c8510f.3.azurestaticapps.net/

### Admin Login Fails

**Problem**: "Login failed" or "Invalid credentials"

**Solution**:
1. Verify password is `admin123`
2. Check API is running: http://20.75.218.182:3001/api/prompts
3. Check browser console for errors
4. Verify CORS is enabled on API

### Changes Don't Appear in Library

**Problem**: Edit/add/delete in admin, but library doesn't show changes

**Solution**:
1. Refresh library page (hard refresh: Ctrl+F5)
2. Check API is updating prompts_index.json
3. Verify no caching on Static Web App
4. Check browser console for API errors

### Bulk Import Fails

**Problem**: Error during JSON/CSV import

**Solution**:
1. Verify file format matches expected structure
2. Check for malformed JSON (use JSONLint.com)
3. Ensure CSV has correct headers
4. Check file size (max 50MB recommended)
5. Validate data structure before import

---

## ADMIN DASHBOARD SECURITY

### Current Security

- Password-based authentication (`admin123`)
- Token-based sessions (in-memory)
- HTTPS recommended for production (currently HTTP)
- CORS enabled for frontend domain

### Recommended Improvements

1. **Change Default Password**
   - Update `ADMIN_PASSWORD` environment variable
   - Use strong, unique password

2. **Add HTTPS to API**
   - Deploy behind Azure Application Gateway
   - Enable SSL/TLS certificate

3. **Add Rate Limiting**
   - Prevent brute force login attempts
   - Limit API requests per IP

4. **Add Multi-User Support**
   - User accounts with roles
   - Activity logging
   - Audit trails

---

## ADMIN DASHBOARD DEPLOYMENT STATUS

**Current Deployment:**
- ✅ Frontend: Azure Static Web Apps
- ✅ Backend API: Azure Container Instance
- ✅ Data Storage: JSON file in container
- ✅ Backups: Container filesystem
- ✅ Authentication: Token-based, in-memory

**Production URLs:**
- **Admin Login**: https://gray-ocean-059c8510f.3.azurestaticapps.net/admin-login
- **Admin Dashboard**: https://gray-ocean-059c8510f.3.azurestaticapps.net/admin
- **API Endpoint**: http://20.75.218.182:3001

**Status:** FULLY OPERATIONAL ✅

---

## SUMMARY

**The admin dashboard is the central control panel for managing all 2,423 prompts in the SPARK library.**

**Location:** https://gray-ocean-059c8510f.3.azurestaticapps.net/admin-login

**Key Features:**
1. Add new prompts with full metadata
2. Edit existing prompts
3. Delete prompts (single or bulk)
4. Bulk import (JSON/CSV)
5. Bulk export (JSON/CSV)
6. Manual backups
7. Data validation
8. Auto-backup system

**Data Sync:** All changes immediately reflected in the library

**Authentication:** Password `admin123` (change recommended)

**Backend:** Azure Container Instance at http://20.75.218.182:3001

**Status:** Fully operational and ready to use
