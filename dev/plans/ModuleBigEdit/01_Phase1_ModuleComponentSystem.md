# Phase 1: Module Component System

**Objective:** Create the foundational module component system that handles expansion, collapse, and visibility.

**Timeline:** Week 1
**Dependencies:** Breaking Change Prevention (00) must be complete
**Can run parallel with:** Phase 3 (CSS Updates)

---

## Overview

This phase implements the core `VisualizationModule` class and related infrastructure. This is the foundation that all other phases depend on. The implementation must be non-breaking - it should work alongside the existing system without interfering.

---

## 🎯 Deliverables

### 1. Core Module System Files

**File: `js/moduleSystem.js`**
```javascript
// moduleSystem.js - Core module system implementation
import { state, updateState } from './state.js';

// Module registry to track all modules
const modules = [];
let moduleOrder = []; // Order of modules for rendering and display

// Base module class
export class VisualizationModule {
  constructor(options) {
    const {
      id,
      title,
      renderFunction,
      color = '#000000',
      initiallyExpanded = false,
    } = options;
    
    this.id = id;
    this.title = title;
    this.renderFunction = renderFunction;
    this.color = color;
    this.expanded = initiallyExpanded;
    this.domElement = null;
    this.headerElement = null;
    this.contentElement = null;
    this.orderIndex = modules.length; // Default order based on registration
    
    // Register this module
    modules.push(this);
    moduleOrder.push(id);
  }
  
  // Create the DOM structure
  createDom(container) {
    // Create module container
    const moduleEl = document.createElement('div');
    moduleEl.id = `${this.id}-module`;
    moduleEl.className = 'module dynamic'; // Add 'dynamic' class to differentiate
    moduleEl.setAttribute('data-module-id', this.id);
    
    // Create header
    const header = document.createElement('div');
    header.className = 'module__header';
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', this.expanded ? 'true' : 'false');
    header.setAttribute('aria-controls', `${this.id}-content`);
    
    // Create colored indicator
    const indicator = document.createElement('span');
    indicator.className = 'module__indicator';
    indicator.style.backgroundColor = this.color;
    indicator.setAttribute('aria-hidden', 'true'); // Decorative only
    
    // Create title
    const title = document.createElement('h3');
    title.className = 'module__title';
    title.textContent = this.title;
    
    // Create drag handle
    const dragHandle = document.createElement('span');
    dragHandle.className = 'module__drag-handle';
    dragHandle.innerHTML = '⋮⋮'; // Simple drag handle icon
    dragHandle.setAttribute('aria-label', 'Drag to reorder module');
    dragHandle.setAttribute('role', 'button');
    dragHandle.setAttribute('tabindex', '0');
    
    // Create content area
    const content = document.createElement('div');
    content.id = `${this.id}-content`;
    content.className = 'module__content';
    content.style.display = this.expanded ? 'block' : 'none';
    content.setAttribute('aria-labelledby', `${this.id}-title`);
    
    // Assemble module
    header.appendChild(indicator);
    header.appendChild(title);
    header.appendChild(dragHandle);
    moduleEl.appendChild(header);
    moduleEl.appendChild(content);
    
    // Add to container
    container.appendChild(moduleEl);
    
    // Store references
    this.domElement = moduleEl;
    this.headerElement = header;
    this.contentElement = content;
    
    // Set up event listeners
    this.setupEvents();
    
    return this;
  }
  
  // Set up event listeners
  setupEvents() {
    // Toggle expansion when header is clicked
    this.headerElement.addEventListener('click', (e) => {
      // Ignore clicks on the drag handle
      if (e.target.closest('.module__drag-handle')) return;
      this.toggle();
    });
    
    // Keyboard accessibility for header
    this.headerElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });
    
    // Keyboard accessibility for drag handle
    const dragHandle = this.headerElement.querySelector('.module__drag-handle');
    dragHandle.addEventListener('keydown', (e) => {
      // Arrow keys for reordering (basic keyboard support)
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.handleKeyboardReorder(e.key === 'ArrowUp' ? 'up' : 'down');
      }
    });
  }
  
  // Toggle expansion state
  toggle() {
    this.expanded = !this.expanded;
    this.contentElement.style.display = this.expanded ? 'block' : 'none';
    this.headerElement.setAttribute('aria-expanded', this.expanded ? 'true' : 'false');
    
    // Update state and trigger rendering
    updateState(`modules.${this.id}.expanded`, this.expanded);
    updateRendering();
    
    // Update module classes
    this.domElement.classList.toggle('module--expanded', this.expanded);
    this.domElement.classList.toggle('module--collapsed', !this.expanded);
    
    // Announce change for screen readers
    this.announceStateChange();
  }
  
  // Programmatically expand the module
  expand() {
    if (!this.expanded) this.toggle();
  }
  
  // Programmatically collapse the module
  collapse() {
    if (this.expanded) this.toggle();
  }
  
  // Update the module's order
  setOrder(index) {
    this.orderIndex = index;
    this.domElement.style.order = index;
  }
  
  // Render this module's visualization
  render(svg, dimensions) {
    if (this.expanded && this.renderFunction) {
      // Use dependency injection pattern to avoid circular imports
      this.renderFunction(svg, dimensions, this.contentElement);
    }
  }
  
  // Handle keyboard-based reordering
  handleKeyboardReorder(direction) {
    const currentIndex = moduleOrder.indexOf(this.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < moduleOrder.length) {
      // Swap positions
      [moduleOrder[currentIndex], moduleOrder[newIndex]] = 
      [moduleOrder[newIndex], moduleOrder[currentIndex]];
      
      // Update visual order
      this.updateModuleOrder();
      
      // Update state
      updateState('moduleOrder', moduleOrder);
      updateRendering();
      
      // Announce change
      this.announceOrderChange(direction);
    }
  }
  
  // Announce state changes for accessibility
  announceStateChange() {
    const message = `${this.title} module ${this.expanded ? 'expanded' : 'collapsed'}`;
    this.announceToScreenReader(message);
  }
  
  announceOrderChange(direction) {
    const message = `${this.title} module moved ${direction}`;
    this.announceToScreenReader(message);
  }
  
  announceToScreenReader(message) {
    // Create or update live region for announcements
    let liveRegion = document.getElementById('module-announcements');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'module-announcements';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }
    
    liveRegion.textContent = message;
  }
}

// Initialize all modules in the container
export function initModules(container) {
  // Clear container
  container.innerHTML = '';
  
  // Create and append modules in the current order
  moduleOrder.forEach((id, index) => {
    const module = getModuleById(id);
    if (module) {
      module.createDom(container);
      module.setOrder(index);
    }
  });
  
  // Set up drag-and-drop (will be implemented in Phase 2)
  // setupDragAndDrop(container);
}

// Helper to find a module by ID
export function getModuleById(id) {
  return modules.find(module => module.id === id);
}

// Update the rendering of all modules
function updateRendering() {
  // This will be called by the renderer system
  // The actual implementation depends on how the rendering system is structured
  document.dispatchEvent(new CustomEvent('modules-changed', {
    detail: { moduleOrder, modules }
  }));
}

// Update visual module order
function updateModuleOrder() {
  moduleOrder.forEach((id, index) => {
    const module = getModuleById(id);
    if (module) {
      module.setOrder(index);
    }
  });
}

// Expose method to get modules in current order
export function getOrderedModules() {
  return moduleOrder.map(id => getModuleById(id)).filter(Boolean);
}

// Get all modules
export function getAllModules() {
  return modules;
}

// Update module order (used by drag and drop)
export function updateModuleOrder(newOrder) {
  moduleOrder = newOrder;
  updateModuleOrder();
  updateState('moduleOrder', moduleOrder);
  updateRendering();
}
```

