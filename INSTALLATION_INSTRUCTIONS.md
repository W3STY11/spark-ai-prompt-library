# ⚡ SPARK M365 Copilot Integration - Installation Instructions

## What This Does

When you click "Copy to Copilot" on ANY prompt in the SPARK library:

1. **✅ Prompt text AUTOMATICALLY appears in M365 Copilot chatbox** (no manual pasting)
2. **✅ Sidecar panel opens on the right** showing ALL prompt details:
   - ⚙️ What This Prompt Does
   - 📖 How To Use This Prompt
   - 📥 Example Input
   - 📤 Example Output
   - 🖼️ Example Images (if available)
   - 💡 Pro Tips
   - 🏷️ Tags
   - ✓ Success message

---

## Installation Steps

### Step 1: Install Tampermonkey

1. Open your browser (Chrome or Edge)
2. Install Tampermonkey extension:
   - **Chrome**: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
   - **Edge**: https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd
3. Click "Add to Browser"

### Step 2: Install the SPARK Script

1. Click the **Tampermonkey icon** in your browser toolbar
2. Select **"Create a new script..."**
3. **DELETE ALL** the default code in the editor
4. Open this file in a text editor:
   ```
   /home/aiwithnick/SPARK_LIBRARY_FLUENT_UI_VERSION/m365-copilot-spark-integration.user.js
   ```
5. **Copy the ENTIRE file** (all ~570 lines)
6. **Paste** into Tampermonkey editor
7. **Save** (Ctrl+S or File → Save)
8. The script should show as **ENABLED** with a green indicator

### Step 3: Start SPARK Library

Make sure SPARK is running:

```bash
cd /home/aiwithnick/SPARK_LIBRARY_FLUENT_UI_VERSION
npm start
```

Verify:
- Frontend: http://localhost:3000 (should show SPARK library)
- API: http://localhost:3001/api/prompts (should show JSON data)

### Step 4: Test It

1. Open M365 Copilot: **https://m365.cloud.microsoft/chat/**
2. Wait 2-3 seconds for page to load
3. You should see a **⚡ floating button** in the bottom-right corner
4. **Click the ⚡ button** → SPARK library opens in new tab
5. Browse to ANY prompt (e.g., search for "wealth")
6. Click on a prompt card to open details
7. Click **"Copy to Copilot"** button (purple gradient button)
8. **Switch back to M365 Copilot tab**
9. You should see:
   - ✅ Prompt text in the chatbox (4,000+ characters)
   - ✅ Sidecar panel on the right with ALL details
   - ✅ Send button is blue/active

---

## How It Works

### Communication Flow

```
M365 Copilot (Tab 1)
    ↓ Click ⚡ button
SPARK Library (Tab 2 - window.opener points to Tab 1)
    ↓ Click "Copy to Copilot"
    ↓ window.opener.postMessage({ type: 'SPARK_SEND_TO_COPILOT', promptText, promptDetails })
M365 Copilot (Tab 1)
    ↓ Tampermonkey script receives message
    ↓ insertPromptText() → directly manipulates <p> element in #m365-chat-editor-target-element
    ↓ openSidecar() → displays all prompt metadata
Result: Prompt in chatbox + Sidecar with details
```

### Key Technical Details

**Input Selector**: `#m365-chat-editor-target-element`

**Insertion Method**: Direct manipulation of the `<p>` element inside the contenteditable div to bypass React's state management:

```javascript
const p = inputElement.querySelector('p');
p.textContent = formattedPrompt;
p.innerText = formattedPrompt;
inputElement.dispatchEvent(new Event('input', { bubbles: true }));
inputElement.dispatchEvent(new Event('change', { bubbles: true }));
```

**Message Protocol**:
```javascript
{
    type: 'SPARK_SEND_TO_COPILOT',
    promptText: '...', // Full prompt content
    promptDetails: {
        title: '...',
        icon: '...',
        department: '...',
        subcategory: '...',
        complexity: '...',
        word_count: 0,
        description: '...',
        tips: [...],
        tags: [...],
        metadata: {
            whatItDoes: '...',
            howToUse: '...',
            exampleInput: '...',
            exampleOutput: '...'
        },
        images: [...]
    }
}
```

