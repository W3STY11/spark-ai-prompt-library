# GitHub + Azure Static Web Apps Production Workflow Setup

## Overview

This guide implements Peter's requirement: **"An absolute must"** - proper production/development separation using GitHub branching with Azure Static Web Apps preview environments.

**What This Achieves:**
- **PRODUCTION** (main branch) = Locked, stable, always working
- **DEVELOPMENT** (dev branch) = Test new features safely
- **FEATURE BRANCHES** = Individual changes (fix-card-spacing, add-search, etc.)
- **AUTO-DEPLOY** = Each branch gets its own URL for testing
- **ZERO DOWNTIME** = Production never breaks from experimental changes

---

## Current State

**Production URL:** `https://gray-ocean-059c8510f.3.azurestaticapps.net`
**Deployment:** Manual via `npx @azure/static-web-apps-cli deploy`
**Source Control:** None (local files only)
**Problem:** Every change risks breaking production

---

## Target Architecture

```
GitHub Repository (sparkpromptstorage/spark-prompt-library)
├── main branch (PRODUCTION)
│   └── Auto-deploys to: https://gray-ocean-059c8510f.3.azurestaticapps.net
│
├── dev branch (STAGING)
│   └── Auto-deploys to: https://gray-ocean-059c8510f-dev.3.azurestaticapps.net
│
└── feature/fix-card-spacing (FEATURE)
    └── Auto-deploys to: https://gray-ocean-059c8510f-feature-fix-card-spacing.3.azurestaticapps.net
```

**Workflow:**
1. Create feature branch from `dev`
2. Make changes, test on feature URL
3. Merge to `dev`, test on staging URL
4. Merge to `main`, auto-deploys to production
5. Production NEVER touched directly

---

## Step-by-Step Implementation

### PHASE 1: Create GitHub Repository

#### 1.1 Initialize Git Repository Locally

```bash
cd /home/aiwithnick/SPARK_LIBRARY_FLUENT_UI_VERSION

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: SPARK Prompt Library v3.1.0 (Azure Edition)

- 1,812 prompts across 9 departments
- Azure Static Web App deployment
- Azure Blob Storage integration (2,096 images)
- Tampermonkey M365 Copilot integration
- Fluent UI v9 components with glass morphism theme
- All features working and tested"
```

#### 1.2 Create GitHub Repository

**Option A: Via GitHub CLI (Recommended)**
```bash
# Install gh CLI if not already installed
# WSL/Ubuntu: sudo apt install gh

# Login to GitHub
gh auth login

# Create repository
gh repo create spark-prompt-library \
  --private \
  --description "SPARK AI Prompt Library - 1,812+ professional prompts with Azure deployment" \
  --source=. \
  --remote=origin \
  --push
```

**Option B: Via GitHub Web UI**
1. Go to https://github.com/new
2. Repository name: `spark-prompt-library`
3. Private repository
4. Do NOT initialize with README (we already have code)
5. Click "Create repository"
6. Follow the "push an existing repository" instructions

```bash
git remote add origin https://github.com/<YOUR_ORG>/spark-prompt-library.git
git branch -M main
git push -u origin main
```

#### 1.3 Create Development Branch

```bash
# Create and push dev branch
git checkout -b dev
git push -u origin dev

# Return to main
git checkout main
```

---

### PHASE 2: Connect GitHub to Azure Static Web Apps

#### 2.1 Get Azure Static Web App Details

```bash
# Get your Static Web App details
az staticwebapp show \
  --name spark-prompt-library \
  --query "{name:name, resourceGroup:resourceGroup, defaultHostname:defaultHostname}" \
  --output table
```

#### 2.2 Configure GitHub Integration in Azure Portal

