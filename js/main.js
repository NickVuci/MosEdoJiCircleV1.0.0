// main.js

import { renderEDO } from './edo.js';
import { renderJI } from './ji.js';

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

// Create groups for lines and points after the circle
const linesGroup = svg.append('g').attr('id', 'lines-group');
const pointsGroup = svg.append('g').attr('id', 'points-group');

// Initial rendering of EDO points and lines
renderEDO(svg, linesGroup, pointsGroup, centerX, centerY, radius);

// Initial rendering of JI intervals
renderJI(svg, centerX, centerY, radius);

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
    svg.select('#ji-group').remove();
    renderJI(svg, centerX, centerY, radius);
});

d3.select('#odd-limit-input').on('input', () => {
    svg.select('#ji-group').remove();
    renderJI(svg, centerX, centerY, radius);
});
