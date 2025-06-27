# Refactoring Tooltip Logic: Step-by-Step Plan

This document outlines the steps to refactor and unify tooltip logic across all visualization modules in MosEdoJiCircleV1.0.0.

---

## Step 1: Analyze Existing Tooltip Code
- Review `mos.js`, `edo.js`, and `ji.js` for all instances of tooltip event handler code (`mouseover`, `mousemove`, `mouseout`).
- Note the similarities and differences (e.g., tooltip content, target selection).

## Step 2: Design a Shared Utility Function
- Define a function (e.g., `attachTooltipHandlers(selection, getText)`) that:
  - Accepts a D3 selection and a callback for tooltip content.
  - Attaches `mouseover`, `mousemove`, and `mouseout` handlers to the selection.
  - Handles showing, positioning, and hiding the tooltip element consistently.

## Step 3: Implement the Utility
- Create the utility in a shared file (e.g., `js/utils.js`).
- Ensure it:
  - Selects the tooltip element (e.g., `#tooltip`).
  - Sets HTML/text content using the provided callback.
  - Positions the tooltip relative to the mouse event.
  - Hides the tooltip on `mouseout`.

## Step 4: Refactor Each Module
- In `mos.js`, `edo.js`, and `ji.js`:
  - Remove the old, repeated tooltip event handler code.
  - Replace it with a call to `attachTooltipHandlers`, passing the appropriate selection and content callback.

## Step 5: Test Thoroughly
- Verify tooltips appear, update, and disappear correctly in all visualizations.
- Check that tooltip content is correct for each module.
- Ensure no regressions in user experience or performance.

## Step 6: Document Usage
- Add comments or documentation for the utility function.
- Optionally, update project documentation to describe the new tooltip system.

---

**Result:**
- All tooltip logic is DRY, consistent, and easy to maintain.
- Any future changes to tooltip behavior or styling can be made in one place.
