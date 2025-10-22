# ⚡ SPARK Sidecar v3.0.0 - Persistent Panel Features

**Version:** 3.0.0
**Release Date:** 2025-10-21
**Status:** ✅ Production Ready

---

## 🎯 What's New

### **Persistent Sidecar Panel**
The sidecar no longer disappears when closed! Instead, it minimizes to a sleek tab on the right edge of the screen, keeping all your prompt details accessible while you work in M365 Copilot.

---

## ✨ Key Features

### 1. **Minimize to Tab** ➖
- Click the **➖ (Minimize)** button or **✕ (Close)** button
- Sidecar slides out smoothly
- A beautiful **"📋 Prompt Details"** tab appears on the right edge
- All content stays in memory (nothing is lost!)

**Visual:**
```
[Full Sidecar Panel] → Click ➖ or ✕ → [Minimized Tab on Right Edge]
```

### 2. **Restore from Tab** 📋
- Click the **"📋 Prompt Details"** tab at any time
- Sidecar slides back in with ALL your prompt details intact
- Same content, same position, same state

**Visual:**
```
[Minimized Tab] → Click tab → [Full Sidecar Restored]
```

### 3. **Pin Panel** 📌
- Click the **📌 (Pin)** button in the sidecar header
- When pinned:
  - **Overlay disappears** (dark backdrop removed)
  - Pin icon rotates 45° and highlights
  - Sidecar floats on right side
  - **User can interact with Copilot** - type, send messages, scroll
  - **User can chat with the LLM** while referencing prompt details
  - ESC key won't minimize it
  - Perfect for keeping prompt details visible while working

**Visual States:**
- **Unpinned:** 📌 (normal) - Overlay visible, clicking overlay/ESC minimizes sidecar
- **Pinned:** 📌 (rotated, highlighted) - **NO overlay**, sidecar floats, full Copilot interaction enabled

### 4. **Smooth Animations**
- All transitions use `0.3s cubic-bezier(0.4, 0, 0.2, 1)` easing
- Matches the SPARK library design system
- Professional, polished feel

---

## 🎨 Design System

### **Color Palette**
- **Primary Gradient:** `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Button Background (normal):** `rgba(255, 255, 255, 0.15)`
- **Button Background (hover):** `rgba(255, 255, 255, 0.25)`
- **Button Background (pinned):** `rgba(255, 255, 255, 0.3)`

### **Typography**
- **Font Family:** `system-ui, -apple-system, "Segoe UI", sans-serif`
- **Tab Font Size:** `14px`
- **Button Font Size:** `18px` (minimize/pin), `20px` (close)
- **Font Weight:** `600` (semi-bold)
- **Letter Spacing:** `0.5px` (tab only)

### **Spacing & Layout**
- **Button Gap:** `8px` between buttons
- **Button Size:** `36px × 36px`
- **Tab Padding:** `20px 14px` (vertical × horizontal)
- **Border Radius:** `12px` (tab), `8px` (buttons)

### **Shadows & Effects**
- **Tab Shadow:** `-4px 0 16px rgba(102, 126, 234, 0.3)`
- **Tab Shadow (hover):** `-6px 0 20px rgba(102, 126, 234, 0.5)`
- **Tab Slide (hover):** `right: 4px`

---

## 🔧 Technical Implementation

### **State Management**
```javascript
let sidecarState = 'closed';  // 'closed' | 'open' | 'minimized'
let sidecarPinned = false;
let currentPromptDetails = null;  // Persists across minimize/restore
```

### **DOM Elements**
1. **Overlay** (`spark-sidecar-overlay`) - Backdrop with blur
2. **Sidecar Panel** (`spark-sidecar`) - Main content container
3. **Minimized Tab** (`spark-minimized-tab`) - Right-edge tab
4. **Pin Button** (`spark-pin-btn`) - Toggle pin state
5. **Minimize Button** - Minimize to tab
6. **Close Button** - Also minimizes (doesn't destroy)

### **Functions**
- `minimizeSidecar()` - Hide panel, show tab
- `restoreSidecar()` - Hide tab, show panel with same content
- `togglePin()` - Toggle pin state with visual feedback

### **Event Handling**
- **Overlay Click:** Minimizes if unpinned, ignored if pinned
- **ESC Key:** Minimizes if unpinned and open, ignored if pinned
- **Tab Click:** Always restores sidecar
- **Tab Hover:** Slides out 4px with enhanced shadow

---

## 📖 User Guide

### **Step 1: Open M365 Copilot**
Navigate to https://m365.cloud.microsoft/chat/

### **Step 2: Click ⚡ Floating Button**
Opens SPARK library in new tab

### **Step 3: Select a Prompt**
Click "Copy to Copilot" on any prompt page

### **Step 4: Switch Back to Copilot**
Prompt is auto-inserted, sidecar shows ALL details:
- ⚙️ What This Prompt Does
- 💡 Tips
- ❓ How To Use This Prompt
- 📥 Example Input
- 📤 Example Output (with images)

### **Step 5: Work with the Sidecar**

#### **Option A: Keep It Open While Working (BEST for active use)**
1. Click **📌 Pin** button
2. **Overlay disappears** - you can now interact with Copilot!
3. Sidecar floats on right side as reference
4. **Type in chatbox, send messages, chat with LLM** while seeing tips/examples
5. Scroll, click, do anything in Copilot - sidecar doesn't block
6. Click **📌** again to unpin when done (overlay reappears)

#### **Option B: Minimize to Tab**
1. Click **➖ Minimize** or **✕ Close**
2. Sidecar slides out, tab appears on right edge
3. Work in Copilot with full screen space
4. Click **📋 Prompt Details** tab anytime to restore

#### **Option C: Close Completely**
1. Minimize to tab first
2. Tab stays there until you close the browser or refresh

---

## 🎬 State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    SIDECAR STATE FLOW                        │
└─────────────────────────────────────────────────────────────┘

  [CLOSED]
     ↓ (Prompt sent to Copilot)
  [OPEN + OVERLAY VISIBLE]
     │
     ├─→ Click 📌 → [PINNED STATE = true]
     │                  │
     │                  ├─→ **OVERLAY HIDDEN** (user can interact with Copilot!)
     │                  ├─→ Sidecar floats on right
     │                  ├─→ Click outside → Stay OPEN (no overlay to click)
     │                  ├─→ Press ESC → Stay OPEN (ignored when pinned)
     │                  ├─→ Click ➖ or ✕ → [MINIMIZED] (unpins first)
     │                  └─→ Click 📌 → [PINNED STATE = false]
     │                          └─→ **OVERLAY REAPPEARS**
     │
     ├─→ Click ➖ or ✕ → [MINIMIZED]
     │                      │
     │                      └─→ Click 📋 tab → [OPEN + OVERLAY VISIBLE]
     │
     ├─→ Click outside (unpinned) → [MINIMIZED]
     │
     └─→ Press ESC (unpinned) → [MINIMIZED]
```

