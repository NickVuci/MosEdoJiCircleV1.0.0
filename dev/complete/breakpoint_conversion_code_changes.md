# Breakpoint Conversion Implementation Guide

**STATUS (July 9, 2025): GUIDE COMPLETE, IMPLEMENTATION PENDING**

This document provides the exact code changes needed to convert all width-based breakpoints to aspect-ratio breakpoints for each file in the codebase. Use this guide as a reference when implementing the changes.

## 1. CSS Base Variables

### File: `/css/base/variables.css`

#### Current Code:
```css
/* ===== TABLET ENHANCEMENTS ===== */
/* Progressive enhancement for tablet-sized screens */
@media (min-width: 768px) {
    :root {
        /* ===== TABLET SPACING ===== */
        /* Standard spacing for comfortable tablet use */
        --space-xs: 4px; 
        --space-sm: 8px;
        --space-md: 16px;
        --space-lg: 24px;
        --space-xl: 32px;
        
        /* ===== TABLET BORDER RADIUS ===== */
        /* Standard radius for tablet */
        --border-radius-sm: 3px;
        --border-radius-md: 5px;
        --border-radius-lg: 8px;
        
        /* ===== TABLET TYPOGRAPHY ===== */
        /* Larger text for better tablet readability */
        --font-size-xxl: 1.5rem;    /* 24px - larger for tablets */
        
        /* ===== TABLET INTERACTION TOKENS ===== */
        /* Mixed touch/mouse interaction */
        --touch-target-size: 40px;  /* Slightly smaller for tablets */
        --interactive-area: 44px;
        
        /* ===== TABLET PERFORMANCE ===== */
        /* Standard transitions for tablets */
        --transition-fast: 150ms;
        --transition-medium: 250ms;
        --transition-slow: 350ms;
        --tooltip-transition-duration: 100ms;
        
        /* Line heights - standard for tablets */
        --line-height-tight: 1.2;
        
        /* ===== TABLET LAYOUT TOKENS ===== */
        --sidebar-width-tablet: 250px;
        --module-spacing-tablet: var(--space-sm);
    }
}

/* ===== DESKTOP OPTIMIZATIONS ===== */
/* Enhanced tokens for desktop screens */
@media (min-width: 1024px) {
    :root {
        /* ===== DESKTOP INTERACTION TOKENS ===== */
        /* Mouse-optimized interaction */
        --touch-target-size: 32px;  /* Smaller for precise mouse input */
        --interactive-area: 36px;
        
        /* ===== DESKTOP PERFORMANCE ===== */
        /* Richer animations for desktop */
        --transition-medium: 280ms;  /* Slightly slower for smoothness */
        --transition-slow: 400ms;
        --tooltip-transition-duration: 120ms;
        
        /* ===== DESKTOP LAYOUT TOKENS ===== */
        --sidebar-width-desktop: 280px;  /* Wider for desktop */
        --module-spacing-desktop: var(--space-md);
    }
}

/* ===== LARGE DESKTOP ENHANCEMENTS ===== */
/* Premium experience for large screens */
@media (min-width: 1200px) {
    :root {
        /* ===== LARGE DESKTOP SPACING ===== */
        /* Generous spacing for large screens */
        --space-lg: 28px;
        --space-xl: 36px;
        
        /* ===== LARGE DESKTOP TYPOGRAPHY ===== */
        /* Enhanced typography for large screens */
        --font-size-xxl: 1.625rem;  /* 26px - larger for big screens */
        
        /* ===== LARGE DESKTOP LAYOUT ===== */
        --sidebar-width-large: 320px;  /* Even wider for large screens */
    }
}
```

