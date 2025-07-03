# Phase 2: Drag and Drop Functionality Implementation

**Status**: 📋 Ready for Implementation  
**Dependencies**: Phase 1 (Module Component System) must be complete  
**Timeline**: Week 2 deliverable  
**Risk Level**: 🟡 Medium (User interaction complexity)

---

## 🎯 Phase 2 Overview

Implement HTML5 Drag and Drop functionality for module reordering with full touch device support, visual feedback, and state persistence.

### Key Deliverables:
1. ✅ HTML5 Drag and Drop API integration
2. ✅ Touch device compatibility layer
3. ✅ Visual feedback system during drag operations
4. ✅ Module reordering with state persistence
5. ✅ Accessibility support for non-drag interactions

---

## 🏗️ Implementation Tasks

### Task 2.1: Core Drag and Drop Infrastructure
**File**: `js/main.js` - ModuleManager drag system

```javascript
// Add to ModuleManager class
class ModuleManager {
    // ... existing code ...
    
    /**
     * Initialize drag and drop functionality for all modules
     */
    initializeDragAndDrop() {
        this.modules.forEach((module, index) => {
            this.setupModuleDragEvents(module, index);
        });
        
        // Set up drop zones
        this.setupDropZones();
        
        // Initialize touch support
        this.initializeTouchDragSupport();
    }
    
    /**
     * Set up drag events for a specific module
     */
    setupModuleDragEvents(module, index) {
        const header = module.headerElement;
        
        // Make header draggable
        header.draggable = true;
        header.setAttribute('role', 'button');
        header.setAttribute('aria-describedby', `module-drag-instructions-${module.id}`);
        
        // Drag start
        header.addEventListener('dragstart', (e) => {
            this.handleDragStart(e, module, index);
        });
        
        // Drag end
        header.addEventListener('dragend', (e) => {
            this.handleDragEnd(e, module);
        });
        
        // Keyboard alternative for accessibility
        header.addEventListener('keydown', (e) => {
            this.handleKeyboardReorder(e, module, index);
        });
    }
    
    /**
     * Handle drag start event
     */
    handleDragStart(event, module, index) {
        // Store drag data
        this.dragData = {
            sourceModule: module,
            sourceIndex: index,
            originalOrder: [...this.moduleOrder]
        };
        
        // Set drag effect
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', module.id);
        
        // Add visual feedback
        module.element.classList.add('dragging');
        this.addDragGhost(event, module);
        
        // Announce to screen readers
        this.announceToScreenReader(`Started dragging ${module.displayName} module`);
        
        // Show drop zones
        this.showDropZones();
        
        // Trigger custom event
        this.emitEvent('moduleragstart', {
            module: module,
            index: index
        });
    }
    
    /**
     * Handle drag end event
     */
    handleDragEnd(event, module) {
        // Clean up visual feedback
        module.element.classList.remove('dragging');
        this.hideDropZones();
        this.removeDragFeedback();
        
        // Clear drag data
        this.dragData = null;
        
        // Announce completion
        this.announceToScreenReader(`Finished dragging ${module.displayName} module`);
        
        // Trigger custom event
        this.emitEvent('moduledragend', {
            module: module
        });
    }
}
```

### Task 2.2: Drop Zone Management
**File**: `js/main.js` - Drop zone system

