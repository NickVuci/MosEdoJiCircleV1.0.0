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
 * Manages tooltip display, positioning, and accessibility for both mouse and touch interactions.
 * Uses CSS transitions for smooth animations with matching JS timeout durations.
 * 
 * @param {d3.Selection} selection - The D3 selection (e.g., circles, lines).
 * @param {function} getText - Callback (d) => string for tooltip HTML/text.
 */
export function attachTooltipHandlers(selection, getText) {
  // Keep track of current tooltip target for accessibility
  let currentId = 0;
  
  selection
    .on('mouseover', function(event, d) {
      // Generate a unique ID for this element if it doesn't have one
      if (!this.id) {
        this.id = `tooltip-trigger-${currentId++}`;
      }
      
      const tooltipId = 'tooltip';
      const tooltip = d3.select(`#${tooltipId}`);
      const content = getText(d);
      
      // Get container dimensions for responsive sizing calculations
      const visualizationDiv = document.getElementById('visualization');
      const containerWidth = visualizationDiv.offsetWidth;
      
      // Set CSS class based on container size for responsive sizing
      tooltip.classed('small-screen', containerWidth < 480)
             .classed('medium-screen', containerWidth >= 480 && containerWidth < 1025)
             .classed('large-screen', containerWidth >= 1025);
      
      // Set content and accessibility attributes
      tooltip
        .html(content)
        .attr('aria-hidden', 'false')
        .classed('visible', true)
        .style('display', 'block');
      
      // Connect tooltip to triggering element
      d3.select(this)
        .attr('aria-describedby', tooltipId);
      
      // Position tooltip initially with improved positioning
      const rect = visualizationDiv.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      // Calculate position to keep tooltip in view
      positionTooltip(tooltip.node(), mouseX, mouseY, visualizationDiv);
    })
    .on('mousemove', function(event) {
      const tooltip = d3.select('#tooltip');
      const visualizationDiv = document.getElementById('visualization');
      const rect = visualizationDiv.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      // Update position as mouse moves
      positionTooltip(tooltip.node(), mouseX, mouseY, visualizationDiv);
    })
    .on('mouseout', function() {
      const tooltip = d3.select('#tooltip');
      
      // Hide tooltip with animation
      tooltip
        .classed('visible', false)
        .attr('aria-hidden', 'true');
        
      // Remove connection to element
      d3.select(this).attr('aria-describedby', null);
      
      // Hide completely after animation completes
      setTimeout(() => {
        if (!tooltip.classed('visible')) {
          tooltip.style('display', 'none');
        }
      }, 100); // Match --tooltip-transition-duration from CSS
    })
    
    // Add touch support
    .on('touchstart', function(event, d) {
      // Prevent scrolling on touch
      event.preventDefault();
      
      // Toggle tooltip visibility
      const tooltip = d3.select('#tooltip');
      const isVisible = tooltip.classed('visible');
      
      if (isVisible) {
        // Hide tooltip with animation
        tooltip
          .classed('visible', false)
          .attr('aria-hidden', 'true');
          
        // Remove connection to element
        d3.select(this).attr('aria-describedby', null);
        
        // Hide completely after animation completes
        setTimeout(() => {
          if (!tooltip.classed('visible')) {
            tooltip.style('display', 'none');
          }
        }, 100); // Match --tooltip-transition-duration from CSS
      } else {
        // If wasn't visible before, show it
        // Simulate mouseover
        const mouseEvent = new MouseEvent('mouseover', {
          clientX: event.touches[0].clientX,
          clientY: event.touches[0].clientY
        });
        this.dispatchEvent(mouseEvent);
      }
    });
    
  /**
   * Helper function to position tooltip intelligently within viewport
   * @param {HTMLElement} tooltip - The tooltip DOM element
   * @param {number} x - Mouse X position
   * @param {number} y - Mouse Y position
   * @param {HTMLElement} container - The container element
   */
  function positionTooltip(tooltip, x, y, container) {
    if (!tooltip) return;
    
    // The tooltip is already visible so we can measure it directly
    const padding = 10;
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    // Adjust offset based on screen size - larger screens get larger offsets
    const baseOffset = Math.max(10, Math.min(20, containerWidth / 100));
    
    // Default position with offset based on container size
    let posX = x + baseOffset;
    let posY = y + baseOffset;
    
    // Adjust if tooltip would extend beyond right edge
    if (posX + tooltipWidth > containerWidth - padding) {
      posX = x - tooltipWidth - baseOffset;
    }
    
    // Adjust if tooltip would extend beyond bottom edge
    if (posY + tooltipHeight > containerHeight - padding) {
      posY = y - tooltipHeight - baseOffset;
    }
    
    // Ensure tooltip doesn't go off the left or top edges
    posX = Math.max(padding, posX);
    posY = Math.max(padding, posY);
    
    // Apply position
    const tooltip$ = d3.select(tooltip);
    tooltip$.style('left', `${posX}px`)
            .style('top', `${posY}px`);
  }
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

/**
 * Creates a throttled function that only invokes the provided function at most once per 
 * animation frame. Useful for smooth, performance-optimized resize or scroll handlers.
 * 
 * @param {Function} func - The function to throttle.
 * @return {Function} The throttled function.
 */
export function throttleAnimationFrame(func) {
  let scheduled = false;
  return function() {
    const context = this;
    const args = arguments;
    
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(() => {
        func.apply(context, args);
        scheduled = false;
      });
    }
  };
}

