# Refactoring Value Clamping and Formatting: Step-by-Step Plan

This document outlines the steps to unify and DRY value clamping and formatting logic across all modules in MosEdoJiCircleV1.0.0.

---

## Step 1: Analyze Existing Clamping and Formatting Code
- Search for all instances of manual clamping (e.g., `Math.max(0, Math.min(1200, value))`).
- Search for all uses of `.toFixed(...)` for formatting cents, intervals, or other values.
- Note where these patterns are repeated in `main.js`, `mos.js`, `ji.js`, and `edo.js`.

## Step 2: Design Shared Utility Functions
- Implement `clamp(value, min, max)` in `utils.js`:
  - Returns `min` if value is less, `max` if value is more, otherwise value.
- Implement `formatCents(value, decimals = 2)` in `utils.js`:
  - Returns a string with the value rounded to the specified number of decimal places, with a cent sign if desired.

## Step 3: Refactor All Modules
- Replace all manual clamping (e.g., `Math.max(0, Math.min(1200, ...))`) with `clamp(...)`.
- Replace all `.toFixed(...)` formatting for cents/intervals with `formatCents(...)`.
- Ensure all modules (`main.js`, `mos.js`, `ji.js`, `edo.js`) use these utilities for all relevant values.

## Step 4: Test Thoroughly
- Verify that all clamping and formatting works as expected in all user flows.
- Check that no values can exceed their intended range, and all formatted values are consistent.
- Ensure no regressions or visual glitches.

## Step 5: Document the Utilities
- Add JSDoc comments to `clamp` and `formatCents` in `utils.js`.
- Optionally, update project documentation to describe the new clamping/formatting system.

---

**Result:**
All value clamping and formatting is DRY, consistent, and easy to update or extend in the future. Any changes to clamping or formatting logic can be made in one place.
