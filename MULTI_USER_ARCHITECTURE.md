# Multi-User Architecture - SPARK → M365 Copilot

## Overview

The SPARK integration is designed to be **100% safe for multiple users** with proper data isolation and no cross-user contamination.

---

## System Architecture

### Layer 1: Shared Library (Read-Only)

```
SPARK Library Server (public/prompts_index.json)
    ├── 2,425+ prompts
    ├── 9 departments
    └── Shared across ALL users
```

**Behavior:**
- ✅ All users see the SAME library
- ✅ Updates propagate to everyone
- ✅ Admins manage centrally
- ❌ Users CANNOT modify the library from M365 Copilot

---

### Layer 2: Client-Side Userscript (Per-Browser)

```
Each User's Browser
    ├── Userscript installed
    ├── Local cache (browser-specific)
    ├── Auto-refresh timer
    └── Customization state (temporary)
```

**Behavior:**
- ✅ Each browser is isolated
- ✅ Cache is per-user
- ✅ No shared state between users
- ✅ Customizations are temporary (not saved)

---

### Layer 3: Customization (Client-Side Only)

```
User Workflow:
    1. User selects prompt: "Analyze Business Cost Structure"
    2. System detects 6 variables
    3. User fills form:
        [MY BUSINESS] → "Tech Startup"
        [INDUSTRY SECTOR] → "SaaS"
        etc.
    4. Content customized IN MEMORY
    5. Inserted to M365 Copilot
    6. ❌ NOT saved back to library
```

**Key Points:**
- ✅ Customization happens in JavaScript memory
- ✅ Each user's inputs are isolated
- ✅ No persistence = no conflicts
- ✅ Original prompt unchanged in library

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  SPARK Library Server                    │
│                                                          │
│  prompts_index.json (2,425 prompts)                     │
│  ✅ Single source of truth                               │
│  ✅ Admin-managed                                         │
└─────────────────────────────────────────────────────────┘
                        │
                        │ (READ ONLY)
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌──────────────┐              ┌──────────────┐
│   User A     │              │   User B     │
│   Browser    │              │   Browser    │
└──────────────┘              └──────────────┘
│                               │
│ ┌──────────────┐             │ ┌──────────────┐
│ │ Userscript   │             │ │ Userscript   │
│ │ Cache        │             │ │ Cache        │
│ └──────────────┘             │ └──────────────┘
│                               │
│ User customizes:              │ User customizes:
│ [MY BUSINESS]                 │ [MY BUSINESS]
│ → "Tech Startup"              │ → "Coffee Shop"
│                               │
▼                               ▼
M365 Copilot                    M365 Copilot
(User A's session)              (User B's session)

❌ NO WRITE-BACK TO SERVER
✅ Library unchanged
```

---

## User Scenarios

### Scenario 1: Shared Library (Current System)

**Setup:**
- Company has 2,425 prompts in centralized library
- All employees use same prompts
- Admins manage the library

**User Experience:**
```
Employee 1: Clicks "Analyze Business Cost Structure"
           → Customizes with their business data
           → Gets customized prompt
           → ✅ Library unchanged

Employee 2: Clicks same prompt 5 minutes later
           → Sees ORIGINAL prompt with [VARIABLES]
           → Customizes with THEIR data
           → Gets THEIR customized version
           → ✅ Library still unchanged
```

**Benefits:**
- ✅ Single source of truth
- ✅ Easy to manage
- ✅ Everyone gets updates
- ✅ No data conflicts

---

### Scenario 2: User-Specific Prompts (Extension)

**What if users want PRIVATE prompts?**

Add this to userscript:

```javascript
// USER-SPECIFIC PROMPTS
window.SPARK.userPrompts = GM_getValue('user_prompts', []);

// Merge with shared library
window.SPARK.allPrompts = [
    ...window.SPARK.prompts,      // Shared library
    ...window.SPARK.userPrompts   // User's private prompts
];
```

**User Experience:**
```
Shared Library:
    ├── 2,425 prompts (everyone sees)
    └── Managed by admins

User A's Private:
    ├── 3 custom prompts
    └── Only User A sees
    └── Stored in browser (GM_setValue)

User B's Private:
    ├── 7 custom prompts
    └── Only User B sees
    └── Different browser = different storage
```

---

## Cache & Sync Behavior

### Auto-Refresh (Every 5 Minutes)

```javascript
// What happens when library is updated:

Time 0:00 - Admin adds new prompt
Time 0:01 - User A still sees old cache
Time 0:05 - User A's cache refreshes → sees new prompt ✅
Time 0:10 - User B's cache refreshes → sees new prompt ✅

// What happens when prompt is deleted:

Time 0:00 - Admin deletes prompt
Time 0:05 - All users refresh → prompt disappears ✅
```

### Cache Invalidation

```javascript
// Cache expires after 1 hour
CACHE_DURATION: 3600000 // 1 hour

// OR refresh manually:
window.SPARK.forceRefresh = async function() {
    await loadPromptsFromJSON();
    console.log('✅ Forced refresh complete');
};
```

---

## Security Considerations

### ✅ Safe Operations

1. **Reading prompts** - Safe, no side effects
2. **Caching locally** - Isolated per browser
3. **Customizing in memory** - Temporary, no persistence
4. **Inserting to Copilot** - Target application, not library

### ❌ Unsafe Operations (NOT IMPLEMENTED)

1. **Writing back to library** - Would cause conflicts
2. **Shared browser storage** - Would leak data
3. **Cross-tab state** - Would cause sync issues
4. **Server-side user sessions** - Would need auth system

---

## Database Approach (Future Enhancement)

**If you want true multi-user with private prompts:**

### Current: JSON File
```
prompts_index.json
    └── All prompts (shared)
```

### Future: Database + User Accounts
```sql
-- Shared prompts table
CREATE TABLE prompts (
    id UUID PRIMARY KEY,
    title TEXT,
    content TEXT,
    department TEXT,
    is_public BOOLEAN DEFAULT true
);

-- User-specific prompts table
CREATE TABLE user_prompts (
    id UUID PRIMARY KEY,
    user_id UUID,
    title TEXT,
    content TEXT,
    department TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Query for User A
SELECT * FROM prompts WHERE is_public = true
UNION
SELECT * FROM user_prompts WHERE user_id = 'user-a-id';

-- User A sees: Public prompts + their private prompts
-- User B sees: Public prompts + their private prompts
-- ✅ Perfect isolation
```

---

## Current Implementation Summary

### What IS Shared:
- ✅ The prompt library (2,425 prompts)
- ✅ Library updates (new/edited/deleted prompts)
- ✅ Department structure

### What is NOT Shared:
- ❌ User customizations (client-side only)
- ❌ Cache (browser-specific)
- ❌ Form inputs (temporary state)
- ❌ Usage history

### Safety Guarantees:
1. **Read-only access** - Userscript NEVER writes to library
2. **Isolated browsers** - Each user's browser is separate
3. **Temporary state** - Customizations don't persist
4. **No conflicts** - Users can't interfere with each other

---

## Testing Multi-User

### Test Case 1: Simultaneous Users

```
User A (Chrome):
    1. Opens M365 Copilot at 10:00
    2. Clicks "Analyze Business Cost Structure"
    3. Fills form with "Tech Startup"
    4. Inserts to Copilot

User B (Firefox):
    1. Opens M365 Copilot at 10:01
    2. Clicks SAME prompt
    3. Fills form with "Coffee Shop"
    4. Inserts to Copilot

Result:
    ✅ Both users get customized versions
    ✅ No interference
    ✅ Library unchanged
```

### Test Case 2: Library Updates

```
Time 10:00 - Library has 2,425 prompts
Time 10:05 - Admin adds new prompt (#2426)
Time 10:10 - User A refreshes → sees 2,426 prompts ✅
Time 10:10 - User B refreshes → sees 2,426 prompts ✅
Time 10:15 - Admin deletes prompt
Time 10:20 - Both users refresh → prompt gone ✅
```

---

## Conclusion

**Is this safe for multiple users?**

✅ **YES!** The system is designed with proper isolation:

1. **Shared library** - Everyone sees same prompts
2. **Client-side customization** - Each user's changes are private
3. **No write-back** - Library never modified by users
4. **Auto-sync** - Updates propagate to everyone
5. **Browser isolation** - No cross-contamination

**Can users have private prompts?**

📝 **Not yet, but easy to add!** See "Scenario 2" above for implementation.

**Is the library safe?**

✅ **100% safe!** The userscript is READ-ONLY. Only admins can modify the library through the admin dashboard.
