# CSS: Combine Similar Rules – Survey & Suggestions (Updated July 2, 2025)

This document surveys the current CSS for similar or overlapping rules that can be combined, and provides suggestions for further simplification and maintainability, based on the latest file state.

---

## 1. `.control-module` and Related Inputs
- All `.control-module` rules are now grouped, with only one canonical block.
- Related selectors: `.control-module h3`, `.control-module label`, `.control-module input[type="number"], ...`, `.control-module input[type="checkbox"]` are already grouped.
- **Status:** Good. No further combination needed unless you want to merge label styles with other label selectors (see below).

---

## 2. Checkbox Label Styles
- `.control-module label { ... }`, `#edo-controls label { ... }`, `#prime-checkboxes label { ... }` remain separate.
- **Suggestion:** If the label styles are similar, combine them using a comma-separated selector, or use a class for shared styles. Currently, `.control-module label` uses `display: block; margin-top: 10px;`, while `#edo-controls label` and `#prime-checkboxes label` use `display: inline-block;` and have both top and bottom margin. Consider unifying if possible.

---

## 3. Range Input Styles
- `.control-module input[type="range"]` is grouped with other input types.
- `#mos-controls input[type="range"]` is separate but uses the same styles.
- **Suggestion:** Combine these selectors if the styles are identical.

---

## 4. Sidebar and Module Spacing
- `#sidebar` uses `gap: 8px;` and `.control-module` uses `margin: 0;`.
- Media query overrides for `.control-module` width/margin are present.
- **Status:** Good. Spacing is consistent and uses variables. No redundant margin rules.

---

## 5. Tooltip Styles
- `.tooltip { ... }` and `.dark-mode .tooltip { ... }` are separate, with `.dark-mode .tooltip` only overriding color and border.
- **Suggestion:** This is already optimal for dark mode overrides.

---

## 6. SVG Element Styles
- `.main-circle`, `.edo-line`, `.mos-generator-line`, `.mos-highlight-line` are grouped and only use `stroke`.
- **Status:** Good. No further combination needed unless you want to use an attribute selector.

---

## 7. Redundant or Overlapping Input Styles
- `.control-module input[type="number"], ...` and `.control-module input[type="checkbox"]` are separate, but only the checkbox has a unique property.
- **Status:** Good. No further combination needed.

---

## 8. Label and Heading Margins
- `.control-module h3 { margin-top: 0; ... }`, `.control-module label { margin-top: 10px; ... }`, `#edo-controls label { margin-top: 10px; margin-bottom: 10px; ... }` remain separate.
- **Suggestion:** If margin values can be unified, combine selectors or use a variable for margin.

---

## Example of Combining (if desired)
```css
.control-module label,
#edo-controls label,
#prime-checkboxes label {
    /* shared label styles if possible */
}
.control-module input[type="range"],
#mos-controls input[type="range"] {
    /* shared range input styles if possible */
}
```

---

## Next Steps
- Consider unifying label and range input styles if you want even more consolidation.
- Otherwise, the file is now well-organized and most similar rules are already combined or grouped.