/**
 * Responsive mode detection utility functions
 * These provide a consistent way to check responsive modes across the codebase
 */

/**
 * Check if device is in portrait mode (mobile-like)
 * @returns {boolean} True if the device is in portrait mode
 */
export function isPortraitMode() {
  return window.matchMedia('(max-aspect-ratio: 1.05/1)').matches;
}

/**
 * Check if device is in standard landscape mode (tablet-like)
 * @returns {boolean} True if the device is in standard landscape mode
 */
export function isStandardLandscapeMode() {
  return window.matchMedia('(min-aspect-ratio: 1.05/1) and (max-aspect-ratio: 1.5/1)').matches;
}

/**
 * Check if device is in wide landscape mode (desktop-like)
 * @returns {boolean} True if the device is in wide landscape mode
 */
export function isWideLandscapeMode() {
  return window.matchMedia('(min-aspect-ratio: 1.5/1)').matches;
}

/**
 * Check if device is in extra wide landscape mode (large desktop)
 * @returns {boolean} True if the device is in extra wide landscape mode
 */
export function isExtraWideLandscapeMode() {
  return window.matchMedia('(min-aspect-ratio: 1.5/1) and (min-width: 1200px)').matches;
}

/**
 * Get the current aspect ratio mode
 * @returns {string} The current mode: 'portrait', 'standardLandscape', or 'wideLandscape'
 */
export function getCurrentAspectRatioMode() {
  if (isPortraitMode()) {
    return 'portrait';
  } else if (isWideLandscapeMode()) {
    return 'wideLandscape';
  } else {
    return 'standardLandscape';
  }
}

/**
 * Create a listener for aspect ratio changes
 * @param {Function} callback - Function to call when aspect ratio changes
 * @returns {Function} Function to remove the listeners
 */
export function onAspectRatioChange(callback) {
  const portraitMQ = window.matchMedia('(max-aspect-ratio: 1.05/1)');
  const wideLandscapeMQ = window.matchMedia('(min-aspect-ratio: 1.5/1)');
  
  // Current mode (initial)
  let currentMode = getCurrentAspectRatioMode();
  
  // Function to check and update mode
  const checkMode = () => {
    let newMode = getCurrentAspectRatioMode();
                   
    if (newMode !== currentMode) {
      const oldMode = currentMode;
      currentMode = newMode;
      
      // Reset sidebar scroll position when layout changes
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        // Use setTimeout to ensure layout has settled before scrolling
        setTimeout(() => { 
          sidebar.scrollTop = 0;
        }, 10);
      }
      
      // Call the original callback
      callback(newMode, oldMode);
    }
  };
  
  // Set up listeners
  portraitMQ.addEventListener('change', checkMode);
  wideLandscapeMQ.addEventListener('change', checkMode);
  
  // Fullscreen change listener
  document.addEventListener('fullscreenchange', () => {
    // Reset sidebar scroll position after fullscreen change
    setTimeout(() => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.scrollTop = 0;
    }, 100);
  });
  
  // Fallback for older browsers
  window.addEventListener('resize', throttleAnimationFrame(checkMode));
  
  // Return function to remove listeners
  return () => {
    portraitMQ.removeEventListener('change', checkMode);
    wideLandscapeMQ.removeEventListener('change', checkMode);
    document.removeEventListener('fullscreenchange', checkMode);
    window.removeEventListener('resize', checkMode);
  };
}

/**
 * Execute a callback with the current aspect ratio mode
 * @param {Object} callbacks - Object with callback functions for each mode
 * @param {Function} callbacks.portrait - Function to call in portrait mode
 * @param {Function} callbacks.standardLandscape - Function to call in standard landscape mode
 * @param {Function} callbacks.wideLandscape - Function to call in wide landscape mode
 * @param {Function} callbacks.any - Function to call in any mode (will run after mode-specific callback)
 */
export function withAspectRatioMode(callbacks) {
  const currentMode = getCurrentAspectRatioMode();
  
  // Call the mode-specific callback if it exists
  if (callbacks[currentMode] && typeof callbacks[currentMode] === 'function') {
    callbacks[currentMode]();
  }
  
  // Call the 'any' callback if it exists
  if (callbacks.any && typeof callbacks.any === 'function') {
    callbacks.any(currentMode);
  }
}