#### New Code:
```css
/* ===== LANDSCAPE ENHANCEMENTS ===== */
/* Progressive enhancement for landscape orientation (tablets, desktops) */
@media (min-aspect-ratio: 1.05/1) {
    :root {
        /* ===== LANDSCAPE SPACING ===== */
        /* Standard spacing for comfortable landscape use */
        --space-xs: 4px; 
        --space-sm: 8px;
        --space-md: 16px;
        --space-lg: 24px;
        --space-xl: 32px;
        
        /* ===== LANDSCAPE BORDER RADIUS ===== */
        /* Standard radius for landscape */
        --border-radius-sm: 3px;
        --border-radius-md: 5px;
        --border-radius-lg: 8px;
        
        /* ===== LANDSCAPE TYPOGRAPHY ===== */
        /* Larger text for better landscape readability */
        --font-size-xxl: 1.5rem;    /* 24px - larger for landscape */
        
        /* ===== LANDSCAPE INTERACTION TOKENS ===== */
        /* Mixed touch/mouse interaction */
        --touch-target-size: 40px;  /* Slightly smaller for landscape */
        --interactive-area: 44px;
        
        /* ===== LANDSCAPE PERFORMANCE ===== */
        /* Standard transitions for landscape */
        --transition-fast: 150ms;
        --transition-medium: 250ms;
        --transition-slow: 350ms;
        --tooltip-transition-duration: 100ms;
        
        /* Line heights - standard for landscape */
        --line-height-tight: 1.2;
        
        /* ===== LANDSCAPE LAYOUT TOKENS ===== */
        --sidebar-width-tablet: 250px;
        --module-spacing-tablet: var(--space-sm);
        
        /* ===== DESKTOP INTERACTION TOKENS ===== */
        /* Mouse-optimized interaction */
        --touch-target-size: 32px;  /* Smaller for precise mouse input */
        --interactive-area: 36px;
        
        /* ===== DESKTOP PERFORMANCE ===== */
        /* Richer animations for desktop */
        --transition-medium: 280ms;  /* Slightly slower for smoothness */
        --transition-slow: 400ms;
        --tooltip-transition-duration: 120ms;
        
        /* ===== DESKTOP LAYOUT TOKENS ===== */
        --sidebar-width-desktop: 280px;  /* Wider for desktop */
        --module-spacing-desktop: var(--space-md);
    }
}

/* ===== WIDE LANDSCAPE ENHANCEMENTS ===== */
/* Premium experience for wide landscape screens (larger desktops) */
@media (min-aspect-ratio: 1.5/1) and (min-width: 1200px) {
    :root {
        /* ===== WIDE LANDSCAPE SPACING ===== */
        /* Generous spacing for large screens */
        --space-lg: 28px;
        --space-xl: 36px;
        
        /* ===== WIDE LANDSCAPE TYPOGRAPHY ===== */
        /* Enhanced typography for large screens */
        --font-size-xxl: 1.625rem;  /* 26px - larger for big screens */
        
        /* ===== WIDE LANDSCAPE LAYOUT ===== */
        --sidebar-width-large: 320px;  /* Even wider for large screens */
    }
}
```

## 2. Tooltips Component

### File: `/css/components/tooltips.css`

#### Current Code:
```css
/* Small screens (mobile) */
@media (max-width: 767px) {
    .tooltip {
        padding: var(--space-sm);
        font-size: var(--font-size-md);
        line-height: var(--line-height-tight);
    }
}

/* Medium screens (tablets) */
@media (min-width: 768px) and (max-width: 1023px) {
    .tooltip {
        padding: calc(var(--space-xs) + 1px) var(--space-sm);
        font-size: var(--font-size-md);
    }
}

/* Large screens (desktop) */
@media (min-width: 1024px) {
    .tooltip {
        padding: var(--space-sm) var(--space-md);
        font-size: var(--font-size-lg);
    }
}
```

#### New Code:
```css
/* Portrait/Mobile screens */
@media (max-aspect-ratio: 1.05/1) {
    .tooltip {
        padding: var(--space-sm);
        font-size: var(--font-size-md);
        line-height: var(--line-height-tight);
    }
}

/* Standard landscape/tablet screens */
@media (min-aspect-ratio: 1.05/1) and (max-aspect-ratio: 1.5/1) {
    .tooltip {
        padding: calc(var(--space-xs) + 1px) var(--space-sm);
        font-size: var(--font-size-md);
    }
}

/* Wide landscape/desktop screens */
@media (min-aspect-ratio: 1.5/1) {
    .tooltip {
        padding: var(--space-sm) var(--space-md);
        font-size: var(--font-size-lg);
    }
}
```

## 3. Modules Component

### File: `/css/components/modules.css`

#### Current Code:
```css
@media (max-width: 767px) {
    /* Module styles for mobile */
    .module__header {
        padding: var(--space-sm);
    }
    
    /* Other mobile-specific module styles... */
}
```

#### New Code:
```css
@media (max-aspect-ratio: 1.05/1) {
    /* Module styles for portrait/mobile */
    .module__header {
        padding: var(--space-sm);
    }
    
    /* Other portrait-specific module styles... */
}
```

## 4. Forms Component

### File: `/css/components/forms.css`

#### Current Code:
```css
@media (max-width: 767px) {
    /* Mobile form styles */
    .form-group {
        margin-bottom: var(--space-md);
    }
    
    /* Other mobile form styles... */
}

@media (min-width: 768px) and (max-width: 1023px) {
    /* Tablet form styles */
    .form-group {
        margin-bottom: var(--space-lg);
    }
    
    /* Other tablet form styles... */
}

@media (min-width: 1024px) {
    /* Desktop form styles */
    .form-group {
        margin-bottom: var(--space-lg);
    }
    
    /* Other desktop form styles... */
}
```

