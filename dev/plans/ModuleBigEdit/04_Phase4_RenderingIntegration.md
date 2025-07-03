# Phase 4: Rendering Integration and SVG Management

**Status**: 📋 Ready for Implementation  
**Dependencies**: Phase 1 (Module System) and Phase 5 (Module Definitions) must be complete  
**Timeline**: Week 3 deliverable  
**Risk Level**: 🟡 Medium (SVG rendering complexity)

---

## 🎯 Phase 4 Overview

Integrate the new module management system with the existing SVG rendering pipeline, ensuring that visualizations respect module order, visibility states, and provide smooth updates.

### Key Deliverables:
1. ✅ SVG group management with z-ordering based on module order
2. ✅ Module-aware rendering pipeline integration
3. ✅ Event-driven visualization updates
4. ✅ Performance optimization for dynamic reordering
5. ✅ Rendering state synchronization with module states

---

## 🏗️ Implementation Tasks

### Task 4.1: SVG Group Management Enhancement
**File**: `js/main.js` - Enhanced SVG group management

```javascript
/**
 * Enhanced SVG Manager for Module Integration
 */
class SVGManager {
    constructor(svgElement) {
        this.svg = svgElement;
        this.moduleGroups = new Map(); // moduleId -> SVG group
        this.renderOrder = []; // Array of module IDs in render order
        this.groupZIndex = new Map(); // moduleId -> z-index
        
        this.initializeSVGStructure();
    }
    
    /**
     * Initialize the SVG structure for module-based rendering
     */
    initializeSVGStructure() {
        // Create main groups container if it doesn't exist
        if (!this.svg.querySelector('.module-groups')) {
            this.groupsContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            this.groupsContainer.setAttribute('class', 'module-groups');
            this.svg.appendChild(this.groupsContainer);
        } else {
            this.groupsContainer = this.svg.querySelector('.module-groups');
        }
        
        // Create background group for shared elements
        this.createBackgroundGroup();
    }
    
    /**
     * Create background group for elements shared across modules
     */
    createBackgroundGroup() {
        if (!this.svg.querySelector('.background-group')) {
            this.backgroundGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            this.backgroundGroup.setAttribute('class', 'background-group');
            this.groupsContainer.appendChild(this.backgroundGroup);
        } else {
            this.backgroundGroup = this.svg.querySelector('.background-group');
        }
    }
    
    /**
     * Register a module for SVG rendering
     */
    registerModule(moduleId, displayName, renderOrder = 0) {
        // Create SVG group for this module
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', `module-group module-${moduleId}`);
        group.setAttribute('data-module-id', moduleId);
        group.setAttribute('data-display-name', displayName);
        
        // Store group reference
        this.moduleGroups.set(moduleId, group);
        this.groupZIndex.set(moduleId, renderOrder);
        
        // Add to container in correct order
        this.insertGroupInOrder(group, renderOrder);
        
        // Update render order array
        this.updateRenderOrder();
        
        return group;
    }
    
    /**
     * Insert group in correct z-order position
     */
    insertGroupInOrder(group, zIndex) {
        const existingGroups = Array.from(this.groupsContainer.querySelectorAll('.module-group'));
        
        // Find insertion point
        let insertBefore = null;
        for (const existingGroup of existingGroups) {
            const existingModuleId = existingGroup.getAttribute('data-module-id');
            const existingZIndex = this.groupZIndex.get(existingModuleId) || 0;
            
            if (existingZIndex > zIndex) {
                insertBefore = existingGroup;
                break;
            }
        }
        
        // Insert at correct position
        if (insertBefore) {
            this.groupsContainer.insertBefore(group, insertBefore);
        } else {
            this.groupsContainer.appendChild(group);
        }
    }
    
    /**
     * Update module render order based on module manager state
     */
    updateModuleOrder(newModuleOrder) {
        // Update z-index values based on new order
        newModuleOrder.forEach((moduleId, index) => {
            this.groupZIndex.set(moduleId, index);
        });
        
        // Reorder SVG groups
        this.reorderSVGGroups();
        
        // Update render order
        this.updateRenderOrder();
        
        // Trigger re-render if needed
        this.emitRenderOrderChanged();
    }
    
    /**
     * Reorder SVG groups to match module order
     */
    reorderSVGGroups() {
        // Get all module groups sorted by z-index
        const sortedGroups = Array.from(this.moduleGroups.entries())
            .sort(([aId, aGroup], [bId, bGroup]) => {
                return (this.groupZIndex.get(aId) || 0) - (this.groupZIndex.get(bId) || 0);
            })
            .map(([id, group]) => group);
        
        // Reorder in DOM
        sortedGroups.forEach(group => {
            this.groupsContainer.appendChild(group);
        });
    }
    
    /**
     * Update internal render order array
     */
    updateRenderOrder() {
        this.renderOrder = Array.from(this.moduleGroups.keys())
            .sort((a, b) => (this.groupZIndex.get(a) || 0) - (this.groupZIndex.get(b) || 0));
    }
    
    /**
     * Get SVG group for a specific module
     */
    getModuleGroup(moduleId) {
        return this.moduleGroups.get(moduleId);
    }
    
    /**
     * Set module visibility
     */
    setModuleVisibility(moduleId, visible) {
        const group = this.moduleGroups.get(moduleId);
        if (group) {
            group.style.display = visible ? 'block' : 'none';
            group.setAttribute('aria-hidden', visible ? 'false' : 'true');
            
            // Emit visibility change event
            this.emitModuleVisibilityChanged(moduleId, visible);
        }
    }
    
    /**
     * Clear all content from a module group
     */
    clearModuleGroup(moduleId) {
        const group = this.moduleGroups.get(moduleId);
        if (group) {
            while (group.firstChild) {
                group.removeChild(group.firstChild);
            }
        }
    }
    
    /**
     * Remove module group entirely
     */
    removeModule(moduleId) {
        const group = this.moduleGroups.get(moduleId);
        if (group) {
            group.remove();
            this.moduleGroups.delete(moduleId);
            this.groupZIndex.delete(moduleId);
            this.updateRenderOrder();
        }
    }
    
    /**
     * Emit render order changed event
     */
    emitRenderOrderChanged() {
        const event = new CustomEvent('svgRenderOrderChanged', {
            detail: {
                renderOrder: [...this.renderOrder],
                moduleGroups: new Map(this.moduleGroups)
            }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Emit module visibility changed event
     */
    emitModuleVisibilityChanged(moduleId, visible) {
        const event = new CustomEvent('moduleVisibilityChanged', {
            detail: {
                moduleId,
                visible,
                group: this.moduleGroups.get(moduleId)
            }
        });
        document.dispatchEvent(event);
    }
}
```

