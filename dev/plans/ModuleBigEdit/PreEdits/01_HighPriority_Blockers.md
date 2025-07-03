# High Priority Blockers - Module Management System Prerequisites

These are critical dependencies that must be completed first, as they are fundamental architectural changes that the module system depends on. **The module system cannot be implemented without these.**

---

## 1. State Management Implementation

**BLOCKER - CRITICAL DEPENDENCY**

The new module system depends on a robust state management pattern:
- **Action:** Implement the state management system as described in the JavaScript refactoring recommendations.
- **Priority:** Critical. This is a core dependency for the module system.
- **Impact:** Without this, the module system cannot track expansion states, order, or communicate changes.

**Implementation Required:**
```javascript
// state.js - Must be created
export const state = {
  modules: {
    edo: { expanded: true },
    ji: { expanded: true }, 
    mos: { expanded: false }
  },
  moduleOrder: ['edo', 'ji', 'mos']
};

export function updateState(path, value) { /* implementation */ }
```

---

## 2. State Capture/Restore Utilities for Migration Safety

**BLOCKER - PREVENTS DATA LOSS**

Current form state could be lost during module system migration:
- **Action:** Implement utilities to capture current form state and restore after module creation
- **Priority:** Critical. Prevents user data loss during migration.
- **Risk:** User loses current EDO/JI/MOS settings during system transition.

**Implementation Required:**
```javascript
// migrationSafety.js - Must be created
export class ModuleMigrationHelper {
  static captureCurrentState() { /* capture all form values */ }
  static restoreStateToModules(state) { /* restore to new modules */ }
}
```

---

## 3. DOM Selector Compatibility Layer

**BLOCKER - PREVENTS BREAKING CHANGES**

All existing `getElementById()` and `querySelector()` calls will break when elements move into dynamic modules:
- **Action:** Create compatibility layer that can find elements within module contexts
- **Priority:** Critical. Without this, all existing DOM queries will fail.
- **Files affected:** `main.js`, `edo.js`, `ji.js`, `mos.js`, `utils.js`

**Implementation Required:**
```javascript
// domCompatibility.js - Must be created
export const compat = {
  getElementById: (id) => {
    // Try direct lookup first, then search within modules
  },
  querySelector: (selector) => {
    // Enhanced selector that works with dynamic modules
  }
};
```

---

## 4. Rendering Function Signature Changes

**BLOCKER - ARCHITECTURAL INCOMPATIBILITY**

Current rendering functions have incompatible signatures with the new module system:
- **Current:** `renderEDO(svg, linesGroup, pointsGroup, centerX, centerY, radius)`
- **New system expects:** `renderEDO(svg, dimensions)` with module content accessed through `edoModule.contentElement`
- **Action:** Refactor all rendering functions to match the new signature before implementation
- **Files to update:** `edo.js`, `ji.js`, `mos.js`

**Required Changes:**
```javascript
// edo.js - Must be refactored
export function renderEDO(svg, dimensions) {
  // New signature - must be implemented before module system
  const edoModule = getModuleById('edo');
  if (!edoModule?.expanded) return;
  
  // Get elements from module content instead of global DOM
  const edoInput = edoModule.contentElement.querySelector('#edo-input');
  // ... rest of implementation
}
```

---

## 5. Main.js Rendering Loop Refactoring

**BLOCKER - CORE SYSTEM INCOMPATIBILITY**

The current `main.js` has hardcoded group management and rendering calls:
- **Current:** Creates groups statically: `jiGroup`, `edoGroup`, `mosGroup`
- **New:** Modules will manage their own groups dynamically
- **Action:** Plan and implement refactoring of the main rendering loop
- **Critical:** The `updateVisualizations()` function will need complete restructuring

**Required Changes:**
```javascript
// main.js - Critical refactoring needed
// OLD (must be replaced):
function updateVisualizations() {
  clearGroup(linesGroup);
  clearGroup(pointsGroup);
  renderEDO(svg, linesGroup, pointsGroup, centerX, centerY, radius);
  // ...
}

// NEW (must be implemented):
function updateVisualizations() {
  // Delegate to module system
  document.dispatchEvent(new CustomEvent('modules-changed'));
}
```

---

## Completion Criteria

### State Management System
- [ ] `state.js` file created with module state structure
- [ ] `updateState()` function implemented and tested
- [ ] State persistence mechanism in place
- [ ] Integration tests with existing codebase

### Migration Safety Utilities  
- [ ] `ModuleMigrationHelper` class implemented
- [ ] Current state capture function tested
- [ ] State restore function tested
- [ ] End-to-end migration test successful

### DOM Compatibility Layer
- [ ] Compatibility functions created
- [ ] All existing DOM queries tested with compatibility layer
- [ ] Zero breaking changes in existing functionality
- [ ] Performance impact evaluated

### Rendering Function Refactoring
- [ ] All rendering functions updated to new signatures
- [ ] Module content access pattern implemented
- [ ] Full rendering functionality preserved
- [ ] Integration tests passing

### Main.js Refactoring
- [ ] Static group management removed
- [ ] Dynamic module-based rendering implemented
- [ ] Event-driven architecture in place
- [ ] All visualizations working correctly

---

## Risk Assessment

**If these blockers are not completed:**
- Module system will fail to initialize
- Application will break completely
- User data will be lost
- Rollback will be difficult or impossible

**Estimated Effort:** 2-3 weeks of focused development

**Next Steps:** Complete these items before proceeding to medium priority tasks or beginning main module system implementation.
