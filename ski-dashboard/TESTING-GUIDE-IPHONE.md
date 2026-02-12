# iPhone Testing Guide - Hood Meadows Dashboard

## Quick Test Checklist

### ✅ iPhone 15 Landscape (844×390)

**Viewport Setup:**
- Chrome DevTools: Toggle device toolbar
- Device: iPhone 15 Pro
- Orientation: Landscape (rotate icon)
- Viewport: 844×390px

**Test Points:**

1. **[ ] Zero Scroll Verification**
   - Load dashboard
   - **WITHOUT scrolling**, can you see:
     - ✓ All 6 condition cards?
     - ✓ Driving time calculator?
     - ✓ All 3 road condition cards (side-by-side)?
     - ✓ Most/all of the snowfall graph?
   - **Goal:** Everything above the fold or nearly so

2. **[ ] Conditions Grid (3×2)**
   - Cards arranged in 3 columns, 2 rows
   - No horizontal overflow
   - Text readable (min 1.2rem for values)

3. **[ ] Road Conditions (3 Columns)**
   - I-84, Highway 26, Highway 35 side-by-side
   - Equal width columns
   - Status badges visible

4. **[ ] Graph Sizing**
   - Height: ~350-400px (60vh)
   - No vertical overflow
   - Chart labels readable

5. **[ ] Weather Summary**
   - 1-2 lines of text max
   - "Read Full Report" link visible

6. **[ ] Gear Link Accessibility**
   - Top-left button visible
   - Not covering content

---

### ✅ iPhone 15 Portrait (390×844)

**Viewport Setup:**
- Device: iPhone 15 Pro
- Orientation: Portrait
- Viewport: 390×844px

**Test Points:**

1. **[ ] 1-2 Swipe Goal**
   - Load dashboard
   - Count scroll swipes to see all content
   - **Goal:** Max 2 swipes

2. **[ ] Conditions Grid (2 Columns)**
   - Cards arranged in 2 columns, 3 rows
   - No horizontal scrolling needed
   - Values still readable

3. **[ ] Road Conditions (Stacked)**
   - 3 cards stacked vertically
   - Full width utilization
   - Spacing optimized

4. **[ ] Driving Time Form**
   - Inputs stack vertically
   - Buttons full width
   - Usable touch targets (44×44px min)

5. **[ ] Graph Visibility**
   - Height: ~50-55vh
   - Fits within single scroll viewport
   - Chart readable

6. **[ ] Overall Scroll Distance**
   - From top to footer
   - Should require 1-2 swipes max

---

## Device-Specific Tests

### iPhone 14 Pro (844×390 landscape)
- Same as iPhone 15 tests
- Verify dynamic sizing works

### iPhone 16 Pro Max (932×430 landscape)
- More vertical space = potentially zero scroll
- Verify content doesn't look too sparse

### iPad (1024×768)
- All grids expand to 3 columns
- Chart maintains 400px fixed height
- Verify layout doesn't break

---

## Performance Checks

### [ ] Load Time
- Dashboard should load in <2 seconds
- API calls complete in <3 seconds

### [ ] Smooth Scrolling
- No janky animations
- Snow canvas doesn't lag
- Chart renders smoothly

### [ ] Touch Targets
- All buttons minimum 44×44px
- Form inputs easy to tap
- No accidental taps

---

## Visual Checks

### [ ] Cozy Aesthetic Maintained
- Warm brown/beige colors present
- Rounded corners (10-12px)
- Backdrop blur effects visible
- Shadow depths appropriate

### [ ] Typography Readable
- Smallest text: 0.7rem (~11px)
- Condition values: 1.4rem (~22px)
- Labels: 0.7rem uppercase
- No text overlap

### [ ] Spacing Consistency
- Card gaps: 6px
- Section margins: 8px
- Internal padding: 10px cards, 12px sections
- No cramped feeling despite optimization

---

## Functionality Tests

### [ ] Driving Time Calculator
1. Enter address (autocomplete works)
2. Set date/time
3. Click "Calculate"
4. Results display correctly
5. Traffic indicator shows appropriate color

### [ ] Road Conditions
1. Status badges show correct colors
2. Icons visible and appropriate
3. Advisories display if present
4. Alert banners show for closures

### [ ] Snowfall Graph
1. Chart renders properly
2. Hover tooltips work
3. Bars show correct heights
4. Legend/labels readable

### [ ] Weather Report
1. Summary text accurate (1-2 lines)
2. "Read Full Report" link works
3. Opens skihood.com in new tab

### [ ] Gear Checklist Link
1. Top-left button always visible
2. Clicking navigates to /checklist.html
3. Doesn't cover content

---

## Browser Compatibility

### [ ] Safari (iOS)
- Viewport units render correctly
- Backdrop blur works
- Grid layouts display properly

### [ ] Chrome (iOS)
- Same as Safari checks
- DevTools simulation accurate

### [ ] Firefox (Desktop Simulation)
- Use responsive design mode
- Check iPhone 15 preset

---

## Edge Cases

### [ ] Very Long Address
- Autocomplete suggestions truncate properly
- Input field doesn't overflow

### [ ] No Weather Data
- Error message displays gracefully
- Doesn't break layout

### [ ] Road Closures Alert
- Banner displays at top of roads section
- Doesn't push content off-screen

### [ ] Heavy Snow Animation
- Canvas snow doesn't obscure text
- Performance remains smooth

---

## Success Criteria

| Test | Target | Pass/Fail |
|------|--------|-----------|
| iPhone 15 Landscape Zero Scroll | All content visible or near visible | [ ] |
| iPhone 15 Portrait 1-2 Swipes | Max 2 scroll swipes | [ ] |
| Conditions Grid 3×2 | Properly laid out | [ ] |
| Roads 3 Columns Landscape | Side-by-side | [ ] |
| Graph 60vh Height | Dynamic sizing works | [ ] |
| Weather 1-2 Lines | Compact summary | [ ] |
| Cozy Aesthetic | Warm colors preserved | [ ] |
| All Functionality | Calculator, links work | [ ] |
| Performance | <3s load, smooth scroll | [ ] |
| Typography | Readable at all sizes | [ ] |

---

## Access Dashboard

**Local Network:** `http://192.168.1.36:18791`  
**Localhost:** `http://localhost:18791`

**Chrome DevTools:**
1. Press `Cmd+Option+I` (Mac) or `F12` (Windows)
2. Click device toolbar icon (or `Cmd+Shift+M`)
3. Select "iPhone 15 Pro"
4. Toggle orientation with rotate icon
5. Refresh page

---

## Report Issues

If any tests fail, note:
- Device/viewport size
- Specific test that failed
- Screenshot if possible
- Browser and version

---

## ✅ Final Verification

**Landscape Zero Scroll:** All critical info (conditions, roads, ETA) visible without ANY scrolling on 844×390 viewport.

**Portrait Minimal Scroll:** 1-2 swipes maximum to see everything on 390×844 viewport.

**Aesthetic Preserved:** Warm, cozy ski resort vibe maintained despite aggressive space optimization.

**Mission Accomplished!** 🎿⛷️
