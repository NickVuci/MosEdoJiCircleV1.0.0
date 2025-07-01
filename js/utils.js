/**
 * Show an error on a given input or UI element.
 * @param {string} selector - CSS selector for the input or element.
 * @param {string} message - Error message to display (as tooltip/title).
 */
export function showError(selector, message) {
  const el = d3.select(selector);
  el.classed('error', true)
    .attr('title', message)
    .attr('aria-invalid', 'true');
}

/**
 * Clear the error from a given input or UI element.
 * @param {string} selector - CSS selector for the input or element.
 */
export function clearError(selector) {
  const el = d3.select(selector);
  el.classed('error', false)
    .attr('title', null)
    .attr('aria-invalid', null);
}

/**
 * Show a global error message in a dedicated error area.
 * @param {string} message - Error message to display.
 */
export function showGlobalError(message) {
  let errorArea = document.getElementById('global-error-area');
  if (!errorArea) {
    errorArea = document.createElement('div');
    errorArea.id = 'global-error-area';
    errorArea.setAttribute('role', 'alert');
    errorArea.style.color = 'var(--error-color, red)';
    errorArea.style.margin = '1em 0';
    errorArea.style.fontWeight = 'bold';
    document.body.prepend(errorArea);
  }
  errorArea.textContent = message;
  errorArea.style.display = 'block';
}

/**
 * Clear the global error message area.
 */
export function clearGlobalError() {
  const errorArea = document.getElementById('global-error-area');
  if (errorArea) {
    errorArea.textContent = '';
    errorArea.style.display = 'none';
  }
}
/**
 * Robust input parsing and validation utility.
 * @param {string} value - The input value to parse.
 * @param {Object} options - Parsing options.
 * @param {'int'|'float'} options.type - Type to parse ('int' or 'float').
 * @param {boolean} [options.required=true] - Whether the value is required.
 * @param {number} [options.min] - Minimum allowed value (inclusive).
 * @param {number} [options.max] - Maximum allowed value (inclusive).
 * @param {string} [options.selector] - CSS selector for error feedback (optional).
 * @param {string} [options.label] - Human-readable label for error messages.
 * @returns {number|null} Parsed value, or null if invalid and not required.
 * @throws {Error} Throws with a user-friendly message if invalid.
 */
export function parseInput(value, {
  type,
  required = true,
  min,
  max,
  selector,
  label = 'Value',
} = {}) {
  const trimmed = (value ?? '').toString().trim();
  if (required && trimmed === '') {
    const msg = `${label} is required.`;
    if (selector) showError(selector, msg);
    throw new Error(msg);
  }
  let parsed;
  if (type === 'int') {
    parsed = parseInt(trimmed, 10);
  } else if (type === 'float') {
    parsed = parseFloat(trimmed);
  } else {
    throw new Error('Invalid parseInput type. Use "int" or "float".');
  }
  if (isNaN(parsed)) {
    const msg = `${label} must be a valid ${type === 'int' ? 'integer' : 'number'}.`;
    if (selector) showError(selector, msg);
    throw new Error(msg);
  }
  if (typeof min === 'number' && parsed < min) {
    const msg = `${label} must be at least ${min}.`;
    if (selector) showError(selector, msg);
    throw new Error(msg);
  }
  if (typeof max === 'number' && parsed > max) {
    const msg = `${label} must be at most ${max}.`;
    if (selector) showError(selector, msg);
    throw new Error(msg);
  }
  if (selector) clearError(selector);
  return parsed;
}
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

/**
 * Clamp a value between min and max.
 * @param {number} value - The value to clamp.
 * @param {number} min - Minimum allowed value.
 * @param {number} max - Maximum allowed value.
 * @returns {number} The clamped value.
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Format a value as cents with a specified number of decimals.
 * @param {number} value - The value to format.
 * @param {number} [decimals=2] - Number of decimal places.
 * @returns {string} The formatted cents string (e.g., '701.96¢').
 */
export function formatCents(value, decimals = 2) {
  return `${Number(value).toFixed(decimals)}¢`;
}

/**
 * Ensure a group with the given id exists in the SVG. Returns the D3 selection for the group.
 * @param {d3.Selection} svg - The D3 SVG selection.
 * @param {string} id - The id for the group.
 * @returns {d3.Selection} The D3 selection for the group.
 */
export function ensureGroup(svg, id) {
  let group = svg.select(`#${id}`);
  if (group.empty()) {
    group = svg.append('g').attr('id', id);
  }
  return group;
}

/**
 * Remove all children from a D3 group selection.
 * @param {d3.Selection} group - The D3 group selection.
 */
export function clearGroup(group) {
  group.selectAll('*').remove();
}
