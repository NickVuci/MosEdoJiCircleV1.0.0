# CSS Code Duplication Analysis

This document identifies specific instances of code duplication and other issues in the current CSS that will be addressed during refactoring.

## Implementation Priority Order

Based on risk assessment and impact, the duplication issues should be addressed in this order:

1. ✅ **Create CSS Custom Properties for Spacing** - Replace hardcoded spacing values with variables (Low Risk, High Impact)
   
   **Implementation Completed:**
   - Added spacing variables to `:root` selector:
     ```css
     :root {
       --space-xxs: 2px;
       --space-xs: 4px; 
       --space-sm: 8px;
       --space-md: 16px;
       --space-lg: 24px;
       --space-xl: 32px;
     }
     ```
   - Updated CSS elements in this order:
     1. Non-layout critical elements (tooltip, labels)
     2. Form control spacing (inputs, checkboxes)
     3. Component elements (control modules, buttons) 
     4. Layout elements (sidebar, controls)
   - Mapped similar values to consistent variables (e.g., 5px → var(--space-xs))
   - Added border-radius variables as part of the same initiative
   - Created documentation in `dev/complete/spacing_variables_implementation.md`

2. **Consolidate SVG Element Styles** - Create base classes for stroke properties (Low Risk, Clear Duplication)
3. **Address Height/Width Redundancies** - Standardize container dimensions (Medium Risk, High Impact)
4. **Simplify Form Control Styling** - Standardize inputs and labels (Medium Risk, Clear Duplication)
5. **Media Query Consolidation** - Refactor responsive styles (Higher Risk, Complex)
6. **Dark Mode Optimization** - Improve theme switching implementation (Medium Risk, Moderate Impact)
7. **State Management Consolidation** - Standardize hover/focus states (Medium Risk, UX Impact)

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

## Additional Areas for Consolidation

### 1. Dark Mode Duplication

```css
/* Dark mode styles are scattered and repeat color assignments */
.dark-mode svg text {
    fill: var(--text-color);
}
.dark-mode .tooltip {
    background-color: var(--background-color);
    color: var(--text-color);
    border-color: var(--module-border);
}
.dark-mode footer#main-footer {
    color: #b0b0b0;
}
```

**Solution:** Improve theme variable usage to minimize duplicate color assignments. Create a more systematic approach to dark mode styling.

### 2. Footer Styling

The footer styling should be analyzed for potential consolidation with other text-based elements.

### 3. State Management

```css
/* Hover states are only defined for some elements */
#dark-mode-button:hover {
    background-color: var(--button-hover-background);
}
```

**Solution:** Create consistent state management classes for hover, focus, and active states.

### 4. Transitions and Animations

There's an opportunity to standardize transition effects across interactive elements.

**Solution:** Define standard transition variables (duration, easing) and apply them consistently.

## Sample Implementation for First Task (Spacing Variables)

Here's a concrete example of how we'll implement the spacing variables:

### Current Spacing Values Audit

From analyzing the CSS, these are the current spacing values in use:

| Current Value | Frequency | Recommended Variable | Context |
|---------------|-----------|---------------------|---------|
| 4px           | High      | `--space-xs`        | Small margins, small gaps |
| 5px           | Medium    | `--space-xs`        | Input padding, small spaces |
| 8px           | High      | `--space-sm`        | Container padding, component gaps |
| 10px          | Medium    | `--space-sm`        | Section padding, some margins |
| 12px          | Low       | `--space-md`        | Module padding (left/right) |
| 14px          | Low       | `--space-md`        | Module padding (top/bottom) |
| 16px          | Low       | `--space-md`        | Button padding (horizontal) |
| 24px+         | Very Low  | `--space-lg`        | Larger spacing |

### Implementation Example

```css
/* Step 1: Add spacing variables to :root */
:root {
  /* Existing variables */
  --background-color: #ffffff;
  /* ... */
  
  /* New spacing system */
  --space-xxs: 2px;
  --space-xs: 4px; 
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
}

/* Step 2: Update a safe, isolated component first */
.tooltip {
  position: absolute;
  background-color: var(--control-background);
  color: var(--text-color);
  padding: var(--space-xs); /* Was 5px */
  border: 1px solid var(--module-border);
  border-radius: 3px;
  pointer-events: none;
}
```

### Testing Checklist

After each component update:
- [ ] Visual comparison with previous state
- [ ] Check all states (hover, focus, etc.)
- [ ] Test at different viewport sizes
- [ ] Ensure no layout shifts

### Expected Outcome

1. More consistent spacing throughout the UI
2. Easier adjustments to spacing by changing variables
3. Reduced CSS size through variable reuse
4. Better maintainability through standardized spacing

This analysis will guide the refactoring process to ensure all duplications and inconsistencies are addressed systematically in a safe, prioritized order.
