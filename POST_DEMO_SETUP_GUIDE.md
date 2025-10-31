# Post-Demo GitHub + Azure SWA Setup Guide

> **⚠️ IMPORTANT:** Do NOT execute Phase B or beyond until AFTER the Oliver demo (Oct 23, 2025 @ 11:30 AM ET)

---

## Phase A: Read-Only Inventory (COMPLETE ✅)

**Azure Resources:**

| Resource | Name | Resource Group | Location | Status |
|----------|------|----------------|----------|--------|
| Static Web App | spark-prompt-library | spark-rg | East US 2 | ✅ Production |
| Storage Account | sparkpromptstorage | spark-rg | East US 2 | ✅ Active (2,096 images) |

**Production URLs (FROZEN - Do NOT modify):**
- SWA: `https://gray-ocean-059c8510f.3.azurestaticapps.net`
- Blob Storage: `https://sparkpromptstorage.blob.core.windows.net/thumbnails/`

**Local Project:**
- Framework: **Vite + React 18**
- Build Output: `dist/` ✅ Confirmed
- Build Command: `npm run build`
- Git Tag: `prod-freeze-2025-10-22` ✅ Created

**Commit Hash:** `6d402ef` (2,157 files, frozen snapshot)

---

## Phase B: GitHub Setup & Workflow (POST-DEMO ONLY)

### 1. Secrets & Approvals Checklist

#### Azure Portal Steps:

1. **Get Deployment Token:**
   - Navigate to: Azure Portal → Static Web Apps → `spark-prompt-library`
   - Click: **Overview → Manage deployment token**
   - Copy the token (starts with `013cb4248...`)
   - Keep this token secure!

2. **(Optional) Rotate Token:**
   ```bash
   # Only if you need to regenerate the token
   az staticwebapp secrets reset \
     --name spark-prompt-library \
     --resource-group spark-rg
   ```

#### GitHub Steps:

1. **Create Private Repository:**
   - Repository name: `spark-prompt-library`
   - Visibility: **Private**
   - Do NOT initialize with README

2. **Add Azure Secret:**
   - Go to: **Settings → Secrets and variables → Actions**
   - Click: **New repository secret**
   - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Value: [paste deployment token from Azure]
   - Click: **Add secret**

3. **Configure Production Environment:**
   - Go to: **Settings → Environments**
   - Click: **New environment**
   - Name: `production`
   - Enable: **Required reviewers**
   - Add yourself as reviewer
   - Click: **Save protection rules**

4. **Protect Main Branch:**
   - Go to: **Settings → Branches**
   - Click: **Add rule**
   - Branch name pattern: `main`
   - Enable:
     - ✅ Require a pull request before merging
     - ✅ Require status checks to pass before merging
     - ✅ Require branches to be up to date
   - Click: **Create**

5. **(Optional) Protect Dev Branch:**
   - Repeat step 4 for `dev` branch if desired

---

### 2. Ready-to-Run Command Block

**⚠️ STOP! Do NOT run these until after Oliver demo**

```bash
# === PHASE B: Execute AFTER demo GO ===

# 1. Create GitHub repository (requires gh CLI)
gh auth login  # If not already logged in

gh repo create spark-prompt-library \
  --private \
  --description "SPARK AI Prompt Library - 1,812+ professional prompts with Azure deployment" \
  --source=. \
  --remote=origin

# 2. Create dev branch locally
git checkout -b dev
git push -u origin dev

# 3. Push main branch and tags
git checkout main
git push -u origin main --tags

# 4. Verify remote setup
git remote -v
git branch -a

# === Workflow will auto-trigger on push ===
# Check: GitHub Actions tab for deployment status
```

**Alternative (if `gh` CLI not available):**
```bash
# Create repo manually via GitHub UI, then:
git remote add origin https://github.com/<YOUR_ORG>/spark-prompt-library.git
git branch -M main
git push -u origin main --tags
git checkout -b dev
git push -u origin dev
```

---

### 3. Workflow File (Already Created Locally)

**File:** `.github/workflows/swa-ci.yml`

**What it does:**
- **Dev Branch:** Auto-deploys to staging environment (`gray-ocean-059c8510f-dev.3.azurestaticapps.net`)
- **Pull Requests:** Creates preview environments for testing
- **Main Branch:** Requires manual approval before deploying to production