```javascript
// Add to ModuleManager class
class ModuleManager {
    /**
     * Set up drop zones between modules
     */
    setupDropZones() {
        this.dropZones = [];
        
        // Create drop zones between each module
        this.modules.forEach((module, index) => {
            // Drop zone before this module
            const dropZone = this.createDropZone(index, 'before');
            this.dropZones.push(dropZone);
            
            // Insert drop zone before module
            this.moduleContainer.insertBefore(dropZone, module.element);
        });
        
        // Final drop zone at the end
        const finalDropZone = this.createDropZone(this.modules.length, 'after');
        this.dropZones.push(finalDropZone);
        this.moduleContainer.appendChild(finalDropZone);
    }
    
    /**
     * Create a drop zone element
     */
    createDropZone(index, position) {
        const dropZone = document.createElement('div');
        dropZone.className = 'module-drop-zone';
        dropZone.setAttribute('data-drop-index', index);
        dropZone.setAttribute('data-drop-position', position);
        
        // Drop zone events
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            dropZone.classList.add('drop-zone-active');
        });
        
        dropZone.addEventListener('dragleave', (e) => {
            dropZone.classList.remove('drop-zone-active');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.handleDrop(e, index, position);
        });
        
        return dropZone;
    }
    
    /**
     * Handle module drop
     */
    handleDrop(event, targetIndex, position) {
        if (!this.dragData) return;
        
        const { sourceModule, sourceIndex } = this.dragData;
        
        // Calculate new position
        let newIndex = targetIndex;
        if (position === 'after') {
            newIndex = targetIndex;
        } else if (sourceIndex < targetIndex) {
            newIndex = targetIndex - 1;
        }
        
        // Don't move if dropped in same position
        if (newIndex === sourceIndex) {
            return;
        }
        
        // Perform the reorder
        this.reorderModules(sourceIndex, newIndex);
        
        // Announce to screen readers
        this.announceToScreenReader(
            `Moved ${sourceModule.displayName} to position ${newIndex + 1} of ${this.modules.length}`
        );
        
        // Trigger custom event
        this.emitEvent('modulereordered', {
            module: sourceModule,
            oldIndex: sourceIndex,
            newIndex: newIndex
        });
    }
    
    /**
     * Show all drop zones
     */
    showDropZones() {
        this.dropZones.forEach(zone => {
            zone.classList.add('drop-zone-visible');
        });
    }
    
    /**
     * Hide all drop zones
     */
    hideDropZones() {
        this.dropZones.forEach(zone => {
            zone.classList.remove('drop-zone-visible', 'drop-zone-active');
        });
    }
}
```

### Task 2.3: Touch Device Support
**File**: `js/main.js` - Touch drag implementation

```javascript
// Add to ModuleManager class
class ModuleManager {
    /**
     * Initialize touch-based drag support
     */
    initializeTouchDragSupport() {
        this.touchDragData = null;
        
        this.modules.forEach((module, index) => {
            this.setupTouchDragEvents(module, index);
        });
    }
    
    /**
     * Set up touch events for a module
     */
    setupTouchDragEvents(module, index) {
        const header = module.headerElement;
        let touchStartTime = 0;
        let touchMoved = false;
        
        header.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchMoved = false;
            
            // Start touch drag after delay (to distinguish from scroll)
            this.touchDragTimeout = setTimeout(() => {
                this.startTouchDrag(e, module, index);
            }, 300);
        });
        
        header.addEventListener('touchmove', (e) => {
            touchMoved = true;
            
            if (this.touchDragData) {
                e.preventDefault(); // Prevent scrolling
                this.updateTouchDrag(e);
            } else {
                // Cancel long-press detection if user scrolls
                clearTimeout(this.touchDragTimeout);
            }
        });
        
        header.addEventListener('touchend', (e) => {
            clearTimeout(this.touchDragTimeout);
            
            if (this.touchDragData) {
                this.finishTouchDrag(e);
            }
        });
        
        header.addEventListener('touchcancel', (e) => {
            clearTimeout(this.touchDragTimeout);
            this.cancelTouchDrag();
        });
    }
    
    /**
     * Start touch-based drag
     */
    startTouchDrag(event, module, index) {
        const touch = event.touches[0];
        
        this.touchDragData = {
            sourceModule: module,
            sourceIndex: index,
            startX: touch.clientX,
            startY: touch.clientY,
            currentDropZone: null
        };
        
        // Visual feedback
        module.element.classList.add('touch-dragging');
        this.showDropZones();
        
        // Create floating drag preview
        this.createTouchDragPreview(module, touch);
        
        // Haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // Announce to screen readers
        this.announceToScreenReader(`Started touch dragging ${module.displayName} module`);
    }
    
    /**
     * Update touch drag position
     */
    updateTouchDrag(event) {
        if (!this.touchDragData) return;
        
        const touch = event.touches[0];
        
        // Update drag preview position
        if (this.touchDragPreview) {
            this.touchDragPreview.style.left = touch.clientX + 'px';
            this.touchDragPreview.style.top = touch.clientY + 'px';
        }
        
        // Find current drop zone
        const dropZone = this.findDropZoneAtPoint(touch.clientX, touch.clientY);
        this.updateTouchDropZone(dropZone);
    }
    
    /**
     * Finish touch-based drag
     */
    finishTouchDrag(event) {
        if (!this.touchDragData) return;
        
        const { sourceModule, sourceIndex, currentDropZone } = this.touchDragData;
        
        // Remove visual feedback
        sourceModule.element.classList.remove('touch-dragging');
        this.hideDropZones();
        this.removeTouchDragPreview();
        
        // Perform drop if over valid zone
        if (currentDropZone) {
            const targetIndex = parseInt(currentDropZone.getAttribute('data-drop-index'));
            const position = currentDropZone.getAttribute('data-drop-position');
            
            this.handleDrop({ preventDefault: () => {} }, targetIndex, position);
        }
        
        // Clean up
        this.touchDragData = null;
        
        // Announce completion
        this.announceToScreenReader(`Finished touch dragging ${sourceModule.displayName} module`);
    }
}
```

