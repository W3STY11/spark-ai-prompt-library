# M365 Copilot Integration - Testing Findings

## ✅ What's Working

1. **Floating Button** - The ⚡ button appears in M365 Copilot and is draggable
2. **Library Opening** - Clicking the button opens SPARK library in new tab
3. **Message Communication** - `window.opener.postMessage` successfully sends data from SPARK to M365 Copilot
4. **Message Reception** - Tampermonkey script receives the message with prompt data
5. **ViewPage.jsx** - Correctly sends prompts via `window.opener.postMessage` with full metadata

## ❌ What's Not Working

### Critical Issue: Text Not Persisting in M365 Copilot Input

**Problem:** The prompt text is being inserted into `#m365-chat-editor-target-element` but immediately disappears. The console shows:
- ✓ `[SPARK] Received prompt: Achieve Sustainable Wealth Strategies`
- ✓ `[SPARK] ✓ Prompt inserted: 4078 characters`
- ✓ `[SPARK] ✓ Preview: #CONTEXT: Adopt the role of wealth architect...`

But when checking the actual DOM element, `textContent.length` is 0.

**Root Cause:** Microsoft 365 Copilot uses a React-controlled contenteditable component. React maintains its own internal state for the input value, and any direct DOM manipulation (like setting `textContent` or `innerHTML`) is immediately reverted by React's reconciliation process.

### Technical Details

The M365 Copilot input structure:
```html
<div id="m365-chat-editor-target-element" contenteditable="true">
  <p class="___1ehrlty f1s184ao fpgzoln">
    <!-- User's text goes here -->
    <br>
  </p>
</div>
```

**Methods Attempted (All Failed):**
1. `inputElement.textContent = formattedPrompt` - React reverts immediately
2. `document.execCommand('insertText', false, formattedPrompt)` - Deprecated, doesn't work
3. `inputElement.innerHTML = '<p>...</p>'` - React reverts immediately
4. Dispatching `InputEvent` and `Event('change')` - React ignores them
5. Using `Object.getOwnPropertyDescriptor` to call native setter - Caused TypeError

## 🔧 Potential Solutions

### Option 1: Use Clipboard API + Paste Simulation (RECOMMENDED)
Instead of trying to fight React, use the clipboard:

```javascript
async function insertPromptText(promptText) {
    const formattedPrompt = formatPromptText(promptText);

    // Copy to clipboard
    await navigator.clipboard.writeText(formattedPrompt);

    // Focus the input
    const inputElement = document.querySelector('#m365-chat-editor-target-element');
    inputElement.focus();

    // Simulate Ctrl+V paste
    const pasteEvent = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: new DataTransfer()
    });
    pasteEvent.clipboardData.setData('text/plain', formattedPrompt);
    inputElement.dispatchEvent(pasteEvent);

    // Or use execCommand as fallback
    document.execCommand('paste');
}
```

### Option 2: Character-by-Character Typing Simulation
Simulate actual keyboard typing to trigger React's onChange handlers:

```javascript
function insertPromptText(promptText) {
    const inputElement = document.querySelector('#m365-chat-editor-target-element');
    inputElement.focus();

    const formattedPrompt = formatPromptText(promptText);

    for (const char of formattedPrompt) {
        const keydownEvent = new KeyboardEvent('keydown', {
            key: char,
            char: char,
            bubbles: true
        });
        const keypressEvent = new KeyboardEvent('keypress', {
            key: char,
            char: char,
            bubbles: true
        });
        const inputEvent = new InputEvent('beforeinput', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertText',
            data: char
        });

        inputElement.dispatchEvent(keydownEvent);
        inputElement.dispatchEvent(keypressEvent);
        inputElement.dispatchEvent(inputEvent);

        // Insert the actual character
        document.execCommand('insertText', false, char);
    }
}
```

### Option 3: Find and Trigger React's Internal onChange Handler
Inspect the React Fiber tree to find the actual onChange handler:

```javascript
function insertPromptText(promptText) {
    const inputElement = document.querySelector('#m365-chat-editor-target-element');

    // Get React internal instance
    const reactKey = Object.keys(inputElement).find(key =>
        key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')
    );

    if (reactKey) {
        const fiberNode = inputElement[reactKey];
        // Navigate fiber tree to find onChange prop
        // Call it with synthetic event
    }
}
```