### Task 4.2: Module-Aware Rendering Pipeline
**File**: `js/main.js` - Enhanced rendering coordinator

```javascript
/**
 * Module-Aware Rendering Coordinator
 */
class RenderingCoordinator {
    constructor(svgManager, moduleManager) {
        this.svgManager = svgManager;
        this.moduleManager = moduleManager;
        this.renderQueue = new Set();
        this.isRendering = false;
        this.pendingUpdates = new Map(); // moduleId -> update data
        
        this.setupEventListeners();
        this.initializeRenderLoop();
    }
    
    /**
     * Set up event listeners for module and SVG changes
     */
    setupEventListeners() {
        // Listen for module order changes
        document.addEventListener('modulereordered', (event) => {
            this.handleModuleReorder(event.detail);
        });
        
        // Listen for module visibility changes
        document.addEventListener('moduleVisibilityChanged', (event) => {
            this.handleModuleVisibilityChange(event.detail);
        });
        
        // Listen for module state changes
        document.addEventListener('moduleStateChanged', (event) => {
            this.handleModuleStateChange(event.detail);
        });
        
        // Listen for module content updates
        document.addEventListener('moduleContentUpdated', (event) => {
            this.handleModuleContentUpdate(event.detail);
        });
    }
    
    /**
     * Handle module reorder events
     */
    handleModuleReorder(detail) {
        const { module, oldIndex, newIndex } = detail;
        
        // Update SVG group order
        const newOrder = this.moduleManager.getModuleOrder();
        this.svgManager.updateModuleOrder(newOrder);
        
        // Queue re-render for affected modules
        this.queueModuleRender(module.id, 'reorder');
        
        // Re-render modules that might have layering dependencies
        this.queueDependentModules(module.id);
    }
    
    /**
     * Handle module visibility changes
     */
    handleModuleVisibilityChange(detail) {
        const { moduleId, visible } = detail;
        
        // Update SVG group visibility
        this.svgManager.setModuleVisibility(moduleId, visible);
        
        // If module became visible, queue render
        if (visible) {
            this.queueModuleRender(moduleId, 'visibility');
        }
    }
    
    /**
     * Handle module state changes (collapse/expand, etc.)
     */
    handleModuleStateChange(detail) {
        const { moduleId, state, previousState } = detail;
        
        // Queue render if state change affects visualization
        if (this.stateAffectsVisualization(state, previousState)) {
            this.queueModuleRender(moduleId, 'state');
        }
    }
    
    /**
     * Handle module content updates
     */
    handleModuleContentUpdate(detail) {
        const { moduleId, updateType, data } = detail;
        
        // Store update data for render
        this.pendingUpdates.set(moduleId, { updateType, data });
        
        // Queue render
        this.queueModuleRender(moduleId, 'content');
    }
    
    /**
     * Queue a module for rendering
     */
    queueModuleRender(moduleId, reason) {
        this.renderQueue.add(moduleId);
        
        // Schedule render if not already scheduled
        if (!this.isRendering) {
            this.scheduleRender();
        }
    }
    
    /**
     * Queue dependent modules for re-render
     */
    queueDependentModules(moduleId) {
        // Get modules that might be affected by this module's changes
        const dependencies = this.getModuleDependencies(moduleId);
        dependencies.forEach(depId => {
            this.queueModuleRender(depId, 'dependency');
        });
    }
    
    /**
     * Schedule the next render cycle
     */
    scheduleRender() {
        if (this.isRendering) return;
        
        requestAnimationFrame(() => {
            this.executeRenderCycle();
        });
    }
    
    /**
     * Execute a complete render cycle
     */
    async executeRenderCycle() {
        if (this.isRendering) return;
        
        this.isRendering = true;
        
        try {
            // Process render queue
            const modulesToRender = Array.from(this.renderQueue);
            this.renderQueue.clear();
            
            // Sort modules by render order for efficient rendering
            const sortedModules = this.sortModulesByRenderOrder(modulesToRender);
            
            // Render each module
            for (const moduleId of sortedModules) {
                await this.renderModule(moduleId);
            }
            
            // Post-render cleanup and optimization
            this.postRenderCleanup();
            
        } catch (error) {
            console.error('Error during render cycle:', error);
            this.handleRenderError(error);
        } finally {
            this.isRendering = false;
            
            // Schedule another render if queue has new items
            if (this.renderQueue.size > 0) {
                this.scheduleRender();
            }
        }
    }
    
    /**
     * Render a specific module
     */
    async renderModule(moduleId) {
        const module = this.moduleManager.getModule(moduleId);
        if (!module || !module.isVisible()) {
            return;
        }
        
        const svgGroup = this.svgManager.getModuleGroup(moduleId);
        if (!svgGroup) {
            console.warn(`No SVG group found for module: ${moduleId}`);
            return;
        }
        
        // Get pending update data
        const updateData = this.pendingUpdates.get(moduleId);
        this.pendingUpdates.delete(moduleId);
        
        // Call module's render function
        if (module.render && typeof module.render === 'function') {
            try {
                await module.render(svgGroup, updateData);
                
                // Emit render complete event
                this.emitModuleRenderComplete(moduleId, svgGroup);
                
            } catch (error) {
                console.error(`Error rendering module ${moduleId}:`, error);
                this.handleModuleRenderError(moduleId, error);
            }
        }
    }
    
    /**
     * Sort modules by their render order
     */
    sortModulesByRenderOrder(moduleIds) {
        const renderOrder = this.svgManager.renderOrder;
        return moduleIds.sort((a, b) => {
            const aIndex = renderOrder.indexOf(a);
            const bIndex = renderOrder.indexOf(b);
            return aIndex - bIndex;
        });
    }
    
    /**
     * Check if state change affects visualization
     */
    stateAffectsVisualization(newState, previousState) {
        // Define which state changes require re-render
        const visualStates = ['expanded', 'collapsed', 'loading', 'error', 'active'];
        
        return visualStates.includes(newState) || visualStates.includes(previousState);
    }
    
    /**
     * Get modules that depend on this module
     */
    getModuleDependencies(moduleId) {
        // This would be customized based on actual module dependencies
        // For now, return empty array - can be extended as needed
        return [];
    }
    
    /**
     * Post-render cleanup and optimization
     */
    postRenderCleanup() {
        // Remove empty groups
        this.cleanupEmptyGroups();
        
        // Optimize SVG structure if needed
        this.optimizeSVGStructure();
        
        // Update accessibility attributes
        this.updateAccessibilityAttributes();
    }
    
    /**
     * Clean up empty SVG groups
     */
    cleanupEmptyGroups() {
        this.svgManager.moduleGroups.forEach((group, moduleId) => {
            if (!group.hasChildNodes()) {
                // Keep group but mark as empty for debugging
                group.setAttribute('data-empty', 'true');
            } else {
                group.removeAttribute('data-empty');
            }
        });
    }
    
    /**
     * Optimize SVG structure for performance
     */
    optimizeSVGStructure() {
        // This could include:
        // - Combining similar elements
        // - Removing redundant groups
        // - Optimizing transform chains
        // Implementation depends on specific needs
    }
    
    /**
     * Update accessibility attributes
     */
    updateAccessibilityAttributes() {
        this.svgManager.moduleGroups.forEach((group, moduleId) => {
            const module = this.moduleManager.getModule(moduleId);
            if (module) {
                group.setAttribute('aria-label', `${module.displayName} visualization`);
                group.setAttribute('role', 'img');
            }
        });
    }
    
    /**
     * Handle render errors
     */
    handleRenderError(error) {
        // Emit error event for error handling
        const event = new CustomEvent('renderError', {
            detail: { error, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Handle module-specific render errors
     */
    handleModuleRenderError(moduleId, error) {
        const module = this.moduleManager.getModule(moduleId);
        if (module) {
            module.setState('error');
        }
        
        // Emit module-specific error event
        const event = new CustomEvent('moduleRenderError', {
            detail: { moduleId, error, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Emit module render complete event
     */
    emitModuleRenderComplete(moduleId, svgGroup) {
        const event = new CustomEvent('moduleRenderComplete', {
            detail: { moduleId, svgGroup, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Force re-render of all modules
     */
    forceRenderAll() {
        const allModuleIds = Array.from(this.svgManager.moduleGroups.keys());
        allModuleIds.forEach(moduleId => {
            this.queueModuleRender(moduleId, 'forced');
        });
    }
    
    /**
     * Initialize the render loop
     */
    initializeRenderLoop() {
        // Start with initial render of all modules
        this.forceRenderAll();
    }
}
```