### 2. State Management Integration

**Requirement:** Must integrate with state management system from Breaking Change Prevention.

**Expected State Structure:**
```javascript
// state.js structure needed
const state = {
  modules: {
    edo: { expanded: true },
    ji: { expanded: true },
    mos: { expanded: false }
  },
  moduleOrder: ['edo', 'ji', 'mos'],
  // ... existing state
};
```

### 3. Error Handling and Validation

**File: `js/moduleSystemValidation.js`**
```javascript
// moduleSystemValidation.js
export class ModuleSystemValidation {
  static validateModuleOptions(options) {
    const required = ['id', 'title', 'renderFunction'];
    const missing = required.filter(prop => !options[prop]);
    
    if (missing.length > 0) {
      throw new Error(`Module options missing required properties: ${missing.join(', ')}`);
    }
    
    if (typeof options.id !== 'string' || options.id.trim() === '') {
      throw new Error('Module id must be a non-empty string');
    }
    
    if (typeof options.renderFunction !== 'function') {
      throw new Error('Module renderFunction must be a function');
    }
    
    return true;
  }
  
  static validateModuleContainer(container) {
    if (!container || !container.nodeType) {
      throw new Error('Module container must be a valid DOM element');
    }
    
    return true;
  }
  
  static validateStateIntegration() {
    // Check if state management is available
    try {
      const { state, updateState } = require('./state.js');
      if (!state || typeof updateState !== 'function') {
        throw new Error('State management system not properly configured');
      }
    } catch (error) {
      throw new Error('State management system not available. Complete Breaking Change Prevention first.');
    }
    
    return true;
  }
}
```

