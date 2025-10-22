# SPARK Prompt Library - Tampermonkey Integration Guide (Azure Edition)

## Overview

This Tampermonkey script integrates your **Azure-hosted SPARK Prompt Library** with Microsoft 365 Copilot and Teams Copilot, allowing you to insert prompts directly into the Copilot chat interface with a beautiful sidecar panel showing all prompt details.

## What's New in Azure Edition (v3.1.0)

✅ **Updated URLs:**
- Library: `https://gray-ocean-059c8510f.3.azurestaticapps.net`
- Images: `https://sparkpromptstorage.blob.core.windows.net/thumbnails/`

✅ **Added Teams Support:**
- Now works on both M365 Chat AND Teams Copilot
- `@match https://teams.microsoft.com/*`

✅ **Secure Origin Checking:**
- Accepts messages from Azure Static Web Apps
- Accepts messages from Azure Blob Storage
- Rejects all other origins

✅ **Azure Blob Storage Images:**
- All example output images load from blob storage
- Click to open full-size in new tab

## Installation Steps

### 1. Install Tampermonkey Browser Extension

**Chrome/Edge:**
- Visit: https://www.tampermonkey.net/
- Click "Download" → Select your browser
- Install the extension

**Firefox:**
- Visit: https://addons.mozilla.org/firefox/addon/tampermonkey/
- Click "Add to Firefox"

### 2. Install the SPARK Integration Script

1. **Open Tampermonkey Dashboard:**
   - Click the Tampermonkey icon in your browser toolbar
   - Select "Dashboard"

2. **Create New Script:**
   - Click the "+" icon (Create a new script)
   - Delete the default template

3. **Copy the Script:**
   - Open the file: `m365-copilot-spark-integration-AZURE.user.js`
   - Select all content (Ctrl+A / Cmd+A)
   - Copy (Ctrl+C / Cmd+C)

4. **Paste and Save:**
   - Paste into the Tampermonkey editor
   - Click "File" → "Save" (or Ctrl+S / Cmd+S)
   - The script should now show as "Enabled"

### 3. Verify Installation

1. **Navigate to M365 Copilot:**
   - Go to: https://m365.cloud.microsoft/chat/
   - OR: https://teams.microsoft.com/ (in a chat with Copilot)

2. **Look for the Button:**
   - You should see a purple ⚡ button in the bottom-right corner
   - It should pulse gently

3. **Check Console:**
   - Press F12 to open DevTools
   - Go to "Console" tab
   - You should see: `[Spark] ⚡ Integration v3.1.0 (Azure) complete!`

## How to Use

### Opening the Prompt Library

**Click the ⚡ Button:**
- Opens your SPARK library in a new tab
- URL: https://gray-ocean-059c8510f.3.azurestaticapps.net

### Sending a Prompt to Copilot

1. **In the SPARK Library:**
   - Browse or search for a prompt
   - Click to view full details
   - Click "Copy to Copilot" button

2. **Automatic Actions:**
   - Prompt text inserts into Copilot editor
   - Sidecar panel opens on the right showing:
     - ⚡ Prompt title and metadata
     - ⚙️ What This Prompt Does
     - 💡 Tips
     - ❓ How To Use This Prompt
     - 📥 Example Input
     - 📤 Example Output (with images)
   - ⚡ Button turns GREEN (sidecar open)

3. **In Copilot:**
   - Customize any placeholders in the prompt
   - Press Send or Enter

### Sidecar Controls

**📌 Pin Button:**
- Pins the sidecar so you can interact with Copilot
- Hides the dark overlay
- Keeps prompt details visible while working

**➖ Minimize Button:**
- Collapses sidecar to a small edge tab
- ⚡ Button turns AMBER with a small badge
- Click ⚡ button or edge tab to restore

