# Module Component Documentation

This document outlines the module system implemented during the CSS refactoring process.

## Base Module Structure

The module system follows a consistent structure:

```html
<div class="module">
    <div class="module__header">
        <h3 class="module__title">Module Title</h3>
    </div>
    <div class="module__content">
        <!-- Content goes here -->
    </div>
    <div class="module__footer">
        <!-- Optional footer content -->
    </div>
</div>
```

## Module Classes

### Base Module

```css
.module {
    border: 1px solid var(--module-border);
    border-radius: var(--border-radius-md);
    padding: var(--space-md);
    box-sizing: border-box;
    background-color: var(--background-color);
    flex: 0 0 auto;
    margin: 0 0 var(--space-sm) 0;
    width: 100%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: box-shadow var(--transition-medium) var(--transition-timing-default),
                border-color var(--transition-medium) var(--transition-timing-default);
}
```

### Module Header

```css
.module__header {
    margin: calc(-1 * var(--space-md));
    margin-bottom: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    border-bottom: 1px solid var(--module-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.module__title {
    margin: 0;
    text-align: center;
    font-size: var(--font-size-lg);
    line-height: var(--line-height-tight);
    flex-grow: 1;
}
```

### Module Content

```css
.module__content {
    padding: 0;
}
```

### Module Footer

```css
.module__footer {
    margin: 0 calc(-1 * var(--space-md)) calc(-1 * var(--space-md));
    padding: var(--space-sm) var(--space-md);
    border-top: 1px solid var(--module-border);
    display: flex;
    justify-content: flex-end;
    align-items: center;
}
```

## Module Variations

### Compact Module

```css
.module--compact {
    padding: var(--space-sm);
}

.module--compact .module__header {
    margin: calc(-1 * var(--space-sm));
    margin-bottom: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
}
```

### Active Module

```css
.module--active {
    border-color: var(--link-color);
}
```

## Usage Examples

### Basic Module

```html
<div class="module">
    <div class="module__header">
        <h3 class="module__title">Settings</h3>
    </div>
    <div class="module__content">
        <!-- Module content here -->
    </div>
</div>
```

### Module with Custom Actions in Header

```html
<div class="module">
    <div class="module__header">
        <h3 class="module__title">Settings</h3>
        <button class="btn btn--small">Reset</button>
    </div>
    <div class="module__content">
        <!-- Module content here -->
    </div>
</div>
```

### Module with Footer

```html
<div class="module">
    <div class="module__header">
        <h3 class="module__title">Settings</h3>
    </div>
    <div class="module__content">
        <!-- Module content here -->
    </div>
    <div class="module__footer">
        <button class="btn">Save</button>
    </div>
</div>
```

## Best Practices

1. Always include the module__header and module__content elements
2. Use module__footer only when needed for action buttons
3. Keep module titles concise and descriptive
4. Consider using icons alongside titles for better visual recognition
5. Use the compact variation for modules with limited content
6. Maintain consistent spacing inside module content

## Accessibility

1. Use proper heading levels in module titles for document outline
2. Ensure sufficient color contrast between module elements
3. Consider adding ARIA attributes for complex interactive modules
4. Test keyboard navigation if modules contain interactive elements

## Responsive Behavior

### Portrait Mode

In portrait mode (when the screen is taller than it is wide), modules are displayed horizontally in a scrollable container:

```css
@media (max-aspect-ratio: 1.05/1) {
    .module,
    .control-module {
        min-width: 200px;
        max-width: 250px;
        width: 200px;
        margin: 0 var(--space-xs);
        flex-shrink: 0;
        scroll-snap-align: start;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }
}
```

Key features in portrait mode:
1. Fixed width modules instead of full-width
2. Horizontal scrolling with scroll snap points
3. Enhanced shadow for better visual separation
4. Visual indicator showing more content is available to scroll
