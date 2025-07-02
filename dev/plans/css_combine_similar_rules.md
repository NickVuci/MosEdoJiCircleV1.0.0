# Combining Similar CSS Rules

This document outlines how we will consolidate similar CSS rules during the refactoring process.

## Creating Base Component Classes

### 1. Form Controls

```css
/* BEFORE */
.control-module input[type="number"] { /* ... */ }
.control-module input[type="range"] { /* ... */ }
.control-module input[type="text"] { /* ... */ }

/* AFTER */
.input {
  /* Common input styles */
  width: 100%;
  box-sizing: border-box;
  margin-bottom: var(--space-xs);
  padding: var(--space-xs);
  background-color: var(--background-color);
  color: var(--text-color);
  border: 1px solid var(--module-border);
}

.input--range {
  /* Range-specific overrides */
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

/* AFTER */
.btn {
  padding: var(--space-xs) var(--space-md);
  font-size: 1em;
  background-color: var(--button-background);
  color: var(--button-text-color);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: background-color 0.2s ease;
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

/* AFTER */
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

## Standardizing Layout Patterns

### 1. Flex Container Patterns

```css
/* BEFORE - scattered flex container styles */
#main-wrapper { display: flex; flex-direction: row; /* ... */ }
#sidebar { display: flex; flex-direction: column; /* ... */ }

/* AFTER */
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

### 2. Module Container Pattern

```css
/* BEFORE */
.control-module {
  border: 1px solid var(--module-border);
  border-radius: 5px;
  padding: 12px 14px;
  /* ... */
}

/* AFTER */
.card {
  border: 1px solid var(--module-border);
  border-radius: var(--border-radius-md);
  padding: var(--space-md);
  background-color: var(--background-color);
}
```

## Responsive Pattern Consolidation

```css
/* BEFORE - scattered media queries */
@media (max-aspect-ratio: 1.05/1) {
  #main-wrapper { /* ... */ }
  #sidebar { /* ... */ }
  .control-module { /* ... */ }
}

/* AFTER - organized by component */
/* In layout/grid.css */
@media (max-aspect-ratio: 1.05/1) {
  .layout { /* ... */ }
}

/* In layout/sidebar.css */
@media (max-aspect-ratio: 1.05/1) {
  .sidebar { /* ... */ }
}
```

## Standardized Spacing System

```css
/* BEFORE - inconsistent spacing values */
padding: 12px 14px;
margin-bottom: 10px;
gap: 8px;

/* AFTER - using spacing variables */
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
}

/* Using consistent spacing */
padding: var(--space-md);
margin-bottom: var(--space-sm);
gap: var(--space-sm);
```

## Typography Consolidation

```css
/* BEFORE - inconsistent font sizing */
font-size: 1em;
font-size: 0.9em;

/* AFTER - using typography variables */
:root {
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.5rem;
}
```

## Implementation Strategy

For each group of similar rules:

1. Identify the common properties
2. Create a base class with those properties
3. Create modifier classes for variations
4. Replace the original selectors with the new classes
5. Test the results after each consolidation
6. Document the new class patterns

This approach will significantly reduce CSS duplication while improving maintainability and consistency.
