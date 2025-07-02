// main.js

import { renderEDO } from './edo.js';
import { renderJI } from './ji.js';
import { renderMOS, convertToCents } from './mos.js';
import { showError, clearError, ensureGroup, clearGroup } from './utils.js';

// Get the visualization container
const container = document.getElementById('visualization');
// Calculate available width and height
let width = container.clientWidth;
let height = container.clientHeight;

// SVG Canvas Setup with responsive attributes
const svg = d3.select('#visualization')
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

// Define center and radius (these will be updated in updateDimensions)
let centerX = width / 2;
let centerY = height / 2;
let radius = Math.min(width, height) / 2 - 50;

// Draw the main circle first to ensure it is at the back
svg.append('circle')
    .attr('class', 'main-circle')
    .attr('cx', centerX)
    .attr('cy', centerY)
    .attr('r', radius)
    .attr('fill', 'none');

// Create groups for organizing SVG elements using shared utilities
const jiGroup = ensureGroup(svg, 'ji-group');
const edoGroup = ensureGroup(svg, 'edo-group');
const mosGroup = ensureGroup(svg, 'mos-group');
// Inside edoGroup, create subgroups for lines and points
const linesGroup = ensureGroup(edoGroup, 'lines-group');
const pointsGroup = ensureGroup(edoGroup, 'points-group');

// Function to update all visualizations
function updateVisualizations() {
    // Always use current centerX, centerY, and radius values
    // Update EDO visualization
    clearGroup(linesGroup);
    clearGroup(pointsGroup);
    renderEDO(svg, linesGroup, pointsGroup, centerX, centerY, radius);

    // Update JI visualization
    clearGroup(jiGroup);
    renderJI(svg, centerX, centerY, radius);

    // Update MOS visualization
    clearGroup(mosGroup);
    if (d3.select('#mos-toggle').property('checked')) {
        renderMOS(svg, centerX, centerY, radius);
        // Move mosGroup to the end to bring it to the front
        mosGroup.raise();
    }
}

// Set default mode to dark mode on page load
document.body.classList.add('dark-mode');

// Set the dark mode button text to 'Light Mode'
const darkModeButton = document.getElementById('dark-mode-button');
darkModeButton.textContent = 'Light Mode';

// Event listener for dark mode toggle button
darkModeButton.addEventListener('click', function() {
    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        darkModeButton.textContent = 'Dark Mode';
    } else {
        document.body.classList.add('dark-mode');
        darkModeButton.textContent = 'Light Mode';
    }
    // Re-render visualizations to update colors
    updateVisualizations();
});

// Config-driven checkbox event binding (now includes JI prime checkboxes)

const checkboxConfigs = [
  { selector: '#always-on-checkbox', handler: updateVisualizations },
  { selector: '#prime-colors-checkbox', handler: updateVisualizations },
  { selector: '#edo-lines', handler: updateVisualizations },
  { selector: '#prime-checkboxes input[type=checkbox]', handler: updateVisualizations },
  { selector: '#mos-toggle', handler: updateVisualizations },
  // Add more checkboxes and handlers here as needed
];

checkboxConfigs.forEach(cfg => {
  const selection = d3.selectAll(cfg.selector);
  if (!selection.empty()) {
    selection.on('change', cfg.handler);
  }
});

// Function to update dimensions and redraw SVG on resize
function updateDimensions() {
  // Get container dimensions
  width = container.clientWidth;
  height = container.clientHeight;
  
  // Update SVG viewBox
  svg.attr('viewBox', `0 0 ${width} ${height}`);
  
  // Recalculate center and radius
  centerX = width / 2;
  centerY = height / 2;
  radius = Math.min(width, height) / 2 - 50;
  
  // Update the main circle position and size
  svg.select('.main-circle')
    .attr('cx', centerX)
    .attr('cy', centerY)
    .attr('r', radius);
    
  // Update all visualizations with new dimensions
  updateVisualizations();
}

// Add window resize listener with debounce for performance
let resizeTimeout;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(updateDimensions, 250);
});

// Initial rendering
updateDimensions();




// Unified input validation and correction
const inputConfigs = [
  {
    selector: '#edo-input',
    type: 'positiveInt',
    allowZero: true
  },
  {
    selector: '#mos-stacks-input',
    type: 'positiveInt',
    allowZero: true
  },
  {
    selector: '#odd-limit-input',
    type: 'oddPositiveInt',
    allowZero: false
  },
  {
    selector: '#mos-generator-input',
    type: 'mos'
  }
];

