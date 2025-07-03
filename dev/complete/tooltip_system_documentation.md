# Tooltip System Documentation

## Overview
The toolt### Responsive Behavior

#### Small Screens (< 480px)
- Larger relative font size for readability
- Compact padding to preserve space
- Positioned to avoid edge clipping
- Show/hide on tap for touch devices

#### Medium Screens (481px - 1024px)
- Balanced font size and padding
- Moderate offset from cursor
- Follow cursor movement with optimized positioning

#### Large Screens (> 1025px)
- Increased padding and font size
- Proportionally sized to content
- Dynamic offset based on screen dimensions
- Smooth tracking with cursor movement MosEdoJiCircleV1.0.0 provides contextual information about notes, intervals, and other musical elements when users hover over or touch interactive elements. This document describes the enhanced tooltip implementation including accessibility features, mobile responsiveness, and customization options.

## Features

### Visual Design
- **Smooth animations** on show/hide with CSS transitions
- **Minimal, clean design** with proportional sizing relative to content
- **Responsive scaling** based on viewport size using CSS clamp()
- **Adaptive positioning** to stay within viewport boundaries
- **Customizable appearance** using CSS variables
- **Size-optimized** for different screen dimensions

### Accessibility
- Proper ARIA attributes (`role="tooltip"`, `aria-hidden`, `aria-describedby`)
- Connected to triggering elements through ARIA attributes
- Keyboard accessible

### Touch Support
- Responds to touch events on mobile devices
- Toggles visibility on tap
- Optimized display size for smaller screens

## Implementation

### HTML Structure
```html
<div id="tooltip" class="tooltip" role="tooltip" aria-hidden="true"></div>
```

### CSS Styling
Tooltips use the following CSS variables for customization:
- `--control-background`: Background color
- `--text-color`: Text color
- `--module-border`: Border color
- `--space-sm`, `--space-md`: Padding values
- `--border-radius-sm`: Corner radius
- `--font-size-sm`, `--font-size-md`: Text size
- `--line-height-sm`: Text line height
- `--transition-fast`: Animation duration

### JavaScript API
The tooltip system is used through the `attachTooltipHandlers` utility function:

```javascript
import { attachTooltipHandlers } from './utils.js';

// Attach to any D3 selection
attachTooltipHandlers(
    d3.selectAll('.interactive-element'),
    (d) => `Your tooltip content for ${d.name}`
);
```

## Responsive Behavior

### Desktop
- Tooltips follow cursor movement
- Positioned with slight offset from cursor
- Hide on mouse out

### Mobile/Touch
- Larger text and padding
- Show/hide on tap
- Positioned to avoid edge clipping
- Adaptive arrow placement

## Dark Mode Support
Dark mode styling is automatically applied when the `.dark-mode` class is present on an ancestor element, with appropriate adjustments to colors and shadows.

## Best Practices
1. Keep tooltip content concise
2. Use HTML formatting for better readability (e.g., `<br>` for line breaks)
3. For complex information, consider linking to more detailed views instead
4. Test on both desktop and mobile devices

---

*This documentation is part of the MosEdoJiCircleV1.0.0 CSS Refactoring project*
