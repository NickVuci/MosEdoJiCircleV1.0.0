# Breaking Change Prevention - Module Management System Prerequisites

These are critical safety measures to prevent breaking changes during the module system implementation. **Every item in this document must be addressed to avoid catastrophic failures during migration.**

---

## 1. DOM Element ID Conflict Resolution

**CRITICAL BREAKING CHANGE RISK**

The new module system will create dynamic DOM elements that may conflict with existing selectors:
- **Current:** Direct selectors like `#edo-input`, `#mos-toggle`, `#prime-checkboxes`
- **New:** Elements will be inside dynamically created module content areas
- **Risk:** All existing `getElementById()` and `querySelector()` calls will break
- **Files affected:** `main.js`, `edo.js`, `ji.js`, `mos.js`, `utils.js`

**Prevention Strategy:**
```javascript
// Create compatibility wrapper before migration
const domCompat = {
  getElementById: (id) => {
    // Try direct lookup first
    let element = document.getElementById(id);
    if (element) return element;
    
    // Search within module content areas
    const modules = document.querySelectorAll('.module__content');
    for (const module of modules) {
      element = module.querySelector(`#${id}`);
      if (element) return element;
    }
    return null;
  }
};

// Replace all direct calls with compatibility layer
// document.getElementById('edo-input') → domCompat.getElementById('edo-input')
```

**Required Actions:**
- [ ] Audit all `getElementById()` calls in codebase
- [ ] Audit all `querySelector()` calls for element IDs
- [ ] Create compatibility layer
- [ ] Replace all direct DOM queries with compatibility layer
- [ ] Test compatibility layer with existing functionality

---

## 2. CSS Class Namespace Conflicts

**CRITICAL BREAKING CHANGE RISK**

Existing CSS module classes will conflict with new module system:
- **Current CSS:** `.module`, `.module__header`, `.module__title`, `.module__content`
- **New CSS:** Same classes plus `.module--expanded`, `.module--collapsed`, `.module--dragging`
- **Risk:** Existing styles may interfere with new functionality

**Prevention Strategy:**
```css
/* Option 1: Namespace existing classes */
.legacy-module { /* existing .module styles */ }
.legacy-module__header { /* existing .module__header styles */ }

/* Option 2: Progressive enhancement */
.module {
  /* Base styles that work for both systems */
}
.module.legacy {
  /* Existing system specific styles */  
}
.module.dynamic {
  /* New system specific styles */
}
```

**Required Actions:**
- [ ] Inventory all existing CSS module classes
- [ ] Identify potential conflicts with new classes
- [ ] Choose namespace or progressive enhancement strategy
- [ ] Update existing CSS to avoid conflicts
- [ ] Test both old and new styles work simultaneously

---

## 3. Event Listener Memory Leak Prevention

**CRITICAL BREAKING CHANGE RISK**

The new system creates and destroys DOM elements dynamically:
- **Current:** Static event listeners on fixed elements
- **New:** Dynamic event listeners on created/destroyed elements
- **Risk:** Memory leaks from uncleaned event listeners
- **Risk:** Event delegation issues when modules are reordered

**Prevention Strategy:**
```javascript
// Event cleanup pattern
class ModuleEventManager {
  constructor() {
    this.listeners = new Map();
  }
  
  addListener(element, event, handler) {
    element.addEventListener(event, handler);
    
    // Track for cleanup
    if (!this.listeners.has(element)) {
      this.listeners.set(element, []);
    }
    this.listeners.get(element).push({ event, handler });
  }
  
  cleanup(element) {
    const elementListeners = this.listeners.get(element);
    if (elementListeners) {
      elementListeners.forEach(({ event, handler }) => {
        element.removeEventListener(event, handler);
      });
      this.listeners.delete(element);
    }
  }
}
```

**Required Actions:**
- [ ] Audit all current event listeners
- [ ] Implement event cleanup management system
- [ ] Use event delegation where appropriate
- [ ] Create memory leak detection tests
- [ ] Document event management patterns

---

## 4. Form State Preservation During Migration

**CRITICAL BREAKING CHANGE RISK**

Current form state could be lost during module system migration:
- **Current:** Form values persist in DOM elements
- **New:** Dynamic module creation may reset form values
- **Risk:** User loses current EDO/JI/MOS settings during migration

**Prevention Strategy:**
```javascript
class StatePreservation {
  static captureFormState() {
    return {
      edo: {
        value: document.getElementById('edo-input')?.value || '12',
        showLines: document.getElementById('edo-lines')?.checked || true,
        primeColors: document.getElementById('prime-colors-checkbox')?.checked || false
      },
      ji: {
        selectedPrimes: Array.from(document.querySelectorAll('#prime-checkboxes input:checked'))
          .map(cb => cb.value),
        oddLimit: document.getElementById('odd-limit-input')?.value || '15'
      },
      mos: {
        enabled: document.getElementById('mos-toggle')?.checked || false,
        generator: document.getElementById('mos-generator-input')?.value || '701.955',
        stacks: document.getElementById('mos-stacks-input')?.value || '6'
      }
    };
  }
  
