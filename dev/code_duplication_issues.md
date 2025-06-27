# Code Duplication Issues in MosEdoJiCircleV1.0.0

This document summarizes areas of code duplication in the codebase, listing them by both priority (impact on maintainability and user experience) and by ease of implementation (how quickly they can be refactored).

---

## Issues by Priority

### High Priority
1. **Tooltip Logic**
   - Tooltip event handlers for note circles are repeated in multiple modules (e.g., `mos.js`, `ji.js`, `edo.js`).
   - Inconsistent or duplicated tooltip code increases maintenance burden and risk of UI inconsistency.

2. **Input Validation and Correction**
   - While mostly unified, any remaining per-module input validation/parsing should be routed through shared utilities.
   - Ensures all user input is handled consistently and robustly.

3. **Error Feedback**
   - Error styling and feedback logic is (or will be) repeated for MOS, EDO, and possibly JI inputs.
   - Consistent error feedback improves user experience and reduces bugs.

### Medium Priority
4. **Label Rendering**
   - The logic for rendering note labels (position, formatting, style) is similar across all visualizations.
   - Unifying this logic ensures consistent appearance and easier updates.

5. **SVG Group and Element Management**
   - Each module manages SVG groups and clearing logic in a similar way.
   - Shared utilities can reduce boilerplate and prevent subtle bugs.

### Lower Priority
6. **Value Clamping and Formatting**
   - Clamping and formatting numbers (e.g., cents, stack numbers) is repeated in several places.
   - Utility functions can make this code DRY and less error-prone.

7. **Checkbox/Event Handler Patterns**
   - The pattern for setting up D3 event listeners for checkboxes and toggles is repeated.
   - A config-driven approach could further streamline this as the UI grows.

---

## Issues by Ease of Implementation

### Easy Fixes
1. **Value Clamping and Formatting**
   - Create `clamp(value, min, max)` and `formatCents(value)` utilities.
   - Replace all manual clamping/formatting with these functions.

2. **SVG Group and Element Management**
   - Create `ensureGroup(parent, id)` and `clearGroup(group)` utilities.
   - Use these for all group creation/clearing in visualizations.

3. **Checkbox/Event Handler Patterns**
   - Use a config array or helper for event binding if more controls are added.

### Moderate Effort
4. **Tooltip Logic**
   - Refactor all tooltip event handlers into a shared function (e.g., `attachTooltipHandlers`).
   - Update all modules to use this utility for consistent tooltips.

5. **Label Rendering**
   - Create a shared `renderLabels` function for all visualizations.
   - Use callbacks for label text and position to keep it flexible.

### Significant Effort
6. **Input Validation and Correction**
   - Audit all modules for any remaining per-input validation/parsing.
   - Refactor to ensure all input handling is routed through shared utilities.

7. **Error Feedback**
   - Create a utility for error styling and messaging.
   - Update all input fields to use this for consistent feedback.

---

## Summary Table

| Area                | Priority        | Ease of Implementation |
|---------------------|----------------|-----------------------|
| Tooltip logic       | High           | Moderate              |
| Input validation    | High           | Significant           |
| Error feedback      | High           | Significant           |
| Label rendering     | Medium         | Moderate              |
| SVG group mgmt      | Medium         | Easy                  |
| Value clamping      | Low            | Easy                  |
| Event handler setup | Low            | Easy                  |

---

**Recommendation:**
Start with the easy fixes (clamping, SVG group utilities), then refactor tooltips and labels, and finally unify all input validation and error feedback for maximum maintainability.
