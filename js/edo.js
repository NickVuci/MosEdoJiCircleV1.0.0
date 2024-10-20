// edo.js

// Helper function to check if a number is prime
function isPrimeNumber(num) {
    if (num <= 1) return false;
    if (num === 2) return true;
    if (num % 2 === 0) return false;

    for (let i = 3; i <= Math.sqrt(num); i += 2) {
        if (num % i === 0) return false;
    }
    return true;
}

export function renderEDO(svg, linesGroup, pointsGroup, centerX, centerY, radius) {
    const edoValue = parseInt(d3.select('#edo-input').property('value'));
    const showLines = d3.select('#edo-lines').property('checked');

    // Check if the EDO value itself is prime
    const isEdoPrime = isPrimeNumber(edoValue);

    const pointsData = [];
    for (let n = 0; n < edoValue; n++) {
        const angle = (n / edoValue) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const centValue = (n / edoValue) * 1200;

        pointsData.push({
            n,
            x,
            y,
            centValue
        });
    }

    // Draw lines
    if (showLines) {
        linesGroup.selectAll('.edo-line')
            .data(pointsData)
            .enter()
            .append('line')
            .attr('class', 'edo-line')
            .attr('x1', centerX)
            .attr('y1', centerY)
            .attr('x2', d => d.x)
            .attr('y2', d => d.y)
            .attr('stroke', 'black');
    }

    // Draw points
    pointsGroup.selectAll('.edo-point')
        .data(pointsData)
        .enter()
        .append('circle')
        .attr('class', 'edo-point')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 5)
        .attr('fill', isEdoPrime ? 'gold' : 'grey') // Color based on EDO primality
        .attr('stroke', 'black')
        .on('mouseover', function(event, d) {
            d3.select(this)
                .attr('fill', isEdoPrime ? 'darkgoldenrod' : 'black');

            // Show tooltip
            const tooltip = d3.select('#tooltip');
            tooltip.style('display', 'block')
                .html(`${d.n}\\${edoValue}, ${d.centValue.toFixed(2)}¢`);
        })
        .on('mousemove', function(event, d) {
            // Update tooltip position as the mouse moves

            // Get the position of the #visualization div
            const visualizationDiv = document.getElementById('visualization');
            const rect = visualizationDiv.getBoundingClientRect();

            // Get the mouse position relative to the visualization div
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // Adjust the offset values as needed
            const offsetX = 15; // Adjust this value to change horizontal distance
            const offsetY = 15; // Adjust this value to change vertical distance

            const tooltip = d3.select('#tooltip');
            tooltip.style('left', `${mouseX + offsetX}px`)
                   .style('top', `${mouseY + offsetY}px`);
        })
        .on('mouseout', function(event, d) {
            d3.select(this)
                .attr('fill', isEdoPrime ? 'gold' : 'grey');

            // Hide tooltip
            d3.select('#tooltip').style('display', 'none');
        });
}