  static restoreFormState(state, moduleSystem) {
    // Restore to new module system
    Object.keys(state).forEach(moduleId => {
      const module = moduleSystem.getModule(moduleId);
      if (module && state[moduleId]) {
        this.restoreModuleState(module, state[moduleId]);
      }
    });
  }
}
```

**Required Actions:**
- [ ] Implement state capture functionality
- [ ] Test state capture with all current forms
- [ ] Implement state restoration to new modules
- [ ] Test end-to-end state preservation
- [ ] Create rollback mechanism

---

## 5. Accessibility Regression Testing

**CRITICAL BREAKING CHANGE RISK**

New dynamic system may break accessibility:
- **Current:** Static ARIA labels and relationships
- **New:** Dynamic ARIA states and focus management
- **Risk:** Screen readers lose track of expanded/collapsed states
- **Risk:** Keyboard navigation breaks with dynamic DOM changes

**Prevention Strategy:**
```javascript
// Accessibility state management
class A11yManager {
  static updateModuleA11y(module) {
    // Update ARIA states
    module.headerElement.setAttribute('aria-expanded', module.expanded);
    module.contentElement.setAttribute('aria-hidden', !module.expanded);
    
    // Manage focus
    if (module.expanded) {
      module.contentElement.removeAttribute('tabindex');
    } else {
      module.contentElement.setAttribute('tabindex', '-1');
    }
  }
  
  static announceChange(message) {
    // Live region for screen reader announcements
    const liveRegion = document.getElementById('sr-live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }
}
```

**Required Actions:**
- [ ] Test current accessibility with screen readers
- [ ] Document current ARIA patterns
- [ ] Implement dynamic ARIA management
- [ ] Test keyboard navigation patterns
- [ ] Verify screen reader compatibility
- [ ] Create accessibility regression test suite

---

## 6. Tooltip and Error Display Integration

**CRITICAL BREAKING CHANGE RISK**

Existing tooltip and error systems may not work with dynamic modules:
- **Current:** Tooltips positioned relative to static elements
- **New:** Module content areas can be collapsed/reordered
- **Risk:** Tooltips appear in wrong positions or get clipped
- **Risk:** Error displays may not be visible in collapsed modules

**Prevention Strategy:**
```javascript
// Enhanced tooltip positioning
class DynamicTooltipManager {
  static positionTooltip(tooltip, targetElement) {
    // Check if target is in collapsed module
    const module = targetElement.closest('.module');
    const isCollapsed = module?.classList.contains('module--collapsed');
    
    if (isCollapsed) {
      // Position relative to module header instead
      const header = module.querySelector('.module__header');
      this.positionRelativeTo(tooltip, header);
    } else {
      // Normal positioning
      this.positionRelativeTo(tooltip, targetElement);
    }
  }
}
```

**Required Actions:**
- [ ] Test tooltip positioning with dynamic layout
- [ ] Implement collapsed module error handling
- [ ] Update error display system for modules
- [ ] Test tooltip clipping issues
- [ ] Create error visibility guarantees

---

## 7. Circular Dependency Prevention

**CRITICAL BREAKING CHANGE RISK**

The new module system creates potential circular dependencies:
- **Current:** `main.js` → `edo.js`/`ji.js`/`mos.js` (one-way)
- **New:** `moduleSystem.js` ↔ `edo.js`/`ji.js`/`mos.js` (two-way)
- **Risk:** Circular import dependencies causing module loading failures

**Prevention Strategy:**
```javascript
// Dependency injection pattern
class ModuleRenderer {
  constructor(renderFunction) {
    this.renderFunction = renderFunction;
  }
  
  render(svg, dimensions, moduleContent) {
    // Render function gets module content passed in
    // No need to import module system
    return this.renderFunction(svg, dimensions, moduleContent);
  }
}

// In moduleSystem.js
import { createEDORenderer } from './edo.js';
const edoRenderer = createEDORenderer(); // Factory function, no circular import
```

**Required Actions:**
- [ ] Map all current import dependencies
- [ ] Identify potential circular dependencies
- [ ] Implement dependency injection pattern
- [ ] Refactor imports to avoid cycles
- [ ] Test module loading order

---

## 8. Error Recovery and Fallback Mechanisms

**CRITICAL BREAKING CHANGE RISK**

Module system failures could break the entire application:
- **Risk:** If module system fails to initialize, app becomes unusable
- **Risk:** Individual module failures could cascade
- **Need:** Graceful degradation and fallback to static layout

**Prevention Strategy:**
```javascript
// Error boundary with fallback
class ModuleSystemErrorBoundary {
  static initialize() {
    try {
      // Try to initialize new module system
      return this.initializeModuleSystem();
    } catch (error) {
      console.error('Module system failed, falling back to static layout:', error);
      return this.fallbackToStaticLayout();
    }
  }
  
  static fallbackToStaticLayout() {
    // Re-enable static module layout
    document.body.classList.add('fallback-static-modules');
    // Restore original event listeners
    this.restoreStaticEventListeners();
  }
}
```

**Required Actions:**
- [ ] Implement module system error boundaries
- [ ] Create fallback to static layout
- [ ] Test error recovery scenarios
- [ ] Implement graceful degradation
- [ ] Document recovery procedures

---

## Critical Implementation Checklist

### Before Any Code Changes
- [ ] Current system state captured and documented
- [ ] All breaking change risks assessed
- [ ] Rollback plan created and tested
- [ ] Compatibility layers implemented

### During Implementation  
- [ ] Each change tested in isolation
- [ ] State preservation verified at each step
- [ ] Accessibility maintained throughout
- [ ] Error recovery tested

### Before Deployment
- [ ] Full regression test suite passed
- [ ] All breaking change mitigations verified
- [ ] Performance impact assessed
- [ ] User acceptance testing completed

---

**CRITICAL WARNING:** Do not proceed with module system implementation until ALL breaking change prevention measures are in place and tested. The risk of catastrophic failure is too high without these safeguards.
