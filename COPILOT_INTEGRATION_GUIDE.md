# SPARK ⚡ Copilot Integration - Complete Setup Guide

## What This Does

This integration adds a **draggable floating button** to Microsoft Copilot that opens the SPARK Prompt Library in a new tab. When you click "Copy to Copilot" on any prompt, it **automatically** appears in your Copilot textbox - no pasting needed!

## ✨ Features

- **Draggable Button**: Move the ⚡ button anywhere on the screen
- **Persistent Position**: Button remembers where you placed it
- **One-Click Access**: Opens SPARK library in new tab
- **Auto-Insert**: Prompts automatically populate in Copilot textbox
- **Cross-Tab Communication**: Uses BroadcastChannel API for instant messaging
- **Beautiful Design**: Gradient purple button with smooth animations
- **2.4K Badge**: Shows total prompt count

## 📋 Installation Instructions

### Step 1: Install Tampermonkey

1. Open Microsoft Edge, Chrome, or Firefox
2. Visit: https://www.tampermonkey.net/
3. Click "Download" for your browser
4. Install the extension

### Step 2: Install SPARK → Copilot Script

1. Open Tampermonkey dashboard (click extension icon → Dashboard)
2. Click the "+" tab (Create a new script)
3. Copy the **ENTIRE** contents of `spark-copilot-FINAL.user.js`
4. Paste into the editor
5. Click File → Save (or Ctrl+S)
6. Close the editor

### Step 3: Verify Installation

1. Navigate to: https://copilot.microsoft.com/
2. You should see a **purple ⚡ button** in the bottom-right corner
3. The button should be **draggable**
4. Clicking it should open the SPARK library in a new tab

## 🎯 How to Use

### Complete Workflow:

1. **Open Copilot**: Go to https://copilot.microsoft.com/
2. **See the Button**: Purple ⚡ button appears in bottom-right
3. **Open Library**: Click the button to open SPARK library in new tab
4. **Browse Prompts**: Find a prompt you want to use
5. **Send to Copilot**: Click "Copy to Copilot" button on any prompt
6. **Switch Back**: Go back to your Copilot tab
7. **It's Already There!**: Prompt is automatically in the textbox
8. **Send**: Click the send arrow in Copilot

### Button Features:

- **Click**: Opens library
- **Drag**: Move button anywhere on screen
- **Auto-Save**: Position saved for next visit
- **Hover**: Smooth scale animation
- **Badge**: Shows "2.4K" prompt count

## 🔧 Technical Details

### How It Works:

1. **Tampermonkey Script** runs on Copilot pages
2. Creates **draggable FAB** (Floating Action Button)
3. Listens for **BroadcastChannel** messages
4. When "Copy to Copilot" clicked in library:
   - Library sends message via `BroadcastChannel('spark_copilot')`
   - Copilot script receives message
   - Automatically inserts prompt into textbox
   - Shows success toast notification

### Cross-Tab Communication:

**Primary Method**: BroadcastChannel API
```javascript
// Library sends:
const channel = new BroadcastChannel('spark_copilot');
channel.postMessage({
  type: 'INSERT_PROMPT',
  content: promptText,
  title: promptTitle
});

// Copilot receives:
channel.onmessage = (e) => {
  if (e.data.type === 'INSERT_PROMPT') {
    insertPrompt(e.data.content);
  }
};
```

**Fallback Method**: localStorage
- Used if BroadcastChannel not supported
- Stores in `localStorage.spark_prompt_transfer`
- Automatically cleaned up after use

### Input Detection:

The script tries multiple selectors to find Copilot's input:
- `textarea[placeholder*="Ask"]`
- `textarea[placeholder*="Message"]`
- `textarea[placeholder*="Copilot"]`
- `div[contenteditable="true"]`
- `[role="textbox"]`
- `textarea`
- `.cib-serp-main textarea`

## 🎨 Customization

### Change Button Position:

Just **drag it** to where you want! The position is automatically saved.

