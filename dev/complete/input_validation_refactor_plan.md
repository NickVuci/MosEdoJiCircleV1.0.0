# Input Validation and Parsing DRY Refactor Plan

**Goal:**  
Eliminate all per-module input parsing/validation logic. Route all user input handling (numbers, ratios, EDO steps, etc.) through a single, shared, well-documented utility (e.g., `parseInput` in `utils.js`).

---

## Step 1: Audit the Codebase
- Search all modules (`main.js`, `edo.js`, `mos.js`, `ji.js`, etc.) for any direct use of:
  - `parseInt`, `parseFloat`, or similar parsing functions
  - Manual input validation (e.g., regex, `isNaN`, custom error messages)
- Identify all places where user input is parsed or validated outside of a shared utility.

---

## Step 2: Expand the Shared Utility
- In `utils.js`, ensure you have a robust `parseInput` function that:
  - Accepts a string and returns `{ value, format }` or throws a clear error.
  - Handles all supported formats (cents, ratios, EDO steps, etc.).
  - Provides consistent error messages and edge case handling.
  - Is fully documented with JSDoc.

---

## Step 3: Refactor All Modules
- Replace all direct parsing/validation in every module with calls to `parseInput`.
- Remove any redundant or inconsistent parsing code.
- Ensure all error handling and feedback uses the shared utility’s error messages.

---

## Step 4: Test Thoroughly
- Test all input fields in the UI with valid and invalid data.
- Confirm that all parsing, validation, and error feedback is consistent and correct.
- Check for regressions or missed cases.

---

## Step 5: Document the Change
- Add/expand JSDoc for `parseInput` in `utils.js`.
- Update developer documentation to describe the new, unified input validation system.

---

**Result:**  
All input parsing and validation is DRY, robust, and easy to update. All modules (`edo.js`, `ji.js`, `mos.js`) now use the shared `parseInput` utility for all numeric input fields, with consistent error handling and user feedback. Any changes to input handling can be made in one place, ensuring consistency and maintainability across the codebase. **(Complete as of July 2025)**