### Task 2.4: Visual Feedback System
**File**: `css/components/modules.css` - Drag visual feedback

```css
/* Drag and Drop Visual Feedback */
.module-drop-zone {
    height: 4px;
    background: transparent;
    transition: all var(--transition-standard);
    margin: 2px 0;
    border-radius: 2px;
    opacity: 0;
    transform: scaleY(0);
}

.module-drop-zone.drop-zone-visible {
    opacity: 1;
    transform: scaleY(1);
    background: var(--color-primary-light);
}

.module-drop-zone.drop-zone-active {
    height: 8px;
    background: var(--color-primary);
    box-shadow: 0 0 8px var(--color-primary-glow);
}

/* Module drag states */
.visualization-module.dragging {
    opacity: 0.6;
    transform: rotate(2deg);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    z-index: 1000;
}

.visualization-module.touch-dragging {
    opacity: 0.8;
    transform: scale(1.02);
}

/* Drag preview for touch */
.touch-drag-preview {
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    opacity: 0.8;
    transform: rotate(5deg) scale(0.9);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    border-radius: var(--border-radius-lg);
    background: var(--color-surface);
    border: 2px solid var(--color-primary);
}

/* Module header drag affordance */
.module-header[draggable="true"] {
    cursor: grab;
    user-select: none;
}

.module-header[draggable="true"]:active {
    cursor: grabbing;
}

/* Drag handle indicator */
.module-header::before {
    content: '⋮⋮';
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-secondary);
    font-size: 12px;
    line-height: 1;
    opacity: 0;
    transition: opacity var(--transition-standard);
}

.module-header:hover::before,
.module-header:focus::before {
    opacity: 0.6;
}

.visualization-module.dragging .module-header::before {
    opacity: 1;
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
    .module-drop-zone,
    .visualization-module.dragging,
    .visualization-module.touch-dragging {
        transition: none;
        transform: none;
    }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
    .module-drop-zone.drop-zone-active {
        background: CanvasText;
        border: 2px solid CanvasText;
    }
    
    .visualization-module.dragging {
        border: 3px solid CanvasText;
    }
}
```

### Task 2.5: Accessibility and Keyboard Support
**File**: `js/main.js` - Accessibility features

```javascript
// Add to ModuleManager class
class ModuleManager {
    /**
     * Handle keyboard-based reordering
     */
    handleKeyboardReorder(event, module, index) {
        const { key, ctrlKey, shiftKey } = event;
        
        // Only handle specific key combinations
        if (!ctrlKey && !shiftKey) return;
        
        let newIndex = index;
        let moved = false;
        
        switch (key) {
            case 'ArrowUp':
                if (ctrlKey && index > 0) {
                    newIndex = index - 1;
                    moved = true;
                }
                break;
                
            case 'ArrowDown':
                if (ctrlKey && index < this.modules.length - 1) {
                    newIndex = index + 1;
                    moved = true;
                }
                break;
                
            case 'Home':
                if (ctrlKey && index > 0) {
                    newIndex = 0;
                    moved = true;
                }
                break;
                
            case 'End':
                if (ctrlKey && index < this.modules.length - 1) {
                    newIndex = this.modules.length - 1;
                    moved = true;
                }
                break;
        }
        
        if (moved) {
            event.preventDefault();
            this.reorderModules(index, newIndex);
            
            // Announce move to screen readers
            this.announceToScreenReader(
                `Moved ${module.displayName} to position ${newIndex + 1} of ${this.modules.length}`
            );
            
            // Focus moved module
            setTimeout(() => {
                module.headerElement.focus();
            }, 100);
        }
    }
    
    /**
     * Add drag instructions for screen readers
     */
    addDragInstructions() {
        this.modules.forEach(module => {
            // Create hidden instructions element
            const instructions = document.createElement('div');
            instructions.id = `module-drag-instructions-${module.id}`;
            instructions.className = 'sr-only';
            instructions.textContent = `Use drag and drop to reorder this module, or use Ctrl+Arrow keys to move it up or down. Current position: ${this.getModulePosition(module)} of ${this.modules.length}`;
            
            module.element.appendChild(instructions);
        });
    }
    
    /**
     * Update position announcements
     */
    updatePositionAnnouncements() {
        this.modules.forEach(module => {
            const instructions = document.getElementById(`module-drag-instructions-${module.id}`);
            if (instructions) {
                const position = this.getModulePosition(module);
                instructions.textContent = `Use drag and drop to reorder this module, or use Ctrl+Arrow keys to move it up or down. Current position: ${position} of ${this.modules.length}`;
            }
        });
    }
    
    /**
     * Announce to screen readers
     */
    announceToScreenReader(message) {
        // Create or use existing live region
        let liveRegion = document.getElementById('module-announcements');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'module-announcements';
            liveRegion.className = 'sr-only';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            document.body.appendChild(liveRegion);
        }
        
        // Clear and set new message
        liveRegion.textContent = '';
        setTimeout(() => {
            liveRegion.textContent = message;
        }, 100);
    }
}
```

