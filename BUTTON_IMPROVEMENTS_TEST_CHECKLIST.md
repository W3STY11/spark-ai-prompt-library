# ✅ BUTTON IMPROVEMENTS TEST CHECKLIST

**Version:** 3.1.0
**Implementation Date:** 2025-10-21
**Status:** ✅ Ready for Testing

---

## 📋 Feature Summary

Three major improvements implemented to the floating button:

1. **Button State Indicator** - Visual feedback for sidecar state (idle/open/minimized)
2. **Quick Actions Context Menu** - Right-click, long-press, and Shift+Click menu
3. **Position Persistence with Snap** - Remember button position, snap to edges

---

## 🧪 Test Checklist

### Feature 1: Button State Indicator

#### Visual States
- [ ] **Idle State** (when sidecar closed)
  - Button background: Purple gradient (`#667eea` to `#764ba2`)
  - Badge: Hidden
  - ARIA label: "Open SPARK AI Prompt Library"
  - Console log: Should show sidecar state changes

- [ ] **Open State** (when sidecar opened)
  - Button background: Green gradient (`#10b981` to `#059669`)
  - Badge: Hidden
  - ARIA label: "SPARK Prompt Library - Sidecar open"
  - Glow animation: Should pulse once when new prompt sent

- [ ] **Minimized State** (when sidecar minimized to tab)
  - Button background: Amber gradient (`#f59e0b` to `#d97706`)
  - Badge: Visible (12px orange dot, top-right corner)
  - ARIA label: "SPARK Prompt Library - Sidecar minimized (click to restore)"
  - Badge styling: 2px white border, subtle shadow

#### Behavior
- [ ] Button updates immediately when sidecar state changes
- [ ] Clicking button when minimized restores sidecar (not opens library)
- [ ] Glow animation plays only once when new prompt is sent
- [ ] No infinite looping animations
- [ ] Smooth transitions between states (0.3s ease)

#### Accessibility
- [ ] Screen readers announce correct state via aria-label
- [ ] Badge has proper contrast for visibility
- [ ] Button remains keyboard accessible
- [ ] Focus indicators work correctly

---

### Feature 2: Quick Actions Context Menu

#### Menu Triggers
- [ ] **Right-Click**: Opens context menu
- [ ] **Long-Press** (500ms): Opens context menu on desktop
- [ ] **Shift+Click**: Opens context menu (accessibility fallback)
- [ ] Drag doesn't trigger menu (only after release)
- [ ] Long-press timer cancels on mouse leave

