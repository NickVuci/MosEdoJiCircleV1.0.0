# Phase 7: Module Controls and Event System

## Overview
This phase focuses on the final integration of the module system, implementing the control systems, event handling, and ensuring proper interaction between modules and the visualization system. This is the capstone phase that ties together all previous implementations.

## Dependencies
- ✅ Phase 1: Module Component System - For base module functionality
- ✅ Phase 2: Drag and Drop - For module reordering
- ✅ Phase 4: Rendering Integration - For visualization updates
- ✅ Phase 5: Module Definitions - For module-specific functionality
- ✅ Phase 6: HTML Structure - For module content structure

## Objectives
- Implement unified event handling system for module controls
- Create input validation system with feedback
- Establish module-specific control behavior
- Integrate form controls with state management
- Create inter-module communication system
- Ensure graceful error recovery for control inputs

## Implementation Plan

### 1. Unified Control Event System

```javascript
// controlSystem.js
import { getModuleById } from './modules.js';
import { state, updateState } from './state.js';
import { debounce } from './utils.js';

// Control system class to manage form control events
export class ModuleControlSystem {
  constructor() {
    this.eventListeners = new Map(); // Track event listeners for cleanup
    this.controlValidators = new Map(); // Input validation functions
    this.moduleInteractions = new Map(); // Cross-module interactions
    
    // State for handling updates
    this.updatingControls = false;
    this.pendingUpdates = [];
  }
  
  /**
   * Initialize control system for all modules
   */
  initialize(modules) {
    // Set up validation functions
    this.setupValidators();
    
    // Register cross-module interactions
    this.registerModuleInteractions();
    
    // Set up event listeners for each module
    modules.forEach(module => {
      this.initializeModuleControls(module);
    });
    
    // Listen for state changes to update controls
    document.addEventListener('state-changed', this.handleStateChange.bind(this));
    
    console.log('Module control system initialized');
  }
  
  /**
   * Initialize controls for a specific module
   */
  initializeModuleControls(module) {
    if (!module.contentElement) {
      console.warn(`Module ${module.id} has no content element`);
      return;
    }
    
    // Get all form controls in this module
    const controls = this.getModuleControls(module);
    
    // Set up event listeners for each control
    controls.forEach(control => {
      this.setupControlEventListeners(control, module);
    });
    
    // Set initial values from state
    this.syncControlsWithState(module);
    
    console.log(`Controls initialized for module: ${module.id}`);
  }
  
  /**
   * Get all form controls in a module
   */
  getModuleControls(module) {
    return Array.from(module.contentElement.querySelectorAll('input, select, textarea, button'));
  }
  
  /**
   * Set up event listeners for a control
   */
  setupControlEventListeners(control, module) {
    // Determine control type and set up appropriate listeners
    const controlType = control.type || control.tagName.toLowerCase();
    const controlId = control.id;
    const moduleId = module.id;
    
    // Clean up existing listeners if any
    this.removeControlEventListeners(control);
    
    // Create event listener mapping
    const listeners = [];
    
    switch (controlType) {
      case 'checkbox':
      case 'radio':
        // For checkboxes and radio buttons
        const changeListener = this.createControlChangeHandler(control, module);
        control.addEventListener('change', changeListener);
        listeners.push({ event: 'change', handler: changeListener });
        break;
        
      case 'number':
      case 'range':
        // For numeric inputs
        const inputListener = this.createControlInputHandler(control, module);
        control.addEventListener('input', inputListener);
        listeners.push({ event: 'input', handler: inputListener });
        
        // Add blur for validation
        const blurListener = this.createControlBlurHandler(control, module);
        control.addEventListener('blur', blurListener);
        listeners.push({ event: 'blur', handler: blurListener });
        break;
        
      case 'select':
        // For select dropdowns
        const selectListener = this.createControlChangeHandler(control, module);
        control.addEventListener('change', selectListener);
        listeners.push({ event: 'change', handler: selectListener });
        break;
        
      default:
        // Default handlers for text inputs, etc.
        const defaultInputListener = this.createControlInputHandler(control, module);
        control.addEventListener('input', defaultInputListener);
        listeners.push({ event: 'input', handler: defaultInputListener });
        
        const defaultBlurListener = this.createControlBlurHandler(control, module);
        control.addEventListener('blur', defaultBlurListener);
        listeners.push({ event: 'blur', handler: defaultBlurListener });
        break;
    }
    
    // Store listeners for cleanup
    const key = `${moduleId}:${controlId}`;
    this.eventListeners.set(key, listeners);
  }
  
  /**
   * Remove event listeners for a control
   */
  removeControlEventListeners(control) {
    const moduleId = control.closest('[data-module-id]')?.getAttribute('data-module-id');
    const controlId = control.id;
    
    if (!moduleId || !controlId) return;
    
    const key = `${moduleId}:${controlId}`;
    const listeners = this.eventListeners.get(key);
    
    if (listeners && listeners.length > 0) {
      listeners.forEach(({ event, handler }) => {
        control.removeEventListener(event, handler);
      });
      this.eventListeners.delete(key);
    }
  }
  
  /**
   * Create change handler for checkbox/radio/select
   */
  createControlChangeHandler(control, module) {
    return (event) => {
      if (this.updatingControls) return; // Avoid loops when updating controls
      
      const field = control.dataset.field || control.name || control.id;
      let value;
      
      if (control.type === 'checkbox') {
        value = control.checked;
      } else if (control.type === 'radio') {
        // For radio buttons, we only update on the checked one
        if (!control.checked) return;
        value = control.value;
      } else {
        value = control.value;
      }
      
      // Validate input
      const validationResult = this.validateControlInput(control, value);
      if (!validationResult.valid) {
        this.showValidationError(control, validationResult.message);
        return;
      }
      
      // Update module state
      this.updateModuleState(module.id, field, validationResult.value);
      
      // Handle any cross-module interactions
      this.handleModuleInteractions(module.id, field, validationResult.value);
      
      // Clear validation errors
      this.clearValidationError(control);
      
      // Trigger visualization update
      this.triggerVisualizationUpdate();
    };
  }
  
  /**
   * Create input handler for text/number inputs
   */
  createControlInputHandler(control, module) {
    // Debounce frequent updates for smooth typing
    return debounce((event) => {
      if (this.updatingControls) return; // Avoid loops when updating controls
      
      const field = control.dataset.field || control.name || control.id;
      const value = control.value;
      
      // Perform live validation but don't show errors yet
      const validationResult = this.validateControlInput(control, value);
      
      // Update module state only if valid
      if (validationResult.valid) {
        this.updateModuleState(module.id, field, validationResult.value);
        
        // Handle any cross-module interactions
        this.handleModuleInteractions(module.id, field, validationResult.value);
        
        // Clear validation errors
        this.clearValidationError(control);
        
        // Trigger visualization update
        this.triggerVisualizationUpdate();
      }
    }, 150); // Debounce delay
  }
  
  /**
   * Create blur handler for validation
   */
  createControlBlurHandler(control, module) {
    return (event) => {
      const field = control.dataset.field || control.name || control.id;
      const value = control.value;
      
      // Validate input
      const validationResult = this.validateControlInput(control, value);
      
      if (!validationResult.valid) {
        // Show error on blur
        this.showValidationError(control, validationResult.message);
        
        // Revert to last valid value if available
        const currentState = this.getModuleState(module.id);
        if (currentState && currentState[field] !== undefined) {
          // Schedule control update after blur
          setTimeout(() => {
            this.updateControl(control, currentState[field]);
          }, 0);
        }
        return;
      }
      
      // Update with validated value
      this.updateModuleState(module.id, field, validationResult.value);
      
      // Update control with normalized value
      this.updateControl(control, validationResult.value);
      
      // Clear validation errors
      this.clearValidationError(control);
    };
  }
  
  /**
   * Validate control input
   */
  validateControlInput(control, value) {
    const validatorKey = control.dataset.validator || control.id || control.name;
    
    // Get validator function for this control
    const validator = this.controlValidators.get(validatorKey);
    
    if (!validator) {
      // No specific validator, perform basic type validation
      return this.defaultValidation(control, value);
    }
    
    // Use custom validator
    return validator(value, control);
  }
  
  /**
   * Default validation based on input type
   */
  defaultValidation(control, value) {
    switch (control.type) {
      case 'number':
      case 'range':
        // Parse and validate number
        const numValue = parseFloat(value);
        const min = parseFloat(control.min);
        const max = parseFloat(control.max);
        
        if (isNaN(numValue)) {
          return { 
            valid: false, 
            value: null, 
            message: 'Please enter a valid number' 
          };
        }
        
        // Apply min/max constraints
        if (!isNaN(min) && numValue < min) {
          return { 
            valid: false, 
            value: min, 
            message: `Minimum value is ${min}` 
          };
        }
        
        if (!isNaN(max) && numValue > max) {
          return { 
            valid: false, 
            value: max, 
            message: `Maximum value is ${max}` 
          };
        }
        
        return { valid: true, value: numValue };
        
      case 'checkbox':
        // Boolean validation
        return { valid: true, value: !!value };
        
      default:
        // Default string validation
        return { valid: true, value: String(value) };
    }
  }
  
  /**
   * Show validation error for a control
   */
  showValidationError(control, message) {
    // Find or create error element
    let errorElement = this.getErrorElementForControl(control);
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'validation-error';
      errorElement.setAttribute('aria-live', 'polite');
      
      // Insert after control or control container
      const container = control.closest('.form-group') || control.parentElement;
      container.appendChild(errorElement);
    }
    
    // Update error message
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Add error class to control
    control.classList.add('input-error');
    control.setAttribute('aria-invalid', 'true');
  }
  
  /**
   * Clear validation error for a control
   */
  clearValidationError(control) {
    // Remove error class from control
    control.classList.remove('input-error');
    control.setAttribute('aria-invalid', 'false');
    
    // Hide error message if it exists
    const errorElement = this.getErrorElementForControl(control);
    if (errorElement) {
      errorElement.style.display = 'none';
      errorElement.textContent = '';
    }
  }
  
  /**
   * Get error element for a control
   */
  getErrorElementForControl(control) {
    const container = control.closest('.form-group') || control.parentElement;
    return container.querySelector('.validation-error');
  }
  
  /**
   * Update control value without triggering events
   */
  updateControl(control, value) {
    // Flag that we're updating programmatically
    this.updatingControls = true;
    
    try {
      if (control.type === 'checkbox') {
        control.checked = !!value;
      } else if (control.type === 'radio') {
        control.checked = control.value === value;
      } else {
        control.value = value;
      }
    } finally {
      this.updatingControls = false;
    }
  }
  
  /**
   * Sync all controls with current state
   */
  syncControlsWithState(module) {
    const controls = this.getModuleControls(module);
    const moduleState = this.getModuleState(module.id);
    
    if (!moduleState) return;
    
    // Flag that we're updating programmatically
    this.updatingControls = true;
    
    try {
      controls.forEach(control => {
        const field = control.dataset.field || control.name || control.id;
        
        // Skip if field not in state
        if (!moduleState.hasOwnProperty(field)) return;
        
        const value = moduleState[field];
        
        // Update control value
        if (control.type === 'checkbox') {
          control.checked = !!value;
        } else if (control.type === 'radio') {
          control.checked = control.value === value;
        } else {
          control.value = value !== undefined ? value : '';
        }
      });
    } finally {
      this.updatingControls = false;
    }
  }
  
  /**
   * Get module state from global state
   */
  getModuleState(moduleId) {
    return state.modules && state.modules[moduleId];
  }
  
  /**
   * Update module state
   */
  updateModuleState(moduleId, field, value) {
    updateState(`modules.${moduleId}.${field}`, value);
  }
  
  /**
   * Handle state change events
   */
  handleStateChange(event) {
    const { path, value } = event.detail;
    
    // Check if this is a module state change
    const matches = path.match(/^modules\.([^.]+)\.([^.]+)/);
    if (!matches) return;
    
    const [_, moduleId, field] = matches;
    
    // Find corresponding module and control
    const module = getModuleById(moduleId);
    if (!module || !module.contentElement) return;
    
    // Find the control by field
    const control = module.contentElement.querySelector(`[data-field="${field}"], [name="${field}"], #${field}`);
    if (!control) return;
    
    // Queue update to avoid loop
    this.queueControlUpdate(control, value);
  }
  
  /**
   * Queue control update to avoid update loops
   */
  queueControlUpdate(control, value) {
    this.pendingUpdates.push({ control, value });
    
    if (!this.updatingControls) {
      // Schedule updates for next tick
      setTimeout(() => {
        this.processControlUpdates();
      }, 0);
    }
  }
  
  /**
   * Process queued control updates
   */
  processControlUpdates() {
    this.updatingControls = true;
    
    try {
      while (this.pendingUpdates.length > 0) {
        const { control, value } = this.pendingUpdates.shift();
        this.updateControl(control, value);
      }
    } finally {
      this.updatingControls = false;
    }
  }
  
  /**
   * Trigger visualization update
   */
  triggerVisualizationUpdate() {
    // Use debounced function to limit updates
    if (!this.debouncedUpdate) {
      this.debouncedUpdate = debounce(() => {
        document.dispatchEvent(new CustomEvent('modules-changed'));
      }, 100);
    }
    
    this.debouncedUpdate();
  }
  
  /**
   * Set up validators for different controls
   */
  setupValidators() {
    // EDO module validators
    this.controlValidators.set('edo-input', (value) => {
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 1) {
        return { valid: false, value: 12, message: 'EDO must be at least 1' };
      }
      if (numValue > 144) {
        return { valid: false, value: 144, message: 'EDO cannot exceed 144' };
      }
      return { valid: true, value: numValue };
    });
    
    // JI module validators
    this.controlValidators.set('odd-limit-input', (value) => {
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 3) {
        return { valid: false, value: 3, message: 'Odd limit must be at least 3' };
      }
      if (numValue > 31) {
        return { valid: false, value: 31, message: 'Odd limit cannot exceed 31' };
      }
      if (numValue % 2 === 0) {
        // Round to nearest odd number
        const oddValue = numValue + 1;
        return { valid: false, value: oddValue, message: 'Odd limit must be an odd number' };
      }
      return { valid: true, value: numValue };
    });
    
    // MOS module validators
    this.controlValidators.set('mos-generator-input', (value) => {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        return { valid: false, value: 0, message: 'Generator must be non-negative' };
      }
      if (numValue > 1200) {
        return { valid: false, value: 1200, message: 'Generator cannot exceed 1200 cents' };
      }
      return { valid: true, value: numValue };
    });
    
    this.controlValidators.set('mos-stacks-input', (value) => {
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 1) {
        return { valid: false, value: 1, message: 'Stacks must be at least 1' };
      }
      if (numValue > 20) {
        return { valid: false, value: 20, message: 'Stacks cannot exceed 20' };
      }
      return { valid: true, value: numValue };
    });
  }
  
  /**
   * Register cross-module interactions
   */
  registerModuleInteractions() {
    // MOS toggle affects rendering
    this.moduleInteractions.set('mos:enabled', (value, moduleId, field) => {
      if (!value) {
        // MOS was disabled, no further actions needed
        return;
      }
      
      // MOS was enabled, make sure module is expanded
      const mosModule = getModuleById('mos');
      if (mosModule && !mosModule.expanded) {
        mosModule.expand();
      }
    });
    
    // EDO value change should update prime colors
    this.moduleInteractions.set('edo:value', (value, moduleId, field) => {
      if (!value || value <= 0) {
        // Invalid value, no further actions needed
        return;
      }
      
      // If prime colors are enabled, update them based on the EDO value
      const edoModule = getModuleById('edo');
      if (edoModule && edoModule.state && edoModule.state.primeColors) {
        // This would trigger a specific update for prime color rendering
        document.dispatchEvent(new CustomEvent('update-prime-colors', {
          detail: { edoValue: value }
        }));
      }
    });
  }
  
  /**
   * Handle registered module interactions
   */
  handleModuleInteractions(moduleId, field, value) {
    const interactionKey = `${moduleId}:${field}`;
    const interaction = this.moduleInteractions.get(interactionKey);
    
    if (interaction) {
      interaction(value, moduleId, field);
    }
  }
  
  /**
   * Cleanup and disposal
   */
  dispose() {
    // Remove all event listeners
    this.eventListeners.forEach((listeners, key) => {
      const [moduleId, controlId] = key.split(':');
      const module = getModuleById(moduleId);
      if (!module || !module.contentElement) return;
      
      const control = module.contentElement.querySelector(`#${controlId}`);
      if (!control) return;
      
      listeners.forEach(({ event, handler }) => {
        control.removeEventListener(event, handler);
      });
    });
    
    // Clear maps
    this.eventListeners.clear();
    this.controlValidators.clear();
    this.moduleInteractions.clear();
    
    // Remove state change listener
    document.removeEventListener('state-changed', this.handleStateChange);
    
    console.log('Module control system disposed');
  }
}