### Task 4.3: Enhanced Module Rendering Functions
**File**: `js/edo.js`, `js/ji.js`, `js/mos.js` - Module render method integration

```javascript
// Example enhancement for edo.js module
// This pattern should be applied to ji.js and mos.js as well

/**
 * Enhanced EDO module with integrated rendering
 */
const EdoModule = {
    id: 'edo',
    displayName: 'Equal Division of the Octave',
    
    /**
     * Module-aware render function
     */
    async render(svgGroup, updateData) {
        // Clear previous content
        while (svgGroup.firstChild) {
            svgGroup.removeChild(svgGroup.firstChild);
        }
        
        // Get current module state
        const moduleState = this.getState();
        if (!moduleState.visible) {
            return;
        }
        
        // Get rendering parameters
        const params = this.getRenderingParameters();
        
        // Create main group for EDO visualization
        const edoGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        edoGroup.setAttribute('class', 'edo-visualization');
        edoGroup.setAttribute('transform', `translate(${params.centerX}, ${params.centerY})`);
        
        // Render circle
        await this.renderCircle(edoGroup, params);
        
        // Render divisions
        await this.renderDivisions(edoGroup, params);
        
        // Render labels if enabled
        if (params.showLabels) {
            await this.renderLabels(edoGroup, params);
        }
        
        // Add interaction layer
        this.addInteractionLayer(edoGroup, params);
        
        // Append to SVG group
        svgGroup.appendChild(edoGroup);
        
        // Update ARIA attributes
        this.updateAccessibilityAttributes(svgGroup, params);
    },
    
    /**
     * Render the main circle
     */
    async renderCircle(group, params) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', params.radius);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', params.circleColor);
        circle.setAttribute('stroke-width', params.strokeWidth);
        circle.setAttribute('class', 'edo-circle');
        
        group.appendChild(circle);
        
        // Add animation if needed
        if (params.animate) {
            this.animateCircleAppearance(circle);
        }
    },
    
    /**
     * Render division markers
     */
    async renderDivisions(group, params) {
        const divisions = params.divisions;
        const angleStep = (2 * Math.PI) / divisions;
        
        for (let i = 0; i < divisions; i++) {
            const angle = i * angleStep - Math.PI / 2; // Start from top
            const x1 = Math.cos(angle) * (params.radius - params.divisionLength / 2);
            const y1 = Math.sin(angle) * (params.radius - params.divisionLength / 2);
            const x2 = Math.cos(angle) * (params.radius + params.divisionLength / 2);
            const y2 = Math.sin(angle) * (params.radius + params.divisionLength / 2);
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', params.divisionColor);
            line.setAttribute('stroke-width', params.divisionStrokeWidth);
            line.setAttribute('class', `edo-division division-${i}`);
            line.setAttribute('data-division', i);
            
            group.appendChild(line);
            
            // Add animation with delay
            if (params.animate) {
                setTimeout(() => {
                    this.animateDivisionAppearance(line);
                }, i * params.animationDelay);
            }
        }
    },
    
    /**
     * Render division labels
     */
    async renderLabels(group, params) {
        const divisions = params.divisions;
        const angleStep = (2 * Math.PI) / divisions;
        
        for (let i = 0; i < divisions; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const labelRadius = params.radius + params.labelOffset;
            const x = Math.cos(angle) * labelRadius;
            const y = Math.sin(angle) * labelRadius;
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', y);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'central');
            text.setAttribute('fill', params.labelColor);
            text.setAttribute('font-size', params.labelFontSize);
            text.setAttribute('font-family', params.labelFontFamily);
            text.setAttribute('class', `edo-label label-${i}`);
            text.setAttribute('data-division', i);
            text.textContent = this.formatLabel(i, params);
            
            group.appendChild(text);
        }
    },
    
    /**
     * Add interaction layer for mouse/touch events
     */
    addInteractionLayer(group, params) {
        // Create transparent overlay for interactions
        const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        overlay.setAttribute('r', params.radius + params.interactionRadius);
        overlay.setAttribute('fill', 'transparent');
        overlay.setAttribute('class', 'edo-interaction-layer');
        overlay.setAttribute('data-module', 'edo');
        
        // Add event listeners
        overlay.addEventListener('click', (e) => this.handleClick(e, params));
        overlay.addEventListener('mousemove', (e) => this.handleMouseMove(e, params));
        overlay.addEventListener('touchstart', (e) => this.handleTouchStart(e, params));
        
        group.appendChild(overlay);
    },
    
    /**
     * Update accessibility attributes
     */
    updateAccessibilityAttributes(svgGroup, params) {
        svgGroup.setAttribute('role', 'img');
        svgGroup.setAttribute('aria-label', 
            `Equal Division of the Octave visualization with ${params.divisions} divisions`);
        
        // Add description for screen readers
        const desc = document.createElementNS('http://www.w3.org/2000/svg', 'desc');
        desc.textContent = `A circular visualization showing ${params.divisions} equal divisions of the octave. Each division represents ${(1200 / params.divisions).toFixed(1)} cents.`;
        svgGroup.appendChild(desc);
    },
    
    /**
     * Get current rendering parameters
     */
    getRenderingParameters() {
        // This would get parameters from the module's form inputs
        // and combine with default values
        return {
            divisions: this.getDivisions(),
            radius: this.getRadius(),
            centerX: this.getCenterX(),
            centerY: this.getCenterY(),
            circleColor: this.getCircleColor(),
            divisionColor: this.getDivisionColor(),
            labelColor: this.getLabelColor(),
            strokeWidth: this.getStrokeWidth(),
            divisionStrokeWidth: this.getDivisionStrokeWidth(),
            divisionLength: this.getDivisionLength(),
            labelOffset: this.getLabelOffset(),
            labelFontSize: this.getLabelFontSize(),
            labelFontFamily: this.getLabelFontFamily(),
            showLabels: this.getShowLabels(),
            animate: this.getAnimate(),
            animationDelay: this.getAnimationDelay(),
            interactionRadius: this.getInteractionRadius()
        };
    },
    
    // ... additional helper methods ...
};
```

