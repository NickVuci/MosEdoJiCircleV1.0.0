# Phase 5: Module Definitions and Registration

## Overview

This phase focuses on defining and registering the individual modules (EDO, JI, MOS) within the module management system. This phase creates the bridge between the abstract module system and the concrete visualization modules, establishing their properties, behaviors, and integration points.

## Objectives

- Define module specifications for EDO, JI, and MOS
- Create module registration system
- Establish module-specific rendering functions
- Implement content population for each module
- Set up module-specific state management
- Ensure backward compatibility during transition

## Prerequisites

- ✅ Phase 1: Module Component System completed
- ✅ Phase 2: Drag and Drop Implementation completed
- ✅ Phase 3: CSS Updates completed
- ✅ Phase 4: Rendering Integration completed
- ✅ Breaking change prevention measures in place

## Deliverables

### 1. Module Definition Framework (`modules.js`)

Create the core module definitions file:

```javascript
// modules.js
import { VisualizationModule } from './moduleSystem.js';
import { renderEDO } from './edo.js';
import { renderJI } from './ji.js';
import { renderMOS } from './mos.js';
import { state } from './state.js';

// Module configuration constants
const MODULE_COLORS = {
  edo: '#1a73e8',    // Blue
  ji: '#e8710a',     // Orange
  mos: '#7b1fa2'     // Purple
};

const MODULE_DEFAULTS = {
  edo: {
    value: 12,
    showLines: true,
    primeColors: false,
    expanded: true
  },
  ji: {
    selectedPrimes: ['2', '3', '5'],
    oddLimit: 15,
    expanded: true
  },
  mos: {
    enabled: false,
    generator: 701.955,
    stacks: 6,
    expanded: false
  }
};

// Create EDO module
export const edoModule = new VisualizationModule({
  id: 'edo',
  title: 'Equal Divisions',
  color: MODULE_COLORS.edo,
  renderFunction: renderEDO,
  initiallyExpanded: MODULE_DEFAULTS.edo.expanded,
  contentBuilder: buildEDOContent,
  stateValidator: validateEDOState
});

// Create JI module
export const jiModule = new VisualizationModule({
  id: 'ji',
  title: 'Just Intonation',
  color: MODULE_COLORS.ji,
  renderFunction: renderJI,
  initiallyExpanded: MODULE_DEFAULTS.ji.expanded,
  contentBuilder: buildJIContent,
  stateValidator: validateJIState
});

// Create MOS module
export const mosModule = new VisualizationModule({
  id: 'mos',
  title: 'Moment of Symmetry',
  color: MODULE_COLORS.mos,
  renderFunction: renderMOS,
  initiallyExpanded: MODULE_DEFAULTS.mos.expanded,
  contentBuilder: buildMOSContent,
  stateValidator: validateMOSState
});

// Export all modules in registration order
export const allModules = [edoModule, jiModule, mosModule];

// Module registry for lookup
const moduleRegistry = new Map();
allModules.forEach(module => moduleRegistry.set(module.id, module));

// Public API for module access
export function getModuleById(id) {
  return moduleRegistry.get(id);
}

export function getAllModules() {
  return [...allModules];
}

export function getActiveModules() {
  return allModules.filter(module => module.expanded);
}
```

### 2. EDO Module Content Builder

```javascript
// Content builder for EDO module
function buildEDOContent(contentElement) {
  const edoDefaults = MODULE_DEFAULTS.edo;
  
  contentElement.innerHTML = `
    <div class="module-section">
      <label for="edo-input" class="form-label">
        Equal Divisions:
      </label>
      <input 
        type="number" 
        id="edo-input" 
        class="form-input" 
        value="${edoDefaults.value}" 
        min="1" 
        max="100"
        data-module="edo"
        data-field="value"
      />
    </div>
    
    <div class="module-section">
      <div class="checkbox-group">
        <input 
          type="checkbox" 
          id="edo-lines" 
          class="form-checkbox"
          ${edoDefaults.showLines ? 'checked' : ''}
          data-module="edo"
          data-field="showLines"
        />
        <label for="edo-lines" class="checkbox-label">
          Show division lines
        </label>
      </div>
    </div>
    
    <div class="module-section">
      <div class="checkbox-group">
        <input 
          type="checkbox" 
          id="prime-colors-checkbox" 
          class="form-checkbox"
          ${edoDefaults.primeColors ? 'checked' : ''}
          data-module="edo"
          data-field="primeColors"
        />
        <label for="prime-colors-checkbox" class="checkbox-label">
          Prime factor colors
        </label>
      </div>
    </div>
  `;
  
  // Set up event listeners for EDO controls
  setupEDOEventListeners(contentElement);
}

function setupEDOEventListeners(contentElement) {
  const edoInput = contentElement.querySelector('#edo-input');
  const linesCheckbox = contentElement.querySelector('#edo-lines');
  const primeColorsCheckbox = contentElement.querySelector('#prime-colors-checkbox');
  
  // EDO value change
  edoInput?.addEventListener('input', (e) => {
    const value = parseInt(e.target.value) || 0;
    updateModuleState('edo', 'value', value);
    triggerVisualizationUpdate();
  });
  
  // Lines toggle
  linesCheckbox?.addEventListener('change', (e) => {
    updateModuleState('edo', 'showLines', e.target.checked);
    triggerVisualizationUpdate();
  });
  
  // Prime colors toggle
  primeColorsCheckbox?.addEventListener('change', (e) => {
    updateModuleState('edo', 'primeColors', e.target.checked);
    triggerVisualizationUpdate();
  });
}

function validateEDOState(moduleState) {
  return {
    value: Math.max(1, Math.min(100, parseInt(moduleState.value) || 12)),
    showLines: Boolean(moduleState.showLines),
    primeColors: Boolean(moduleState.primeColors)
  };
}
```

