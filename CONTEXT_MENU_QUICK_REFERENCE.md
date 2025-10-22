# 🎛️ SPARK Context Menu - Quick Reference

**Version:** 3.1.0
**Last Updated:** 2025-10-21

---

## 🖱️ How to Access

**Three Ways to Open the Context Menu:**

1. **Right-Click** the floating button
2. **Long-Press** the button for 500ms (mobile-friendly)
3. **Shift+Click** the button (keyboard accessibility)

---

## 📋 Menu Options (6 Total)

### 1. 📚 Open Library
**What it does:**
- Opens SPARK AI Prompt Library in a new browser tab
- Tab automatically gets focus
- Same as clicking the button normally

**When to use:**
- Browse all 2,400+ prompts
- Explore different departments
- Search for specific prompts

---

### 2. 👁️ Show/Hide Sidecar
**What it does:**
- Toggles sidecar panel visibility
- **Dynamic label:**
  - Shows "👁️ Show Sidecar" when minimized
  - Shows "👁️‍🗨️ Hide Sidecar" when open

**When to use:**
- Need more screen space → Hide sidecar
- Want to reference prompt details → Show sidecar
- Quick toggle without using minimize button

---

### 3. 🔄 New Conversation ⭐ NEW!
**What it does:**
- Refreshes the M365 Copilot page
- Clears current conversation history
- Gives you a completely fresh start
- All SPARK features remain active after reload

**When to use:**
- Finished one conversation, starting a new topic
- Want a clean slate without manual refresh
- Reset Copilot chat to default state
- Clear any errors or stuck states

**Note:** Your button position and sidecar preferences are preserved (saved in localStorage)!

---

### 4. 📍 Reset Position
**What it does:**
- Moves floating button back to default location
- Default: Bottom-right corner, 24px from edges
- Clears saved position from localStorage
- Instant reset (no page refresh needed)

**When to use:**
- Button is in an awkward position
- Want to start fresh with layout
- Accidentally moved button off to the side

---

### 5. 🗑️ Clear Saved Preferences
**What it does:**
- Removes ALL saved SPARK preferences:
  - Button position → Reset to default
  - Sidecar position → Reset to right side
  - Sidecar size → Reset to 380px width
- Shows confirmation alert
- Requires page refresh to see defaults

**When to use:**
- Complete reset of all SPARK customizations
- Troubleshooting layout issues
- Starting completely fresh
- Sharing computer and want clean state

**Warning:** This clears everything! Use "Reset Position" if you only want to reset the button.

---

### 6. ❓ Help / Docs
**What it does:**
- Shows comprehensive help guide in alert dialog
- Covers:
  - Floating button controls
  - All menu actions
  - Sidecar panel features
  - Button state meanings
  - Auto-save features

**When to use:**
- First time using SPARK integration
- Forgot how a feature works
- Quick reference without leaving Copilot

---

## 🎨 Visual Guide

### Context Menu Appearance

```
┌─────────────────────────────────┐
│  📚 Open Library                │
├─────────────────────────────────┤
│  👁️ Show Sidecar               │
├─────────────────────────────────┤
│  🔄 New Conversation            │ ← NEW!
├─────────────────────────────────┤
│  📍 Reset Position              │
├─────────────────────────────────┤
│  🗑️ Clear Saved Preferences    │
├─────────────────────────────────┤
│  ❓ Help / Docs                 │
└─────────────────────────────────┘
```

**Styling:**
- White background
- Rounded corners (8px)
- Soft shadow
- Hover effect: Light gray background
- Clean separators between items

---

## 🔄 Workflow Examples

### Example 1: Fresh Start Workflow
```
1. Finish working on financial planning prompts
2. Right-click floating button
3. Click "🔄 New Conversation"
4. Page refreshes → Clean Copilot chat
5. Click floating button → Open SPARK library
6. Browse Marketing department prompts
7. Send new prompt → Start fresh conversation
```

### Example 2: Maximize Screen Space
```
1. Sidecar is open, taking up space
2. Right-click floating button
3. Click "👁️‍🗨️ Hide Sidecar"
4. Sidecar minimizes to tab
5. Work in Copilot with full screen
6. Need prompt details → Right-click → "👁️ Show Sidecar"
7. Sidecar restores with all content intact
```

### Example 3: Complete Reset
```
1. SPARK layout is messy (button moved, sidecar resized)
2. Right-click floating button
3. Click "🗑️ Clear Saved Preferences"
4. Alert appears → Click OK
5. Refresh page (Ctrl+R or F5)
6. Everything back to defaults:
   - Button: Bottom-right
   - Sidecar: Right side, 380px
   - All positions reset
```

### Example 4: Quick Button Reposition
```
1. Accidentally dragged button to weird spot
2. Don't want to clear ALL preferences
3. Right-click floating button
4. Click "📍 Reset Position"
5. Button instantly moves to bottom-right
6. Sidecar preferences unchanged ✅
```

---

## 💡 Pro Tips

### Tip 1: Keyboard Shortcut
Use **Shift+Click** on the button for quick menu access without right-clicking. Great for:
- Trackpad users
- Accessibility needs
- Single-button mice
- Personal preference

### Tip 2: New Conversation vs Refresh
- **🔄 New Conversation (Menu):**
  - One click from context menu
  - More discoverable
  - Intentional action