---

## Troubleshooting

### ❌ Floating button doesn't appear

**Check:**
1. Is Tampermonkey enabled? (icon should be colorful, not gray)
2. Is the script enabled in Tampermonkey dashboard?
3. Refresh M365 Copilot page (Ctrl+R)
4. Open console (F12) and look for: `[Spark] ⚡ Integration v2.0.0 complete!`

### ❌ Prompt doesn't appear in chatbox

**Check:**
1. Did you open library by clicking the ⚡ button? (NOT by manually typing localhost:3000)
2. Open console (F12) on M365 Copilot tab
3. Look for these logs after clicking "Copy to Copilot":
   - `[Spark] Received message from library:`
   - `[Spark] ✓ Text inserted into paragraph element`
   - `[Spark] ✓ Prompt inserted successfully: XXXX characters`
4. If you see "Input element not found" → Microsoft changed the selector
5. Inspect the DOM and find the actual input element ID/selector

**Manual Fix:**
If insertion fails, the script automatically copies to clipboard. Just press **Ctrl+V** in the chatbox.

### ❌ Sidecar doesn't appear

**Check:**
1. Did the prompt successfully insert? (sidecar only opens after successful insertion)
2. Open console and look for: `[Spark] ✓ Sidecar opened: [Prompt Title]`
3. Check if sidecar elements exist:
   - Open DevTools (F12)
   - Elements tab
   - Search for `spark-sidecar` and `spark-sidecar-overlay`
4. If elements exist but not visible, check their `style.right` and `style.display` properties

### ❌ Missing metadata in sidecar

**Check:**
1. Does the prompt have metadata? (some older prompts might not)
2. Open console and check the message received:
   - Look for `[Spark] Received message from library:`
   - Expand the object and verify `promptDetails.metadata` exists
3. If metadata is missing → The prompt needs to be re-imported with rich content

---

## Keyboard Shortcuts

- **ESC** → Close sidecar
- **Click overlay** → Close sidecar

---

## Script Files

| File | Purpose |
|------|---------|
| `m365-copilot-spark-integration.user.js` | Main Tampermonkey script (install this) |
| `INSTALLATION_INSTRUCTIONS.md` | This guide |
| `COPILOT_INTEGRATION_FINDINGS.md` | Technical findings and testing notes |
| `TAMPERMONKEY_INSTALLATION_GUIDE.md` | Detailed installation guide |
| `test-copilot-integration.html` | Standalone test page |
| `src/components/ViewPage.jsx` | SPARK library component that sends prompts |

---

## What You Should See

### M365 Copilot Before:
- Empty chatbox
- ⚡ floating button in bottom-right

### After Clicking "Copy to Copilot":
- **Chatbox filled** with full prompt text (formatted with line breaks)
- **Sidecar panel** on right side showing:
  - Icon + Title + Department badge
  - Complexity level
  - Word count
  - Description
  - What It Does (blue card)
  - How To Use (purple card)
  - Example Input (green card)
  - Example Output (yellow card)
  - Example Images (pink card with image grid)
  - Pro Tips (golden card)
  - Tags (colorful pills)
  - Success message (green)
- **Send button** is active/blue
- **Ready to customize** placeholders and send!

---

## Success Criteria

✅ Floating ⚡ button visible on M365 Copilot
✅ Clicking button opens SPARK library in new tab
✅ Clicking "Copy to Copilot" inserts prompt automatically
✅ NO manual Ctrl+V pasting required
✅ Sidecar shows ALL prompt details
✅ Images display if available
✅ Works with ANY prompt in the library

---

## Version

**Script Version**: 2.0.0
**Last Updated**: 2025-10-21
**Status**: ✅ FULLY FUNCTIONAL

---

## Support

If you encounter issues:
1. Check browser console for [Spark] logs
2. Verify SPARK is running on localhost:3000/3001
3. Try refreshing both tabs
4. Disable/re-enable Tampermonkey script
5. Clear browser cache and reinstall script
