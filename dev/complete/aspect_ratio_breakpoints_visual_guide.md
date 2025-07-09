# Aspect-Ratio Breakpoints Visual Guide

This document provides a visual representation of the aspect-ratio breakpoint system and explains how it differs from traditional width-based breakpoints.

## Aspect-Ratio vs. Width-Based Breakpoints

### Traditional Width-Based Approach

```
Width:  0px       767px      1023px     1200px+
        |----------|----------|----------|
Mode:   Mobile    Tablet     Desktop    Large Desktop
```

Issues with width-based breakpoints:
- A tablet in landscape mode might use mobile styles if it's narrow
- A phone in landscape could use tablet styles even though it's a mobile device
- Width doesn't account for the actual shape of the viewport

### New Aspect-Ratio Approach

```
Aspect:  0.5:1      1.05:1      1.5:1+
         |-----------|-----------|
Mode:    Portrait   Standard    Wide
         (Mobile)   Landscape   Landscape
                   (Tablet)    (Desktop)
```

Benefits of aspect-ratio breakpoints:
- Portrait devices (tall) get portrait-optimized UI regardless of width
- Landscape devices get landscape-optimized UI regardless of width
- More closely matches how users perceive and hold their devices

## Visual Representation of Breakpoints

```
    1.05:1                 1.5:1
      |                      |
      v                      v
┌─────────────────────────────────────┐
│                                     │
│                                     │
│                                     │
│                                     │  Aspect ratio > 1.5:1
│                WIDE LANDSCAPE       │  (Wide Landscape/Desktop)
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘

┌───────────────────────┐
│                       │
│                       │
│                       │
│                       │  1.05:1 < Aspect ratio < 1.5:1
│  STANDARD LANDSCAPE   │  (Standard Landscape/Tablet)
│                       │
│                       │
│                       │
└───────────────────────┘

┌───────┐
│       │
│       │
│       │
│       │
│       │  Aspect ratio < 1.05:1
│       │  (Portrait/Mobile)
│       │
│ PORT- │
│ RAIT  │
│       │
│       │
└───────┘
```

## Common Device Orientations

| Device Type | Portrait Mode | Standard Landscape | Wide Landscape |
|-------------|--------------|-------------------|----------------|
| Smartphone  | ✓            | Some models        | Rarely         |
| Tablet      | ✓            | ✓                 | Rarely         |
| Laptop      | Rarely       | Some models       | ✓              |
| Desktop     | Rarely       | Some models       | ✓              |

## Testing Aspect Ratio in Browser

To visualize and test aspect ratio breakpoints during development:

1. Open DevTools and use the device emulation mode
2. Adjust the viewport dimensions to create different aspect ratios:
   - Portrait: Make height greater than width (e.g., 400px × 800px)
   - Standard Landscape: Width slightly greater than height (e.g., 800px × 600px)
   - Wide Landscape: Width much greater than height (e.g., 1200px × 600px)

3. Observe how the layout changes based on aspect ratio, not just width

## Implementation Diagram

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  CSS Variables (variables.css)                  │
│  Define base variables for each aspect-ratio    │
│  @media (max-aspect-ratio: 1.05/1) {}           │
│  @media (min-aspect-ratio: 1.05/1) {}           │
│  @media (min-aspect-ratio: 1.5/1) {}            │
│                                                 │
└─────────────┬───────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│                                                 │
│  Component CSS Files                            │
│  Use aspect-ratio media queries for components  │
│  - tooltips.css                                 │
│  - modules.css                                  │
│  - forms.css                                    │
│  - buttons.css                                  │
│                                                 │
└─────────────┬───────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│                                                 │
│  JavaScript Detection (utils.js)                │
│  - isPortraitMode()                             │
│  - isStandardLandscapeMode()                    │
│  - isWideLandscapeMode()                        │
│  - onAspectRatioChange()                        │
│                                                 │
└─────────────┬───────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│                                                 │
│  Layout Structure (responsive-layout.css)       │
│  Overall layout structure changes based on      │
│  aspect ratio (already implemented)             │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Edge Cases to Consider

1. **Very Small Devices**
   - Even in landscape mode, very small devices might benefit from portrait-style layouts

2. **Very Large Devices**
   - Ultra-wide monitors may need special handling beyond the standard breakpoints

3. **Near-Square Aspect Ratios**
   - Devices with aspect ratios very close to 1:1 should be tested carefully
   - The transition between portrait and landscape modes around 1.05:1 is critical

4. **Device Rotation**
   - Test smooth transitions when rotating devices between portrait and landscape

## Media Query Reference

```css
/* Portrait/Mobile Layout */
@media (max-aspect-ratio: 1.05/1) {
  /* Styles for portrait/tall viewports */
}

/* Standard Landscape Layout (Tablet/Small Desktop) */
@media (min-aspect-ratio: 1.05/1) and (max-aspect-ratio: 1.5/1) {
  /* Styles for standard landscape viewports */
}

/* Wide Landscape Layout (Desktop) */
@media (min-aspect-ratio: 1.5/1) {
  /* Styles for wide landscape viewports */
}

/* Extra Wide Landscape with Minimum Width (Large Desktop) */
@media (min-aspect-ratio: 1.5/1) and (min-width: 1200px) {
  /* Styles for very wide, large viewports */
}
```

JavaScript equivalent:

```javascript
// Portrait/Mobile detection
if (window.matchMedia('(max-aspect-ratio: 1.05/1)').matches) {
  // Portrait/mobile layout logic
}

// Standard Landscape detection (Tablet)
if (window.matchMedia('(min-aspect-ratio: 1.05/1) and (max-aspect-ratio: 1.5/1)').matches) {
  // Standard landscape layout logic
}

// Wide Landscape detection (Desktop)
if (window.matchMedia('(min-aspect-ratio: 1.5/1)').matches) {
  // Wide landscape layout logic
}

// Extra Wide Landscape detection (Large Desktop)
if (window.matchMedia('(min-aspect-ratio: 1.5/1) and (min-width: 1200px)').matches) {
  // Extra wide landscape layout logic
}
```
