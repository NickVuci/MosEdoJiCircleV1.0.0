# Phase 6: HTML Structure Updates and Integration

## Overview
This phase focuses on updating the HTML structure to support the new dynamic module system while ensuring backward compatibility and smooth migration from the existing static layout.

## Objectives
- Update HTML structure to accommodate dynamic module container
- Migrate existing form controls into module content areas
- Ensure proper semantic structure and accessibility
- Maintain existing IDs and classes during transition
- Create migration utilities for DOM restructuring

## Dependencies
- **Requires**: Phase 1 (Module Component System) - Base module classes
- **Requires**: Phase 5 (Module Definitions) - Module instances created
- **Blocks**: Phase 7 (Module Controls) - Controls need new structure

## Deliverables

### 1. Updated Main HTML Structure

```html
<!-- Updated index.html structure -->
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- ...existing head content... -->
</head>
<body>
    <div id="app">
        <header id="header">
            <!-- ...existing header content... -->
        </header>
        
        <main id="main-content">
            <div id="sidebar" class="sidebar">
                <!-- New dynamic module container -->
                <div id="modules-container" class="modules-container" role="region" aria-label="Control Modules">
                    <!-- Modules will be dynamically created here -->
                </div>
                
                <!-- Legacy container for migration safety -->
                <div id="legacy-controls" class="legacy-controls" style="display: none;">
                    <!-- Original controls preserved during migration -->
                </div>
                
                <!-- Other sidebar content (if any) -->
                <div id="sidebar-footer" class="sidebar__footer">
                    <!-- Additional controls that aren't module-specific -->
                </div>
            </div>
            
            <div id="visualization-container" class="visualization-container">
                <svg id="circle-svg" class="circle-svg" role="img" aria-label="Musical Circle Visualization">
                    <!-- SVG content will be dynamically generated -->
                </svg>
            </div>
        </main>
    </div>
    
    <!-- Module system initialization -->
    <script type="module" src="js/app.js"></script>
</body>
</html>
```

### 2. Module Content Templates

Create templates for each module's internal structure:

```html
<!-- EDO Module Content Template -->
<template id="edo-module-template">
    <div class="module-section">
        <label for="edo-input" class="form-label">
            Equal Divisions:
        </label>
        <input 
            type="number" 
            id="edo-input" 
            class="form-input" 
            value="12" 
            min="1" 
            max="144"
            aria-describedby="edo-input-help"
        />
        <div id="edo-input-help" class="form-help">
            Number of equal divisions of the octave
        </div>
    </div>
    
    <div class="module-section">
        <div class="form-group">
            <input 
                type="checkbox" 
                id="edo-lines" 
                class="form-checkbox" 
                checked
            />
            <label for="edo-lines" class="form-label form-label--checkbox">
                Show division lines
            </label>
        </div>
        
        <div class="form-group">
            <input 
                type="checkbox" 
                id="prime-colors-checkbox" 
                class="form-checkbox"
            />
            <label for="prime-colors-checkbox" class="form-label form-label--checkbox">
                Prime number coloring
            </label>
        </div>
    </div>
</template>

<!-- JI Module Content Template -->
<template id="ji-module-template">
    <div class="module-section">
        <label for="odd-limit-input" class="form-label">
            Odd Limit:
        </label>
        <input 
            type="number" 
            id="odd-limit-input" 
            class="form-input" 
            value="15" 
            min="3" 
            max="31" 
            step="2"
            aria-describedby="odd-limit-help"
        />
        <div id="odd-limit-help" class="form-help">
            Maximum odd number in ratios
        </div>
    </div>
    
    <div class="module-section">
        <fieldset class="form-fieldset">
            <legend class="form-legend">Prime Numbers</legend>
            <div id="prime-checkboxes" class="prime-checkboxes" role="group" aria-labelledby="prime-legend">
                <!-- Prime checkboxes will be dynamically generated -->
            </div>
        </fieldset>
    </div>
</template>

<!-- MOS Module Content Template -->
<template id="mos-module-template">
    <div class="module-section">
        <div class="form-group">
            <input 
                type="checkbox" 
                id="mos-toggle" 
                class="form-checkbox"
            />
            <label for="mos-toggle" class="form-label form-label--checkbox">
                Enable MOS visualization
            </label>
        </div>
    </div>
    
    <div class="module-section">
        <label for="mos-generator-input" class="form-label">
            Generator (cents):
        </label>
        <input 
            type="number" 
            id="mos-generator-input" 
            class="form-input" 
            value="701.955" 
            min="0" 
            max="1200" 
            step="0.001"
            aria-describedby="mos-generator-help"
        />
        <div id="mos-generator-help" class="form-help">
            Generator interval in cents
        </div>
    </div>
    
    <div class="module-section">
        <label for="mos-stacks-input" class="form-label">
            Number of Stacks:
        </label>
        <input 
            type="number" 
            id="mos-stacks-input" 
            class="form-input" 
            value="6" 
            min="1" 
            max="20"
            aria-describedby="mos-stacks-help"
        />
        <div id="mos-stacks-help" class="form-help">
            Number of generator stacks
        </div>
    </div>
</template>
```

