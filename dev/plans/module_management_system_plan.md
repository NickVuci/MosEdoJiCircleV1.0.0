# Module Management System Enhancement Plan

This document outlines a plan to implement a unified, flexible module management system for the MosEdoJiCircle application, replacing the current ad-hoc approach with a consistent, user-friendly interface that allows for module expansion/collapse and reordering via drag-and-drop.

## Current Limitations

The application currently has several issues with module management:

1. **Inconsistent Visibility Controls**:
   - MOS visualization uses a dedicated checkbox toggle
   - EDO visualization requires setting the value to 0 to hide
   - JI visualization requires unchecking all prime checkboxes

2. **Fixed Visual Layering**:
   - The rendering order of visualizations is hardcoded
   - Users cannot adjust which visualizations appear on top

3. **Always Expanded Modules**:
   - All control modules are always fully expanded
   - No way to collapse modules to save space or focus attention

4. **No Visual Priority**:
   - No clear indication of which visualization is the "primary" focus
   - Difficult to work with multiple visualizations simultaneously

## Proposed Solution

### Core Concepts

1. **Unified Module System**:
   - Each module (EDO, JI, MOS) follows the same pattern for visibility
   - Modules are collapsible/expandable with a consistent interface
   - Module visibility directly tied to expansion state (expanded = visible)

2. **Drag-and-Drop Ordering**:
   - Users can reorder modules using drag-and-drop
   - Order determines both sidebar arrangement and visualization layering
   - Top module in sidebar = top layer in visualization

3. **Visual Feedback**:
   - Clear indicators showing which modules are active
   - Visual hierarchy showing rendering order
   - Preview/hint of the visualization color/style in module header

## Implementation Plan

### Phase 1: Module Component System

Create a unified module component system that handles expansion, collapse, and visibility:

```javascript
// moduleSystem.js
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
    moduleEl.className = 'module';
    moduleEl.setAttribute('data-module-id', this.id);
    
    // Create header
    const header = document.createElement('div');
    header.className = 'module__header';
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', this.expanded ? 'true' : 'false');
    
    // Create colored indicator
    const indicator = document.createElement('span');
    indicator.className = 'module__indicator';
    indicator.style.backgroundColor = this.color;
    
    // Create title
    const title = document.createElement('h3');
    title.className = 'module__title';
    title.textContent = this.title;
    
    // Create drag handle
    const dragHandle = document.createElement('span');
    dragHandle.className = 'module__drag-handle';
    dragHandle.innerHTML = '⋮⋮'; // Simple drag handle icon
    dragHandle.setAttribute('aria-label', 'Drag to reorder module');
    
    // Create content area
    const content = document.createElement('div');
    content.className = 'module__content';
    content.style.display = this.expanded ? 'block' : 'none';
    
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
    
    // Keyboard accessibility
    this.headerElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
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
      this.renderFunction(svg, dimensions);
    }
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
  
  // Set up drag-and-drop
  setupDragAndDrop(container);
}

// Helper to find a module by ID
function getModuleById(id) {
  return modules.find(module => module.id === id);
}

// Update the rendering of all modules
function updateRendering() {
  // This will be called by the renderer system
  // The actual implementation depends on how the rendering system is structured
  document.dispatchEvent(new CustomEvent('modules-changed'));
}

// Expose method to get modules in current order
export function getOrderedModules() {
  return moduleOrder.map(id => getModuleById(id)).filter(Boolean);
}
```

### Phase 2: Drag and Drop Implementation

Add drag-and-drop functionality for module reordering:

```javascript
// Part of moduleSystem.js

// Set up drag-and-drop functionality
function setupDragAndDrop(container) {
  // Use SortableJS or a similar library for drag-and-drop
  // This is a simplified version using the HTML5 Drag and Drop API
  
  const moduleElements = container.querySelectorAll('.module');
  
  moduleElements.forEach(moduleEl => {
    const dragHandle = moduleEl.querySelector('.module__drag-handle');
    if (!dragHandle) return;
    
    // Make only the handle draggable
    dragHandle.setAttribute('draggable', 'true');
    
    dragHandle.addEventListener('dragstart', (e) => {
      // Set data and styling
      const moduleId = moduleEl.getAttribute('data-module-id');
      e.dataTransfer.setData('text/plain', moduleId);
      moduleEl.classList.add('module--dragging');
      
      // For better drag image
      setTimeout(() => {
        moduleEl.classList.add('module--dragging-active');
      }, 0);
    });
    
    dragHandle.addEventListener('dragend', () => {
      moduleEl.classList.remove('module--dragging', 'module--dragging-active');
    });
  });
  
  // Handle drag over
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    
    const draggingEl = container.querySelector('.module--dragging');
    if (!draggingEl) return;
    
    // Find the module we're currently hovering over
    const targetEl = getModuleElementUnderCursor(container, e.clientY);
    if (!targetEl || targetEl === draggingEl) return;
    
    // Determine if we should insert before or after
    const rect = targetEl.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const insertBefore = e.clientY < midpoint;
    
    if (insertBefore) {
      container.insertBefore(draggingEl, targetEl);
    } else {
      container.insertBefore(draggingEl, targetEl.nextSibling);
    }
  });
  
  // Handle drop
  container.addEventListener('drop', (e) => {
    e.preventDefault();
    
    // Update module order based on DOM order
    moduleOrder = Array.from(container.querySelectorAll('.module'))
      .map(el => el.getAttribute('data-module-id'));
    
    // Update order properties
    moduleOrder.forEach((id, index) => {
      const module = getModuleById(id);
      if (module) module.setOrder(index);
    });
    
    // Save order to state
    updateState('moduleOrder', moduleOrder);
    
    // Update visualization rendering order
    updateRendering();
  });
}

// Helper to find which module element is under the cursor
function getModuleElementUnderCursor(container, clientY) {
  return Array.from(container.querySelectorAll('.module:not(.module--dragging)'))
    .find(el => {
      const rect = el.getBoundingClientRect();
      return clientY >= rect.top && clientY <= rect.bottom;
    });
}
```

### Phase 3: CSS Updates

Add the necessary CSS for the enhanced module system:

```css
/* Add to components/modules.css */

/* Module states */
.module--expanded .module__indicator {
  opacity: 1;
}

.module--collapsed .module__indicator {
  opacity: 0.5;
}

/* Module header */
.module__header {
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
}

.module__header:hover {
  background-color: var(--control-background);
}

/* Module indicator */
.module__indicator {
  width: var(--space-sm);
  height: var(--space-sm);
  border-radius: 50%;
  margin-right: var(--space-sm);
  transition: opacity var(--transition-fast) var(--transition-timing-default);
}

/* Module drag handle */
.module__drag-handle {
  margin-left: auto;
  cursor: grab;
  opacity: 0.5;
  transition: opacity var(--transition-fast) var(--transition-timing-default);
}

.module__drag-handle:hover {
  opacity: 1;
}

/* Dragging styles */
.module--dragging {
  opacity: 0.6;
  position: relative;
  z-index: 10;
}

.module--dragging-active {
  outline: 2px dashed var(--link-color);
}

/* Animation for expand/collapse */
.module__content {
  transition: height var(--transition-medium) var(--transition-timing-default);
  overflow: hidden;
}
```

### Phase 4: Integrating with the Rendering System

Update the rendering system to respect module order:

```javascript
// renderer.js
import { state } from './state.js';
import { getOrderedModules } from './moduleSystem.js';

export function initializeRenderer(svg) {
  // Set up groups for each module in advance
  const moduleGroups = {};
  
  // Listen for module changes
  document.addEventListener('modules-changed', () => {
    renderVisualizations(svg);
  });
  
  // Initial render
  renderVisualizations(svg);
  
  function renderVisualizations(svg) {
    // Clear existing visualizations or prepare groups
    prepareGroups(svg);
    
    // Get modules in order (last = top layer)
    const orderedModules = getOrderedModules();
    
    // Render each module's visualization
    orderedModules.forEach(module => {
      // Get or create group for this module
      const group = ensureGroup(svg, `${module.id}-group`);
      
      // Clear previous content
      clearGroup(group);
      
      // Render if expanded
      if (module.expanded) {
        module.render(svg, state.dimensions);
        
        // Move to correct z-order (last module = top layer)
        group.raise();
      }
    });
  }
  
  function prepareGroups(svg) {
    // Create or ensure a group exists for each module
    getOrderedModules().forEach(module => {
      const groupId = `${module.id}-group`;
      if (!moduleGroups[groupId]) {
        moduleGroups[groupId] = ensureGroup(svg, groupId);
      }
    });
  }
}
```

