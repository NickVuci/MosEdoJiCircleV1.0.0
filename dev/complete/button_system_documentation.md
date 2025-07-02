# Button Component Documentation

This document outlines the button system implemented during the CSS refactoring process.

## Base Button Class

The `.btn` class provides a consistent foundation for all buttons in the application:

```css
.btn {
    padding: var(--space-sm) var(--space-md);
    font-size: var(--font-size-md);
    background-color: var(--button-background);
    color: var(--button-text-color);
    border: none;
    border-radius: var(--border-radius-md);
    cursor: pointer;
    transition: all var(--transition-fast) var(--transition-timing-default);
    line-height: var(--line-height-normal);
    display: inline-block;
    text-align: center;
}
```

## Button Variants

### Size Variants

- `.btn--small`: Smaller buttons for less important actions
- `.btn--large`: Larger buttons for primary actions

### Style Variants

- `.btn--primary`: High emphasis button with accent color
- `.btn--outline`: Low emphasis button with transparent background

## State Handling

The button component handles various states:

- `:hover`: Visual feedback when hovering
- `:focus`: Accessibility enhancement for keyboard navigation
- `:active`: Visual feedback when clicking

## Usage Examples

### Default Button
```html
<button class="btn">Default Button</button>
```

### Primary Button
```html
<button class="btn btn--primary">Primary Action</button>
```

### Small Outline Button
```html
<button class="btn btn--small btn--outline">Tertiary Action</button>
```

## Best Practices

1. Use the primary button style sparingly, typically once per view
2. Choose button sizes according to importance of actions
3. Provide appropriate labels that describe the action
4. Use the `disabled` attribute for buttons that are not currently available

## Accessibility

- All buttons maintain a minimum contrast ratio of 4.5:1
- Focus states are clearly visible
- Interactive states have appropriate transition timing
- Text size remains readable at all button sizes