- **Browser Refresh (F5/Ctrl+R):**
  - Traditional method
  - Muscle memory
  - Same result

Both work! Use whichever you prefer.

### Tip 3: State Awareness
The "Show/Hide Sidecar" label changes based on current state:
- If you see **"👁️ Show Sidecar"** → Sidecar is minimized
- If you see **"👁️‍🗨️ Hide Sidecar"** → Sidecar is open

No need to guess the current state!

### Tip 4: Long-Press on Mobile
If using M365 Copilot on a touchscreen:
- Long-press (hold) the button for 500ms
- Menu appears (no right-click needed)
- Tap outside menu to close

### Tip 5: Quick Help
Forgot what a menu option does?
- Open menu → Click "❓ Help / Docs"
- Detailed guide appears
- No need to leave Copilot

---

## 🔧 Technical Details

### Menu Position
- **Offset:** 120px left of button, 70px below
- **Auto-adjust:** Stays within viewport
- **Z-index:** 10001 (above button's 10000)

### Menu Behavior
- **Close on:** Click outside, select option, ESC key
- **Delay:** 100ms before outside-click closes (prevents accidental close)
- **One at a time:** Only one menu can be open

### localStorage Keys
- `spark_button_prefs` → Button position
- `spark_sidecar_prefs` → Sidecar position and size

**Clear Preferences** removes both keys.
**Reset Position** only removes `spark_button_prefs`.

---

## 📊 Menu Options Summary Table

| Option | Icon | Action | Requires Refresh | Saves to localStorage |
|--------|------|--------|------------------|----------------------|
| **Open Library** | 📚 | Opens new tab | No | No |
| **Show/Hide Sidecar** | 👁️ | Toggle visibility | No | No |
| **New Conversation** | 🔄 | Refresh page | Yes (intentional) | No |
| **Reset Position** | 📍 | Move button to default | No | Yes (clears position) |
| **Clear Preferences** | 🗑️ | Reset all settings | Yes (to see defaults) | Yes (clears all) |
| **Help / Docs** | ❓ | Show guide | No | No |

---

## 🚀 What's New in v3.1.0

### New Menu Option Added
✅ **🔄 New Conversation**
- One-click page refresh
- Clean slate for new topics
- Preserves all SPARK preferences
- Positioned between "Show/Hide" and "Reset Position"

### Updated Help Text
✅ **Expanded Help Guide**
- Now includes all 6 menu actions
- Clear explanations for each option
- More comprehensive quick reference

### Icon Change
✅ **Reset Position Icon**
- Changed from 🔄 to 📍 (to avoid confusion with "New Conversation")
- More intuitive "location pin" visual

---

## 📱 Accessibility

### Screen Readers
All menu items are announced correctly:
- Option labels clearly describe actions
- Menu structure is semantic
- Keyboard navigation supported

### Keyboard Users
- **Shift+Click** opens menu (no right-click needed)
- **ESC** closes menu
- **Tab** navigates menu items
- **Enter/Space** activates menu item

### Motor Disabilities
- Large click targets (10px padding)
- Hover effects for visual feedback
- Long-press alternative to right-click

---

## 🎓 User Education

### For New Users
1. Try right-clicking the floating button
2. Explore each menu option
3. Click "❓ Help / Docs" for guidance
4. Experiment with "New Conversation" for fresh starts

### For Power Users
- Use **Shift+Click** for quick menu access
- Memorize positions: Top option = Open Library, Bottom = Help
- Use **🔄 New Conversation** to quickly reset between different prompt workflows

---

## 🔍 Troubleshooting

### Menu Doesn't Appear
- **Check:** Is button visible and not dragged off-screen?
- **Try:** Refresh page and try again
- **Alternative:** Use Shift+Click instead of right-click

### Menu Appears in Wrong Place
- **Reason:** Button is near screen edge
- **Note:** Menu auto-adjusts to stay on-screen
- **If issues persist:** Reset button position via menu

### Preferences Don't Clear
- **Check:** Did you refresh page after clearing?
- **Try:** Open developer console (F12) → Check localStorage
- **Manual clear:** Console → `localStorage.clear()` → Refresh

---

## 📞 Support

**Documentation:**
- `COMPLETE_SETUP_GUIDE.md` - Full installation guide
- `BUTTON_IMPROVEMENTS_IMPLEMENTATION.md` - Technical details
- `BUTTON_IMPROVEMENTS_TEST_CHECKLIST.md` - Test procedures

**Console Logs:**
- `[Spark] ✓ Starting new conversation - refreshing page...` (New Conversation)
- `[Spark] ✓ Button position reset to default` (Reset Position)
- `[Spark] ✓ All preferences cleared` (Clear Preferences)

---

## 🎉 Summary

The context menu provides **6 powerful actions** accessible via **3 different methods** (right-click, long-press, Shift+Click).

**Most Popular Options:**
1. 🔄 **New Conversation** - Fresh start for new topics
2. 👁️ **Show/Hide Sidecar** - Quick visibility toggle
3. 📚 **Open Library** - Browse all prompts

**Power User Options:**
4. 📍 **Reset Position** - Fix button placement
5. 🗑️ **Clear Preferences** - Complete reset
6. ❓ **Help / Docs** - Quick reference

All designed to make your SPARK + M365 Copilot workflow smoother and more productive!

---

**END OF QUICK REFERENCE**