### Phase 5: Module Definitions and Integration

Define and register the modules:

```javascript
// modules.js
import { VisualizationModule } from './moduleSystem.js';
import { renderEDO } from './edo.js';
import { renderJI } from './ji.js';
import { renderMOS } from './mos.js';

// Create EDO module
export const edoModule = new VisualizationModule({
  id: 'edo',
  title: 'Equal Divisions',
  color: '#1a73e8',
  renderFunction: renderEDO,
  initiallyExpanded: true
});

// Create JI module
export const jiModule = new VisualizationModule({
  id: 'ji',
  title: 'Just Intonation',
  color: '#e8710a',
  renderFunction: renderJI,
  initiallyExpanded: true
});

// Create MOS module
export const mosModule = new VisualizationModule({
  id: 'mos',
  title: 'Moment of Symmetry',
  color: '#7b1fa2',
  renderFunction: renderMOS,
  initiallyExpanded: false
});

// Export all modules in an array for convenience
export const allModules = [edoModule, jiModule, mosModule];
```

### Phase 6: Update HTML Structure

Update the HTML to support the new module system:

```html
<!-- In index.html -->
<div id="sidebar">
  <!-- Module container will be populated by JavaScript -->
  <div id="modules-container" class="modules-container">
    <!-- Modules will be created here -->
  </div>
  
  <!-- Other sidebar content -->
</div>

<script type="module">
  import { initModules } from './js/moduleSystem.js';
  import { allModules } from './js/modules.js';
  
  // Initialize modules after DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    const modulesContainer = document.getElementById('modules-container');
    if (modulesContainer) {
      initModules(modulesContainer);
    }
  });
</script>
```

### Phase 7: Update Module Controls

Update each module's internal controls:

```javascript
// For each module, we need to modify their rendering functions
// to get their content from the module system

// For example, in edo.js:
export function renderEDO(svg, dimensions) {
  const edoModule = getModuleById('edo');
  if (!edoModule || !edoModule.expanded) return;
  
  // Get the EDO value from the input
  const edoInput = edoModule.contentElement.querySelector('#edo-input');
  const edoValue = parseFloat(edoInput?.value || 0);
  
  // Rest of rendering code...
}
```

## Implementation Timeline

### Week 1: Core Structure
- Create the module system base classes
- Implement the expand/collapse functionality
- Update CSS for module styling
- Create basic module definitions

### Week 2: Drag and Drop
- Implement drag-and-drop functionality
- Integrate with state management
- Add visual feedback for drag operations
- Ensure keyboard accessibility

### Week 3: Rendering Integration
- Update rendering system to work with module order
- Integrate module visibility with expansion state
- Ensure proper group management in SVG
- Add proper layer management

### Week 4: Testing and Refinement
- Test all interactions
- Fix edge cases
- Optimize drag performance
- Ensure accessibility compliance
- Add documentation

## Technical Challenges

1. **SVG Layer Management**:
   - Ensuring proper z-ordering of visualization elements
   - Managing groups and cleanup between renders

2. **Drag Performance**:
   - Ensuring smooth dragging without janky movements
   - Handling drag with large DOM elements

3. **State Synchronization**:
   - Keeping UI state, module state, and visualization state in sync
   - Handling module state persistence between sessions

4. **Accessibility**:
   - Ensuring keyboard navigation for module ordering
   - Providing proper ARIA attributes for state changes

## Benefits

This implementation will provide numerous benefits:

1. **Unified Interface**:
   - Consistent approach to module visibility
   - Clear visual hierarchy

2. **User Control**:
   - Custom ordering of visualizations
   - Ability to focus on specific modules

3. **Improved UX**:
   - More screen space with collapsible modules
   - Better organization of controls

4. **Extendability**:
   - Easier to add new visualization modules
   - Consistent pattern for all future modules

## Conclusion

By implementing this module management system, the MosEdoJiCircle application will gain significant improvements in usability, customization, and visual clarity. The unified approach to module visibility and ordering will replace the current ad-hoc methods, providing users with intuitive control over which visualizations are displayed and how they are layered.

The collapsible modules will allow users to focus on specific aspects of the visualization while the drag-and-drop ordering will enable custom arrangement of both the sidebar controls and the visualization layers. This enhancement will transform the application from a fixed-layout tool to a flexible, user-configurable environment for exploring musical concepts.
