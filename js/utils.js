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