### 3. JI Module Content Builder

```javascript
// Content builder for JI module
function buildJIContent(contentElement) {
  const jiDefaults = MODULE_DEFAULTS.ji;
  
  contentElement.innerHTML = `
    <div class="module-section">
      <label for="odd-limit-input" class="form-label">
        Odd Limit:
      </label>
      <input 
        type="number" 
        id="odd-limit-input" 
        class="form-input" 
        value="${jiDefaults.oddLimit}" 
        min="3" 
        max="99" 
        step="2"
        data-module="ji"
        data-field="oddLimit"
      />
    </div>
    
    <div class="module-section">
      <fieldset class="prime-fieldset">
        <legend class="form-label">Prime Factors:</legend>
        <div id="prime-checkboxes" class="checkbox-grid">
          <!-- Prime checkboxes will be populated dynamically -->
        </div>
      </fieldset>
    </div>
  `;
  
  // Build prime checkboxes based on odd limit
  buildPrimeCheckboxes(contentElement, jiDefaults.oddLimit, jiDefaults.selectedPrimes);
  
  // Set up event listeners for JI controls
  setupJIEventListeners(contentElement);
}

function buildPrimeCheckboxes(contentElement, oddLimit, selectedPrimes) {
  const container = contentElement.querySelector('#prime-checkboxes');
  if (!container) return;
  
  // Generate prime numbers up to odd limit
  const primes = generatePrimesUpTo(oddLimit);
  
  container.innerHTML = primes.map(prime => `
    <div class="checkbox-group">
      <input 
        type="checkbox" 
        id="prime-${prime}" 
        class="form-checkbox prime-checkbox"
        value="${prime}"
        ${selectedPrimes.includes(prime.toString()) ? 'checked' : ''}
        data-module="ji"
        data-field="selectedPrimes"
      />
      <label for="prime-${prime}" class="checkbox-label">
        ${prime}
      </label>
    </div>
  `).join('');
}

function setupJIEventListeners(contentElement) {
  const oddLimitInput = contentElement.querySelector('#odd-limit-input');
  const primeContainer = contentElement.querySelector('#prime-checkboxes');
  
  // Odd limit change
  oddLimitInput?.addEventListener('input', (e) => {
    const oddLimit = parseInt(e.target.value) || 15;
    updateModuleState('ji', 'oddLimit', oddLimit);
    
    // Rebuild prime checkboxes
    const currentSelected = getSelectedPrimes(contentElement);
    buildPrimeCheckboxes(contentElement, oddLimit, currentSelected);
    setupPrimeCheckboxListeners(contentElement);
    
    triggerVisualizationUpdate();
  });
  
  // Initial setup of prime checkbox listeners
  setupPrimeCheckboxListeners(contentElement);
}

function setupPrimeCheckboxListeners(contentElement) {
  const primeCheckboxes = contentElement.querySelectorAll('.prime-checkbox');
  
  primeCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const selectedPrimes = getSelectedPrimes(contentElement);
      updateModuleState('ji', 'selectedPrimes', selectedPrimes);
      triggerVisualizationUpdate();
    });
  });
}

function getSelectedPrimes(contentElement) {
  return Array.from(contentElement.querySelectorAll('.prime-checkbox:checked'))
    .map(cb => cb.value);
}

function validateJIState(moduleState) {
  const oddLimit = Math.max(3, parseInt(moduleState.oddLimit) || 15);
  const validPrimes = generatePrimesUpTo(oddLimit).map(p => p.toString());
  const selectedPrimes = (moduleState.selectedPrimes || [])
    .filter(prime => validPrimes.includes(prime));
  
  return {
    oddLimit,
    selectedPrimes: selectedPrimes.length > 0 ? selectedPrimes : ['2', '3', '5']
  };
}
```

### 4. MOS Module Content Builder

