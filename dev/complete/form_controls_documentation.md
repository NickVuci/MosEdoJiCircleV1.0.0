# Form Controls Documentation

This document outlines the form control system implemented during the CSS refactoring process.

## Base Classes

### Form Control

The `.form-control` class provides a consistent foundation for all input elements:

```css
.form-control {
    width: 100%;
    box-sizing: border-box;
    margin-bottom: var(--space-xs);
    padding: var(--space-xs);
    background-color: var(--background-color);
    color: var(--text-color);
    border: 1px solid var(--module-border);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-normal);
    transition: all var(--transition-fast) var(--transition-timing-default);
}
```

### Form Label

The `.form-label` class standardizes all form labels:

```css
.form-label {
    display: inline-block;
    margin-top: var(--space-xs);
    margin-bottom: var(--space-xs);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-normal);
    font-weight: normal;
}
```

### Form Group

The `.form-group` class provides proper spacing between form elements:

```css
.form-group {
    margin-bottom: var(--space-sm);
}
```

## State Classes

### Error State

Use the `.error` class to indicate validation errors:

```css
.form-control.error {
    border: 2px solid #ff4444 !important;
    background-color: rgba(255, 68, 68, 0.1);
}
```

### Success State

Use the `.success` class to indicate valid input:

```css
.form-control.success {
    border-color: #00cc66;
    background-color: rgba(0, 204, 102, 0.05);
}
```

### Form Messages

Display error or success messages using `.form-message`:

```css
.form-message {
    display: block;
    font-size: var(--font-size-xs);
    margin-top: var(--space-xxs);
}

.form-message.error {
    color: #ff4444;
}

.form-message.success {
    color: #00cc66;
}
```

## Usage Examples

### Text Input

```html
<div class="form-group">
    <label for="name-input" class="form-label">Name:</label>
    <input type="text" id="name-input" class="form-control">
</div>
```

### Checkbox

```html
<label class="form-label">
    <input type="checkbox" class="form-control">
    Subscribe to newsletter
</label>
```

### Input with Error Message

```html
<div class="form-group">
    <label for="email" class="form-label">Email:</label>
    <input type="email" id="email" class="form-control error">
    <span class="form-message error">Please enter a valid email address</span>
</div>
```

## Accessibility Guidelines

1. Always associate labels with inputs using `for` attribute or by wrapping the input in the label
2. Use appropriate `aria` attributes for custom controls
3. Ensure all form controls can be operated by keyboard
4. Provide clear feedback for errors and validation
5. Maintain sufficient color contrast for all text and borders

## Best Practices

1. Group related form elements with `.form-group`
2. Use clear, concise labels that describe what should be entered
3. Provide placeholder text for additional guidance when helpful
4. Add validation feedback as close as possible to the input field
5. Maintain a consistent layout and alignment of form elements