### 3. DOM Migration Utilities

```javascript
// domMigration.js
export class DOMStructureMigrator {
  constructor() {
    this.originalStructure = null;
    this.migrationState = 'initial'; // initial, backing-up, migrating, completed
  }
  
  // Backup original DOM structure before migration
  backupOriginalStructure() {
    this.migrationState = 'backing-up';
    
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) {
      throw new Error('Sidebar element not found for migration');
    }
    
    // Clone the original structure
    this.originalStructure = sidebar.cloneNode(true);
    
    // Move existing controls to legacy container
    const legacyContainer = document.getElementById('legacy-controls');
    if (legacyContainer) {
      // Move all existing children except modules-container to legacy
      Array.from(sidebar.children).forEach(child => {
        if (child.id !== 'modules-container' && child.id !== 'legacy-controls') {
          legacyContainer.appendChild(child);
        }
      });
    }
    
    console.log('Original DOM structure backed up');
  }
  
  // Restore original structure if migration fails
  restoreOriginalStructure() {
    if (!this.originalStructure) {
      throw new Error('No backup structure available for restoration');
    }
    
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.parentNode) {
      sidebar.parentNode.replaceChild(this.originalStructure.cloneNode(true), sidebar);
      this.migrationState = 'initial';
      console.log('Original DOM structure restored');
    }
  }
  
  // Migrate content from templates into modules
  migrateToModuleStructure() {
    this.migrationState = 'migrating';
    
    try {
      // Ensure modules container exists
      const modulesContainer = document.getElementById('modules-container');
      if (!modulesContainer) {
        throw new Error('Modules container not found');
      }
      
      // Migration will be handled by module system when modules are created
      // This method validates the migration was successful
      this.validateMigration();
      
      this.migrationState = 'completed';
      console.log('DOM migration completed successfully');
      
    } catch (error) {
      console.error('DOM migration failed:', error);
      this.restoreOriginalStructure();
      throw error;
    }
  }
  
  // Validate that migration preserved all critical elements
  validateMigration() {
    const criticalElements = [
      'edo-input',
      'edo-lines', 
      'prime-colors-checkbox',
      'odd-limit-input',
      'prime-checkboxes',
      'mos-toggle',
      'mos-generator-input',
      'mos-stacks-input'
    ];
    
    const missing = criticalElements.filter(id => {
      const element = document.getElementById(id) || 
                     document.querySelector(`[data-migrated-id="${id}"]`);
      return !element;
    });
    
    if (missing.length > 0) {
      throw new Error(`Migration validation failed. Missing elements: ${missing.join(', ')}`);
    }
    
    console.log('Migration validation passed');
  }
  
  // Populate module content from templates
  populateModuleContent(module, templateId) {
    const template = document.getElementById(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }
    
    // Clone template content
    const content = template.content.cloneNode(true);
    
    // Update IDs to be unique if needed (for multiple instances)
    this.updateTemplateIds(content, module.id);
    
    // Clear existing content and append new
    module.contentElement.innerHTML = '';
    module.contentElement.appendChild(content);
    
    // Set up any module-specific initialization
    this.initializeModuleContent(module);
  }
  
  // Update template IDs to avoid conflicts
  updateTemplateIds(content, moduleId) {
    const elementsWithIds = content.querySelectorAll('[id]');
    elementsWithIds.forEach(element => {
      const originalId = element.id;
      // Keep original IDs for compatibility, but add data attribute for tracking
      element.setAttribute('data-module-id', moduleId);
      element.setAttribute('data-original-id', originalId);
    });
  }
  
  // Initialize module-specific content
  initializeModuleContent(module) {
    switch (module.id) {
      case 'ji':
        this.initializeJIPrimeCheckboxes(module);
        break;
      // Add other module-specific initialization as needed
    }
  }
  
  // Generate JI prime checkboxes dynamically
  initializeJIPrimeCheckboxes(jiModule) {
    const primeContainer = jiModule.contentElement.querySelector('#prime-checkboxes');
    if (!primeContainer) return;
    
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
    
    primeContainer.innerHTML = '';
    
    primes.forEach(prime => {
      const wrapper = document.createElement('div');
      wrapper.className = 'form-group form-group--inline';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `prime-${prime}`;
      checkbox.className = 'form-checkbox';
      checkbox.value = prime;
      
      const label = document.createElement('label');
      label.htmlFor = `prime-${prime}`;
      label.className = 'form-label form-label--checkbox';
      label.textContent = prime.toString();
      
      wrapper.appendChild(checkbox);
      wrapper.appendChild(label);
      primeContainer.appendChild(wrapper);
    });
  }
}

// Export singleton instance
export const domMigrator = new DOMStructureMigrator();
```