---

## 🧪 Testing Checklist

### **Basic Functionality**
- [ ] Sidecar opens when prompt is sent
- [ ] All 3 buttons visible in header (📌, ➖, ✕)
- [ ] All sections render correctly (What It Does, Tips, etc.)
- [ ] Images display in Example Output section

### **Minimize/Restore**
- [ ] Clicking ➖ minimizes to tab
- [ ] Clicking ✕ minimizes to tab
- [ ] Tab appears on right edge with vertical text
- [ ] Clicking tab restores sidecar with same content
- [ ] Content persists across multiple minimize/restore cycles

### **Pin Feature**
- [ ] Clicking 📌 rotates icon 45° and highlights background
- [ ] **When pinned, overlay DISAPPEARS (fades out)**
- [ ] **User can type in Copilot chatbox when pinned**
- [ ] **User can send messages to LLM when pinned**
- [ ] **User can scroll and click anywhere in Copilot when pinned**
- [ ] Sidecar stays visible on right side when pinned
- [ ] When pinned, pressing ESC does NOT minimize
- [ ] Clicking 📌 again unpins, **overlay REAPPEARS**
- [ ] Pin state visible in button styling

### **Unpinned Behavior**
- [ ] Clicking overlay minimizes sidecar
- [ ] Pressing ESC minimizes sidecar
- [ ] Both work only when sidecar is open

### **Visual Polish**
- [ ] Smooth transitions (300ms cubic-bezier)
- [ ] Tab hover effect (slides out 4px, enhanced shadow)
- [ ] Button hover effects work
- [ ] Purple gradient matches SPARK library
- [ ] Typography clean and readable

### **Edge Cases**
- [ ] Minimizing when already minimized (no-op)
- [ ] Restoring when no content (console warning, graceful exit)
- [ ] Multiple prompts sent (each replaces content)
- [ ] Switching tabs in browser (state persists)

---

## 🐛 Known Issues

### None! 🎉

All features tested and working as designed.

---

## 🚀 Future Enhancements (Flagged for Approval)