#### Menu Appearance
- [ ] Menu appears near button (120px left offset, 70px below)
- [ ] White background, rounded corners (8px)
- [ ] Shadow: `0 4px 16px rgba(0, 0, 0, 0.2)`
- [ ] Minimum width: 200px
- [ ] Font: 14px system-ui
- [ ] Proper z-index (10001, above button's 10000)

#### Menu Items (5 total)
1. [ ] **📚 Open Library**
   - Opens SPARK library in new tab
   - Tab gets focus
   - Menu closes after click

2. [ ] **👁️ Show/Hide Sidecar**
   - Label changes based on state:
     - "👁️ Show Sidecar" when minimized
     - "👁️‍🗨️ Hide Sidecar" when open
   - Toggles between open and minimized states
   - Menu closes after click

3. [ ] **🔄 Reset Position**
   - Moves button to default position (bottom: 24px, right: 24px)
   - Clears buttonPosition from localStorage
   - Console log confirms: "✓ Button position reset to default"
   - Menu closes after click

4. [ ] **🗑️ Clear Saved Preferences**
   - Removes `spark_button_prefs` from localStorage
   - Removes `spark_sidecar_prefs` from localStorage
   - Resets all position/size variables
   - Shows alert: "SPARK preferences cleared! Refresh the page to see defaults."
   - Console log confirms: "✓ All preferences cleared"
   - Menu closes after click

5. [ ] **❓ Help / Docs**
   - Shows alert with quick guide
   - Help text includes:
     - Floating button controls (Click, Drag, Right-click, Shift+Click)
     - Sidecar panel controls (Drag, Resize, Pin, Minimize, Close)
     - Button states (Purple, Green, Amber)
   - Alert is properly formatted
   - Menu closes after click

#### Menu Interaction
- [ ] Hover effect: Background changes to `#f3f4f6`
- [ ] Mouse leave: Background returns to transparent
- [ ] Items have borders except last one
- [ ] Clicking outside menu closes it (with 100ms delay)
- [ ] Clicking button while menu open doesn't re-trigger
- [ ] Only one menu can be open at a time

---

### Feature 3: Position Persistence with Snap

#### Saving Position
- [ ] Button position saved to `localStorage.spark_button_prefs` after drag
- [ ] Saved format: `{ left: number, top: number }`
- [ ] Console log confirms save: "✓ Button position saved: {left: X, top: Y}"
- [ ] Position persists across page refreshes
- [ ] No save if button isn't dragged (click only)

#### Snap to Edge Behavior
- [ ] **Top Edge**: Snaps to 16px from top if within threshold
- [ ] **Bottom Edge**: Snaps to 16px from bottom if within threshold
- [ ] **Left Edge**: Snaps to 16px from left if within threshold
- [ ] **Right Edge**: Snaps to 16px from right if within threshold
- [ ] Snap threshold: 16px (CONFIG.snapEdgeThreshold)
- [ ] Snap animation: 200ms ease transition
- [ ] Snap happens on mouseup (after drag)

#### Viewport Constraints
- [ ] Button cannot be dragged off-screen left (min: 0px)
- [ ] Button cannot be dragged off-screen right (max: viewport width - button width)
- [ ] Button cannot be dragged off-screen top (min: 0px)
- [ ] Button cannot be dragged off-screen bottom (max: viewport height - button height)
- [ ] Constraints enforced during drag (real-time)

#### Position Loading
- [ ] Saved position applied on page load
- [ ] If no saved position: defaults to bottom: 24px, right: 24px
- [ ] Position uses `left` and `top` (not `right` and `bottom`) when restored
- [ ] Saved position works across browser sessions

#### Edge Case Testing
- [ ] Multiple drags: Each saves correctly
- [ ] Reset position: Clears saved data and moves to default
- [ ] Clear preferences: Removes all localStorage, refreshes to defaults
- [ ] Drag distance < 5px: Treated as click, not drag (no position save)
- [ ] Window resize: Button stays within viewport bounds

#### Sidecar Tab Overlap Prevention
- [ ] Button doesn't overlap minimized tab (right edge)
- [ ] Both button and tab can coexist on screen
- [ ] Tab is 62px from right edge (safe zone)
- [ ] Button can be on left/top/bottom without conflict

---

## 🎨 Visual Polish Checks

### Transitions & Animations
- [ ] Background color transitions: 0.3s ease
- [ ] Box shadow transitions: 0.3s ease
- [ ] Snap position transitions: 0.2s ease (left/top)
- [ ] Badge appears/disappears smoothly
- [ ] No jarring visual jumps

### Brand Consistency
- [ ] Purple gradient matches SPARK brand (#667eea, #764ba2)
- [ ] Green state uses success colors (#10b981, #059669)
- [ ] Amber state uses warning colors (#f59e0b, #d97706)
- [ ] Menu styling matches modern UI (rounded, shadowed, clean)
- [ ] Font consistency: system-ui throughout

### Responsive Design
- [ ] Button works on 1920x1080 (desktop)
- [ ] Button works on 1366x768 (laptop)
- [ ] Button works on smaller viewports
- [ ] Drag constraints adapt to viewport size
- [ ] Menu positioning adapts to button location

---

## 🔍 Technical Validation

### localStorage
- [ ] `spark_button_prefs` key created after first drag
- [ ] `spark_sidecar_prefs` key unchanged by button features
- [ ] Both keys cleared by "Clear Saved Preferences"
- [ ] Data format is valid JSON
- [ ] No console errors when loading/saving

### Console Logs
- [ ] Button position saved: `[Spark] ✓ Button position saved: {left: X, top: Y}`
- [ ] Position reset: `[Spark] ✓ Button position reset to default`
- [ ] Preferences cleared: `[Spark] ✓ All preferences cleared`
- [ ] State changes logged (optional, via updateFloatingButtonUI)

### Error Handling
- [ ] Invalid localStorage data doesn't crash
- [ ] Missing DOM elements handled gracefully
- [ ] Menu closes properly on all interactions
- [ ] Long-press timer cleans up correctly

### Performance
- [ ] No memory leaks from event listeners
- [ ] Drag performance smooth (60fps target)
- [ ] Snap calculation doesn't lag
- [ ] Menu appears instantly (<100ms)

---

## 🚨 Regression Tests

### Existing Features (Must Still Work)
- [ ] **Floating Button**
  - Draggable
  - Opens SPARK library on click
  - Pulse animation when idle
  - Hover effects

- [ ] **Sidecar Panel**
  - Opens with prompt details
  - Draggable by header
  - Resizable by corner handle
  - Pin/minimize/close buttons work
  - Position and size saved to localStorage

- [ ] **Prompt Insertion**
  - Prompts auto-insert into M365 Copilot chatbox
  - Nuclear insertion methods still work
  - React bypass still functional

- [ ] **Pin Feature**
  - Overlay hides when pinned
  - User can interact with Copilot when pinned
  - Overlay returns when unpinned
  - Pin icon rotates 45°

---

## 📊 Acceptance Criteria (User Requirements)

### 1. Button State Indicator
✅ **Criteria:**
- [x] Button clearly shows sidecar state (idle/open/minimized)
- [x] Idle → neutral purple
- [x] Open → highlighted green
- [x] Minimized → amber with badge dot
- [x] aria-label updates for accessibility
- [x] Tiny glow pulse when new prompt sent
- [x] No looping animations (except idle pulse)

### 2. Quick Actions Menu
✅ **Criteria:**
- [x] Right-click opens menu
- [x] Long-press (500ms) opens menu
- [x] Shift+Click opens menu (accessibility)
- [x] All 5 menu options present and functional
- [x] Menu closes on outside click
- [x] Menu styled with brand colors

### 3. Position Persistence
✅ **Criteria:**
- [x] Position persists to localStorage
- [x] Viewport constraints enforced
- [x] Snap to edges (16px threshold)
- [x] Never off-screen
- [x] No overlap with minimized tab
- [x] CONFIG.minimizeToButtonMode = false (current tab mode preserved)

### 4. Overall Quality
✅ **Criteria:**
- [x] All features ARIA-friendly
- [x] No console errors
- [x] No layout shift regressions
- [x] Smooth transitions
- [x] Updates only in m365-copilot-spark-integration.user.js

---

## 🎯 Test Scenarios

### Scenario 1: Fresh Install
1. Open M365 Copilot (new session, no localStorage)
2. Verify button at default position (bottom-right, 24px inset)
3. Verify button is purple (idle state)
4. Send a prompt to Copilot
5. Verify button turns green and glows once
6. Verify sidecar opens
7. Minimize sidecar
8. Verify button turns amber with badge dot
9. Click button → Verify sidecar restores

### Scenario 2: Drag & Snap
1. Drag button near top edge
2. Release → Verify it snaps to 16px from top
3. Check console for saved position
4. Refresh page
5. Verify button is at same position
6. Drag near left edge
7. Release → Verify snap to 16px from left
8. Try dragging off-screen → Verify it stays within viewport

### Scenario 3: Context Menu
1. Right-click button → Verify menu opens
2. Click "Open Library" → Verify new tab opens
3. Right-click again → Click "Show/Hide Sidecar"
4. Verify sidecar minimizes/restores
5. Shift+Click button → Verify menu opens
6. Click "Reset Position" → Verify button moves to default
7. Right-click → Click "Clear Saved Preferences"
8. Verify alert appears
9. Refresh page → Verify all defaults restored

### Scenario 4: Long-Press
1. Hold left-click on button for 500ms
2. Verify menu appears
3. Release mouse → Verify no drag occurred
4. Try long-press but release at 400ms
5. Verify menu doesn't appear
6. Move mouse away during long-press
7. Verify menu doesn't appear

### Scenario 5: State Transitions
1. Fresh start (purple/idle)
2. Send prompt → Green + glow
3. Minimize → Amber + badge
4. Restore → Green (no glow)
5. Close sidecar → Purple/idle
6. Verify each transition is smooth
7. Check ARIA labels at each state

---

## 🐛 Known Issues & Notes

### Expected Behavior
- **Glow animation**: Only plays when NEW prompt is sent, not on restore
- **Long-press threshold**: 500ms (industry standard for touch interfaces)
- **Snap threshold**: 16px (balances usability and precision)
- **Menu positioning**: Fixed offset (may need adjustment for edge cases)

### Future Enhancements (NOT in this version)
- Drag-to-reposition menu
- Customizable snap threshold
- Mobile/touch screen optimization
- Button size/shape customization
- Multiple button positions (tabs)

---

## ✅ Test Results

**Tester:** _______________________
**Date:** _______________________
**Browser:** Chrome / Edge / Firefox (circle one)
**Version:** _______________________

### Overall Results
- [ ] All features working as specified
- [ ] No console errors
- [ ] No visual regressions
- [ ] Performance acceptable
- [ ] Ready for production

### Issues Found
1. ____________________________________________________________
2. ____________________________________________________________
3. ____________________________________________________________

### Notes
________________________________________________________________
________________________________________________________________
________________________________________________________________

---

**END OF TEST CHECKLIST**