// Create and export singleton instance
export const controlSystem = new ModuleControlSystem();
```

### 2. Module-specific Control Behaviors

```javascript
// moduleControlBehaviors.js
import { getModuleById } from './modules.js';

// Module-specific behavior extensions
export class ModuleControlBehaviors {
  /**
   * Initialize module-specific behaviors
   */
  static initialize() {
    this.initializeEdoModule();
    this.initializeJiModule();
    this.initializeMosModule();
  }
  
  /**
   * Initialize EDO-specific control behaviors
   */
  static initializeEdoModule() {
    const edoModule = getModuleById('edo');
    if (!edoModule || !edoModule.contentElement) return;
    
    // EDO value display enhancement
    const edoInput = edoModule.contentElement.querySelector('#edo-input');
    if (edoInput) {
      // Create or find display element
      let displayEl = edoModule.contentElement.querySelector('.edo-display');
      if (!displayEl) {
        displayEl = document.createElement('div');
        displayEl.className = 'edo-display';
        displayEl.setAttribute('aria-live', 'polite');
        edoInput.parentNode.insertBefore(displayEl, edoInput.nextSibling);
      }
      
      // Update display when input changes
      edoInput.addEventListener('input', () => {
        const value = parseInt(edoInput.value) || 0;
        this.updateEdoDisplay(displayEl, value);
      });
      
      // Initial update
      this.updateEdoDisplay(displayEl, parseInt(edoInput.value) || 0);
    }
  }
  
