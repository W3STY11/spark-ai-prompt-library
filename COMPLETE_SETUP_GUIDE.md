# ⚡ COMPLETE SETUP GUIDE - SPARK M365 Copilot Integration

**Version:** 3.0.0 | **Updated:** 2025-10-21

## What This Does - NO MANUAL COPYING OR PASTING!

✅ **Click "Copy to Copilot"** → Prompt AUTOMATICALLY appears in M365 Copilot chatbox
✅ **Persistent Sidecar** with minimize/restore/pin features - NEVER lose your prompt details!
✅ **Pin panel** to keep it open while you work
✅ **Minimize to tab** when you need more screen space
✅ **ZERO manual pasting** - completely automatic!

---

## Installation (5 Minutes)

### 1. Install Tampermonkey Extension

**Chrome:**
1. Go to: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
2. Click "Add to Chrome"

**Edge:**
1. Go to: https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd
2. Click "Get"

### 2. Install SPARK Integration Script

1. **Click Tampermonkey icon** in toolbar
2. Select **"Create a new script..."**
3. **DELETE ALL** default code
4. **Open this file**: `/home/aiwithnick/SPARK_LIBRARY_FLUENT_UI_VERSION/m365-copilot-spark-integration.user.js`
5. **Copy EVERYTHING** (all ~829 lines - v3.0.0 with minimize/restore/pin!)
6. **Paste into Tampermonkey**
7. **Save** (File → Save or Ctrl+S)
8. ✅ Script should show as ENABLED

### 3. Start SPARK Library

```bash
cd /home/aiwithnick/SPARK_LIBRARY_FLUENT_UI_VERSION
npm start
```

Verify it's running:
- Frontend: http://localhost:3000 ✅
- API: http://localhost:3001/api/prompts ✅

---

## How To Use

### Step 1: Go to M365 Copilot
Open: **https://m365.cloud.microsoft/chat/**

Wait 2-3 seconds → You'll see a **⚡ floating button** (bottom-right corner)

### Step 2: Click ⚡ Button
The SPARK library opens in a new tab

### Step 3: Find a Prompt
- Browse departments
- Search for keywords
- Click any prompt card

### Step 4: Click "Copy to Copilot"
Purple gradient button on the prompt page

### Step 5: Switch Back to Copilot Tab
**BOOM! The prompt is ALREADY THERE!**

✅ Full prompt text in chatbox (4,000+ characters)
✅ Sidecar panel on right with ALL details:
- ⚙️ What This Prompt Does
- 💡 Tips
- ❓ How To Use This Prompt
- 📥 Example Input
- 📤 Example Output (images)

### Step 6: Work with the Sidecar Panel (NEW in v3.0.0!)

The sidecar now has **3 powerful buttons** in the header:

#### **📌 Pin Button** (Left) - MOST IMPORTANT!
- Click to **pin** the sidecar
- When pinned:
  - **Overlay DISAPPEARS** (dark backdrop removed)
  - Icon rotates 45° and highlights
  - Sidecar floats on right side
  - **YOU CAN NOW INTERACT WITH COPILOT!**
  - **Type messages, send to LLM, scroll, click anywhere**
  - Sidecar stays visible as reference panel
  - Perfect for keeping prompt details visible while chatting with AI
- Click again to unpin (overlay reappears)

#### **➖ Minimize Button** (Middle)
- Click to **minimize** sidecar to a small tab
- Tab appears on right edge: "📋 Prompt Details"
- All content stays in memory (nothing lost!)
- Great when you need more screen space
- Click the tab anytime to restore