```javascript
// Content builder for MOS module
function buildMOSContent(contentElement) {
  const mosDefaults = MODULE_DEFAULTS.mos;
  
  contentElement.innerHTML = `
    <div class="module-section">
      <div class="checkbox-group">
        <input 
          type="checkbox" 
          id="mos-toggle" 
          class="form-checkbox"
          ${mosDefaults.enabled ? 'checked' : ''}
          data-module="mos"
          data-field="enabled"
        />
        <label for="mos-toggle" class="checkbox-label">
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
        value="${mosDefaults.generator}" 
        min="0" 
        max="1200" 
        step="0.001"
        data-module="mos"
        data-field="generator"
      />
    </div>
    
    <div class="module-section">
      <label for="mos-stacks-input" class="form-label">
        Number of Stacks:
      </label>
      <input 
        type="number" 
        id="mos-stacks-input" 
        class="form-input" 
        value="${mosDefaults.stacks}" 
        min="1" 
        max="20"
        data-module="mos"
        data-field="stacks"
      />
    </div>
  `;
  
  // Set up event listeners for MOS controls
  setupMOSEventListeners(contentElement);
}

function setupMOSEventListeners(contentElement) {
  const enableToggle = contentElement.querySelector('#mos-toggle');
  const generatorInput = contentElement.querySelector('#mos-generator-input');
  const stacksInput = contentElement.querySelector('#mos-stacks-input');
  
  // Enable/disable toggle
  enableToggle?.addEventListener('change', (e) => {
    const enabled = e.target.checked;
    updateModuleState('mos', 'enabled', enabled);
    
    // Enable/disable other controls
    toggleMOSControls(contentElement, enabled);
    
    triggerVisualizationUpdate();
  });
  
  // Generator change
  generatorInput?.addEventListener('input', (e) => {
    const generator = parseFloat(e.target.value) || 701.955;
    updateModuleState('mos', 'generator', generator);
    triggerVisualizationUpdate();
  });
  
  // Stacks change
  stacksInput?.addEventListener('input', (e) => {
    const stacks = parseInt(e.target.value) || 6;
    updateModuleState('mos', 'stacks', stacks);
    triggerVisualizationUpdate();
  });
  
  // Initial state setup
  toggleMOSControls(contentElement, enableToggle?.checked || false);
}

function toggleMOSControls(contentElement, enabled) {
  const controls = contentElement.querySelectorAll('input:not(#mos-toggle)');
  controls.forEach(control => {
    control.disabled = !enabled;
  });
}

function validateMOSState(moduleState) {
  return {
    enabled: Boolean(moduleState.enabled),
    generator: Math.max(0, Math.min(1200, parseFloat(moduleState.generator) || 701.955)),
    stacks: Math.max(1, Math.min(20, parseInt(moduleState.stacks) || 6))
  };
}
```

### 5. State Management Integration

```javascript
// State management utilities for modules
function updateModuleState(moduleId, field, value) {
  const module = getModuleById(moduleId);
  if (!module) return;
  
  // Update internal module state
  if (!module.state) module.state = {};
  module.state[field] = value;
  
  // Update global state
  updateState(`modules.${moduleId}.${field}`, value);
  
  // Validate state if validator exists
  if (module.stateValidator) {
    module.state = module.stateValidator(module.state);
  }
}

function triggerVisualizationUpdate() {
  // Debounce visualization updates
  clearTimeout(triggerVisualizationUpdate.timeout);
  triggerVisualizationUpdate.timeout = setTimeout(() => {
    document.dispatchEvent(new CustomEvent('modules-changed'));
  }, 50);
}

// Utility functions
function generatePrimesUpTo(limit) {
  const primes = [];
  const sieve = new Array(limit + 1).fill(true);
  sieve[0] = sieve[1] = false;
  
  for (let i = 2; i <= limit; i++) {
    if (sieve[i]) {
      primes.push(i);
      for (let j = i * i; j <= limit; j += i) {
        sieve[j] = false;
      }
    }
  }
  
  return primes;
}
```

## Migration Strategy

### Safe Content Migration

```javascript
// Migration helper for moving existing controls into modules
export class ModuleContentMigrator {
  static migrateExistingControls() {
    // Capture current values before migration
    const currentState = this.captureCurrentState();
    
    // Migrate each module's content
    this.migrateEDOControls(currentState.edo);
    this.migrateJIControls(currentState.ji);
    this.migrateMOSControls(currentState.mos);
    
    // Remove old control elements after successful migration
    this.cleanupOldControls();
  }
  
  static captureCurrentState() {
    return {
      edo: {
        value: document.getElementById('edo-input')?.value || '12',
        showLines: document.getElementById('edo-lines')?.checked !== false,
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
  
  static migrateEDOControls(edoState) {
    const edoModule = getModuleById('edo');
    if (!edoModule) return;
    
    // Build content with migrated state
    edoModule.contentBuilder(edoModule.contentElement);
    
    // Restore values
    const edoInput = edoModule.contentElement.querySelector('#edo-input');
    const linesCheckbox = edoModule.contentElement.querySelector('#edo-lines');
    const primeColorsCheckbox = edoModule.contentElement.querySelector('#prime-colors-checkbox');
    
    if (edoInput) edoInput.value = edoState.value;
    if (linesCheckbox) linesCheckbox.checked = edoState.showLines;
    if (primeColorsCheckbox) primeColorsCheckbox.checked = edoState.primeColors;
  }
  
  // Similar methods for JI and MOS...
}
```