  /**
   * Update EDO display with prime factorization and cents per step
   */
  static updateEdoDisplay(displayEl, value) {
    if (value <= 0) {
      displayEl.innerHTML = '';
      return;
    }
    
    // Calculate cents per step
    const centsPerStep = (1200 / value).toFixed(2);
    
    // Get prime factorization
    const primes = this.getPrimeFactorization(value);
    const primeFactors = primes.length > 0 
      ? `<span class="prime-factors">${primes.join(' × ')}</span>`
      : '';
    
    displayEl.innerHTML = `
      <span class="cents-per-step">${centsPerStep} ¢/step</span>
      ${primeFactors}
    `;
  }
  
  /**
   * Initialize JI-specific control behaviors
   */
  static initializeJiModule() {
    const jiModule = getModuleById('ji');
    if (!jiModule || !jiModule.contentElement) return;
    
    // Create ratio preview element
    let previewEl = jiModule.contentElement.querySelector('.ji-preview');
    if (!previewEl) {
      previewEl = document.createElement('div');
      previewEl.className = 'ji-preview';
      previewEl.setAttribute('aria-live', 'polite');
      jiModule.contentElement.appendChild(previewEl);
    }
    
    // Update when any prime checkbox changes
    const primeCheckboxes = jiModule.contentElement.querySelectorAll('.prime-checkbox');
    primeCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.updateJiPreview(jiModule, previewEl);
      });
    });
    
    // Update when odd limit changes
    const oddLimitInput = jiModule.contentElement.querySelector('#odd-limit-input');
    if (oddLimitInput) {
      oddLimitInput.addEventListener('input', () => {
        this.updateJiPreview(jiModule, previewEl);
      });
    }
    
    // Initial update
    this.updateJiPreview(jiModule, previewEl);
  }
  
  /**
   * Update JI preview with selected primes information
   */
  static updateJiPreview(jiModule, previewEl) {
    // Get selected primes
    const selectedPrimes = Array.from(
      jiModule.contentElement.querySelectorAll('.prime-checkbox:checked')
    ).map(cb => parseInt(cb.value));
    
    if (selectedPrimes.length === 0) {
      previewEl.innerHTML = '<span class="empty-selection">No primes selected</span>';
      return;
    }
    
    // Calculate maximum frequency ratio
    const oddLimit = parseInt(jiModule.contentElement.querySelector('#odd-limit-input')?.value) || 15;
    
    // Create HTML for preview
    const primeList = selectedPrimes.join(', ');
    const oddLimitInfo = `Odd limit: ${oddLimit}`;
    
    previewEl.innerHTML = `
      <div class="ji-preview__primes">Selected primes: <strong>${primeList}</strong></div>
      <div class="ji-preview__limit">${oddLimitInfo}</div>
    `;
  }
  
  /**
   * Initialize MOS-specific control behaviors
   */
  static initializeMosModule() {
    const mosModule = getModuleById('mos');
    if (!mosModule || !mosModule.contentElement) return;
    
    // Generator value enhancement
    const generatorInput = mosModule.contentElement.querySelector('#mos-generator-input');
    if (generatorInput) {
      // Create or find display element
      let displayEl = mosModule.contentElement.querySelector('.mos-preview');
      if (!displayEl) {
        displayEl = document.createElement('div');
        displayEl.className = 'mos-preview';
        displayEl.setAttribute('aria-live', 'polite');
        mosModule.contentElement.appendChild(displayEl);
      }
      
      // Update display when input changes
      const updateDisplay = () => {
        const generator = parseFloat(generatorInput.value) || 0;
        const stacks = parseInt(mosModule.contentElement.querySelector('#mos-stacks-input')?.value) || 6;
        const enabled = mosModule.contentElement.querySelector('#mos-toggle')?.checked || false;
        
        this.updateMosPreview(displayEl, generator, stacks, enabled);
      };
      
      // Watch all MOS controls
      generatorInput.addEventListener('input', updateDisplay);
      
      const stacksInput = mosModule.contentElement.querySelector('#mos-stacks-input');
      if (stacksInput) {
        stacksInput.addEventListener('input', updateDisplay);
      }
      
      const enableToggle = mosModule.contentElement.querySelector('#mos-toggle');
      if (enableToggle) {
        enableToggle.addEventListener('change', updateDisplay);
      }
      
      // Initial update
      updateDisplay();
    }
  }
  
  /**
   * Update MOS preview with generator information
   */
  static updateMosPreview(displayEl, generator, stacks, enabled) {
    if (!enabled || generator <= 0) {
      displayEl.innerHTML = '';
      return;
    }
    
    // Calculate generator as ratio of octave
    const genRatio = generator / 1200;
    const genFraction = this.approximateFraction(genRatio, 0.00001);
    
    displayEl.innerHTML = `
      <div class="mos-preview__generator">
        Generator: <strong>${generator.toFixed(3)} ¢</strong>
        ${genFraction ? `≈ <span class="fraction">${genFraction[0]}/${genFraction[1]}</span> of octave` : ''}
      </div>
      <div class="mos-preview__stacks">
        Stacks: <strong>${stacks}</strong>
      </div>
    `;
  }
  
  /**
   * Utility: Get prime factorization of a number
   */
  static getPrimeFactorization(num) {
    const factors = [];
    let n = num;
    
    // Check for 2 as a factor
    while (n % 2 === 0) {
      factors.push(2);
      n /= 2;
    }
    
    // Check for odd factors
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      while (n % i === 0) {
        factors.push(i);
        n /= i;
      }
    }
    
    // If n is a prime greater than 2
    if (n > 2) {
      factors.push(n);
    }
    
    return factors;
  }
  
  /**
   * Utility: Approximate a decimal as a fraction
   */
  static approximateFraction(decimal, tolerance) {
    if (decimal === 0) return [0, 1];
    if (decimal === 1) return [1, 1];
    
    let n1 = 1, d1 = 0, n2 = 0, d2 = 1, b = decimal;
    let stop = false;
    
    do {
      let a = Math.floor(b);
      let aux = n1;
      n1 = a * n1 + n2;
      n2 = aux;
      aux = d1;
      d1 = a * d1 + d2;
      d2 = aux;
      b = 1 / (b - a);
      
      // Check if the approximation is good enough
      if (Math.abs(decimal - n1/d1) < tolerance) {
        stop = true;
      }
      // Avoid infinite loops and excessively large fractions
    } while (!stop && isFinite(b) && n1 <= 1000 && d1 <= 1000);
    
    return [n1, d1];
  }
}
```

### 3. Module Initialization and Integration

```javascript
// app.js - Main application entry point