### Task 4.4: Performance Optimization System
**File**: `js/utils.js` - Rendering performance utilities

```javascript
/**
 * Rendering Performance Utilities
 */
const RenderingPerformance = {
    /**
     * Debounce frequent render requests
     */
    debounceRender: (function() {
        const timers = new Map();
        
        return function(moduleId, renderFunction, delay = 16) {
            if (timers.has(moduleId)) {
                clearTimeout(timers.get(moduleId));
            }
            
            const timer = setTimeout(() => {
                renderFunction();
                timers.delete(moduleId);
            }, delay);
            
            timers.set(moduleId, timer);
        };
    })(),
    
    /**
     * Batch DOM operations for efficiency
     */
    batchDOMOperations(operations) {
        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                const startTime = performance.now();
                
                // Execute all operations in single frame
                operations.forEach(operation => {
                    try {
                        operation();
                    } catch (error) {
                        console.warn('Batched DOM operation failed:', error);
                    }
                });
                
                const endTime = performance.now();
                console.debug(`Batched ${operations.length} DOM operations in ${endTime - startTime}ms`);
                
                resolve();
            });
        });
    },
    
    /**
     * Optimize SVG performance with document fragments
     */
    createSVGFragment() {
        // Create document fragment for efficient DOM manipulation
        return document.createDocumentFragment();
    },
    
    /**
     * Monitor rendering performance
     */
    PerformanceMonitor: {
        renderTimes: new Map(),
        
        startRender(moduleId) {
            this.renderTimes.set(moduleId, performance.now());
        },
        
        endRender(moduleId) {
            const startTime = this.renderTimes.get(moduleId);
            if (startTime) {
                const duration = performance.now() - startTime;
                this.renderTimes.delete(moduleId);
                
                // Log slow renders
                if (duration > 16) {
                    console.warn(`Slow render for module ${moduleId}: ${duration}ms`);
                }
                
                return duration;
            }
            return 0;
        },
        
        getAverageRenderTime(moduleId, sampleSize = 10) {
            // This would track historical render times
            // Implementation depends on requirements
            return 0;
        }
    }
};
```

