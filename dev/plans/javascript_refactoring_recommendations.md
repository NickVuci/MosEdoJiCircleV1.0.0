# JavaScript Refactoring Recommendations

This document outlines opportunities for refactoring the JavaScript codebase of the MosEdoJiCircle project to improve maintainability, performance, and extensibility.

## Current State of JavaScript Structure

The application is reasonably well-structured with modular files:

- **main.js**: Handles initialization, DOM interactions, and visualization management
- **utils.js**: Contains shared utility functions like error handling, input validation, and tooltip management
- **edo.js**, **ji.js**, **mos.js**: Handle specific visualization components
- **sound.js**: Manages audio functionality
- **lib/d3.v7.min.js**: External D3.js library

The codebase has already made good progress toward maintainability with:
- ✅ Shared utility functions for common operations
- ✅ Modular file structure separating concerns
- ✅ Consistent input validation and error handling
- ✅ Config-driven approach for checkboxes

## Refactoring Opportunities

### 1. Implement State Management Pattern

**Current Issue:**
The application state (EDO value, JI settings, MOS parameters) is currently managed through direct DOM interactions. This makes it difficult to track application state and makes testing more challenging.

**Recommendation:**
Implement a simple state management pattern:

```javascript
// state.js
export const state = {
  ui: {
    darkMode: false,
    visualizations: {
      edo: true,
      ji: true,
      mos: false
    }
  },
  edo: {
    value: 12,
    showLines: true
  },
  ji: {
    oddLimit: 9,
    selectedPrimes: [3, 5, 7]
  },
  mos: {
    generator: 700,
    stacks: 5
  },
  dimensions: {
    width: 0,
    height: 0,
    centerX: 0,
    centerY: 0,
    radius: 0
  }
};

export const subscribers = [];

export function updateState(path, value) {
  // Update nested state path (e.g., 'edo.value', 'ui.darkMode')
  const parts = path.split('.');
  let current = state;
  
  // Navigate to the parent object
  for (let i = 0; i < parts.length - 1; i++) {
    current = current[parts[i]];
  }
  
  // Set the value
  current[parts[parts.length - 1]] = value;
  
  // Notify subscribers
  notifySubscribers(path);
}

export function subscribe(callback) {
  subscribers.push(callback);
  return () => {
    const index = subscribers.indexOf(callback);
    if (index !== -1) {
      subscribers.splice(index, 1);
    }
  };
}

function notifySubscribers(changedPath) {
  subscribers.forEach(callback => callback(state, changedPath));
}
```

### 2. Create a Rendering System with Clear Lifecycle

**Current Issue:**
The rendering logic is mixed with event handling and state management, making it hard to maintain a clear rendering lifecycle.

**Recommendation:**
Create a dedicated rendering system:

```javascript
// renderer.js
import { state, subscribe } from './state.js';
import { renderEDO } from './edo.js';
import { renderJI } from './ji.js';
import { renderMOS } from './mos.js';

export function initializeRenderer(svg) {
  // Initial render based on state
  renderAll(svg);
  
  // Subscribe to state changes
  subscribe((newState, changedPath) => {
    // Optimized rendering based on what changed
    if (changedPath.startsWith('edo')) {
      renderEDO(svg, newState.dimensions);
    } else if (changedPath.startsWith('ji')) {
      renderJI(svg, newState.dimensions);
    } else if (changedPath.startsWith('mos')) {
      renderMOS(svg, newState.dimensions);
    } else if (changedPath.startsWith('dimensions')) {
      renderAll(svg);
    } else if (changedPath === 'ui.darkMode') {
      renderAll(svg); // Theme change affects all visualizations
    }
  });
}

function renderAll(svg) {
  const { dimensions } = state;
  
  if (state.ui.visualizations.edo) {
    renderEDO(svg, dimensions);
  }
  
  if (state.ui.visualizations.ji) {
    renderJI(svg, dimensions);
  }
  
  if (state.ui.visualizations.mos) {
    renderMOS(svg, dimensions);
  }
}
```

### 3. Create a Component System for UI Elements