import { initModules, getOrderedModules } from './moduleSystem.js';
import { allModules } from './modules.js';
import { state, updateState, initializeState } from './state.js';
import { controlSystem } from './controlSystem.js';
import { ModuleControlBehaviors } from './moduleControlBehaviors.js';
import { domMigrator } from './domMigration.js';
import { renderingCoordinator } from './renderingCoordinator.js';
import { SVGManager } from './svgManager.js';

// Main initialization function
async function initializeApplication() {
  try {
    console.log('Initializing application...');
    
    // Initialize state with default values
    await initializeState({
      moduleOrder: ['edo', 'ji', 'mos'],
      modules: {
        edo: { expanded: true, value: 12, showLines: true, primeColors: false },
        ji: { expanded: true, selectedPrimes: ['2', '3', '5'], oddLimit: 15 },
        mos: { expanded: false, enabled: false, generator: 701.955, stacks: 6 }
      }
    });
    
    // Backup original DOM structure before migration
    domMigrator.backupOriginalStructure();
    
    // Get container element for modules
    const modulesContainer = document.getElementById('modules-container');
    if (!modulesContainer) {
      throw new Error('Modules container not found');
    }
    
    // Initialize modules
    await initModules(modulesContainer);
    console.log('Modules initialized');
    
    // Initialize SVG manager
    const svgElement = document.getElementById('circle-svg');
    if (!svgElement) {
      throw new Error('SVG element not found');
    }
    const svgManager = new SVGManager(svgElement);
    console.log('SVG manager initialized');
    
    // Initialize rendering coordinator
    renderingCoordinator.initialize(svgManager, getOrderedModules());
    console.log('Rendering coordinator initialized');
    
    // Initialize control system
    controlSystem.initialize(allModules);
    console.log('Control system initialized');
    
    // Initialize module-specific behaviors
    ModuleControlBehaviors.initialize();
    console.log('Module behaviors initialized');
    
    // Perform DOM migration
    domMigrator.migrateToModuleStructure();
    console.log('DOM migration completed');
    
    // Trigger initial render
    document.dispatchEvent(new CustomEvent('modules-changed'));
    console.log('Application initialization complete');
    
  } catch (error) {
    console.error('Application initialization failed:', error);
    
    // Attempt to recover
    try {
      domMigrator.restoreOriginalStructure();
      console.warn('Restored original DOM structure after initialization failure');
    } catch (restoreError) {
      console.error('Failed to restore original structure:', restoreError);
    }
    
    // Show error to user
    showInitializationError(error);
  }
}

