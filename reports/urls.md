# Deployment URLs

## Status Report
Generated: 2025-10-22

### Staging (dev branch)
- URL: *pending* (deployment in progress)
- Run ID: 18729756682
- Workflow: https://github.com/W3STY11/spark-ai-prompt-library/actions/runs/18729756682

### PR Preview (#1 - feat/card-tightening)
- URL: *pending* (deployment in progress)
- Run ID: 18729773987
- Workflow: https://github.com/W3STY11/spark-ai-prompt-library/actions/runs/18729773987

### Production (FROZEN)
- URL: https://gray-ocean-059c8510f.3.azurestaticapps.net
- Status: **FROZEN** - No changes deployed
- Branch: main (local only, not pushed)

## Pull Request
- PR #1: https://github.com/W3STY11/spark-ai-prompt-library/pull/1
- Title: feat: Tighten browse page card layout
- Base: dev
- Head: feat/card-tightening

## Card Tightening Changes
Modified: src/components/BrowsePage.jsx:403-499

**Implemented:**
- Single-line header: Title · WordCount · DepartmentBadge
- Reduced vertical padding: 16px → 8px
- Absolutely positioned image indicator (no CLS)
- Title truncation with ellipsis
- Word count abbreviated inline (250w)
- Smaller badge size (size="small")
- Fits ~9 cards @ 1366×768 viewport (was ~5 cards)

## How to Get Preview URLs

Once deployments complete (2-5 minutes), run:

```bash
# Get dev staging URL
gh run view 18729756682 --log | grep -Eo 'https://[a-z0-9.-]*azurestaticapps\.net' | sort -u

# Get PR preview URL
gh run view 18729773987 --log | grep -Eo 'https://[a-z0-9.-]*azurestaticapps\.net' | sort -u
```

Expected URL patterns:
- Staging: `https://gray-ocean-059c8510f-dev.3.azurestaticapps.net`
- PR Preview: `https://gray-ocean-059c8510f-1.3.azurestaticapps.net`
