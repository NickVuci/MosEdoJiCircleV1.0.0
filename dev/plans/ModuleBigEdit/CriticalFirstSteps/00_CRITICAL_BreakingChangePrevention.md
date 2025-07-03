# CRITICAL Breaking Change Prevention - MUST COMPLETE BEFORE ANY OTHER CHANGES

**⚠️ WARNING: This document contains critical safety information. All breaking change prevention measures MUST be implemented before any code changes begin. Failure to follow these procedures could result in complete application failure and data loss.**

---

## Overview

The module management system implementation introduces several critical breaking changes that could render the application unusable if not properly handled. This consolidated document combines all breaking change risks and required mitigation strategies from both `00_Critical_BreakingChanges.md` and `PreEdits/04_BreakingChangePrevention_Critical.md` to create a single, authoritative source of truth.

**IMPORTANT:** This document supersedes all other breaking change documentation. Both the original `00_Critical_BreakingChanges.md` and `PreEdits/04_BreakingChangePrevention_Critical.md` should be considered obsolete and only this document should be referenced.

---

## 🚨 Critical Breaking Changes and Mitigations

### 1. DOM Selector Breaking Changes

**IMPACT: COMPLETE FUNCTIONALITY LOSS**

**Problem:**
- **Current:** Direct selectors like `#edo-input`, `#mos-toggle`, `#prime-checkboxes`
- **New:** Elements will be inside dynamically created module content areas
- **Risk:** All existing `getElementById()` and `querySelector()` calls will break
- **Files affected:** `main.js`, `edo.js`, `ji.js`, `mos.js`, `utils.js`

**Required Mitigation Strategy:**
```javascript
// domCompatibility.js - MUST BE CREATED FIRST
export class DOMCompatibility {
  static getElementById(id) {
    // Try direct lookup first (for static elements)
    let element = document.getElementById(id);
    if (element) return element;
    
    // Search within module content areas (for migrated elements)
    const modules = document.querySelectorAll('.module__content');
    for (const module of modules) {
      element = module.querySelector(`#${id}`);
      if (element) return element;
    }
    
    return null;
  }
  
  static querySelector(selector) {
    // Try global first
    let element = document.querySelector(selector);
    if (element) return element;
    
    // Search within modules
    const modules = document.querySelectorAll('.module__content');
    for (const module of modules) {
      element = module.querySelector(selector);
      if (element) return element;
    }
    
    return null;
  }
  
  static querySelectorAll(selector) {
    // Combine global and module-scoped results
    const globalElements = Array.from(document.querySelectorAll(selector));
    const moduleElements = [];
    
    const modules = document.querySelectorAll('.module__content');
    modules.forEach(module => {
      moduleElements.push(...module.querySelectorAll(selector));
    });
    
    return [...globalElements, ...moduleElements];
  }
}

// Replace ALL existing DOM queries with compatibility layer
// OLD: document.getElementById('edo-input')
// NEW: DOMCompatibility.getElementById('edo-input')
```

**Required Actions:**
- [ ] Create `domCompatibility.js` file
- [ ] Audit ALL DOM queries in codebase
- [ ] Replace ALL `document.getElementById()` calls
- [ ] Replace ALL `document.querySelector()` calls
- [ ] Test compatibility layer with existing system
- [ ] Verify no functionality is broken

---

### 2. CSS Class Conflicts

**IMPACT: VISUAL BREAKING AND LAYOUT ISSUES**

**Problem:**
- **Current CSS:** `.module`, `.module__header`, `.module__title`, `.module__content`
- **New CSS:** Same classes plus `.module--expanded`, `.module--collapsed`, `.module--dragging`
- **Risk:** Existing styles may interfere with new functionality

**Required Mitigation Strategy - Option 1 (Namespace):**
```css
/* Rename existing classes to avoid conflicts */
.legacy-module { /* old .module styles */ }
.legacy-module__header { /* old .module__header styles */ }
.legacy-module__title { /* old .module__title styles */ }
.legacy-module__content { /* old .module__content styles */ }

