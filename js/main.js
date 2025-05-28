// main.js

import { renderEDO } from './edo.js';
import { renderJI } from './ji.js';
import { renderMOS, convertToCents } from './mos.js'; // Import renderMOS and convertToCents

// SVG Canvas Setup
const width = 600;
const height = 600;
const svg = d3.select('#visualization')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

// Define center and radius
const centerX = width / 2;
const centerY = height / 2;
const radius = Math.min(width, height) / 2 - 50;

// Draw the main circle first to ensure it is at the back
svg.append('circle')
    .attr('class', 'main-circle')
    .attr('cx', centerX)
    .attr('cy', centerY)
    .attr('r', radius)
    .attr('fill', 'none');

// Create groups for organizing SVG elements
const jiGroup = svg.append('g').attr('id', 'ji-group'); // JI lines group
const edoGroup = svg.append('g').attr('id', 'edo-group'); // EDO group
const mosGroup = svg.append('g').attr('id', 'mos-group'); // MOS group

// Inside edoGroup, create subgroups for lines and points
const linesGroup = edoGroup.append('g').attr('id', 'lines-group');
const pointsGroup = edoGroup.append('g').attr('id', 'points-group');

// Function to update all visualizations
function updateVisualizations() {
    // Update EDO visualization
    linesGroup.selectAll('*').remove();
    pointsGroup.selectAll('*').remove();
    renderEDO(svg, linesGroup, pointsGroup, centerX, centerY, radius);

    // Update JI visualization
    jiGroup.selectAll('*').remove();
    renderJI(svg, centerX, centerY, radius);

    // Update MOS visualization
    mosGroup.selectAll('*').remove();
    svg.select('#mos-text').remove();
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

// Event listener for "Labels Always On" checkbox
d3.select('#always-on-checkbox').on('change', function() {
    updateVisualizations();
});

// Initial rendering
updateVisualizations();

// Synchronize the MOS inputs
function synchronizeMOSInputs() {
    // Get and clamp number of stacks only - don't touch the generator input
    let numStacksValue = parseInt(d3.select('#mos-stacks-input').property('value'), 10);
    numStacksValue = Math.max(numStacksValue, 1);
    d3.select('#mos-stacks-input').property('value', numStacksValue);

    // Re-render the MOS visualization
    updateVisualizations();
}

// Event listeners for MOS controls
d3.select('#mos-stacks-input').on('change', function() {
    synchronizeMOSInputs();
});

d3.select('#mos-toggle').on('change', function() {
    updateVisualizations(); // Just update visualizations, don't synchronize inputs
});

// Event listeners for EDO controls
function updateEDO() {
    linesGroup.selectAll('*').remove();
    pointsGroup.selectAll('*').remove();
    renderEDO(svg, linesGroup, pointsGroup, centerX, centerY, radius);
}
d3.select('#edo-input').on('input', updateEDO);
d3.select('#edo-lines').on('change', updateEDO);

// Event listeners for JI controls
function updateJI() {
    // Ensure odd-limit-input is an odd positive integer
    let oddLimitValue = parseInt(d3.select('#odd-limit-input').property('value'), 10);
    if (isNaN(oddLimitValue) || oddLimitValue < 1) {
        oddLimitValue = 1;
    } else if (oddLimitValue % 2 === 0) {
        // If even, adjust to the nearest lower odd number
        oddLimitValue -= 1;
    }
    d3.select('#odd-limit-input').property('value', oddLimitValue);

    jiGroup.selectAll('*').remove();
    renderJI(svg, centerX, centerY, radius);
}
d3.selectAll('#prime-checkboxes input[type="checkbox"]').on('change', updateJI);
d3.select('#odd-limit-input').on('change', updateJI);

// Add this where you set up other event listeners
d3.select('#prime-colors-checkbox').on('change', function() {
    updateVisualizations();
});

// Function to update slider from text input
function updateSliderFromText() {
    const textInput = d3.select('#mos-generator-input');
    const slider = d3.select('#mos-generator-slider');
    const inputValue = textInput.property('value');
    
    try {
        // Import convertToCents function or redefine it here
        const cents = convertToCents(inputValue);
        // Clamp value to slider range
        const clampedCents = Math.max(0, Math.min(1200, cents));
        slider.property('value', clampedCents);
    } catch (error) {
        // If conversion fails, don't update slider
        console.log('Invalid input for slider conversion:', error.message);
    }
}

// Function to update text input from slider
function updateTextFromSlider() {
    const slider = d3.select('#mos-generator-slider');
    const textInput = d3.select('#mos-generator-input');
    const sliderValue = parseFloat(slider.property('value'));
    
    // Format to 3 decimal places and remove trailing zeros
    const formattedValue = parseFloat(sliderValue.toFixed(3)).toString();
    textInput.property('value', formattedValue);
}

// Event listener for text input changes
d3.select('#mos-generator-input').on('input', function() {
    updateSliderFromText();
    
    clearTimeout(this.validationTimeout);
    this.validationTimeout = setTimeout(() => {
        updateVisualizations();
    }, 500);
});

// Event listener for slider changes
d3.select('#mos-generator-slider').on('input', function() {
    updateTextFromSlider();
    updateVisualizations();
});

// Arrow key functionality for slider
d3.select('#mos-generator-slider').on('keydown', function(event) {
    const slider = d3.select(this);
    let currentValue = parseFloat(slider.property('value'));
    let newValue = currentValue;
    
    switch(event.key) {
        case 'ArrowLeft':
            newValue = Math.max(0, currentValue - 0.1);
            event.preventDefault();
            break;
        case 'ArrowRight':
            newValue = Math.min(1200, currentValue + 0.1);
            event.preventDefault();
            break;
        case 'ArrowUp':
            newValue = Math.min(1200, currentValue + 0.01);
            event.preventDefault();
            break;
        case 'ArrowDown':
            newValue = Math.max(0, currentValue - 0.01);
            event.preventDefault();
            break;
        default:
            return; // Don't handle other keys
    }
    
    if (newValue !== currentValue) {
        slider.property('value', newValue);
        updateTextFromSlider();
        updateVisualizations();
    }
});

// Arrow key functionality for text input
d3.select('#mos-generator-input').on('keydown', function(event) {
    const textInput = d3.select(this);
    const currentValue = textInput.property('value');
    
    // Only handle arrow keys when input contains pure cents (numbers only)
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        try {
            const cents = convertToCents(currentValue);
            let newCents;
            
            if (event.key === 'ArrowUp') {
                newCents = cents + 1;
                event.preventDefault();
            } else if (event.key === 'ArrowDown') {
                newCents = Math.max(0, cents - 1); // Don't go below 0
                event.preventDefault();
            }
            
            // Format to remove unnecessary decimal places
            const formattedValue = parseFloat(newCents.toFixed(3)).toString();
            textInput.property('value', formattedValue);
            
            // Update slider and visualization
            updateSliderFromText();
            updateVisualizations();
            
        } catch (error) {
            // If input is not a valid format, don't handle arrow keys
            console.log('Arrow keys not applicable for current input format:', error.message);
        }
    }
});

// Initial synchronization
updateSliderFromText();