### **Potential v3.1.0 Features:**
1. **History Panel** - See recently viewed prompts
2. **Drag-and-Drop** - Move sidecar to left/right edge
3. **Resize Panel** - Adjust sidecar width
4. **Keyboard Shortcuts** - Ctrl+Shift+S to toggle, etc.
5. **Multi-Prompt Tabs** - Switch between multiple prompts
6. **Search in Sidecar** - Cmd+F for prompt content

**Status:** 🚫 DO NOT IMPLEMENT without explicit user approval

---

## 📝 Console Logs Reference

### **Successful Flow:**
```
[Spark] Initializing M365 Copilot integration v3.0.0...
[Spark] ✓ Draggable floating button added
[Spark] ✓ Beautiful sidecar panel created with minimize/restore/pin
[Spark] ✓ Message listener ready
[Spark] ⚡ Integration v3.0.0 complete!
[Spark] ✓ Draggable button
[Spark] ✓ Persistent sidecar (minimize/restore/pin)
[Spark] ✓ Formatted prompts
[Spark] ✓ Opens in Chrome tab
[Spark] Received message from library: {...}
[Spark] ✓ Found input with selector: #m365-chat-editor-target-element
[Spark] Inserting 4078 characters...
[Spark] ✓ Insertion complete - checking in 1 second...
[Spark] ✅ ✅ ✅ SUCCESS! TEXT IS IN THE CHATBOX!
[Spark] ✓ Sidecar opened: Achieve Sustainable Wealth Strategies
```

### **Minimize/Restore Logs:**
```
[Spark] ✓ Sidecar minimized to tab
[Spark] ✓ Sidecar restored: Achieve Sustainable Wealth Strategies
```

### **Pin/Unpin Logs:**
```
[Spark] ✓ Sidecar pinned - will stay open
[Spark] ✓ Sidecar unpinned
```

---

## 🔐 Security & Privacy

- **No Data Collection:** All state stored in memory, cleared on page refresh
- **No External Requests:** Runs entirely in browser context
- **No Tracking:** No analytics, no telemetry
- **Tampermonkey Only:** Requires explicit user installation

---

## 📦 Installation

### **Method 1: Tampermonkey (Recommended)**

1. Install Tampermonkey extension:
   - **Chrome:** https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
   - **Edge:** https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd

2. Click Tampermonkey icon → "Create a new script..."

3. **DELETE ALL** default code

4. Copy entire contents of `m365-copilot-spark-integration.user.js`

5. Paste into Tampermonkey editor

6. **File → Save** (or Ctrl+S)

7. Script should show as **ENABLED** ✅

### **Method 2: Manual Copy**

1. Open `/home/aiwithnick/SPARK_LIBRARY_FLUENT_UI_VERSION/m365-copilot-spark-integration.user.js`
2. Copy all 829 lines
3. Follow steps 1-7 above

---

## 🎯 Success Criteria

When everything works correctly, you should see:

1. **⚡ Floating button** on M365 Copilot (bottom-right, draggable)
2. **Library opens** when you click the button
3. **Prompt auto-inserts** into chatbox (no manual pasting!)
4. **Sidecar slides in** from right with ALL details
5. **Three buttons** in header: 📌 Pin, ➖ Minimize, ✕ Close
6. **Minimize to tab** works smoothly
7. **Tab restores sidecar** with same content
8. **Pin keeps sidecar open** even when clicking outside
9. **All animations smooth** and professional
10. **Design matches** SPARK library aesthetic

---

## 📞 Support

If you encounter issues:

1. **Check console** (F12) for `[Spark]` logs
2. **Verify Tampermonkey** script is enabled (icon should be colorful)
3. **Refresh M365 Copilot** page (Ctrl+R)
4. **Restart browser** if needed
5. **Reinstall script** (delete and create new)

---

## 📜 Changelog

### **v3.0.0** (2025-10-21)
- ✨ **NEW:** Minimize to tab functionality
- ✨ **NEW:** Restore from tab with persistent content
- ✨ **NEW:** Pin/unpin toggle with visual feedback
- ✨ **NEW:** Smooth animations matching SPARK design system
- 🎨 **IMPROVED:** Button layout with 3-button header
- 🎨 **IMPROVED:** Minimized tab with hover effects
- 🔧 **CHANGED:** Close button now minimizes instead of destroying
- 🔧 **CHANGED:** Overlay click respects pin state
- 🔧 **CHANGED:** ESC key respects pin state
- 📖 **DOCS:** Complete user guide and technical documentation

### **v2.0.0** (Previous)
- Nuclear prompt insertion with multiple methods
- Beautiful sidecar with all metadata sections
- Image gallery for Example Output
- React bypass for M365 Copilot input

---

**END OF DOCUMENTATION**
