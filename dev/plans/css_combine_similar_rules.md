# Combining Similar CSS Rules

This document outlines how we will consolidate similar CSS rules during the refactoring process.

## Creating Base Component Classes

### 1. Form Controls

```css
/* BEFORE */
.control-module input[type="number"] { /* ... */ }
.control-module input[type="range"] { /* ... */ }
.control-module input[type="text"] { /* ... */ }

/* AFTER - IMPLEMENTED ✅ */
.form-control {
  /* Common input styles */
  width: 100%;
  box-sizing: border-box;
  margin-bottom: var(--space-xs);
  padding: var(--space-xs);
  background-color: var(--background-color);
  color: var(--text-color);
  border: 1px solid var(--module-border);
  border-radius: var(--border-radius-sm);
  /* And more styles as seen in components/forms.css */
}
```

### 2. Button Styles

```css
/* BEFORE */
#dark-mode-button {
  padding: 8px 16px;
  font-size: 1em;
  background-color: var(--button-background);
  color: var(--button-text-color);
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* AFTER - IMPLEMENTED ✅ */
.btn {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-size-md);
  background-color: var(--button-background);
  color: var(--button-text-color);
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-fast) var(--transition-timing-default);
  /* And more styles as seen in components/buttons.css */
}

.btn:hover {
  background-color: var(--button-hover-background);
}
```

### 3. SVG Elements

```css
/* BEFORE */
.main-circle {
  stroke: var(--circle-stroke-color);
  stroke-width: 1px;
  vector-effect: non-scaling-stroke;
}

.edo-line {
  stroke: var(--edo-line-color);
  vector-effect: non-scaling-stroke;
}

/* AFTER - NOT IMPLEMENTED ❌ */
.svg-element {
  vector-effect: non-scaling-stroke;
  stroke-width: 1px;
}

.svg-element--circle {
  stroke: var(--circle-stroke-color);
}

.svg-element--edo {
  stroke: var(--edo-line-color);
}
```

**Note:** The SVG elements in visualization/svg.css still use the original class names and have not been refactored to use a base class with modifiers.

## Standardizing Layout Patterns

### 1. Flex Container Patterns

```css
/* BEFORE - scattered flex container styles */
#main-wrapper { display: flex; flex-direction: row; /* ... */ }
#sidebar { display: flex; flex-direction: column; /* ... */ }

/* AFTER - NOT IMPLEMENTED ❌ */
.flex-container {
  display: flex;
}

.flex-row {
  flex-direction: row;
}

.flex-column {
  flex-direction: column;
}
```

**Note:** The layout has been consolidated into responsive-layout.css, but utility classes for flex containers have not been implemented. ID selectors are still being used in the layout.

### 2. Module Container Pattern

```css
/* BEFORE */
.control-module {
  border: 1px solid var(--module-border);
  border-radius: 5px;
  padding: 12px 14px;
  /* ... */
}

/* AFTER - IMPLEMENTED ✅ (but as .module instead of .card) */
.module {
  border: 1px solid var(--module-border);
  border-radius: var(--border-radius-md);
  padding: var(--space-md);
  background-color: var(--background-color);
  /* And more styles as seen in components/modules.css */
}
```

**Note:** The implementation uses `.module` instead of `.card` as the base class, with more comprehensive styling in components/modules.css.

## Responsive Pattern Consolidation

```css
/* BEFORE - scattered media queries */
@media (max-aspect-ratio: 1.05/1) {
  #main-wrapper { /* ... */ }
  #sidebar { /* ... */ }
  .control-module { /* ... */ }
}

/* AFTER - IMPLEMENTED ✅ (but in a single file) */
/* In layout/responsive-layout.css */
@media (max-aspect-ratio: 1.05/1) {
  #main-wrapper { /* ... */ }
  #sidebar { /* ... */ }
  .module { /* ... */ } /* Note: .module instead of .control-module */
}
```

**Note:** According to consolidation-summary.md, the responsive patterns have been consolidated, but into a single file (responsive-layout.css) rather than separate component files. The old files have been moved to css/backup/.

## Standardized Spacing System

```css
/* BEFORE - inconsistent spacing values */
padding: 12px 14px;
margin-bottom: 10px;
gap: 8px;

/* AFTER - IMPLEMENTED ✅ */
:root {
  --space-xxs: 2px;  /* Extra size added */
  --space-xs: 3px;   /* Mobile sizes */
  --space-sm: 6px;
  --space-md: 12px;
  --space-lg: 18px;
  --space-xl: 24px;

  /* Responsive adjustments */
  @media (min-width: 768px) {
    --space-xs: 4px;  /* Tablet/desktop sizes */
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 32px;
  }
}

/* Using consistent spacing */
padding: var(--space-md);
margin-bottom: var(--space-sm);
gap: var(--space-sm);
```

**Note:** Spacing variables are implemented in css/base/variables.css with responsive adjustments for different screen sizes.

## Typography Consolidation

```css
/* BEFORE - inconsistent font sizing */
font-size: 1em;
font-size: 0.9em;

/* AFTER - IMPLEMENTED ✅ */
:root {
  --font-size-xs: 0.75rem;    /* 12px at 16px base */
  --font-size-sm: 0.875rem;   /* 14px at 16px base */
  --font-size-md: 1rem;       /* 16px at 16px base */
  --font-size-lg: 1.125rem;   /* 18px at 16px base */
  --font-size-xl: 1.25rem;    /* 20px at 16px base */
  --font-size-xxl: 1.375rem;  /* 22px at 16px base - smaller for mobile */

  /* Responsive adjustments */
  @media (min-width: 768px) {
    --font-size-xxl: 1.5rem;  /* 24px - larger for tablets */
  }

  @media (min-width: 1200px) {
    --font-size-xxl: 1.625rem; /* 26px - larger for big screens */
  }
}
```

**Note:** Font size variables are implemented in css/base/variables.css with responsive adjustments.

## Implementation Status Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Form Controls | ✅ DONE | Implemented as `.form-control` in components/forms.css |
| Button Styles | ✅ DONE | Implemented as `.btn` in components/buttons.css |
| SVG Elements | ❌ TODO | Still using original class names in visualization/svg.css |
| Flex Container Patterns | ❌ TODO | Layout consolidated but utility classes not implemented |
| Module Container | ✅ DONE | Implemented as `.module` in components/modules.css |
| Responsive Layout | ✅ DONE | Consolidated into layout/responsive-layout.css |
| Spacing System | ✅ DONE | Implemented in base/variables.css with responsive adjustments |
| Typography | ✅ DONE | Implemented in base/variables.css with responsive adjustments |

## Remaining Implementation Tasks

1. **SVG Elements Consolidation**:
   - Create a base `.svg-element` class
   - Convert `.main-circle`, `.edo-line`, etc. to use the base class with modifiers

2. **Flex Container Utilities**:
   - Implement utility classes for flex layouts
   - Refactor `#main-wrapper` and `#sidebar` to use these classes

3. **ID to Class Migration**:
   - Replace remaining ID selectors with class selectors where appropriate

## Implementation Strategy (for remaining tasks)

For each group of similar rules:

1. Identify the common properties
2. Create a base class with those properties
3. Create modifier classes for variations
4. Replace the original selectors with the new classes
5. Test the results after each consolidation
6. Document the new class patterns

This approach will significantly reduce CSS duplication while improving maintainability and consistency.