**Current Issue:**
UI component logic is scattered across different files and mixed with visualization logic. This makes it difficult to maintain consistency and reusability.

**Recommendation:**
Implement a simple component system:

```javascript
// components/Input.js
import { updateState } from '../state.js';
import { parseInput, showError, clearError } from '../utils.js';

export function createInput(options) {
  const {
    id,
    statePath,
    type = 'text',
    min,
    max,
    required = true,
    label = 'Value'
  } = options;
  
  const element = document.getElementById(id);
  if (!element) return;
  
  element.addEventListener('input', (event) => {
    try {
      const value = parseInput(event.target.value, {
        type: type === 'number' ? 'float' : 'int',
        min,
        max,
        required,
        selector: `#${id}`,
        label
      });
      
      updateState(statePath, value);
      clearError(`#${id}`);
    } catch (err) {
      showError(`#${id}`, err.message);
    }
  });
  
  // Initialize with state value
  return {
    update: (newValue) => {
      element.value = newValue;
    }
  };
}

// components/Checkbox.js
import { updateState } from '../state.js';

export function createCheckbox(options) {
  const { id, statePath } = options;
  const element = document.getElementById(id);
  if (!element) return;
  
  element.addEventListener('change', (event) => {
    updateState(statePath, event.target.checked);
  });
  
  return {
    update: (newValue) => {
      element.checked = newValue;
    }
  };
}
```

### 4. Standardize Event Handling

**Current Issue:**
Event handling is inconsistent across the application, with a mix of direct DOM manipulations and d3 selections.

**Recommendation:**
Create a consistent event handling system:

```javascript
// events.js
import { state, updateState } from './state.js';

export function initializeEvents() {
  // Dark mode toggle
  const darkModeButton = document.getElementById('dark-mode-button');
  darkModeButton.addEventListener('click', () => {
    const newMode = !state.ui.darkMode;
    updateState('ui.darkMode', newMode);
    document.body.classList.toggle('dark-mode', newMode);
    darkModeButton.textContent = newMode ? 'Light Mode' : 'Dark Mode';
  });
  
  // Visualization toggles
  document.getElementById('mos-toggle').addEventListener('change', (event) => {
    updateState('ui.visualizations.mos', event.target.checked);
  });
  
  // Window resize
  window.addEventListener('resize', debounce(() => {
    const container = document.getElementById('visualization');
    const width = container.clientWidth;
    const height = container.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 50;
    
    updateState('dimensions', { width, height, centerX, centerY, radius });
  }, 100));
}

// Simple debounce function
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
```

### 5. Audio System Improvements

**Current Issue:**
The sound.js file is fairly simple but could benefit from more robust audio management.

**Recommendation:**
Enhance the audio system:

```javascript
// sound.js
let audioContext;
let activeOscillators = [];

export function initAudioSystem() {
  // Create on user interaction to comply with browser policies
  document.addEventListener('click', () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, { once: true });
}

export function playInterval(cents) {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  // Resume context if suspended (browser policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  const selectedWaveform = d3.select('#sound-waveform').property('value');
  if (selectedWaveform === 'off') return;

  const frequency = 440 * Math.pow(2, cents / 1200);
  
  // Oscillator setup
  const oscillator = audioContext.createOscillator();
  oscillator.type = selectedWaveform;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  
  // Gain node for envelope
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.01);
  
  // Connect nodes
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Start and schedule stop
  oscillator.start();
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);
  oscillator.stop(audioContext.currentTime + 1.1);
  
  // Track active oscillators
  activeOscillators.push({ oscillator, gainNode });
  oscillator.onended = () => {
    const index = activeOscillators.findIndex(o => o.oscillator === oscillator);
    if (index !== -1) {
      activeOscillators.splice(index, 1);
    }
  };
}