// Show initialization error to user
function showInitializationError(error) {
  const errorElement = document.createElement('div');
  errorElement.className = 'initialization-error';
  errorElement.innerHTML = `
    <h3>Initialization Error</h3>
    <p>The application encountered a problem during initialization:</p>
    <pre>${error.message || error}</pre>
    <button id="retry-init">Retry Initialization</button>
  `;
  
  // Add to page
  document.body.appendChild(errorElement);
  
  // Set up retry button
  document.getElementById('retry-init')?.addEventListener('click', () => {
    errorElement.remove();
    initializeApplication();
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApplication);
```

### 4. Error Handling and Recovery

```javascript
// errorHandling.js
export class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogLength = 50;
    this.recoveryStrategies = new Map();
    this.setupGlobalHandlers();
  }
  
  /**
   * Set up global error handlers
   */
  setupGlobalHandlers() {
    // Handle uncaught promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'promise',
        error: event.reason,
        message: event.reason.message,
        time: Date.now()
      });
    });
    
    // Handle global errors
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'global',
        error: event.error,
        message: event.message,
        file: event.filename,
        line: event.lineno,
        column: event.colno,
        time: Date.now()
      });
    });
    
    // Custom modules-error event
    document.addEventListener('modules-error', (event) => {
      this.handleError({
        type: 'module',
        error: event.detail.error,
        moduleId: event.detail.moduleId,
        message: event.detail.message,
        time: Date.now()
      });
    });
  }
  
  /**
   * Handle all error types
   */
  handleError(errorData) {
    // Log the error
    this.logError(errorData);
    
    // Check if we have a recovery strategy for this error
    const recoverySuccess = this.attemptRecovery(errorData);
    
    // If no recovery or recovery failed, show error to user
    if (!recoverySuccess) {
      this.notifyUser(errorData);
    }
    
    // Return false to prevent default error handling
    return false;
  }
  
  /**
   * Log error to internal log and console
   */
  logError(errorData) {
    // Add to internal log
    this.errorLog.push(errorData);
    
    // Trim log if too long
    if (this.errorLog.length > this.maxLogLength) {
      this.errorLog.shift();
    }
    
    // Log to console
    console.error('Module System Error:', errorData);
  }
  
  /**
   * Register a recovery strategy for specific error types
   */
  registerRecoveryStrategy(errorType, strategy) {
    this.recoveryStrategies.set(errorType, strategy);
  }
  
  /**
   * Attempt to recover from error
   */
  attemptRecovery(errorData) {
    // Determine error type for recovery
    const errorType = errorData.moduleId 
      ? `module:${errorData.moduleId}`
      : errorData.type;
    
    // Get recovery strategy
    const strategy = this.recoveryStrategies.get(errorType) || 
                    this.recoveryStrategies.get(errorData.type);
    
    if (!strategy) return false;
    
    try {
      // Attempt recovery
      return strategy(errorData);
    } catch (recoveryError) {
      console.error('Error during recovery attempt:', recoveryError);
      return false;
    }
  }
  
  /**
   * Notify user about error
   */
  notifyUser(errorData) {
    // Create or get error notification area
    let notificationArea = document.getElementById('error-notifications');
    if (!notificationArea) {
      notificationArea = document.createElement('div');
      notificationArea.id = 'error-notifications';
      notificationArea.className = 'error-notifications';
      document.body.appendChild(notificationArea);
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.setAttribute('role', 'alert');
    
    // Format message based on error type
    let message = 'An error occurred';
    if (errorData.moduleId) {
      message = `Error in ${errorData.moduleId} module: ${errorData.message || 'Unknown error'}`;
    } else {
      message = errorData.message || 'Unknown error';
    }
    
    notification.innerHTML = `
      <div class="error-notification__message">${message}</div>
      <button class="error-notification__close" aria-label="Dismiss">&times;</button>
    `;
    
    // Add dismiss handler
    notification.querySelector('.error-notification__close').addEventListener('click', () => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        notification.remove();
      }, 300);
    });
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.add('fade-out');
        setTimeout(() => {
          notification.remove();
        }, 300);
      }
    }, 10000);
    
    // Add to notification area
    notificationArea.appendChild(notification);
    
    // Ensure it's visible
    notification.classList.add('show');
  }
  
  /**
   * Get error log for debugging
   */
  getErrorLog() {
    return [...this.errorLog];
  }
}

