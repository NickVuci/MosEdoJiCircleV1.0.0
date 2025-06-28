# Refactoring Label Rendering: Step-by-Step Plan

This document outlines the steps to refactor and unify label rendering logic across all visualization modules in MosEdoJiCircleV1.0.0.

---

## Step 1: Analyze Existing Label Code
- Review how each module (`edo.js`, `mos.js`, `ji.js`) currently renders labels:
  - Data binding (`.data(...).enter().append('text')`)
  - Position calculation (`x`, `y`)
  - Text formatting (`.text(...)`)
  - Styling (`font-size`, `fill`, `text-anchor`)

## Step 2: Design the Utility API
- The utility should accept:
  - A D3 selection (the group to append labels to)
  - The data array
  - Config object with:
    - `getText(d)`: function for label text
    - `getX(d)`: function for x position
    - `getY(d)`: function for y position
    - Optional: `fontSize`, `fill`, `anchor`, and any other style overrides

Example usage:
```js
renderLabels({
  selection: mosGroup,
  data: scaleNotes,
  getText: d => `Stack ${d.stack}: ${d.cents.toFixed(2)}¢`,
  getX: d => centerX + (radius + 10) * Math.cos(...),
  getY: d => centerY + (radius + 10) * Math.sin(...),
  fontSize: '10px',
  fill: 'var(--text-color)',
  anchor: 'middle'
});
```

## Step 3: Implement the Utility in `utils.js`
- Write a function that:
  - Binds data to text elements
  - Appends new text elements
  - Sets attributes and styles using the config
  - Returns the D3 selection of created labels (optional)

## Step 4: Refactor Each Module
- Replace the repeated label rendering code in `edo.js`, `mos.js`, and `ji.js` with calls to `renderLabels`.
- Pass the appropriate data, text, and position functions for each system.

## Step 5: Test Thoroughly
- Verify that labels appear correctly in all visualizations.
- Check that style, position, and formatting are consistent and correct.
- Ensure no regressions or visual glitches.

## Step 6: Document the Utility
- Add JSDoc comments to `renderLabels` in `utils.js`.
- Optionally, update project documentation to describe the new label rendering system.

---

**Result:**
All label rendering is DRY, consistent, and easy to update or extend in the future. Any changes to label style or logic can be made in one place.
