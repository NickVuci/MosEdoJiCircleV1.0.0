# Code Duplication Issues in MosEdoJiCircleV1.0.0

This document summarizes areas of code duplication in the codebase, listing them by both priority (impact on maintainability and user experience) and by ease of implementation (how quickly they can be refactored). Status for each item is shown below.

---

## Issues by Priority

### High Priority
1. **Tooltip Logic**
   - ✅ Tooltip event handlers are now unified via the shared `attachTooltipHandlers` utility in `utils.js`.
   - All modules (`edo.js`, `mos.js`, `ji.js`) use this for consistent, DRY tooltips.

2. **Input Validation and Correction**
   - ✅ Input validation and correction is unified and config-driven in `main.js`.
   - Minor per-module parsing remains, but is minimal and not error-prone. Further DRYing is possible by moving all parsing to shared utilities if desired.

3. **Error Feedback**
   - ⚠️ Partially unified. Some error styling and feedback is consistent, but not all modules use a shared utility for error display. Creating a utility for error styling/messaging and using it everywhere would complete this.

### Medium Priority
4. **Label Rendering**
   - ✅ The logic for rendering note labels (position, formatting, style) is now unified across all visualizations using the shared `renderLabels` utility in `utils.js`.
   - All modules (`edo.js`, `mos.js`, `ji.js`) use this utility for consistent appearance and easier updates.

5. **SVG Group and Element Management**
   - ⚠️ Not yet unified. Each module still manages SVG groups and clearing logic in a similar way. Creating `ensureGroup` and `clearGroup` utilities and using them everywhere would address this.

### Lower Priority
6. **Value Clamping and Formatting**
   - ⚠️ Not yet unified. Clamping and formatting logic is still repeated. Implement `clamp` and `formatCents` utilities in `utils.js` and refactor all manual clamping/formatting to use them.

7. **Checkbox/Event Handler Patterns**
   - ✅ Checkbox and toggle event handling is config-driven and unified in `main.js`.

---

## Issues by Ease of Implementation

### Easy Fixes
1. **Value Clamping and Formatting**
   - ⚠️ Not yet done. Implement and use `clamp` and `formatCents` utilities.
2. **SVG Group and Element Management**
   - ⚠️ Not yet done. Implement and use `ensureGroup` and `clearGroup` utilities.
3. **Checkbox/Event Handler Patterns**
   - ✅ Done. All event handler patterns are config-driven and unified.

### Moderate Effort
4. **Tooltip Logic**
   - ✅ Done. All modules use the shared utility.
5. **Label Rendering**
   - ✅ Done. All modules use the shared utility.

### Significant Effort
6. **Input Validation and Correction**
   - ✅ Mostly done. Only minor per-module parsing remains.
7. **Error Feedback**
   - ⚠️ Not yet done. Needs a shared utility and consistent usage.

---

## Summary Table

| Area                | Status         |
|---------------------|---------------|
| Tooltip logic       | ✅ Done        |
| Input validation    | ✅ Mostly done |
| Error feedback      | ⚠️ Partial     |
| Label rendering     | ✅ Done        |
| SVG group mgmt      | ⚠️ Not done    |
| Value clamping      | ⚠️ Not done    |
| Event handler setup | ✅ Done        |

---

**Recommendation:**
Start with the remaining easy fixes (clamping, SVG group utilities), then finish error feedback, and optionally further DRY input parsing for maximum maintainability and consistency.
