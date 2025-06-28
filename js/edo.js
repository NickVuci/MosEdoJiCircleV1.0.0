// edo.js
import { renderLabels, ensureGroup, clearGroup } from './utils.js';

export function renderEDO(svg, linesGroup, pointsGroup, centerX, centerY, radius) {
    // Clear existing elements using shared utility
    clearGroup(linesGroup);
    clearGroup(pointsGroup);

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
        const darkModeEnabled = document.body.classList.contains('dark-mode');
        const primeColorsEnabled = d3.select('#prime-colors-checkbox').property('checked');
        
        if (primeColorsEnabled) {
            const isPrimeEDO = isPrime(edoValue);
            if (isPrimeEDO) {
                return 'gold'; // Gold color is visible in both modes
            } else {
                return darkModeEnabled ? '#ffffff' : '#000000'; // White in dark mode, black in light mode
            }
        } else {
            // Always use the non-prime colors when checkbox is unchecked
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
    const points = pointsGroup.selectAll('circle')
        .data(edoData)
        .enter()
        .append('circle')
        .attr('class', 'edo-point')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 5)
        .attr('fill', pointFillColor)
        .attr('stroke', 'black');

    // Handle labels
    const alwaysOn = d3.select('#always-on-checkbox').property('checked');

    if (alwaysOn) {
        // Display labels for all points using shared utility
        renderLabels({
            selection: pointsGroup,
            data: edoData,
            getText: d => `${d.index} \\ ${edoValue} EDO\n${d.angle.toFixed(2)}¢`,
            getX: d => d.x + 8,
            getY: d => d.y - 8,
            fontSize: '10px',
            fill: 'var(--text-color)'
        });
    } else {
        // Attach tooltip event handlers using shared utility
        // Lazy import to avoid circular dependency if needed
        import('./utils.js').then(({ attachTooltipHandlers }) => {
            attachTooltipHandlers(points, d => `${d.index} \\ ${edoValue} EDO<br>${d.angle.toFixed(2)}¢`);
        });
    }
}