---

## 🔧 Implementation Steps

### Step 1: Prerequisites Validation
- [ ] Verify all Breaking Change Prevention measures are in place
- [ ] Confirm state management system is implemented
- [ ] Ensure DOM compatibility layer is working
- [ ] Test event management system

### Step 2: Core Module Class Implementation
- [ ] Create `VisualizationModule` class with full functionality
- [ ] Implement DOM creation with proper accessibility
- [ ] Add event handling with memory leak prevention
- [ ] Create module registry and management functions

### Step 3: Integration Layer
- [ ] Integrate with state management system
- [ ] Create validation and error handling
- [ ] Implement accessibility features (ARIA, screen reader support)
- [ ] Add keyboard navigation support

### Step 4: Testing and Validation
- [ ] Test module creation and destruction
- [ ] Verify event listeners are properly cleaned up
- [ ] Test accessibility with screen readers
- [ ] Validate keyboard navigation works
- [ ] Ensure no conflicts with existing system

---

## 🧪 Testing Requirements

### Unit Tests
```javascript
// tests/moduleSystem.test.js
describe('VisualizationModule', () => {
  test('creates module with required options', () => {
    const options = {
      id: 'test',
      title: 'Test Module',
      renderFunction: () => {},
      color: '#ff0000'
    };
    
    const module = new VisualizationModule(options);
    expect(module.id).toBe('test');
    expect(module.title).toBe('Test Module');
    expect(module.color).toBe('#ff0000');
  });
  
  test('throws error with missing required options', () => {
    expect(() => {
      new VisualizationModule({ id: 'test' });
    }).toThrow();
  });
  
  test('creates proper DOM structure', () => {
    const module = new VisualizationModule({
      id: 'test',
      title: 'Test',
      renderFunction: () => {}
    });
    
    const container = document.createElement('div');
    module.createDom(container);
    
    expect(container.querySelector('.module')).toBeTruthy();
    expect(container.querySelector('.module__header')).toBeTruthy();
    expect(container.querySelector('.module__content')).toBeTruthy();
  });
});
```

### Integration Tests
- [ ] Test with existing HTML structure
- [ ] Verify no interference with current functionality
- [ ] Test memory usage (no leaks)
- [ ] Test accessibility compliance

### Accessibility Tests
- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] ARIA attribute correctness
- [ ] Focus management

---

## 🚨 Safety Measures

### Non-Breaking Implementation
- Module system runs in parallel with existing system
- Uses 'dynamic' class to differentiate from existing modules
- No removal or modification of existing DOM elements
- Feature flag integration for safe testing

### Memory Management
- All event listeners tracked and cleaned up
- WeakMap usage for element references
- Proper disposal methods for modules

### Error Recovery
```javascript
// Error boundary for module system
try {
  initModules(container);
} catch (error) {
  console.error('Module system initialization failed:', error);
  // Fall back to existing system
  fallbackToStaticModules();
}
```

---

## ✅ Completion Criteria

### Phase 1 is complete when:
- [ ] `VisualizationModule` class fully implemented and tested
- [ ] Module registry and management functions working
- [ ] DOM creation with proper accessibility implemented
- [ ] Event handling with cleanup working correctly
- [ ] Integration with state management system complete
- [ ] No conflicts with existing system
- [ ] All unit tests passing
- [ ] Accessibility compliance verified
- [ ] Memory leak testing passed
- [ ] Error handling and validation implemented

### Ready for Phase 2 when:
- [ ] Module system can create and manage modules
- [ ] Expand/collapse functionality works
- [ ] Event system is stable and leak-free
- [ ] Accessibility features are working
- [ ] Integration with existing system is seamless

---

## 🔄 Next Phase Preparation

**For Phase 2 (Drag and Drop):**
- Module system must be stable and tested
- Event management system working properly
- DOM structure ready for drag handlers
- Accessibility foundation in place

**For Phase 3 (CSS Updates):**
- Module classes and states defined
- CSS hooks available for styling
- Theme integration points identified

---

**Note:** This phase establishes the foundation for the entire module system. Take time to get it right - all other phases depend on this working correctly and safely.