/* New system uses original class names */
.module { /* new dynamic module styles */ }
.module__header { /* new interactive header */ }
```

**Required Mitigation Strategy - Option 2 (Progressive Enhancement):**
```css
/* Base styles that work for both systems */
.module {
  /* Common styles */
  border: 1px solid var(--module-border);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--space-sm);
}

/* Static system specific */
.module.static {
  /* Original static styles */
  padding: var(--space-md);
}

/* Dynamic system specific */
.module.dynamic {
  /* New dynamic styles */
  position: relative;
}

.module.dynamic.module--expanded {
  /* Expanded state styles */
}
```

**Required Actions:**
- [ ] Inventory all existing CSS module classes
- [ ] Identify potential conflicts with new classes
- [ ] Choose namespace or progressive enhancement strategy
- [ ] Update existing CSS to avoid conflicts
- [ ] Test both old and new styles work simultaneously
- [ ] Verify no visual regressions

---

### 3. Event Listener Memory Leaks

**IMPACT: MEMORY LEAKS AND PERFORMANCE DEGRADATION**

**Problem:**
- **Current:** Static event listeners on fixed elements
- **New:** Dynamic event listeners on created/destroyed elements
- **Risk:** Memory leaks from uncleaned event listeners
- **Risk:** Event delegation issues when modules are reordered

**Required Mitigation Strategy:**
```javascript
// eventManager.js - MUST BE CREATED
export class EventManager {
  constructor() {
    this.listeners = new WeakMap();
  }
  
  addListener(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
    
    // Track for cleanup
    if (!this.listeners.has(element)) {
      this.listeners.set(element, []);
    }
    this.listeners.get(element).push({ event, handler, options });
  }
  