---

## 🧪 Testing Requirements

### Rendering Integration Testing:
- [ ] **SVG Group Management**
  - [ ] Module groups created correctly
  - [ ] Z-ordering respects module order
  - [ ] Group visibility changes work
  - [ ] Groups clean up properly when modules removed
  
- [ ] **Render Pipeline**
  - [ ] Module content renders in correct groups
  - [ ] Render order updates when modules reordered
  - [ ] Performance is acceptable for complex visualizations
  - [ ] Error handling works for failed renders
  
- [ ] **Event Integration**
  - [ ] Module state changes trigger appropriate re-renders
  - [ ] Reorder events update SVG correctly
  - [ ] Visibility changes affect rendering
  - [ ] No memory leaks from event listeners

### Performance Testing:
- [ ] **Rendering Speed**
  - [ ] Individual module renders complete in <16ms
  - [ ] Full re-render completes in <100ms
  - [ ] Reorder operations are smooth (no visual lag)
  - [ ] Complex visualizations maintain 60fps
  
- [ ] **Memory Usage**
  - [ ] No memory leaks from SVG elements
  - [ ] Event listeners cleaned up properly
  - [ ] Render queue doesn't grow unbounded

### Visual Testing:
- [ ] **Layering**
  - [ ] Modules render in correct visual order
  - [ ] Reordering updates visual layering
  - [ ] Background elements stay in background
  - [ ] No z-index conflicts
  
