**QA — Card Tightening (PR #1)**

URLs
- Staging (dev): https://gray-ocean-059c8510f-dev.eastus2.3.azurestaticapps.net
- PR Preview: https://gray-ocean-059c8510f-1.eastus2.3.azurestaticapps.net

Automated Checks
- ✅ Both URLs return HTTP 200
- ✅ React Router navigation working (fixed: staticwebapp.config.json now in dist/)
- ✅ Card grid layout rendering
- ✅ Department badges displaying

Visual Verification Needed @1366×768
- ⚠️  **6 cards visible** (not ~9) — card height may need further reduction
- ✅ Header is 1 line (Title · WordCount · Department) — long titles truncate
- ✅ Image indicator overlay produces no layout shift (CLS)
- ✅ Font sizes appear unchanged (spacing tightened)
- 🔍 Consistent card heights after department filter — **needs manual test**

Screenshots
- `reports/preview-1366x768.png` - Homepage
- `reports/browse-1366x768.png` - Browse page with cards

Notes
- Routing fix required copying staticwebapp.config.json to dist/ (commit 6f77348)
- Card count lower than expected — may need to reduce card min-height or padding
- Manual testing recommended for department filter consistency

_No production changes. Main remains at 73f87fd (unpushed)._
