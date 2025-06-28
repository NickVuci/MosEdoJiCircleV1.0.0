# Refactoring Label Rendering: Step-by-Step Plan

This document outlines the steps to refactor and unify label rendering logic across all visualization modules in MosEdoJiCircleV1.0.0.

---

## Step 1: Analyze Existing Label Code
- ✅ Reviewed how each module (`edo.js`, `mos.js`, `ji.js`) renders labels.

## Step 2: Design the Utility API
- ✅ Designed a shared utility API for label rendering.

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
- ✅ Implemented the `renderLabels` function in `utils.js`.

## Step 4: Refactor Each Module
- ✅ Replaced the repeated label rendering code in `edo.js`, `mos.js`, and `ji.js` with calls to `renderLabels`.

## Step 5: Test Thoroughly
- ✅ Verified that labels appear correctly in all visualizations.
- ✅ Checked that style, position, and formatting are consistent and correct.
- ✅ No regressions or visual glitches found.

## Step 6: Document the Utility
- ✅ Added JSDoc comments to `renderLabels` in `utils.js`.
- ✅ This document updated to reflect completion.

---

**Result:**
All label rendering is DRY, consistent, and easy to update or extend in the future. Any changes to label style or logic can be made in one place. This refactor is complete.
