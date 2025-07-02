# CSS Code Duplication Analysis

This document identifies specific instances of code duplication and other issues in the current CSS that will be addressed during refactoring.

## Identified Duplications

### 1. Input Styling Duplications

```css
/* These styles are repeated for different input types */
.control-module input[type="number"],
.control-module input[type="range"],
.control-module input[type="text"] {
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 4px;
    padding: 5px;
    background-color: var(--background-color);
    color: var(--text-color);
    border: 1px solid var(--module-border);
}
```

**Solution:** Create a base `.input` class that applies to all input types, then add type-specific modifications.

### 2. Label Styling Duplications

```css
.control-module label,
#edo-controls label,
#prime-checkboxes label {
    display: inline-block;
    margin-top: 4px;
    margin-bottom: 4px;
}
```

**Solution:** Create a `.control-label` class and apply it to all labels instead of using element selectors.

### 3. Stroke Effects on SVG Elements

```css
.main-circle {
    stroke: var(--circle-stroke-color);
    stroke-width: 1px;
    vector-effect: non-scaling-stroke;
}

.edo-line {
    stroke: var(--edo-line-color);
    vector-effect: non-scaling-stroke;
}

.mos-generator-line {
    stroke: var(--mos-line-color);
    vector-effect: non-scaling-stroke;
}
```

**Solution:** Create a `.svg-line` base class for common stroke properties, then extend with specific color classes.

### 4. Height/Width Redundancies

```css
#main-wrapper {
    flex: 1 0 auto;
    display: flex;
    flex-direction: row;
    height: 100%;
    min-height: 0;
}

#sidebar {
    /* ... */
    max-height: 100vh;
    height: 100vh;
    /* ... */
}

#main-content {
    /* ... */
    height: 100vh;
}
```

**Solution:** Create consistent height handling with CSS custom properties.

### 5. Media Query Repetition

The media query for portrait mode contains several redundant declarations.

**Solution:** Break up media queries by component and use a common breakpoint variable.

## Specificity Issues

1. **Over-specific Selectors:**
   - `#edo-controls label` should be simplified
   - `.dark-mode footer#main-footer` is unnecessarily specific

2. **ID-based Selectors:**
   - Many selectors use IDs which increases specificity and reduces reusability

## Inconsistent Patterns

1. **Mixed Units:**
   - `px` values are used in some places
   - `vh/vw` in others
   - Inconsistent spacing values (8px, 10px, 12px, 14px)

2. **Button Styling:**
   - Only dark mode button has specific styling
   - No consistent button class

3. **Margin & Padding Inconsistencies:**
   - Some elements use margin, others padding for the same visual effect
   - Inconsistent spacing around similar components

## Redundant Rules

1. **Duplicate Height/Width Settings:**
   - Many elements have redundant width/height settings
   - Some elements have both `max-height` and `height`

2. **Conflicting Flex Settings:**
   - Some containers have multiple flex-related properties that may conflict

This analysis will guide the refactoring process to ensure all duplications and inconsistencies are addressed systematically.