// Create and export singleton
export const errorHandler = new ErrorHandler();

// Register common recovery strategies
errorHandler.registerRecoveryStrategy('module', (errorData) => {
  // Try to recover module-specific errors
  const moduleId = errorData.moduleId;
  if (!moduleId) return false;
  
  try {
    // Get module instance
    const { getModuleById } = require('./modules.js');
    const module = getModuleById(moduleId);
    if (!module) return false;
    
    // Reset module to default state
    if (module.reset && typeof module.reset === 'function') {
      module.reset();
      return true;
    }
    
    return false;
  } catch (e) {
    return false;
  }
});
```

## Testing Requirements

### Unit Tests
- Module control event handling with mocked DOM elements
- Input validation for various input types
- Cross-module interaction logic
- State synchronization between controls and state

### Integration Tests
- Full control system initialization with real modules
- State updates propagating correctly to UI
- Error handling and recovery mechanisms
- Edge cases in user input handling

### User Experience Tests
- Form validation feedback visibility and clarity
- Control interactions on various devices and browsers
- Keyboard accessibility for all controls
- Screen reader compatibility for validation messages

## Breaking Change Prevention

### Compatible DOM Selectors
The new system maintains all existing element IDs for backward compatibility:

```javascript
// Ensure legacy code continues to work
export function enableLegacyCompatibility() {
  // Create virtual elements for legacy code
  function ensureVirtualElement(id, defaultValue = '') {
    if (document.getElementById(id)) return;
    
    // Find actual element in modules
    const moduleEls = document.querySelectorAll('.module__content');
    let targetEl = null;
    
    for (const moduleEl of moduleEls) {
      const el = moduleEl.querySelector(`#${id}`);
      if (el) {
        targetEl = el;
        break;
      }
    }
    
    if (!targetEl) {
      // No actual element found, create virtual one
      const virtual = document.createElement('input');
      virtual.id = id;
      virtual.style.display = 'none';
      virtual.value = defaultValue;
      document.body.appendChild(virtual);
      return;
    }
    
    // Create proxy element that stays in sync with actual element
    const proxy = document.createElement(targetEl.tagName);
    proxy.id = `legacy-${id}`;
    proxy.style.display = 'none';
    document.body.appendChild(proxy);
    
    // Create bidirectional sync
    const observer = new MutationObserver(() => {
      if (targetEl.type === 'checkbox') {
        proxy.checked = targetEl.checked;
      } else {
        proxy.value = targetEl.value;
      }
    });
    
    observer.observe(targetEl, { attributes: true });
    
    // Ensure legacy code can find element by ID
    Object.defineProperty(document, 'getElementById', {
      value: function(id) {
        // Use original method
        const original = Document.prototype.getElementById.call(this, id);
        if (original) return original;
        
        // Check if this is a legacy ID we're tracking
        if (id === targetEl.id) {
          return targetEl;
        }
        
        return null;
      },
      writable: true,
      configurable: true
    });
  }
  
  // Ensure all critical elements have virtual proxies
  ensureVirtualElement('edo-input', '12');
  ensureVirtualElement('edo-lines', 'true');
  ensureVirtualElement('prime-colors-checkbox', 'false');
  ensureVirtualElement('odd-limit-input', '15');
  // ... etc for all critical elements
}
```

## Success Criteria

### Module Control Integration Checklist
- [ ] All module controls properly hooked up to event system
- [ ] Validation system provides clear feedback for invalid inputs
- [ ] State synchronization works bidirectionally
- [ ] Module-specific behaviors enhance user experience
- [ ] Cross-module interactions work correctly
- [ ] Error handling provides graceful recovery

### Interaction Requirements
- [ ] Controls work intuitively and provide immediate feedback
- [ ] Visual changes reflect state updates promptly
- [ ] User errors are handled gracefully with clear guidance
- [ ] Keyboard accessibility maintained for all controls
- [ ] Screen reader compatibility for all interactions
- [ ] Consistent behavior across browsers and devices

## Next Steps

After completing Phase 7, the module management system will be fully implemented. The final steps involve:

1. Comprehensive testing of the entire system
2. Optimization of performance bottlenecks
3. Documentation updates for the new system
4. Potential enhancement planning for future iterations

The next phase will focus on monitoring and optimization to ensure the new module system meets performance targets across all supported browsers and devices.
