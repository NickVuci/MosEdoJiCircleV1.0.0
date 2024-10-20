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

const centerX = width / 2;
const centerY = height / 2;
const radius = Math.min(width, height) / 2 - 50;

// Draw the main circle first to ensure it is at the back
svg.append('circle')
    .attr('cx', centerX)
    .attr('cy', centerY)
    .attr('r', radius)
    .attr('fill', 'none')
    .attr('stroke', 'black');

// Create groups for organizing SVG elements
const jiGroup = svg.append('g').attr('id', 'ji-group'); // JI lines group (behind other elements)
const mosGroup = svg.append('g').attr('id', 'mos-group'); // MOS group
const edoGroup = svg.append('g').attr('id', 'edo-group'); // EDO group

// Inside edoGroup, create subgroups for lines and points
const linesGroup = edoGroup.append('g').attr('id', 'lines-group');
const pointsGroup = edoGroup.append('g').attr('id', 'points-group');

// Initial rendering of JI intervals (behind other elements)
renderJI(svg, centerX, centerY, radius);

// Initial rendering of MOS generator
renderMOS(svg, centerX, centerY, radius);

// Initial rendering of EDO points and lines
renderEDO(svg, linesGroup, pointsGroup, centerX, centerY, radius);

// Synchronize the MOS inputs
function synchronizeMOSInputs() {
    // Get and clamp generator value
    let generatorValue = parseFloat(d3.select('#mos-generator-input').property('value'));
    generatorValue = Math.min(Math.max(generatorValue, 0), 1200);
    d3.select('#mos-generator-input').property('value', generatorValue);

    // Update the slider value, rounding to the nearest whole number for the slider
    d3.select('#mos-generator-slider').property('value', Math.round(generatorValue));

    // Get and clamp number of stacks
    let numStacksValue = parseInt(d3.select('#mos-stacks-input').property('value'), 10);
    numStacksValue = Math.max(numStacksValue, 1);
    d3.select('#mos-stacks-input').property('value', numStacksValue);

    // Remove and re-render the MOS visualization
    svg.select('#mos-group').selectAll('*').remove();
    renderMOS(svg, centerX, centerY, radius);
}

// Event listeners for MOS controls
d3.select('#mos-generator-slider').on('input', function() {
    const value = parseFloat(this.value);
    d3.select('#mos-generator-input').property('value', value.toFixed(2)); // Keep two decimal places
    synchronizeMOSInputs();
});

d3.select('#mos-generator-input').on('input', function() {
    const value = parseFloat(this.value);
    d3.select('#mos-generator-slider').property('value', Math.round(value)); // Slider uses whole numbers
    synchronizeMOSInputs();
});

d3.select('#mos-stacks-input').on('input', function() {
    synchronizeMOSInputs();
});

// Event listeners for EDO controls
d3.select('#edo-input').on('input', () => {
    linesGroup.selectAll('*').remove();
    pointsGroup.selectAll('*').remove();
    renderEDO(svg, linesGroup, pointsGroup, centerX, centerY, radius);
});

d3.select('#edo-lines').on('change', () => {
    linesGroup.selectAll('*').remove();
    pointsGroup.selectAll('*').remove();
    renderEDO(svg, linesGroup, pointsGroup, centerX, centerY, radius);
});

// Event listeners for JI controls
d3.selectAll('#prime-checkboxes input[type="checkbox"]').on('change', () => {
    svg.select('#ji-group').selectAll('*').remove();
    renderJI(svg, centerX, centerY, radius);
});

d3.select('#odd-limit-input').on('input', () => {
    svg.select('#ji-group').selectAll('*').remove();
    renderJI(svg, centerX, centerY, radius);
});