## Testing Requirements

### Unit Tests

```javascript
// Test suite for module definitions
describe('Module Definitions', () => {
  test('EDO module creates correct content structure', () => {
    const edoModule = getModuleById('edo');
    const mockContainer = document.createElement('div');
    
    edoModule.contentBuilder(mockContainer);
    
    expect(mockContainer.querySelector('#edo-input')).toBeTruthy();
    expect(mockContainer.querySelector('#edo-lines')).toBeTruthy();
    expect(mockContainer.querySelector('#prime-colors-checkbox')).toBeTruthy();
  });
  
  test('JI module validates state correctly', () => {
    const jiModule = getModuleById('ji');
    const invalidState = { oddLimit: -5, selectedPrimes: ['999'] };
    
    const validatedState = jiModule.stateValidator(invalidState);
    
    expect(validatedState.oddLimit).toBeGreaterThanOrEqual(3);
    expect(validatedState.selectedPrimes).toContain('2');
  });
  
  test('MOS module handles enable/disable correctly', () => {
    const mosModule = getModuleById('mos');
    const mockContainer = document.createElement('div');
    
    mosModule.contentBuilder(mockContainer);
    
    const toggle = mockContainer.querySelector('#mos-toggle');
    const controls = mockContainer.querySelectorAll('input:not(#mos-toggle)');
    
    // Test disable
    toggle.checked = false;
    toggle.dispatchEvent(new Event('change'));
    
    controls.forEach(control => {
      expect(control.disabled).toBe(true);
    });
  });
});
```

### Integration Tests

```javascript
// Integration test for module registration
describe('Module Registration', () => {
  test('all modules are properly registered', () => {
    expect(getAllModules()).toHaveLength(3);
    expect(getModuleById('edo')).toBeTruthy();
    expect(getModuleById('ji')).toBeTruthy();
    expect(getModuleById('mos')).toBeTruthy();
  });
  
  test('module state updates trigger visualization updates', () => {
    const updateSpy = jest.spyOn(document, 'dispatchEvent');
    
    updateModuleState('edo', 'value', 24);
    
    // Wait for debounced update
    setTimeout(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'modules-changed' })
      );
    }, 100);
  });
});
```

## Breaking Change Prevention

### Compatibility Layer

```javascript
// Compatibility layer for existing code
export class ModuleCompatibilityLayer {
  static enableLegacySupport() {
    // Create global references for backward compatibility
    window.getEDOValue = () => {
      const edoModule = getModuleById('edo');
      return edoModule?.state?.value || 12;
    };
    
    window.getSelectedPrimes = () => {
      const jiModule = getModuleById('ji');
      return jiModule?.state?.selectedPrimes || ['2', '3', '5'];
    };
    
    window.isMOSEnabled = () => {
      const mosModule = getModuleById('mos');
      return mosModule?.state?.enabled || false;
    };
  }
  
  static disableLegacySupport() {
    // Clean up global references after migration is complete
    delete window.getEDOValue;
    delete window.getSelectedPrimes;
    delete window.isMOSEnabled;
  }
}
```

## Success Criteria

- [ ] All three modules (EDO, JI, MOS) are properly defined and registered
- [ ] Module content builders create correct DOM structures
- [ ] Event listeners are properly attached and functional
- [ ] State validation works correctly for all modules
- [ ] Migration from existing controls preserves all user data
- [ ] Compatibility layer maintains existing functionality
- [ ] All tests pass (unit and integration)
- [ ] No breaking changes to existing rendering functions
- [ ] Performance impact is minimal (< 50ms initialization)

## Risk Mitigation

### High Risk: State Loss During Migration
- **Mitigation**: Implement comprehensive state capture/restore
- **Fallback**: Keep old controls as backup until migration is verified

### Medium Risk: Event Listener Conflicts
- **Mitigation**: Use event delegation and proper cleanup
- **Fallback**: Namespace events to avoid conflicts

### Low Risk: Performance Impact
- **Mitigation**: Lazy load module content, debounce updates
- **Fallback**: Optional module system with feature flag

## Next Phase

After completion, proceed to **Phase 6: HTML Structure Updates** to integrate the module system into the main application structure.
