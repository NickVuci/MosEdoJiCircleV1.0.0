// main.js

import { renderEDO } from './edo.js';
import { renderJI } from './ji.js';
import { renderMOS } from './mos.js'; // Import renderMOS

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

// Initial rendering
updateVisualizations();

// Synchronize the MOS inputs
function synchronizeMOSInputs() {
    // Get the generator value as a string
    let generatorValueStr = d3.select('#mos-generator-input').property('value');
    let generatorValue = parseFloat(generatorValueStr);

    // Check if the input is a valid number
    if (!isNaN(generatorValue)) {
        // Clamp the value between 0 and 1200
        generatorValue = Math.min(Math.max(generatorValue, 0), 1200);
        // Round to 2 decimal places
        generatorValue = Math.round(generatorValue * 100) / 100;
        // Update the input field to display the value with two decimal places
        d3.select('#mos-generator-input').property('value', generatorValue.toFixed(2));
        // Update the slider value, rounding to the nearest whole number
        d3.select('#mos-generator-slider').property('value', Math.round(generatorValue));
    } else {
        // If invalid, do not update the input or slider
        return;
    }

    // Get and clamp number of stacks
    let numStacksValue = parseInt(d3.select('#mos-stacks-input').property('value'), 10);
    numStacksValue = Math.max(numStacksValue, 1);
    d3.select('#mos-stacks-input').property('value', numStacksValue);

    // Remove and re-render the MOS visualization if enabled
    mosGroup.selectAll('*').remove();
    svg.select('#mos-text').remove();
    if (d3.select('#mos-toggle').property('checked')) {
        renderMOS(svg, centerX, centerY, radius);
        // Move mosGroup to the end to bring it to the front
        mosGroup.raise();
    }
}

// Event listeners for MOS controls
d3.select('#mos-generator-slider').on('input', function() {
    const value = parseFloat(this.value);
    d3.select('#mos-generator-input').property('value', value.toFixed(2)); // Keep two decimal places
    synchronizeMOSInputs();
});

d3.select('#mos-generator-input').on('change', function() {
    synchronizeMOSInputs();
});

d3.select('#mos-stacks-input').on('change', function() {
    synchronizeMOSInputs();
});

d3.select('#mos-toggle').on('change', function() {
    synchronizeMOSInputs();
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

// Dark Mode Toggle Button
const darkModeButton = document.getElementById('dark-mode-button');
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

// Set initial button text based on current mode
if (document.body.classList.contains('dark-mode')) {
    darkModeButton.textContent = 'Light Mode';
} else {
    darkModeButton.textContent = 'Dark Mode';
}
