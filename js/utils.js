// utils.js
// Shared utility for attaching consistent tooltip handlers to D3 selections

/**
 * Attach tooltip event handlers to a D3 selection.
 * @param {d3.Selection} selection - The D3 selection (e.g., circles, lines).
 * @param {function} getText - Callback (d) => string for tooltip HTML/text.
 */
export function attachTooltipHandlers(selection, getText) {
  selection
    .on('mouseover', function(event, d) {
      const tooltip = d3.select('#tooltip');
      tooltip.style('display', 'block')
        .html(getText(d));
      // Position tooltip initially
      const visualizationDiv = document.getElementById('visualization');
      const rect = visualizationDiv.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      tooltip.style('left', `${mouseX + 15}px`)
        .style('top', `${mouseY + 15}px`);
    })
    .on('mousemove', function(event) {
      const tooltip = d3.select('#tooltip');
      const visualizationDiv = document.getElementById('visualization');
      const rect = visualizationDiv.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      tooltip.style('left', `${mouseX + 15}px`)
        .style('top', `${mouseY + 15}px`);
    })
    .on('mouseout', function() {
      d3.select('#tooltip').style('display', 'none');
    });
}

/**
 * Render labels for a D3 selection in a DRY, configurable way.
 *
 * Example usage:
 * renderLabels({
 *   selection: mosGroup,
 *   data: scaleNotes,
 *   getText: d => `Stack ${d.stack}: ${d.cents.toFixed(2)}¢`,
 *   getX: d => centerX + (radius + 10) * Math.cos(...),
 *   getY: d => centerY + (radius + 10) * Math.sin(...),
 *   fontSize: '10px',
 *   fill: 'var(--text-color)',
 *   anchor: 'middle'
 * });
 *
 * @param {Object} config - Configuration object
 * @param {d3.Selection} config.selection - D3 selection to append labels to
 * @param {Array} config.data - Data array for labels
 * @param {function} config.getText - Function (d) => string for label text
 * @param {function} config.getX - Function (d) => number for x position
 * @param {function} config.getY - Function (d) => number for y position
 * @param {string} [config.fontSize] - Font size (default '10px')
 * @param {string} [config.fill] - Text color (default 'var(--text-color)')
 * @param {string} [config.anchor] - Text anchor (default 'middle')
 * @returns {d3.Selection} The D3 selection of created text labels
 */
export function renderLabels({ selection, data, getText, getX, getY, fontSize = '10px', fill = 'var(--text-color)', anchor = 'middle' }) {
  return selection.selectAll('text')
    .data(data)
    .enter()
    .append('text')
    .attr('x', getX)
    .attr('y', getY)
    .text(getText)
    .attr('font-size', fontSize)
    .attr('fill', fill)
    .attr('text-anchor', anchor);
}