### Change Button Color:

Edit these lines in the script:
```javascript
const BRAND_COLOR = '#6B47DC';      // Main color
const GRADIENT_START = '#6B47DC';   // Gradient start
const GRADIENT_END = '#8B5CF6';     // Gradient end
```

### Change Button Size:

Edit these lines:
```javascript
width: 64px;   // Button width
height: 64px;  // Button height
```

### Change Library URL:

Edit this line (if deploying to different URL):
```javascript
const LIBRARY_URL = 'https://c7c817a549a4.ngrok-free.app';
```

## 🐛 Troubleshooting

### Button Doesn't Appear:

1. Check Tampermonkey is enabled (extension icon should be colored)
2. Check script is enabled in dashboard
3. Refresh the Copilot page
4. Check browser console (F12) for errors
5. Look for log: `⚡ SPARK: Draggable FAB initialized!`

### Prompts Don't Auto-Insert:

1. Check both tabs are open (Copilot + Library)
2. Check browser console in Copilot tab
3. Look for log: `⚡ SPARK: Received BroadcastChannel message`
4. Make sure you're clicking "Copy to Copilot" (not "Copy")
5. Try refreshing both tabs

### Button Position Not Saving:

1. Check Tampermonkey has storage permissions
2. Clear browser cache and try again
3. Manually reset position (drag to default spot)

### BroadcastChannel Not Working:

1. BroadcastChannel requires same origin
2. Both tabs must be HTTPS (or both HTTP)
3. Check browser console for errors
4. Fallback to localStorage should work

## 📊 Browser Support

| Browser | BroadcastChannel | localStorage | Status |
|---------|-----------------|--------------|--------|
| Chrome  | ✅ Yes          | ✅ Yes       | ✅ Full Support |
| Edge    | ✅ Yes          | ✅ Yes       | ✅ Full Support |
| Firefox | ✅ Yes          | ✅ Yes       | ✅ Full Support |
| Safari  | ✅ Yes          | ✅ Yes       | ✅ Full Support |
| Opera   | ✅ Yes          | ✅ Yes       | ✅ Full Support |

## 🔒 Security & Privacy

- **No data collection**: Everything runs locally
- **No external requests**: Only loads library from your URL
- **No tracking**: No analytics or monitoring
- **Open source**: Full code visible in the script
- **Tampermonkey permissions**: Only runs on specified domains

## 📝 Console Logs

The script logs helpful messages:

```
⚡ SPARK: Page detected - Copilot
⚡ SPARK: Draggable FAB initialized!
⚡ SPARK: BroadcastChannel listener active
⚡ SPARK: localStorage listener active
⚡ SPARK: Opening library in new tab...
⚡ SPARK: Received BroadcastChannel message
⚡ SPARK: Found input with selector: textarea[placeholder*="Ask"]
⚡ SPARK: Prompt inserted successfully!
```

## 🚀 Production Deployment

Current Setup:
- **Library URL**: https://c7c817a549a4.ngrok-free.app
- **Server**: Running on port 8080
- **Admin Password**: sparkadmin2025
- **Total Prompts**: 2,423
- **Departments**: 9

## 📞 Support

If you encounter issues:
1. Check browser console (F12 → Console tab)
2. Look for ⚡ SPARK log messages
3. Verify both tabs are HTTPS
4. Clear cache and refresh
5. Reinstall the script

## ✅ Success Checklist

- [ ] Tampermonkey installed
- [ ] Script installed and enabled
- [ ] Purple ⚡ button visible on Copilot
- [ ] Button is draggable
- [ ] Button opens library in new tab
- [ ] Library loads successfully
- [ ] "Copy to Copilot" buttons visible
- [ ] Clicking "Copy to Copilot" shows success toast
- [ ] Switching back to Copilot shows prompt in textbox
- [ ] Prompt is fully inserted and ready to send

---

**Version**: 4.0.0
**Last Updated**: 2025-10-20
**Status**: ✅ Production Ready