#### New Code:
```css
@media (max-aspect-ratio: 1.05/1) {
    /* Portrait/mobile form styles */
    .form-group {
        margin-bottom: var(--space-md);
    }
    
    /* Other portrait form styles... */
}

@media (min-aspect-ratio: 1.05/1) and (max-aspect-ratio: 1.5/1) {
    /* Standard landscape/tablet form styles */
    .form-group {
        margin-bottom: var(--space-lg);
    }
    
    /* Other landscape form styles... */
}

@media (min-aspect-ratio: 1.5/1) {
    /* Wide landscape/desktop form styles */
    .form-group {
        margin-bottom: var(--space-lg);
    }
    
    /* Other desktop form styles... */
}
```

## 5. Buttons Component

### File: `/css/components/buttons.css`

#### Current Code:
```css
@media (max-width: 767px) {
    /* Mobile button styles */
    .btn {
        padding: var(--space-xs) var(--space-sm);
        font-size: var(--font-size-sm);
    }
    
    /* Other mobile button styles... */
}
```

#### New Code:
```css
@media (max-aspect-ratio: 1.05/1) {
    /* Portrait/mobile button styles */
    .btn {
        padding: var(--space-xs) var(--space-sm);
        font-size: var(--font-size-sm);
    }
    
    /* Other portrait button styles... */
}
```

## 6. JavaScript Module Manager

### File: `/js/modules.js`

#### Current Code:
```javascript
constructor() {
    this.modules = [];
    this.isMobile = window.innerWidth <= 767;
    this.init();
}

updateAccordionState() {
    const isMobile = window.innerWidth <= 767;
    
    // On mobile, we can optionally start some modules collapsed to save space
    // For now, keep all expanded unless user explicitly collapses them
    this.modules.forEach(moduleData => {
        if (isMobile && moduleData.isCollapsed) {
            this.collapseModule(moduleData);
        } else {
            this.expandModule(moduleData);
        }
    });
}

handleResponsiveChanges() {
    // Update accordion behavior on resize
    window.addEventListener('resize', () => {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 767;
        
        if (wasMobile !== this.isMobile) {
            this.updateAccordionState();
        }
    });
}
```

#### New Code:
```javascript
constructor() {
    this.modules = [];
    this.isMobile = window.matchMedia('(max-aspect-ratio: 1.05/1)').matches;
    this.init();
}

updateAccordionState() {
    const isMobile = window.matchMedia('(max-aspect-ratio: 1.05/1)').matches;
    
    // In portrait mode, we can optionally start some modules collapsed to save space
    // For now, keep all expanded unless user explicitly collapses them
    this.modules.forEach(moduleData => {
        if (isMobile && moduleData.isCollapsed) {
            this.collapseModule(moduleData);
        } else {
            this.expandModule(moduleData);
        }
    });
}

handleResponsiveChanges() {
    // Create media query for portrait mode
    const portraitMQ = window.matchMedia('(max-aspect-ratio: 1.05/1)');
    
    // Add listener for aspect ratio changes
    portraitMQ.addEventListener('change', (e) => {
        const wasMobile = this.isMobile;
        this.isMobile = e.matches;
        
        if (wasMobile !== this.isMobile) {
            this.updateAccordionState();
        }
    });
    
    // Fallback for browsers that don't support addEventListener on matchMedia
    window.addEventListener('resize', () => {
        const wasMobile = this.isMobile;
        this.isMobile = window.matchMedia('(max-aspect-ratio: 1.05/1)').matches;
        
        if (wasMobile !== this.isMobile) {
            this.updateAccordionState();
        }
    });
}
```

## 7. Utility Functions for Responsive Detection

### File: `/js/utils.js` (Add to existing file)

