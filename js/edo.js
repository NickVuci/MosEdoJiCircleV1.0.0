// edo.js

export function renderEDO(svg, linesGroup, pointsGroup, centerX, centerY, radius) {
    // Get the EDO value from the input
    const edoValue = parseInt(d3.select('#edo-input').property('value'), 10);

    // Check if we should show lines
    const showLines = d3.select('#edo-lines').property('checked');

    // Function to check if a number is prime
    function isPrime(n) {
        if (n <= 1) return false;
        if (n <= 3) return true;
        if (n % 2 === 0 || n % 3 === 0) return false;
        for (let i = 5; i * i <= n; i += 6) {
            if (n % i === 0 || n % (i + 2) === 0) return false;
        }
        return true;
    }

    // Function to determine point color based on EDO value and dark mode
    function getPointFillColor(edoValue) {
        const isPrimeEDO = isPrime(edoValue);
        const darkModeEnabled = document.body.classList.contains('dark-mode');
        if (isPrimeEDO) {
            return 'gold'; // Gold color is visible in both modes
        } else {
            return darkModeEnabled ? '#ffffff' : '#000000'; // White in dark mode, black in light mode
        }
    }

    // Use the function to get the point fill color
    const pointFillColor = getPointFillColor(edoValue);

    // Generate EDO data
    const edoData = [];
    for (let i = 0; i < edoValue; i++) {
        const angle = (i / edoValue) * 1200; // in cents
        const radians = (angle / 1200) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + radius * Math.cos(radians);
        const y = centerY + radius * Math.sin(radians);
        edoData.push({ index: i, angle, x, y });
    }

    // Draw lines
    if (showLines) {
        linesGroup.selectAll('line')
            .data(edoData)
            .enter()
            .append('line')
            .attr('class', 'edo-line')
            .attr('x1', centerX)
            .attr('y1', centerY)
            .attr('x2', d => d.x)
            .attr('y2', d => d.y)
            .attr('stroke-width', 1);
    }

    // Draw points
    pointsGroup.selectAll('circle')
        .data(edoData)
        .enter()
        .append('circle')
        .attr('class', 'edo-point')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 5)
        .attr('fill', pointFillColor)
        .attr('stroke', 'black')
        .on('mouseover', function(event, d) {
            // Show tooltip
            const tooltip = d3.select('#tooltip');
            tooltip.style('display', 'block')
                .html(`${d.index}\\${edoValue} EDO<br>${d.angle.toFixed(2)}¢`);

            // Position tooltip
            const visualizationDiv = document.getElementById('visualization');
            const rect = visualizationDiv.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            tooltip.style('left', `${mouseX + 15}px`)
                .style('top', `${mouseY + 15}px`);
        })
        .on('mousemove', function(event) {
            // Update tooltip position
            const tooltip = d3.select('#tooltip');
            const visualizationDiv = document.getElementById('visualization');
            const rect = visualizationDiv.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            tooltip.style('left', `${mouseX + 15}px`)
                .style('top', `${mouseY + 15}px`);
        })
        .on('mouseout', function() {
            // Hide tooltip
            d3.select('#tooltip').style('display', 'none');
        });
}