1. Go to Azure Portal: https://portal.azure.com
2. Search for "Static Web Apps"
3. Click on your app: `spark-prompt-library` (or whatever it's named)
4. In the left menu, click **"Configuration"** → **"Application settings"**
5. Note the deployment token (or generate new one)

#### 2.3 Add GitHub Repository Secret

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
5. Value: [paste your deployment token]
6. Click **"Add secret"**

---

### PHASE 3: Create GitHub Actions Workflow

#### 3.1 Create Workflow Directory

```bash
mkdir -p .github/workflows
```

#### 3.2 Create Workflow File

Create `.github/workflows/azure-static-web-apps.yml`:

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main      # Production
      - dev       # Staging
      - feature/* # All feature branches
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3
        with:
          submodules: true

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Application
        run: npm run build

      - name: Deploy to Azure Static Web Apps
        id: deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          app_build_command: "npm run build"
          output_location: "dist"
          production_branch: "main"  # CRITICAL: Defines production branch

  close_pull_request:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

#### 3.3 Add .gitignore (if not exists)

Create or update `.gitignore`:

```
node_modules/
dist/
.DS_Store
.env
.vscode/
backups/*.json
public/thumbnails/*.png
public/prompts/*.html
.azure/
```

#### 3.4 Commit and Push Workflow

```bash
git add .github/workflows/azure-static-web-apps.yml
git add .gitignore
git commit -m "feat: Add GitHub Actions workflow for Azure Static Web Apps

- Auto-deploy on push to main, dev, and feature/* branches
- Branch preview environments for dev and features
- Production locked to main branch
- PR preview deployments"

git push origin main
```

---

### PHASE 4: Configure Branch Protection Rules

#### 4.1 Protect Main Branch

1. Go to GitHub repository → **Settings** → **Branches**
2. Click **"Add rule"**
3. Branch name pattern: `main`
4. Enable:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Do not allow bypassing the above settings
5. Click **"Create"**

**Result:** Nobody (including you) can push directly to main. All changes must go through pull requests.

#### 4.2 Configure Dev Branch (Optional)

Same process for `dev` branch if you want review requirements.

---

### PHASE 5: Verify Deployment URLs

After pushing, GitHub Actions will run. Check:

1. **GitHub Actions Tab:** Watch build/deploy progress
2. **Azure Portal → Static Web Apps → Environments:**
   - `Production` → main branch → `https://gray-ocean-059c8510f.3.azurestaticapps.net`
   - `dev` → dev branch → `https://gray-ocean-059c8510f-dev.3.azurestaticapps.net`

---

## Daily Workflow - How to Use This

### Scenario 1: Fix Card Spacing (Peter's Request)

```bash
# Start from dev branch
git checkout dev
git pull origin dev

# Create feature branch
git checkout -b feature/fix-card-spacing

# Make changes to BrowsePage.jsx
# Edit spacing, padding, etc.

# Commit and push
git add src/components/BrowsePage.jsx
git commit -m "fix: Reduce card padding on browse page

- Reduced vertical padding from 20px to 8px
- Tightened card layout to fit 9 cards on screen
- Fixed image icon causing inconsistent widths"

git push origin feature/fix-card-spacing
```

**What Happens:**
- GitHub Actions builds and deploys to: `https://gray-ocean-059c8510f-feature-fix-card-spacing.3.azurestaticapps.net`
- You can test the changes without affecting production
- Show Peter the preview URL

**When Ready to Merge:**
```bash
# Create pull request to dev branch
gh pr create \
  --base dev \
  --head feature/fix-card-spacing \
  --title "Fix: Reduce browse page card spacing" \
  --body "Implements Peter's feedback to tighten card layout and fit more cards on screen."

# After Peter approves, merge via GitHub UI
# This auto-deploys to dev staging URL
```

**Promote to Production:**
```bash
# Create pull request from dev to main
gh pr create \
  --base main \
  --head dev \
  --title "Release: Card spacing improvements" \
  --body "Tested on staging, ready for production."

# After approval, merge
# This auto-deploys to production URL
```

### Scenario 2: Emergency Hotfix

```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix

# Make fix
git add .
git commit -m "hotfix: Fix critical authentication bug"
git push origin hotfix/critical-bug-fix

# Create PR directly to main
gh pr create --base main --head hotfix/critical-bug-fix

# Fast-track review and merge
```

---

## Environment URLs Reference

| Environment | Branch | URL Pattern |
|-------------|--------|-------------|
| **Production** | `main` | `https://gray-ocean-059c8510f.3.azurestaticapps.net` |
| **Staging** | `dev` | `https://gray-ocean-059c8510f-dev.3.azurestaticapps.net` |
| **Feature** | `feature/*` | `https://gray-ocean-059c8510f-<branch-name>.3.azurestaticapps.net` |
| **Pull Request** | PR #123 | `https://gray-ocean-059c8510f-123.3.azurestaticapps.net` |

---

## Important Notes

### DO NOT Manually Deploy to Production Anymore

**Old Way (STOP DOING THIS):**
```bash
npx @azure/static-web-apps-cli deploy ./dist --deployment-token "..." --env production
```

**New Way:**
```bash
# Just push to GitHub
git push origin main  # (via PR only, not direct push)
```

### Blob Storage Still Needs Manual Upload

Images in Azure Blob Storage are NOT in the GitHub repo. When you add new images:

```bash
# Upload new images to blob storage
node scripts/upload-index-images-only.mjs
```

This is separate from the app deployment.

### Meeting with Oliver Tomorrow (11:30 AM)

**Before the meeting:**
1. ✅ Do NOT start this GitHub setup before 11:30 AM tomorrow
2. ✅ Production is stable right now
3. ✅ All changes frozen until after demo

**After the meeting:**
1. Begin Phase 1: Initialize Git repository
2. Complete setup in one session (2-3 hours)
3. Test deployment to dev branch first
4. Only promote to main when confirmed working

---

## Troubleshooting

### Build Fails in GitHub Actions

Check:
1. `package.json` scripts are correct
2. All dependencies in `package.json` (not just node_modules)
3. Build command works locally: `npm run build`

### Preview URL Returns 404

- Wait 2-3 minutes for deployment to complete
- Check GitHub Actions → Logs for errors
- Verify `output_location: "dist"` matches your build output

### Images Not Loading on Preview URLs

Preview environments share the same blob storage:
- `https://sparkpromptstorage.blob.core.windows.net/thumbnails/`
- Images work across all environments (production, dev, features)

---

## Rollback Plan

If something goes wrong:

```bash
# Revert to previous commit on main
git revert <commit-hash>
git push origin main
```

Or use Azure Portal → Static Web Apps → Deployments → Redeploy a previous version.

---

## Next Steps After Setup

1. ✅ Implement card spacing fixes on `feature/fix-card-spacing`
2. ✅ Test on feature preview URL
3. ✅ Merge to `dev`, test on staging
4. ✅ Merge to `main`, deploy to production
5. Document all environment URLs for team

---

## Summary

**What Peter Gets:**
- Production is LOCKED and SAFE
- All new features tested on separate URLs first
- Easy rollback if anything breaks
- Professional software development workflow
- Ability to demo changes without risk

**What You Get:**
- Freedom to experiment without fear
- Clear path to production
- Automatic deployments (no manual CLI commands)
- Preview URLs to share with Peter before merging

**Time to Complete:**
- Initial setup: 2-3 hours
- Daily use: Same as now, just with git commands instead of manual deploy

---

**Ready to implement after Oliver meeting tomorrow at 11:30 AM! ✅**