### Option 4: User Instruction (SIMPLEST)
Since automated insertion is complex, provide clear instructions:

```javascript
function showInsertionInstructions(promptText) {
    // Copy to clipboard
    await navigator.clipboard.writeText(formattedPrompt);

    // Show toast/modal
    alert('Prompt copied to clipboard! Press Ctrl+V to paste into Copilot chat.');

    // Focus the input field
    const inputElement = document.querySelector('#m365-chat-editor-target-element');
    inputElement.focus();
}
```

## 📊 Test Results Summary

### Browser Testing Environment
- **Browser:** Playwright Chrome
- **M365 Copilot URL:** `https://m365.cloud.microsoft/chat/`
- **SPARK Library URL:** `http://localhost:3000`
- **API URL:** `http://localhost:3001`

### Communication Flow Test
1. ✅ User clicks ⚡ floating button in M365 Copilot
2. ✅ SPARK library opens in new tab (via `window.open`)
3. ✅ User browses prompts in SPARK library
4. ✅ User clicks "Copy to Copilot" button
5. ✅ ViewPage.jsx sends `postMessage` to `window.opener`
6. ✅ Tampermonkey script receives message
7. ✅ Script logs confirm 4078 characters received
8. ❌ **Text does not appear in chatbox**
9. ❌ **No sidecar opens** (because sidecar only opens on successful insertion)

### Console Output (M365 Copilot Tab)
```
[LOG] [SPARK] Floating button injected successfully!
[LOG] [SPARK] Opening library in new tab...
[LOG] [SPARK] Received prompt: Achieve Sustainable Wealth Strategies
[LOG] [SPARK] ✓ Prompt inserted: 4078 characters
[LOG] [SPARK] ✓ Preview: #CONTEXT: Adopt the role of wealth architect operating in today's volatile...
```

But DOM inspection shows: `textContent.length: 0`

## 🎯 Recommended Next Steps

1. **Update Tampermonkey Script** to use **Option 1 (Clipboard + Paste)** as it's most likely to work with React
2. **Add fallback to Option 4** if paste fails - just copy to clipboard and show instructions
3. **Test sidecar separately** - ensure it opens even if insertion fails
4. **Add better error handling** - detect if text actually persisted and show appropriate feedback

## 📝 Files That Need Updates

### `/home/aiwithnick/SPARK_LIBRARY_FLUENT_UI_VERSION/m365-copilot-spark-integration.user.js`

**Current problematic code** (lines 411-456):
```javascript
function insertPromptText(promptText) {
    // ... current implementation using execCommand and fallbacks
}
```

**Should be replaced with:**
```javascript
async function insertPromptText(promptText) {
    const inputElement = document.querySelector(CONFIG.inputSelector);

    if (!inputElement) {
        console.error('[Spark] Input element not found');
        alert('Could not find Copilot input field');
        return false;
    }

    try {
        const formattedPrompt = formatPromptText(promptText);

        // Method 1: Try clipboard paste
        await navigator.clipboard.writeText(formattedPrompt);
        inputElement.focus();

        const success = document.execCommand('paste');

        if (success) {
            console.log('[Spark] ✓ Prompt pasted successfully');
            return true;
        }

        // Method 2: Fallback - show instructions
        alert('Prompt copied to clipboard! Press Ctrl+V (or Cmd+V on Mac) to paste into Copilot.');
        inputElement.focus();
        return true;

    } catch (error) {
        console.error('[Spark] Error inserting prompt:', error);
        return false;
    }
}
```

## 🖼️ Screenshots

- `copilot-chat-interface.png` - Shows M365 Copilot with floating ⚡ button visible
- Input field is empty despite console logs showing successful insertion

## 🔍 Additional Notes

- M365 Copilot's input selector `#m365-chat-editor-target-element` is correct and stable
- The floating button drag functionality works perfectly
- All SPARK library features work (browsing, viewing prompts, metadata display)
- The only issue is the final step of inserting text into React-controlled input

## ✅ Conclusion

The integration is **95% complete**. The only remaining issue is bypassing React's state management to insert text. Using the clipboard paste approach should resolve this, as paste events are typically handled by React applications.

**Estimated time to fix:** 30 minutes to update the Tampermonkey script and test.