#### New Code to Add:
```javascript
/**
 * Responsive mode detection utility functions
 * These provide a consistent way to check responsive modes across the codebase
 */

// Check if device is in portrait mode (mobile-like)
function isPortraitMode() {
    return window.matchMedia('(max-aspect-ratio: 1.05/1)').matches;
}

// Check if device is in standard landscape mode (tablet-like)
function isStandardLandscapeMode() {
    return window.matchMedia('(min-aspect-ratio: 1.05/1) and (max-aspect-ratio: 1.5/1)').matches;
}

// Check if device is in wide landscape mode (desktop-like)
function isWideLandscapeMode() {
    return window.matchMedia('(min-aspect-ratio: 1.5/1)').matches;
}

// Check if device is in extra wide landscape mode (large desktop)
function isExtraWideLandscapeMode() {
    return window.matchMedia('(min-aspect-ratio: 1.5/1) and (min-width: 1200px)').matches;
}

// Create a listener for aspect ratio changes
function onAspectRatioChange(callback) {
    const portraitMQ = window.matchMedia('(max-aspect-ratio: 1.05/1)');
    const wideLandscapeMQ = window.matchMedia('(min-aspect-ratio: 1.5/1)');
    
    // Current mode (initial)
    let currentMode = portraitMQ.matches ? 'portrait' : 
                     wideLandscapeMQ.matches ? 'wideLandscape' : 'standardLandscape';
    
    // Function to check and update mode
    const checkMode = () => {
        let newMode = portraitMQ.matches ? 'portrait' : 
                     wideLandscapeMQ.matches ? 'wideLandscape' : 'standardLandscape';
                     
        if (newMode !== currentMode) {
            const oldMode = currentMode;
            currentMode = newMode;
            callback(newMode, oldMode);
        }
    };
    
    // Set up listeners
    portraitMQ.addEventListener('change', checkMode);
    wideLandscapeMQ.addEventListener('change', checkMode);
    
    // Fallback for older browsers
    window.addEventListener('resize', throttleAnimationFrame(checkMode));
    
    // Return function to remove listeners
    return () => {
        portraitMQ.removeEventListener('change', checkMode);
        wideLandscapeMQ.removeEventListener('change', checkMode);
        window.removeEventListener('resize', checkMode);
    };
}
```

## 8. Main.js Responsive Updates

### File: `/js/main.js`

Find any code using window resizing and update it to use the new aspect-ratio utilities:

```javascript
// Example: Update dimension calculations based on aspect ratio

function updateDimensions() {
    // Get window dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;
    
    // Use aspect ratio detection from utils.js
    const isPortrait = isPortraitMode();
    const isWideLandscape = isWideLandscapeMode();
    
    // Update layout based on aspect ratio mode
    if (isPortrait) {
        // Portrait layout calculations
        // ...
    } else if (isWideLandscape) {
        // Wide landscape layout calculations
        // ...
    } else {
        // Standard landscape layout calculations
        // ...
    }
    
    // Update SVG dimensions
    // ...
}

// Setup aspect ratio change listener
const removeAspectRatioListener = onAspectRatioChange((newMode, oldMode) => {
    console.log(`Layout changed from ${oldMode} to ${newMode}`);
    updateDimensions();
});

// Clean up when needed
// removeAspectRatioListener();
```

## Implementation Status

| File | Changes Required | Status | Notes |
|------|------------------|--------|-------|
| `/css/base/variables.css` | Replace width-based media queries with aspect-ratio | ⬜ Not Started | High priority - affects all components |
| `/css/components/tooltips.css` | Replace 3 width-based queries with aspect-ratio | ⬜ Not Started | Medium priority |
| `/css/components/modules.css` | Replace width-based query with aspect-ratio | ⬜ Not Started | Medium priority |
| `/css/components/forms.css` | Replace 3 width-based queries with aspect-ratio | ⬜ Not Started | Medium priority |
| `/css/components/buttons.css` | Replace width-based query with aspect-ratio | ⬜ Not Started | Medium priority |
| `/js/utils.js` | Add aspect-ratio utility functions | ⬜ Not Started | High priority - needed for JS detection |
| `/js/modules.js` | Replace width-based checks with matchMedia | ⬜ Not Started | Medium priority |
| `/js/main.js` | Update any responsive behavior | ⬜ Not Started | Low priority - check first |

## Testing Recommendations

1. Test all breakpoints in various screen orientations and sizes:
   - Mobile phones in portrait and landscape
   - Tablets in portrait and landscape
   - Laptops of various widths
   - Desktop monitors of various sizes

2. Check for any UI elements that might need special handling:
   - SVG visualizations
   - Text that needs to scale differently based on orientation
   - Interactive elements that change behavior based on orientation

3. Ensure all JavaScript functionality works with the new aspect-ratio detection:
   - Module accordion behavior
   - Interactive elements
   - Tooltips display
   - Form control sizing and placement

## Final Notes

- This conversion ensures that the layout responds to the device's orientation rather than arbitrary width breakpoints
- The aspect-ratio approach provides a more consistent and predictable user experience
- Using media query listeners in JavaScript improves performance over resize listeners
- The standardized utility functions make it easier to maintain responsive behavior

## Next Steps

1. Begin with the variables.css file as it affects all component styling
2. Add utility functions to utils.js to support JavaScript detection
3. Update component CSS files one by one
4. Update JavaScript files to use the new utility functions
5. Test thoroughly on different devices and orientations