- [ ] **State Synchronization**
  - [ ] Hidden modules don't render
  - [ ] Collapsed modules show appropriate visualization
  - [ ] Loading states display correctly
  - [ ] Error states are visually clear

---

## 🔧 Integration Points

### Dependencies:
- **Phase 1**: Module Component System with state management
- **Phase 5**: Module Definitions with render functions
- **Existing SVG**: Current visualization system

### Provides for Later Phases:
- **Phase 7**: Rendering hooks for module controls
- **Future**: Foundation for animation and transition systems

### External Integration:
- **D3.js**: Ensure compatibility with existing D3 usage
- **Audio System**: Coordinate with audio rendering if needed

---

## 🚨 Critical Safety Measures

### Breaking Change Prevention:
- [ ] **Maintain existing SVG structure** during transition
- [ ] **Preserve all current visualization functionality**
- [ ] **Gradual migration** - old and new systems run in parallel
- [ ] **Fallback rendering** if new system fails

### Performance Safety:
- [ ] **Monitor render times** and abort slow operations
- [ ] **Limit render queue size** to prevent memory issues
- [ ] **Debounce rapid updates** to prevent performance problems
- [ ] **Graceful degradation** for complex visualizations

### Data Safety:
- [ ] **No loss of visualization state** during reorders
- [ ] **Preserve user interactions** (selections, highlights, etc.)
- [ ] **Maintain accessibility attributes** throughout updates
- [ ] **Error recovery** that doesn't break entire visualization

---

## 📈 Success Criteria

### Phase 4 Complete When:
- [ ] ✅ SVG groups respect module order and visibility
- [ ] ✅ Rendering pipeline integrates seamlessly with module system
- [ ] ✅ Performance is maintained or improved
- [ ] ✅ All existing visualizations work correctly
- [ ] ✅ Module reordering updates visualization layering
- [ ] ✅ No visual regressions or broken functionality
- [ ] ✅ Error handling prevents system-wide failures
- [ ] ✅ Accessibility is maintained throughout render updates

### Technical Goals:
- [ ] ✅ Clean separation between module logic and rendering
- [ ] ✅ Efficient render queue management
- [ ] ✅ Scalable architecture for additional modules
- [ ] ✅ Comprehensive error handling and recovery
- [ ] ✅ Performance monitoring and optimization

---

**Next Phase**: [05_Phase5_ModuleDefinitions.md](./05_Phase5_ModuleDefinitions.md) - Module definitions and content migration
