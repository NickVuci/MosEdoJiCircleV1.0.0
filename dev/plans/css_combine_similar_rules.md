# CSS: Combine Similar Rules – Survey & Suggestions

This document surveys the current CSS for similar or overlapping rules that can be combined, and provides suggestions for further simplification and maintainability.

---

## 1. `.control-module` and Related Inputs
- Multiple `.control-module` blocks (some now marked as DUPLICATE).
- Related selectors: `.control-module h3`, `.control-module label`, `.control-module input[type="number"], ...`, `.control-module input[type="checkbox"]`.
- **Suggestion:** Group all `.control-module`-related rules together, and combine input selectors where possible. For example, combine all input types that share the same styles.

---

## 2. Checkbox Label Styles
- `.control-module label { ... }`
- `#edo-controls label { ... }`
- `#prime-checkboxes label { ... }`
- **Suggestion:** If the label styles are similar, combine them using a comma-separated selector, or use a class for shared styles.

---

## 3. Range Input Styles
- `.control-module input[type="range"] { ... }`
- `#mos-controls input[type="range"] { ... }`
- **Suggestion:** If the styles are the same, combine these selectors.

---

## 4. Sidebar and Module Spacing
- `#sidebar { ... gap: 8px; ... }`
- `.control-module { ... margin: 0; ... }`
- Media query overrides for `.control-module` width/margin.
- **Suggestion:** If spacing is consistent, use a variable for gap and remove redundant margin rules.

---

## 5. Tooltip Styles
- `.tooltip { ... }`
- `.dark-mode .tooltip { ... }`
- **Suggestion:** If only a few properties differ in dark mode, use the base `.tooltip` for shared styles and override only the necessary properties in `.dark-mode .tooltip`.

---

## 6. SVG Element Styles
- `.main-circle`, `.edo-line`, `.mos-generator-line`, `.mos-highlight-line`
- **Suggestion:** If they all use only the `stroke` property, you could use an attribute selector or group them if appropriate.

---

## 7. Redundant or Overlapping Input Styles
- `.control-module input[type="number"], ...`
- `.control-module input[type="checkbox"]`
- **Suggestion:** If some properties are shared, combine them, and only override the unique ones.

---

## 8. Label and Heading Margins
- `.control-module h3 { margin-top: 0; ... }`
- `.control-module label { margin-top: 10px; ... }`
- `#edo-controls label { margin-top: 10px; margin-bottom: 10px; ... }`
- **Suggestion:** If the margin values are the same, combine selectors or use a variable.

---

## Example of Combining
```css
.control-module input[type="number"],
.control-module input[type="range"],
.control-module input[type="text"] {
    /* shared styles */
}
.control-module input[type="checkbox"] {
    /* only unique styles */
}
.control-module label,
#edo-controls label,
#prime-checkboxes label {
    /* shared label styles */
}
```

---

## Next Steps
- Review all label, input, and module styles for shared properties and combine them.
- Use CSS variables for all spacing and color values.
- Group related rules together for clarity.
- Remove any remaining redundant margin or padding rules.