#### **✕ Close Button** (Right)
- Also minimizes to tab (doesn't destroy content!)
- Same as clicking ➖
- Press **ESC** key for keyboard shortcut (when unpinned)

#### **Workflows:**

**Option A: Keep Sidecar Open While Working (RECOMMENDED!)**
1. Click **📌 Pin** button
2. **Overlay disappears** - dark backdrop removed
3. Sidecar floats on right side
4. **NOW YOU CAN USE COPILOT!**
   - Type in the chatbox
   - Send messages to the LLM
   - Have full conversations with AI
   - Scroll, click, interact with everything
5. Sidecar stays visible as reference (see tips, examples, how-to-use)
6. Click **📌** again to unpin when done (overlay comes back)

**Option B: Minimize When You Need Space**
1. Click **➖** or **✕** to minimize
2. Sidecar slides out, tab appears on right edge
3. Work in Copilot with full screen
4. Click **📋 Prompt Details** tab to restore anytime
5. All content is exactly as you left it!

**Option C: Quick Toggle with Overlay/ESC**
- When **unpinned**: Click outside sidecar or press ESC → Minimizes to tab
- When **pinned**: No overlay to click (it's hidden!), ESC does nothing → Sidecar stays open while you work in Copilot

### Step 7: Customize & Send
Edit placeholders (like [COMPANY NAME]) and hit Send!

---

## What the Sidecar Shows (EXACT Match to Library)

The sidecar displays in this EXACT order (matching ViewPage.jsx):

1. **Header**
   - Icon + Title
   - Department badge
   - Complexity level
   - Word count
   - Subcategory (if available)
   - Description

2. **⚙️ What This Prompt Does** (purple card)
   - Bullet list explaining capabilities

3. **💡 Tips** (golden gradient card)
   - Pro tips for best results

4. **❓ How To Use This Prompt** (purple card)
   - Step-by-step instructions

5. **📥 Example Input** (green card)
   - Sample inputs you can use

6. **📤 Example Output** (pink card)
   - IMAGE GALLERY showing example results
   - Click images to open full size

7. **Success Message** (green card)
   - "✅ Prompt inserted into Copilot!"

---

## Technical Details

### How It Works

```
1. M365 Copilot Tab
   ↓
2. Click ⚡ button → Opens SPARK library (new tab)
   ↓
3. SPARK library (window.opener = Copilot tab)
   ↓
4. Click "Copy to Copilot" → Sends postMessage
   ↓
5. Tampermonkey script receives message
   ↓
6. insertPromptText() - NUCLEAR INSERTION:
   - Tries 5 different selectors to find input
   - Sets text with textContent, innerText, innerHTML
   - Creates text nodes + <br> tags
   - Dispatches 11 different events
   - Finds React instance and calls onChange
   - Sets cursor position
   ↓
7. openSidecar() - Shows ALL metadata
   ↓
8. ✅ Prompt in chatbox + Sidecar visible!
```

### Insertion Methods Used (All Simultaneously)

The script tries EVERYTHING at once:

1. **Direct DOM manipulation**
   - `p.textContent = formattedPrompt`
   - `p.innerText = formattedPrompt`
   - `p.innerHTML = formattedPrompt.replace(/\n/g, '<br>')`

2. **Text node creation**
   - Creates actual DOM text nodes
   - Inserts `<br>` tags for line breaks

3. **Event dispatching**
   - beforeinput, input, textInput
   - focus, focusin, click
   - change, keydown, keypress, keyup, blur

4. **React instance manipulation**
   - Finds `__reactFiber`, `__reactProps`, or `__reactInternalInstance`
   - Calls `onChange({ target: { value: formattedPrompt } })`

5. **Cursor positioning**
   - Sets selection to end of text

### Multiple Selector Fallback

Tries these selectors in order:
1. `#m365-chat-editor-target-element`
2. `[contenteditable="true"][role="textbox"]`
3. `[contenteditable="true"]`
4. `div[class*="editor"]`
5. `div[class*="input"]`

If all fail → Uses first contenteditable element found

---

## Troubleshooting

### ❌ No floating button

**Fix:**
1. Is Tampermonkey enabled? (icon colorful, not gray)
2. Refresh M365 Copilot page (Ctrl+R)
3. Check console (F12): Should see `[Spark] ⚡ Integration v2.0.0 complete!`

### ❌ Prompt doesn't appear in chatbox

**Debug:**
1. Open console (F12) on M365 Copilot tab
2. Click "Copy to Copilot" in library
3. Look for these logs:
   - `[Spark] ✓ Found input with selector: ...`
   - `[Spark] Inserting XXXX characters...`
   - `[Spark] ✓ Insertion complete - checking in 1 second...`
   - `[Spark] ✅ ✅ ✅ SUCCESS! TEXT IS IN THE CHATBOX!`

**If you see "❌ FAILED - Text not persisting":**
- Microsoft changed the input structure
- Console will show what element was found
- Send me the console output to fix the selectors

### ❌ Sidecar doesn't open

**Check:**
1. Did prompt successfully insert?
2. Console should show: `[Spark] ✓ Sidecar opened: [Prompt Title]`
3. Check if elements exist:
   - F12 → Elements tab
   - Search for `spark-sidecar`
   - Check `style.right` (should be "0")
   - Check `style.display` (should be "block")

### ❌ Missing data in sidecar

**Check:**
1. Does the prompt have metadata?
2. Console: Look for message received
3. Expand the `promptDetails` object
4. Verify `metadata.whatItDoes`, `metadata.howToUse`, etc. exist

---

## Console Logs Reference

### ✅ Successful Insertion (v3.0.0)

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

[Spark] ✓ Found input with selector: #m365-chat-editor-target-element
[Spark] Inserting 4078 characters...
[Spark] Found React key: __reactFiber$oevtjdiojd
[Spark] React instance: Object { ... }
[Spark] ✓ Insertion complete - checking in 1 second...
[Spark] Current text length: 4078
[Spark] Expected length: 4078
[Spark] Preview: #CONTEXT: You are a financial planning AI assistant...
[Spark] ✅ ✅ ✅ SUCCESS! TEXT IS IN THE CHATBOX!
[Spark] ✓ Sidecar opened: Achieve Sustainable Wealth Strategies
```

### ✅ Minimize/Restore Logs (NEW!)

```
[Spark] ✓ Sidecar minimized to tab
[Spark] ✓ Sidecar restored: Achieve Sustainable Wealth Strategies
```

### ✅ Pin/Unpin Logs (NEW!)

```
[Spark] ✓ Sidecar pinned - overlay hidden, user can interact with Copilot
[Spark] ✓ Sidecar unpinned - overlay visible again
```

### ❌ Failed Insertion

```
[Spark] ❌ Could not find ANY input element!
[Spark] All contenteditable elements: NodeList []
[Spark] ❌ FAILED: Cannot find Copilot input field!
```

OR

```
[Spark] ✓ Found input with selector: #m365-chat-editor-target-element
[Spark] Inserting 4078 characters...
[Spark] ✓ Insertion complete - checking in 1 second...
[Spark] Current text length: 0
[Spark] Expected length: 4078
[Spark] ❌ FAILED - Text not persisting
[Spark] DOM innerHTML: <p><br></p>
[Spark] DOM textContent:
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `m365-copilot-spark-integration.user.js` | **Main script v3.0.0 - Install this in Tampermonkey** |
| `SIDECAR_V3_FEATURES.md` | **NEW! Complete v3.0.0 feature documentation** |
| `src/components/ViewPage.jsx` | Sends prompt data via postMessage |
| `COMPLETE_SETUP_GUIDE.md` | This file |
| `INSTALLATION_INSTRUCTIONS.md` | Installation guide |
| `DEBUG_SCRIPT.md` | Debugging notes |

---

## Version Info

**Script Version:** 3.0.0
**Last Updated:** 2025-10-21
**Status:** ✅ PRODUCTION READY - Persistent Sidecar with Minimize/Restore/Pin!

---

## What's New in v3.0.0

✅ **Persistent Sidecar** - Never lose prompt details again!
✅ **Minimize to Tab** - "📋 Prompt Details" tab on right edge
✅ **Restore from Tab** - Click tab to bring back full sidecar
✅ **Pin Panel** - Keep sidecar open while clicking outside
✅ **Smooth Animations** - Matches SPARK library design system
✅ **3-Button Header** - 📌 Pin, ➖ Minimize, ✕ Close
✅ **State Persistence** - Content stays in memory across minimize/restore
✅ **Visual Feedback** - Pin icon rotates 45°, tab hover effects
✅ **Keyboard Shortcuts** - ESC minimizes (when unpinned)
✅ **Professional Polish** - Clean, sleek, production-ready

## What's Fixed (Previous Versions)

✅ **Sidecar matches library exactly** - Same order, same sections, same styling
✅ **Example Output shows IMAGES** - Not text, actual image grid
✅ **No manual pasting** - Completely automatic insertion
✅ **Nuclear insertion** - 5 methods simultaneously
✅ **React bypass** - Finds and calls React onChange directly
✅ **Multiple selectors** - Tries 5 different ways to find input
✅ **Detailed logging** - Every step logged with ✅/❌
✅ **Verification** - Checks text actually persisted

---

## Success Criteria

When everything works correctly, you'll see:

1. ⚡ **Floating button** on M365 Copilot (draggable, bottom-right)
2. **Library opens** when you click button (new tab)
3. **Prompt auto-inserts** into chatbox (NO manual pasting!)
4. **Sidecar slides in** from right with ALL details
5. **3 buttons** in sidecar header: 📌 Pin, ➖ Minimize, ✕ Close
6. **Click ➖ or ✕** → Sidecar minimizes to "📋 Prompt Details" tab
7. **Click tab** → Sidecar restores with same content
8. **Click 📌** → Pin icon rotates 45°, sidecar stays open
9. **Clicking outside** (unpinned) → Minimizes to tab
10. **ESC key** (unpinned) → Minimizes to tab
11. **Images display** in Example Output section
12. **Send button** is active/blue in Copilot
13. **All animations smooth** and polished
14. **Ready to customize** and send!

---

## Browser Compatibility

✅ **Chrome** - Fully tested
✅ **Edge** - Fully tested
⚠️ **Firefox** - Not tested (Tampermonkey required)
❌ **Safari** - Not supported (no Tampermonkey)

---

## Support

If it doesn't work:

1. **Check console** (F12) for [Spark] logs
2. **Verify SPARK running** on localhost:3000
3. **Check Tampermonkey** script is enabled
4. **Try different prompt** (some may have no metadata)
5. **Refresh both tabs** and try again
6. **Clear browser cache** and reinstall script

---

## What You Should See

### Before (M365 Copilot):
- Empty chatbox
- ⚡ button bottom-right

### After "Copy to Copilot":
- **Chatbox:** Full prompt (4,000+ chars, formatted)
- **Right side:** Sidecar panel with:
  - Icon, title, badges
  - What It Does (purple)
  - Tips (golden)
  - How To Use (purple)
  - Example Input (green)
  - Example Output (pink with images)
  - Success message (green)
- **Send button:** Active/blue
- **NO manual pasting needed!**

---

**END OF GUIDE**