  removeListener(element, event, handler) {
    element.removeEventListener(event, handler);
    
    // Update tracking
    if (this.listeners.has(element)) {
      const listeners = this.listeners.get(element);
      const index = listeners.findIndex(l => l.event === event && l.handler === handler);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  cleanupElement(element) {
    const elementListeners = this.listeners.get(element);
    if (elementListeners) {
      elementListeners.forEach(({ event, handler, options }) => {
        element.removeEventListener(event, handler, options);
      });
      this.listeners.delete(element);
    }
  }
  
  cleanupAll() {
    // Called on module destruction
    this.listeners = new WeakMap();
  }
}

// Use throughout module system
const eventManager = new EventManager();

// In module creation:
eventManager.addListener(header, 'click', this.toggle.bind(this));

// In module destruction:
eventManager.cleanupElement(this.domElement);
```

**Required Actions:**
- [ ] Audit all current event listeners
- [ ] Create event management system
- [ ] Replace all direct event listeners
- [ ] Implement cleanup in module destruction
- [ ] Create memory leak detection tests
- [ ] Monitor memory usage during development

---

### 4. State Loss During Migration

**IMPACT: USER DATA LOSS**

**Problem:**
- **Current:** Form values persist in DOM elements
- **New:** Dynamic module creation may reset form values
- **Risk:** User loses current EDO/JI/MOS settings during migration

**Required Mitigation Strategy:**
```javascript
// statePreservation.js - MUST BE CREATED FIRST
export class StatePreservation {
  static captureCurrentState() {
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
  
  static restoreStateToModules(state, moduleSystem) {
    // Restore EDO module state
    const edoModule = moduleSystem.getModule('edo');
    if (edoModule && state.edo) {
      const edoInput = edoModule.contentElement.querySelector('#edo-input');
      if (edoInput) edoInput.value = state.edo.value;
      
      const edoLines = edoModule.contentElement.querySelector('#edo-lines');
      if (edoLines) edoLines.checked = state.edo.showLines;
      
      const primeColors = edoModule.contentElement.querySelector('#prime-colors-checkbox');
      if (primeColors) primeColors.checked = state.edo.primeColors;
    }
    
    // Restore JI module state
    const jiModule = moduleSystem.getModule('ji');
    if (jiModule && state.ji) {
      const primeCheckboxes = jiModule.contentElement.querySelectorAll('#prime-checkboxes input');
      primeCheckboxes.forEach(checkbox => {
        checkbox.checked = state.ji.selectedPrimes.includes(checkbox.value);
      });
      
      const oddLimitInput = jiModule.contentElement.querySelector('#odd-limit-input');
      if (oddLimitInput) oddLimitInput.value = state.ji.oddLimit;
    }
    
    // Restore MOS module state
    const mosModule = moduleSystem.getModule('mos');
    if (mosModule && state.mos) {
      const mosToggle = mosModule.contentElement.querySelector('#mos-toggle');
      if (mosToggle) mosToggle.checked = state.mos.enabled;
      
      const generatorInput = mosModule.contentElement.querySelector('#mos-generator-input');
      if (generatorInput) generatorInput.value = state.mos.generator;
      
      const stacksInput = mosModule.contentElement.querySelector('#mos-stacks-input');
      if (stacksInput) stacksInput.value = state.mos.stacks;
    }
  }
  
  static createMigrationCheckpoint() {
    const state = this.captureCurrentState();
    sessionStorage.setItem('moduleSystemMigrationCheckpoint', JSON.stringify(state));
    return state;
  }
  
  static restoreFromCheckpoint(moduleSystem) {
    const checkpointData = sessionStorage.getItem('moduleSystemMigrationCheckpoint');
    if (checkpointData) {
      const state = JSON.parse(checkpointData);
      this.restoreStateToModules(state, moduleSystem);
      return true;
    }
    return false;
  }
}
```

**Required Actions:**
- [ ] Create state preservation utilities
- [ ] Test state capture with all current forms
- [ ] Test state restoration to new modules
- [ ] Create checkpoint/restore mechanism
- [ ] Test end-to-end state preservation

---

### 5. Accessibility Regression Prevention

**IMPACT: SCREEN READER AND KEYBOARD NAVIGATION BREAKING**

**Problem:**
- **Current:** Static ARIA labels and relationships
- **New:** Dynamic ARIA states and focus management
- **Risk:** Screen readers lose track of expanded/collapsed states
- **Risk:** Keyboard navigation breaks with dynamic DOM changes

**Required Mitigation Strategy:**
```javascript
// a11yManager.js - MUST BE CREATED
export class A11yManager {
  static initializeA11y() {
    // Add live region for announcements if not exists
    if (!document.getElementById('sr-live-region')) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'sr-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.classList.add('sr-only');
      document.body.appendChild(liveRegion);
    }
  }

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
    
    // Update drag and drop ARIA attributes
    module.dragHandleElement?.setAttribute('aria-label', `Drag to reposition ${module.title} module`);
    module.dragHandleElement?.setAttribute('role', 'button');
    module.dragHandleElement?.setAttribute('tabindex', '0');
  }
  
  static announceChange(message) {
    // Live region for screen reader announcements
    const liveRegion = document.getElementById('sr-live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }
  
  static ensureKeyboardNavigation(moduleSystem) {
    // Ensure keyboard users can navigate between modules
    const modules = moduleSystem.getAllModules();
    modules.forEach((module, index) => {
      const nextModule = modules[index + 1];
      const prevModule = modules[index - 1];
      
      module.headerElement.addEventListener('keydown', (e) => {
        // Arrow key navigation between modules
        if (e.key === 'ArrowDown' && nextModule) {
          e.preventDefault();
          nextModule.headerElement.focus();
        } else if (e.key === 'ArrowUp' && prevModule) {
          e.preventDefault();
          prevModule.headerElement.focus();
        }
      });
    });
  }
}
```

**Required Actions:**
- [ ] Test current accessibility with screen readers
- [ ] Document current ARIA patterns
- [ ] Create accessibility management system
- [ ] Implement dynamic ARIA state management
- [ ] Ensure keyboard navigation works with dynamic layout
- [ ] Test screen reader compatibility
- [ ] Create accessibility regression test suite

---

### 6. Tooltip and Error Display Integration

**IMPACT: BROKEN UI FEEDBACK**

**Problem:**
- **Current:** Tooltips positioned relative to static elements
- **New:** Module content areas can be collapsed/reordered
- **Risk:** Tooltips appear in wrong positions or get clipped
- **Risk:** Error displays may not be visible in collapsed modules

**Required Mitigation Strategy:**
```javascript
// tooltipManager.js - MUST BE CREATED
export class TooltipManager {
  static positionTooltip(tooltip, targetElement) {
    // Check if target is in a module
    const module = targetElement.closest('.module');
    
    if (!module) {
      // Standard positioning for non-module elements
      this.standardPositioning(tooltip, targetElement);
      return;
    }
    
    const isCollapsed = module.classList.contains('module--collapsed');
    
    if (isCollapsed) {
      // Position relative to module header instead
      const header = module.querySelector('.module__header');
      this.positionRelativeTo(tooltip, header);
      
      // Add indicator that this relates to collapsed content
      tooltip.classList.add('tooltip--collapsed-content');
    } else {
      // Standard positioning within expanded module
      this.positionRelativeTo(tooltip, targetElement);
      tooltip.classList.remove('tooltip--collapsed-content');
    }
  }
  
  static handleError(errorMessage, relatedElement) {
    const module = relatedElement.closest('.module');
    
    // If error is in a collapsed module, expand it first
    if (module?.classList.contains('module--collapsed')) {
      // Get module instance and expand
      const moduleId = module.dataset.moduleId;
      const moduleSystem = window.moduleSystem; // Global reference
      moduleSystem.getModule(moduleId)?.expand();
      
      // Announce to screen readers
      A11yManager.announceChange(`${errorMessage}. Module expanded to show error.`);
    }
    
    // Then show error as normal
    this.showError(errorMessage, relatedElement);
  }
}
```

**Required Actions:**
- [ ] Test tooltip positioning with dynamic layout
- [ ] Create tooltip management system
- [ ] Update error handling for collapsed modules
- [ ] Test tooltip visibility with module states
- [ ] Create error visibility guarantees

---

### 7. Circular Dependency Prevention

**IMPACT: MODULE LOADING FAILURE**

**Problem:**
- **Current:** `main.js` → `edo.js`/`ji.js`/`mos.js` (one-way)
- **New:** `moduleSystem.js` ↔ `edo.js`/`ji.js`/`mos.js` (two-way)
- **Risk:** Circular import dependencies causing module loading failures

**Required Mitigation Strategy:**
```javascript
// moduleSystem.js - USE DEPENDENCY INJECTION
export class VisualizationModule {
  constructor(options) {
    const { id, title, renderFunction, color, initiallyExpanded } = options;
    this.id = id;
    this.title = title;
    this.renderFunction = renderFunction; // Injected, not imported
    this.color = color;
    this.expanded = initiallyExpanded !== false;
  }
  
  render(svg, dimensions) {
    if (this.expanded && this.renderFunction) {
      // Pass module content as parameter instead of importing getModuleById
      this.renderFunction(svg, dimensions, this.contentElement);
    }
  }
}

// edo.js - NO IMPORTS OF MODULE SYSTEM
export function renderEDO(svg, dimensions, moduleContentElement) {
  // Receive module content as parameter instead of importing getModuleById
  if (!moduleContentElement) return;
  
  const edoInput = moduleContentElement.querySelector('#edo-input');
  const edoValue = parseFloat(edoInput?.value || 0);
  
  // Rest of rendering code...
}

// modules.js - CREATES MODULES WITH DEPENDENCY INJECTION
import { VisualizationModule } from './moduleSystem.js';
import { renderEDO } from './edo.js';
import { renderJI } from './ji.js';
import { renderMOS } from './mos.js';

export const createModules = () => {
  return [
    new VisualizationModule({
      id: 'edo',
      title: 'Equal Divisions',
      color: '#1a73e8',
      renderFunction: renderEDO, // Inject render function
      initiallyExpanded: true
    }),
    new VisualizationModule({
      id: 'ji',
      title: 'Just Intonation',
      color: '#d93025',
      renderFunction: renderJI,
      initiallyExpanded: true
    }),
    new VisualizationModule({
      id: 'mos',
      title: 'Moment of Symmetry',
      color: '#188038',
      renderFunction: renderMOS,
      initiallyExpanded: false
    })
  ];
};
```

**Required Actions:**
- [ ] Map all current import dependencies
- [ ] Identify potential circular dependencies
- [ ] Implement dependency injection pattern
- [ ] Refactor imports to avoid cycles
- [ ] Test module loading order

---

### 8. Error Recovery and Fallback Mechanisms

**IMPACT: CATASTROPHIC APPLICATION FAILURE**

**Problem:**
- **Risk:** If module system fails to initialize, app becomes unusable
- **Risk:** Individual module failures could cascade
- **Need:** Graceful degradation and fallback to static layout

**Required Mitigation Strategy:**
```javascript
// errorBoundary.js - MUST BE CREATED
export class ModuleSystemErrorBoundary {
  static initialize() {
    try {
      // Try to initialize new module system
      return this.initializeModuleSystem();
    } catch (error) {
      console.error('Module system failed, falling back to static layout:', error);
      return this.fallbackToStaticLayout();
    }
  }
  
  static initializeModuleSystem() {
    // Feature detection first
    if (!this.browserSupportsRequiredFeatures()) {
      throw new Error('Browser missing required features for module system');
    }
    
    // Try module initialization
    const moduleSystem = new ModuleSystem();
    
    // Sanity check - does it work?
    if (!moduleSystem.validateFunctionality()) {
      throw new Error('Module system failed functionality validation');
    }
    
    return moduleSystem;
  }
  
  static fallbackToStaticLayout() {
    // Re-enable static module layout
    document.body.classList.add('fallback-static-modules');
    
    // Restore original event listeners
    this.restoreStaticEventListeners();
    
    // Log telemetry of failure
    console.warn('Module system failed, using static fallback');
    
    // Return null to indicate failure
    return null;
  }
  
  static browserSupportsRequiredFeatures() {
    // Check for required browser features
    return (
      'draggable' in document.createElement('div') &&
      'content' in document.createElement('template') &&
      'classList' in document.createElement('div') &&
      window.requestAnimationFrame &&
      window.localStorage
    );
  }
}

// In main.js - Use error boundary when initializing
const moduleSystem = ModuleSystemErrorBoundary.initialize();
if (moduleSystem) {
  // Use new module system
  moduleSystem.start();
} else {
  // Fallback to legacy static layout
  initializeLegacyLayout();
}
```

**Required Actions:**
- [ ] Implement module system error boundaries
- [ ] Create fallback to static layout
- [ ] Test error recovery scenarios
- [ ] Implement graceful degradation
- [ ] Document recovery procedures

---

## 🛡️ Safe Migration Approach

### Phase 0: Pre-Migration Safety (MANDATORY)

**Before ANY code changes:**

1. **Create Complete System Backup**
   ```bash
   # Create backup of entire codebase
   git tag pre-module-system-backup
   git push origin pre-module-system-backup
   ```

2. **Implement ALL Breaking Change Mitigations**
   - [ ] DOM compatibility layer
   - [ ] State preservation utilities  
   - [ ] Event management system
   - [ ] CSS conflict resolution
   - [ ] Accessibility management
   - [ ] Tooltip management
   - [ ] Dependency injection pattern
   - [ ] Error boundary system

3. **Create Rollback Procedures**
   ```javascript
   // rollback.js
   export class SystemRollback {
     static canRollback() {
       return sessionStorage.getItem('moduleSystemMigrationCheckpoint') !== null;
     }
     
     static executeRollback() {
       // Disable new module system
       document.body.classList.add('fallback-static-modules');
       document.body.classList.remove('using-dynamic-modules');
       
       // Restore state from checkpoint
       const checkpoint = sessionStorage.getItem('moduleSystemMigrationCheckpoint');
       if (checkpoint) {
         const state = JSON.parse(checkpoint);
         this.restoreStaticState(state);
       }
       
       // Show rollback notification
       this.showRollbackNotification();
     }
   }
   ```

4. **Create Feature Flag System**
   ```javascript
   // featureFlags.js
   export const FeatureFlags = {
     useNewModuleSystem: false, // Start with false
     allowModuleDragAndDrop: false,
     showModuleControls: false,
     useOptimizedRendering: false
   };
   
   // Load from local storage or defaults
   export function initializeFeatureFlags() {
     try {
       const savedFlags = localStorage.getItem('featureFlags');
       if (savedFlags) {
         const parsedFlags = JSON.parse(savedFlags);
         Object.assign(FeatureFlags, parsedFlags);
       }
     } catch (e) {
       console.error('Failed to load feature flags:', e);
     }
   }
   ```

### Phase 1: Parallel Implementation

**Build new system alongside existing system without removing old system:**

- Implement new module system classes
- Create new DOM structure in parallel
- Test new system in isolation
- Keep old system fully functional
- Use feature flags to switch between systems

### Phase 2: Gradual Migration

**Migrate one module at a time:**

1. **Start with EDO module** (simplest)
2. **Validate full functionality** before proceeding
3. **Add JI module** 
4. **Validate again**
5. **Add MOS module**
6. **Final validation**

**At each step:**
- [ ] Test rollback procedure works
- [ ] Validate no functionality lost
- [ ] Check for memory leaks
- [ ] Verify performance acceptable

### Phase 3: Legacy Cleanup

**Only after new system is fully validated:**

- Remove old system code
- Clean up compatibility layers (optional)
- Optimize new system
- Remove feature flags

---

## 🚨 Emergency Procedures

### If Things Go Wrong

**STOP IMMEDIATELY** - Don't try to fix on the fly

1. **Assess the Damage**
   - What functionality is broken?
   - Is user data at risk?
   - Can users still use the application?

2. **Execute Rollback if Necessary**
   ```javascript
   // In browser console if needed
   SystemRollback.executeRollback();
   ```

3. **Document the Issue**
   - What was being implemented when it broke?
   - What error messages appeared?
   - What user actions triggered the problem?

4. **Review Breaking Change Prevention**
   - Were all mitigations in place?
   - What was missed?
   - How can we prevent this in the future?

### Rollback Triggers

**Execute immediate rollback if:**
- [ ] Any core functionality completely broken
- [ ] User data lost or corrupted
- [ ] Application becomes unusable
- [ ] Performance degraded beyond acceptable levels
- [ ] Memory leaks detected causing browser issues
- [ ] Accessibility seriously compromised

---

## ✅ Implementation Checklist

### Before Starting ANY Implementation

- [ ] All team members have read and understood this document
- [ ] DOM compatibility layer implemented and tested
- [ ] State preservation utilities implemented and tested  
- [ ] Event management system implemented and tested
- [ ] CSS conflict resolution strategy chosen and implemented
- [ ] Accessibility management system implemented and tested
- [ ] Tooltip and error display integration implemented and tested
- [ ] Dependency injection pattern implemented
- [ ] Error boundary system implemented
- [ ] Rollback procedures created and tested
- [ ] Feature flag system implemented
- [ ] Complete system backup created
- [ ] Migration checkpoint system working

### During Implementation

- [ ] Breaking change mitigations applied at each step
- [ ] Rollback procedures tested at major milestones
- [ ] Memory usage monitored continuously
- [ ] Performance impact measured
- [ ] Functionality validated after each change
- [ ] User data preservation verified
- [ ] Accessibility maintained at each step

### Before Final Deployment

- [ ] Comprehensive regression testing completed
- [ ] All breaking change regressions fixed
- [ ] Performance benchmarks met
- [ ] Accessibility maintained or improved
- [ ] Cross-browser compatibility verified
- [ ] User acceptance testing passed
- [ ] All error recovery paths tested

---

**🔴 CRITICAL SAFETY NOTICE: Implementation of ANY feature of the module system MUST NOT BEGIN until ALL breaking change mitigations in this document are fully implemented and verified. No exceptions.**

---

## Order of Operations

1. **Complete ALL items in the "Before Starting ANY Implementation" checklist**
2. **Test and verify ALL breaking change mitigations independently**
3. **Get team sign-off on mitigation completeness**
4. **Only then proceed with module system implementation phases**

---

**REMINDER: This is not optional. Every breaking change mitigation must be implemented before proceeding with any code changes. The risk of catastrophic failure is too high without these safeguards.**