**✕ Close Button:**
- Same as minimize (doesn't fully close)
- Click to hide and restore later

**Drag Header:**
- Click and drag the purple header to move the sidecar anywhere

**Resize Handle:**
- Drag the bottom-right corner to resize
- Width: 280px - 600px
- Height: minimum 400px

### Context Menu (Right-Click on ⚡ Button)

**📚 Open Library:**
- Opens SPARK in new tab

**👁️ Show/Hide Sidecar:**
- Toggle sidecar visibility

**🔄 New Conversation:**
- Refreshes the page for a clean start

**📍 Reset Position:**
- Moves button back to default (bottom-right)

**🗑️ Clear Saved Preferences:**
- Resets all positions and sizes
- Refresh page to apply

## Button States

| State | Color | Indicator | Meaning |
|-------|-------|-----------|---------|
| **Idle** | Purple | Pulsing | No sidecar, ready to use |
| **Open** | Green | Solid | Sidecar is open and visible |
| **Minimized** | Amber | Small badge dot | Sidecar minimized to edge tab |

## Features

### ✨ Smart Position Memory
- Button and sidecar remember where you placed them
- Saved in browser localStorage
- Persists across page refreshes and sessions

### 🎯 Edge Snapping
- Drag the button near screen edges (within 16px)
- Automatically snaps to edge
- Prevents button from going off-screen

### ⌨️ Keyboard Shortcuts
- **Esc:** Minimize sidecar (when not pinned)

### 🖼️ Example Output Images
- If a prompt has example output images, they display in a grid
- Click any image card to open full-size in new tab
- Images load from: `https://sparkpromptstorage.blob.core.windows.net/thumbnails/`

### 🔒 Security
- Only accepts messages from your Azure domains
- All other origins are ignored
- CSP-compliant (no eval, no inline scripts)

## Troubleshooting

### ⚡ Button Not Appearing

1. **Check Tampermonkey Status:**
   - Click Tampermonkey icon → Dashboard
   - Verify "Spark AI Prompt Library - M365 Copilot Integration (Azure)" is enabled
   - Check "Last updated" timestamp

2. **Check Page URL:**
   - Script only runs on:
     - `https://m365.cloud.microsoft/*`
     - `https://teams.microsoft.com/*`
   - Make sure you're on one of these domains

3. **Refresh the Page:**
   - Press Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
   - Force reload to clear cache

### Prompt Not Inserting

1. **Check Console Logs:**
   - Press F12 → Console tab
   - Look for messages starting with `[Spark]`
   - Look for: `✓ Found input with selector: ...`

2. **Check Copilot Input Field:**
   - Click inside the Copilot chat input
   - Make sure it's focused and editable

3. **Try Manual Test:**
   - Open browser console (F12)
   - Type: `document.querySelector('#m365-chat-editor-target-element')`
   - If it returns `null`, the selector might have changed

### Sidecar Not Showing Prompt Details

1. **Check postMessage:**
   - Open console in BOTH tabs (Library + Copilot)
   - Library should log: `Sending prompt to Copilot via postMessage`
   - Copilot should log: `[Spark] Received message from library:`

2. **Check Origins:**
   - Make sure Library URL is: `https://gray-ocean-059c8510f.3.azurestaticapps.net`
   - Messages from other origins are ignored

### Images Not Loading

1. **Check Blob Storage URL:**
   - Images should load from: `https://sparkpromptstorage.blob.core.windows.net/thumbnails/`
   - Open DevTools → Network tab
   - Look for failed requests

2. **Check CORS:**
   - Blob storage must have CORS enabled
   - Should allow requests from M365 domains

### Button Position Stuck

1. **Clear Saved Preferences:**
   - Right-click ⚡ button → "Clear Saved Preferences"
   - Refresh page
   - Button returns to default position (bottom-right)

2. **Manual Reset:**
   - Open console (F12)
   - Type: `localStorage.removeItem('spark_button_prefs')`
   - Type: `localStorage.removeItem('spark_sidecar_prefs')`
   - Refresh page

## Technical Details

### Configuration

```javascript
const CONFIG = {
    libraryUrl: 'https://gray-ocean-059c8510f.3.azurestaticapps.net',
    blobStorageUrl: 'https://sparkpromptstorage.blob.core.windows.net',
    inputSelector: '#m365-chat-editor-target-element',
    sidecarWidth: '380px',
    sidecarMinWidth: 280,
    sidecarMaxWidth: 600,
    sidecarMinHeight: 400,
    messageType: 'SPARK_SEND_TO_COPILOT',
    snapEdgeThreshold: 16
};
```

### LocalStorage Keys

- `spark_button_prefs` - Button position { left, top }
- `spark_sidecar_prefs` - Sidecar position and size { position: { left, top }, size: { width, height } }

### Allowed Origins

Messages are only accepted from:
- `gray-ocean-059c8510f.3.azurestaticapps.net`
- `sparkpromptstorage.blob.core.windows.net`

### Message Format

```javascript
window.postMessage({
    type: 'SPARK_SEND_TO_COPILOT',
    promptText: '...',  // Full prompt text to insert
    promptDetails: {
        id: '...',
        title: '...',
        description: '...',
        department: '...',
        subcategory: '...',
        icon: '...',
        complexity: '...',
        word_count: 123,
        tips: [...],
        images: [...],
        metadata: {
            whatItDoes: '...',
            howToUse: '...',
            exampleInput: '...',
            exampleOutput: '...'
        }
    }
}, '*');
```

## Support

### Check Console Logs

All operations log to the browser console. Press F12 and look for:

- `[Spark] ⚡ Integration v3.1.0 (Azure) complete!` - Script loaded
- `[Spark] ✓ Draggable floating button added` - Button created
- `[Spark] ✓ Draggable & resizable sidecar created` - Sidecar created
- `[Spark] ✓ Message listener ready (Azure Edition)` - Listening for messages
- `[Spark] Received message from library:` - Message received from SPARK
- `[Spark] ✓ Found input with selector: ...` - Found Copilot input field
- `[Spark] ✅ SUCCESS! TEXT IS IN THE CHATBOX!` - Insertion successful
- `[Spark] ✓ Sidecar opened:` - Sidecar opened with prompt details

### Version Info

- **Current Version:** 3.1.0 (Azure Edition)
- **Released:** October 22, 2025
- **Author:** Nicholas Westburg / Treasury FinOps

## Changelog

### v3.1.0 (Azure Edition) - October 22, 2025
- Updated for Azure Static Web Apps hosting
- Added Azure Blob Storage support for images
- Added Teams Copilot support
- Updated allowed origins for security
- Improved error handling and logging

### v3.0.0 - Previous version
- Localhost-based integration
- M365 Chat only
- Local image hosting

## Future Enhancements

Planned features:
- [ ] Prompt history/favorites in sidecar
- [ ] Quick search within sidecar
- [ ] Keyboard shortcuts for common actions
- [ ] Multiple prompt queue
- [ ] Prompt customization before insertion
- [ ] Dark/light theme toggle
- [ ] Compact mode option

---

**Ready to Use!**

Once installed, navigate to M365 Copilot or Teams and look for the purple ⚡ button. Click it to open your SPARK library, browse prompts, and send them directly to Copilot!