---

## 🧪 Testing Requirements

### Testing Checklist:
- [ ] **Basic Drag and Drop**
  - [ ] Modules can be dragged by header
  - [ ] Drop zones appear during drag
  - [ ] Modules reorder correctly
  - [ ] Visual feedback is clear
  
- [ ] **Touch Device Support**
  - [ ] Long press initiates drag on touch devices
  - [ ] Touch drag works smoothly
  - [ ] Drop zones work with touch
  - [ ] No conflicts with scrolling
  
- [ ] **Accessibility**
  - [ ] Keyboard reordering works (Ctrl+Arrow keys)
  - [ ] Screen reader announcements work
  - [ ] Focus management during reorder
  - [ ] ARIA attributes are correct
  
- [ ] **State Persistence**
  - [ ] Module order persists after reorder
  - [ ] Module state preserved during move
  - [ ] Local storage updated correctly
  - [ ] SVG rendering respects new order
  
- [ ] **Edge Cases**
  - [ ] Dragging to same position handled gracefully
  - [ ] Rapid drag operations don't break system
  - [ ] Network interruption during drag handled
  - [ ] Memory leaks from event listeners checked

### Browser Compatibility:
- [ ] Chrome/Edge (desktop & mobile)
- [ ] Firefox (desktop & mobile) 
- [ ] Safari (desktop & mobile)
- [ ] Touch devices (tablets & phones)

---

## 🔧 Integration Points

### Dependencies:
- **Phase 1**: Module Component System must provide:
  - `VisualizationModule` class with proper structure
  - Module registry and state management
  - Event system for module updates

### Provides for Later Phases:
- **Phase 4**: Reorder events for SVG rendering updates
- **Phase 7**: Module position data for control system

### CSS Integration:
- **Phase 3**: Enhanced styling will build on drag feedback classes
- Ensure no conflicts with existing module styles

---

## 🚨 Critical Safety Measures

### Breaking Change Prevention:
- [ ] **Preserve existing module functionality** during drag operations
- [ ] **Maintain accessibility** - keyboard users must retain full functionality
- [ ] **No data loss** during reorder operations
- [ ] **Graceful degradation** if drag/drop not supported

### Performance Considerations:
- [ ] **Debounce rapid reorder events** to prevent performance issues
- [ ] **Clean up event listeners** to prevent memory leaks
- [ ] **Minimize DOM manipulation** during drag operations
- [ ] **Optimize for mobile performance** with touch events

### Error Handling:
- [ ] **Fallback to keyboard reordering** if drag fails
- [ ] **State restoration** if reorder operation fails
- [ ] **User feedback** for unsuccessful operations
- [ ] **Logging** for debugging drag issues

---

## 📈 Success Criteria

### Phase 2 Complete When:
- [ ] ✅ All modules can be reordered via drag and drop
- [ ] ✅ Touch devices fully supported
- [ ] ✅ Keyboard accessibility maintained
- [ ] ✅ Visual feedback is intuitive and smooth
- [ ] ✅ State persistence works correctly
- [ ] ✅ No regressions in existing functionality
- [ ] ✅ Performance is acceptable on all devices
- [ ] ✅ All browsers and assistive technologies supported

### User Experience Goals:
- [ ] ✅ Drag operations feel natural and responsive
- [ ] ✅ Clear visual indication of where modules will be dropped
- [ ] ✅ Touch users have equivalent functionality to mouse users
- [ ] ✅ Screen reader users can reorder modules effectively
- [ ] ✅ No confusion about module positions after reorder

---

**Next Phase**: [03_Phase3_CSSUpdates.md](./03_Phase3_CSSUpdates.md) - Enhanced styling and visual feedback system
