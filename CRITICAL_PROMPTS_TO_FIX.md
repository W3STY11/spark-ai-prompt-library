# CRITICAL PROMPTS REQUIRING MANUAL FIX

**Status**: 7 prompts with empty content/descriptions need attention
**Date**: 2025-10-20
**Priority**: HIGH

---

## 1. "Create Retirement Planning Strategy" (Index 105)
- **ID**: `prompt_1729272799000_abc123` (check actual ID)
- **Department**: Finance
- **Issue**: ❌ **Empty description**
- **Action Required**: Add a proper description
- **Status**: Content exists but description is blank

---

## 2. "Improve Competitive Comparison Angles" (Index 528)
- **Department**: Marketing
- **Issue**: ❌ **Empty content** (word_count says 1 but content is empty)
- **Action Required**: Add the full prompt content OR delete if invalid
- **Status**: Description exists but NO CONTENT

---

## 3. "Untitled" (Index 574)
- **Department**: Unknown
- **Issue**: ❌ **Empty description AND empty content**
- **Action Required**: **DELETE THIS PROMPT** - completely empty
- **Status**: Invalid entry, should be removed

---

## 4. "Optimize Website Breadcrumb Navigation" (Index 1058)
- **Department**: SEO
- **Issue**: ❌ **Empty description**
- **Action Required**: Add a proper description
- **Status**: Content exists but description is blank

---

## 5. "Create A Professional Resume" (Index 1618)
- **Department**: Education
- **Issue**: ❌ **Empty description AND empty content**
- **Action Required**: Add full content and description OR delete if invalid
- **Status**: Completely empty, should probably be deleted

---

## 6. "Create Insightful Interview Questions" (Index 1724)
- **Department**: Education
- **Issue**: ❌ **Empty description**
- **Action Required**: Add a proper description
- **Status**: Content exists but description is blank

---

## 7. "Expand Your Vocabulary" (Index 1841)
- **Department**: Education
- **Issue**: ❌ **Empty content** (word_count says 1 but content is empty)
- **Action Required**: Add the full prompt content OR delete if invalid
- **Status**: Description exists but NO CONTENT

---

## Summary of Actions Needed

### Delete (2 prompts - completely empty):
1. "Untitled" (Index 574) - No description, no content
2. "Create A Professional Resume" (Index 1618) - No description, no content

### Fix - Add Description (4 prompts):
1. "Create Retirement Planning Strategy" (Index 105)
2. "Optimize Website Breadcrumb Navigation" (Index 1058)
3. "Create Insightful Interview Questions" (Index 1724)

### Fix - Add Content (2 prompts):
1. "Improve Competitive Comparison Angles" (Index 528)
2. "Expand Your Vocabulary" (Index 1841)

---

## How to Fix Via Admin Dashboard

1. Navigate to http://localhost:3002/admin-login
2. Login with password: `sparkadmin2025`
3. Go to Admin Dashboard
4. Search for each prompt by title
5. Either:
   - Click "Edit" and fill in missing content/description
   - Click "Delete" to remove invalid entries
6. Run validation again: `node scripts/validate-prompts.mjs`

---

## Note on Warnings (94 prompts)

94 prompts are missing standard structure markers (#CONTEXT:, #ROLE:, etc.) but this is **NOT critical**. These prompts still work perfectly fine, they just use a different format. No action required unless you want to standardize all prompts to the same format.

---

**After fixing these 7 issues, you'll have 100% valid prompts! 🎯**