export function stopAllSound() {
  activeOscillators.forEach(({ gainNode }) => {
    gainNode.gain.cancelScheduledValues(audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
  });
}
```

### 6. Better Code Organization for Visualization Modules

**Current Issue:**
Visualization modules (edo.js, ji.js, mos.js) contain a mix of D3 rendering code, domain logic, and event handling.

**Recommendation:**
Separate concerns within each visualization module:

```javascript
// edo/model.js - Domain logic
export function generateEdoData(edoValue, centerX, centerY, radius) {
  const data = [];
  for (let i = 0; i < edoValue; i++) {
    const angle = (i / edoValue) * 1200; // in cents
    const radians = (angle / 1200) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + radius * Math.cos(radians);
    const y = centerY + radius * Math.sin(radians);
    data.push({ index: i, angle, x, y });
  }
  return data;
}

// edo/view.js - Rendering logic
import { generateEdoData } from './model.js';
import { ensureGroup, clearGroup } from '../utils.js';

export function renderEdoView(svg, state) {
  const { value, showLines } = state.edo;
  const { centerX, centerY, radius } = state.dimensions;
  
  const edoGroup = ensureGroup(svg, 'edo-group');
  const linesGroup = ensureGroup(edoGroup, 'lines-group');
  const pointsGroup = ensureGroup(edoGroup, 'points-group');
  
  clearGroup(linesGroup);
  clearGroup(pointsGroup);
  
  const edoData = generateEdoData(value, centerX, centerY, radius);
  
  // Draw lines
  if (showLines) {
    linesGroup.selectAll('line')
      .data(edoData)
      .enter()
      .append('line')
      .attr('class', 'edo-line')
      .attr('x1', centerX)
      .attr('y1', centerY)
      .attr('x2', d => d.x)
      .attr('y2', d => d.y);
  }
  
  // Draw points
  pointsGroup.selectAll('circle')
    .data(edoData)
    .enter()
    .append('circle')
    .attr('class', 'edo-point')
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', 5);
}
```

### 7. Implement Error Boundaries and Robust Error Handling

**Current Issue:**
While there is error handling for inputs, the application lacks comprehensive error boundaries to prevent crashes and provide feedback.

**Recommendation:**
Implement error boundaries:

```javascript
// errorBoundary.js
export function wrapWithErrorBoundary(fn, fallback, errorHandler = console.error) {
  return function(...args) {
    try {
      return fn(...args);
    } catch (error) {
      errorHandler(error);
      if (typeof fallback === 'function') {
        return fallback(...args);
      }
      return fallback;
    }
  };
}

// Example usage
const safeRenderEDO = wrapWithErrorBoundary(
  renderEDO, 
  () => console.log("EDO rendering failed, showing empty visualization"),
  (error) => showGlobalError(`EDO visualization error: ${error.message}`)
);
```

## Implementation Priority

1. **State Management Pattern** (High Impact, Medium Effort)
   - Centralizes application state
   - Makes debugging easier
   - Simplifies testing

2. **Component System for UI Elements** (High Impact, Medium Effort)
   - Reduces code duplication
   - Makes UI interactions more consistent

3. **Visualization Module Refactoring** (Medium Impact, Medium Effort)
   - Better separation of concerns
   - More maintainable visualization code

4. **Rendering System** (Medium Impact, High Effort)
   - Cleaner rendering lifecycle
   - Better performance through optimized rendering

5. **Event Handling Standardization** (Low Impact, Low Effort)
   - More consistent code
   - Easier to debug

6. **Audio System Improvements** (Low Impact, Low Effort)
   - Better audio experience
   - More robust audio management

7. **Error Boundaries** (Medium Impact, Low Effort)
   - Improves application stability
   - Better user experience during errors

## Implementation Approach

For implementing these changes, a phased approach would be best:

1. **Phase 1: Add State Management**
   - Create state.js module
   - Refactor main.js to use state management
   - Update event handlers to modify state

2. **Phase 2: UI Component System**
   - Create component wrappers for inputs, checkboxes, etc.
   - Refactor UI interactions to use component system

3. **Phase 3: Visualization Refactoring**
   - Separate domain logic from rendering in visualization modules
   - Implement cleaner interfaces for visualization modules

4. **Phase 4: Complete System Integration**
   - Integrate all components with state management
   - Implement rendering system
   - Add error boundaries

This approach allows incremental improvements while maintaining a working application throughout the refactoring process.