**Key Features:**
- Concurrency control (cancels outdated builds)
- Production environment requires reviewer approval
- Separate jobs for dev/preview vs production
- Uses official Azure Static Web Apps action

---

## Phase C: First UI Tightening (Code-Only, No Prod Deploy)

### Task: Fix Browse Page Card Spacing

**Target:** `src/components/BrowsePage.jsx`

**Requirements:**
1. ✅ Single-line header row (Title · WordCount · DepartmentBadge)
2. ✅ Reduce vertical whitespace (trim padding)
3. ✅ Image indicator must not change card height
4. ✅ At ~1366×768, show ~9 cards without header wrapping
5. ✅ Long titles truncate with ellipsis
6. ✅ No layout shift when indicator appears

**Branch:** `feat/card-tightening` (created from `dev`)

**Commands:**
```bash
# Create feature branch
git checkout dev
git pull origin dev
git checkout -b feat/card-tightening

# Make changes to BrowsePage.jsx
# ... edit files ...

# Commit and push
git add src/components/BrowsePage.jsx
git commit -m "feat: Tighten browse page card layout

- Single-line header with title truncation
- Reduced vertical padding from 20px to 8px
- Absolutely positioned image indicator (no reflow)
- Fits 9 cards @ 1366×768 viewport"

git push -u origin feat/card-tightening

# Create PR to dev (not main!)
gh pr create \
  --base dev \
  --head feat/card-tightening \
  --title "feat: Tighten browse page card layout" \
  --body "Implements card spacing improvements per Peter's feedback.

## Changes
- Single-line header row with ellipsis truncation
- Reduced padding: 20px → 8px (top/bottom)
- Image indicator: absolute positioning (no layout shift)

## Testing
- ✅ 9 cards visible @ 1366×768
- ✅ No header wrapping
- ✅ Long titles truncate gracefully

## Preview URL
Will be generated after PR created"
```

**Expected Result:**
- GitHub Actions builds and deploys to preview URL
- Share preview URL + screenshots with Peter
- Do NOT merge until approved

---

## Phase D: Post-Demo Verification

### After Oliver Meeting, Check:

1. ✅ Production still working: `https://gray-ocean-059c8510f.3.azurestaticapps.net`
2. ✅ Tampermonkey integration still functional
3. ✅ Images loading from blob storage
4. ✅ No errors in browser console

### After GitHub Push, Verify:

1. ✅ GitHub Actions workflow ran successfully
2. ✅ Dev environment deployed: `gray-ocean-059c8510f-dev.3.azurestaticapps.net`
3. ✅ Production environment still on `main` branch
4. ✅ No unintended deployments to production

---

## Environment URLs Reference

| Environment | Branch | URL Pattern |
|-------------|--------|-------------|
| **Production** | `main` | `https://gray-ocean-059c8510f.3.azurestaticapps.net` |
| **Staging** | `dev` | `https://gray-ocean-059c8510f-dev.3.azurestaticapps.net` |
| **Feature** | `feat/*` | `https://gray-ocean-059c8510f-<branch-name>.3.azurestaticapps.net` |
| **Pull Request** | PR #N | `https://gray-ocean-059c8510f-N.3.azurestaticapps.net` |

---

## Rollback Plan

If anything goes wrong:

```bash
# Revert to frozen snapshot
git reset --hard prod-freeze-2025-10-22
git push origin main --force  # Only if absolutely necessary

# Or revert specific commit
git revert <commit-hash>
git push origin main
```

**Azure Portal Rollback:**
- Static Web Apps → Deployments → Select previous version → Redeploy

---

## Support & Troubleshooting

**GitHub Actions Fails:**
- Check: Actions tab → View logs
- Common issues: Missing secret, incorrect build command, wrong output path

**Preview URL 404:**
- Wait 2-3 minutes for deployment
- Check: Azure Portal → Static Web Apps → Environments

**Production Accidentally Modified:**
- Use branch protection rules (should prevent direct pushes)
- Revert via git or Azure Portal

---

**Ready for GO signal after Oliver demo! 🚀**