function handleInput(e, config) {
  let val = e.target.value;

  // Filter characters
  if (config.type === 'mos') {
    val = val.replace(/[^0-9.\\/\-]/g, ''); // Only allow digits, dot, minus, backslash, slash
  } else {
    val = val.replace(/[^0-9]/g, ''); // Only allow digits
  }

  // Correction logic
  if (config.type === 'positiveInt' || config.type === 'oddPositiveInt') {
    let num = parseInt(val, 10);
    if (isNaN(num)) num = config.allowZero ? 0 : 1;
    if (!config.allowZero && num === 0) num = 1;
    if (config.type === 'oddPositiveInt' && num % 2 === 0) num = num > 1 ? num - 1 : 1;
    val = num.toString();
  }

  // Set the corrected value
  e.target.value = val;

  // Trigger visualization update if needed
  if (config.selector === '#edo-input' || config.selector === '#edo-lines') {
    linesGroup.selectAll('*').remove();
    pointsGroup.selectAll('*').remove();
    renderEDO(svg, linesGroup, pointsGroup, centerX, centerY, radius);
  } else if (config.selector === '#mos-stacks-input') {
    updateVisualizations();
  } else if (config.selector === '#odd-limit-input') {
    jiGroup.selectAll('*').remove();
    renderJI(svg, centerX, centerY, radius);
  } else if (config.selector === '#mos-generator-input') {
    syncMosSliderToInput();
    clearTimeout(e.target.validationTimeout);
    e.target.validationTimeout = setTimeout(() => {
      updateVisualizations();
    }, 500);
  }
}

inputConfigs.forEach(config => {
  const input = document.querySelector(config.selector);
  if (!input) return;
  input.addEventListener('input', e => handleInput(e, config));
  input.addEventListener('blur', e => handleInput(e, config));
});

// Unified MOS generator value adjustment utility
function adjustMosGeneratorValue(deltaCents, source) {
    const textInput = d3.select('#mos-generator-input');
    const slider = d3.select('#mos-generator-slider');
    let currentCents;
    try {
        // Always parse from the text input for consistency
        currentCents = convertToCents(textInput.property('value'));
    } catch (error) {
        // If invalid, fall back to slider value
        currentCents = parseFloat(slider.property('value')) || 0;
    }
    let newCents = currentCents + deltaCents;
    newCents = Math.max(0, Math.min(1200, newCents));
    // Format to 3 decimal places, remove trailing zeros
    const formattedValue = parseFloat(newCents.toFixed(3)).toString();
    // Update both input and slider
    textInput.property('value', formattedValue);
    slider.property('value', newCents);
    updateVisualizations();
}

// Keep input and slider in sync (text to slider)
function syncMosSliderToInput() {
    const textInput = d3.select('#mos-generator-input');
    const slider = d3.select('#mos-generator-slider');
    try {
        const cents = convertToCents(textInput.property('value'));
        const clampedCents = Math.max(0, Math.min(1200, cents));
        slider.property('value', clampedCents);
        clearError('#mos-generator-input');
    } catch (error) {
        showError('#mos-generator-input', error.message);
        // If conversion fails, don't update slider
    }
}

// Keep input and slider in sync (slider to text)
function syncMosInputToSlider() {
    const slider = d3.select('#mos-generator-slider');
    const textInput = d3.select('#mos-generator-input');
    const sliderValue = parseFloat(slider.property('value'));
    const formattedValue = parseFloat(sliderValue.toFixed(3)).toString();
    textInput.property('value', formattedValue);
}

// (Removed redundant event listener for #mos-generator-input; unified handler now manages this)


// Event listener for slider changes
d3.select('#mos-generator-slider').on('input', function() {
    syncMosInputToSlider();
    updateVisualizations();
});

// Arrow key functionality for slider (special increments)
d3.select('#mos-generator-slider').on('keydown', function(event) {
    switch(event.key) {
        case 'ArrowLeft':
            adjustMosGeneratorValue(-0.1, 'slider');
            event.preventDefault();
            break;
        case 'ArrowRight':
            adjustMosGeneratorValue(0.1, 'slider');
            event.preventDefault();
            break;
        case 'ArrowUp':
            adjustMosGeneratorValue(0.01, 'slider');
            event.preventDefault();
            break;
        case 'ArrowDown':
            adjustMosGeneratorValue(-0.01, 'slider');
            event.preventDefault();
            break;
        default:
            return;
    }
});

// Arrow key functionality for text input (whole cents)
d3.select('#mos-generator-input').on('keydown', function(event) {
    if (event.key === 'ArrowUp') {
        adjustMosGeneratorValue(1, 'input');
        event.preventDefault();
    } else if (event.key === 'ArrowDown') {
        adjustMosGeneratorValue(-1, 'input');
        event.preventDefault();
    }
});

// Initial synchronization
syncMosSliderToInput();