### 4. Module Content Integration

```javascript
// moduleContentLoader.js
import { domMigrator } from './domMigration.js';

export class ModuleContentLoader {
  static loadModuleContent(module) {
    const templateMap = {
      'edo': 'edo-module-template',
      'ji': 'ji-module-template', 
      'mos': 'mos-module-template'
    };
    
    const templateId = templateMap[module.id];
    if (!templateId) {
      console.warn(`No template found for module: ${module.id}`);
      return;
    }
    
    try {
      domMigrator.populateModuleContent(module, templateId);
      console.log(`Content loaded for module: ${module.id}`);
    } catch (error) {
      console.error(`Failed to load content for module ${module.id}:`, error);
      throw error;
    }
  }
  
  // Load content for all modules
  static loadAllModuleContent(modules) {
    modules.forEach(module => {
      this.loadModuleContent(module);
    });
  }
}
```

## Implementation Checklist

### Pre-Implementation
- [ ] Review current HTML structure and identify all elements that need migration
- [ ] Create comprehensive list of all form element IDs that must be preserved
- [ ] Test backup and restore functionality in isolation
- [ ] Validate all templates render correctly in isolation

### Implementation Steps
1. **HTML Structure Update**
   - [ ] Add modules-container div to existing HTML
   - [ ] Add legacy-controls container for migration safety
   - [ ] Update main layout to accommodate new structure
   - [ ] Add proper ARIA labels and semantic structure

2. **Template Creation**
   - [ ] Create template elements for each module type
   - [ ] Ensure all existing form elements are included in templates
   - [ ] Add proper accessibility attributes to template elements
   - [ ] Validate templates against existing element structure

3. **Migration Utilities**
   - [ ] Implement DOM backup and restore functionality
   - [ ] Create template population system
   - [ ] Add migration validation checks
   - [ ] Test migration rollback capabilities

4. **Integration Testing**
   - [ ] Test template loading for each module type
   - [ ] Verify all form elements retain their IDs and functionality
   - [ ] Validate accessibility compliance of new structure
   - [ ] Test backup/restore functionality

### Post-Implementation
- [ ] Verify all existing selectors still work
- [ ] Test form submission and data retrieval
- [ ] Validate keyboard navigation and accessibility
- [ ] Confirm visual styling remains consistent

## Risk Mitigation

### High Risk Items
1. **ID Conflicts**: Template elements might create duplicate IDs
   - **Mitigation**: Use data attributes to track original IDs, implement ID conflict detection

2. **CSS Selector Breaking**: Existing CSS selectors might not work with new structure
   - **Mitigation**: Maintain original element structure within templates, test all CSS selectors

3. **Event Listener Loss**: Event listeners attached to elements might be lost during migration
   - **Mitigation**: Document all existing event listeners, re-attach after migration

### Medium Risk Items
1. **Template Loading Failures**: Templates might not load or populate correctly
   - **Mitigation**: Implement robust error handling and fallback to original structure

2. **Accessibility Regression**: New structure might introduce accessibility issues
   - **Mitigation**: Comprehensive accessibility testing, maintain semantic structure

## Testing Requirements

### Unit Tests
- DOM migration utilities backup/restore functionality
- Template population and ID handling
- Migration validation checks

### Integration Tests  
- Full migration process from original to module structure
- Module content loading for all module types
- Rollback capability when migration fails

### Accessibility Tests
- Keyboard navigation through new structure
- Screen reader compatibility
- ARIA attribute correctness

## Success Criteria
- [ ] All existing form elements are successfully migrated to module structure
- [ ] No existing functionality is broken by structure changes
- [ ] All element IDs are preserved and accessible
- [ ] Migration can be safely rolled back if needed
- [ ] New structure maintains accessibility compliance
- [ ] Visual layout remains consistent with original design
