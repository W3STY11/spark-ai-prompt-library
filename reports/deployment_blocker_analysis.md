# Deployment Blocker Analysis

## Current Status: FAILED ❌

Both dev and PR preview deployments continue to fail with size limit exceeded (500 MB).

### Root Cause Analysis

**Issue:** Even with `skip_app_build: true` and 300 sampled prompts, the deployment still exceeds 500 MB.

**Why:**
1. ✅ Oryx rebuild is now skipped (confirmed in logs)
2. ✅ CI prep script downloads and samples to 300 prompts
3. ❌ **BUT** the sampled prompts_index.json contains FULL HTML CONTENT for all 300 prompts

The production `prompts_index.json` includes complete HTML content in the `content` field for each prompt. Even 300 prompts with full HTML content = massive file size.

### Failed Runs:
- Dev (18730939252): Failed with "size too large" error
- PR (18730943644): Likely will also fail for same reason

### Solution Required

The `ci-prep.mjs` script needs to:
1. Download production prompts_index.json ✅ (already doing this)
2. Sample to 300 prompts ✅ (already doing this)  
3. **NEW:** Strip out the `content` field from each prompt to reduce size dramatically
4. Keep only: id, title, department, subcategory, description, tags, word_count, complexity

### Estimated Impact
- Current: 300 prompts × ~20-50 KB HTML each = 6-15 MB just for content
- After stripping content: 300 prompts × ~500 bytes metadata = ~150 KB

This should bring the total `dist` folder well under the 500 MB limit.

### Next Steps
1. Update `ci-prep.mjs` to strip content field during sampling
2. Commit and push fix
3. Retrigger CI deployments
4. Monitor for success

### Production Status
- ✅ main branch: NEVER pushed (production frozen)
- ✅ Production URL unchanged: https://gray-ocean-059c8510f.3.azurestaticapps.net
