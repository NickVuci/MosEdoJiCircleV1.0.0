// mos.js

export function renderMOS(svg, centerX, centerY, radius) {
    // Get the generator value from the input (in cents)
    const generatorCents = parseFloat(d3.select('#mos-generator-input').property('value'));

    // Get the number of stacks from the input
    const numStacks = parseInt(d3.select('#mos-stacks-input').property('value'), 10);

    // Select the MOS group
    let mosGroup = svg.select('#mos-group');
    mosGroup.selectAll('*').remove();

    // Initialize array to store cent values of the notes
    let scaleCents = [];

    // Include 0 cents in scaleCents
    scaleCents.push(0);

    // Initialize cumulative generator
    let cumulativeCents = 0;

    // Calculate all scale degrees first
    for (let i = 1; i <= numStacks; i++) {
        cumulativeCents += generatorCents;
        // Normalize cumulativeCents to 0-1200 cents
        const normalizedCents = ((cumulativeCents % 1200) + 1200) % 1200;
        scaleCents.push(normalizedCents);
    }

    // Now, check if the intervals between the notes have exactly two distinct sizes
    // First, sort the scaleCents array
    scaleCents.sort((a, b) => a - b);

    // Compute the intervals between adjacent notes
    let intervals = [];
    for (let i = 0; i < scaleCents.length; i++) {
        const currentCents = scaleCents[i];
        const nextCents = scaleCents[(i + 1) % scaleCents.length]; // wrap around to the first note
        let interval = nextCents - currentCents;
        if (interval < 0) {
            interval += 1200; // adjust for wrap-around
        }
        intervals.push(interval);
    }

    // Find the unique interval sizes
    const uniqueIntervals = [...new Set(intervals.map(interval => interval.toFixed(5)))]; // use toFixed to handle floating point inaccuracies

    let isMOS = uniqueIntervals.length === 2;

    // If it's an MOS, determine the counts
    let mosTextContent = '';
    if (isMOS) {
        // Determine which interval is the large step and which is the small step
        const intervalValues = uniqueIntervals.map(parseFloat).sort((a, b) => a - b);
        const smallStepSize = intervalValues[0];
        const largeStepSize = intervalValues[1];

        // Count how many times each interval occurs
        let smallStepCount = 0;
        let largeStepCount = 0;

        intervals.forEach(interval => {
            const intervalValue = parseFloat(interval.toFixed(5));
            if (Math.abs(intervalValue - smallStepSize) < 1e-4) {
                smallStepCount++;
            } else if (Math.abs(intervalValue - largeStepSize) < 1e-4) {
                largeStepCount++;
            }
        });

        // Function to calculate GCD of two numbers
        function gcd(a, b) {
            if (!b) {
                return a;
            }
            return gcd(b, a % b);
        }

        // Calculate GCD of largeStepCount and smallStepCount
        const stepsGCD = gcd(largeStepCount, smallStepCount);

        // Only display the label if the counts are coprime (GCD is 1)
        if (stepsGCD === 1 && smallStepCount > 0) {
            // Display "xL y s" above the circle (lowercase 's')
            mosTextContent = `${largeStepCount}L ${smallStepCount}s`;
            const mosText = svg.select('#mos-text');
            if (mosText.empty()) {
                svg.append('text')
                    .attr('id', 'mos-text')
                    .attr('x', centerX)
                    .attr('y', centerY - radius - 20)
                    .attr('text-anchor', 'middle')
                    .attr('fill', 'var(--text-color)')
                    .attr('font-size', '24px')
                    .text(mosTextContent);
            } else {
                mosText.text(mosTextContent);
            }
        } else {
            // Remove MOS text if it exists
            svg.select('#mos-text').remove();
            // Also, set isMOS to false to prevent lines from highlighting
            isMOS = false;
        }
    } else {
        // Remove MOS text if it exists
        svg.select('#mos-text').remove();
    }

    // Handle labels
    const alwaysOn = d3.select('#always-on-checkbox').property('checked');

    // Now, draw the lines and dots
    for (let i = 0; i < scaleCents.length; i++) {
        const normalizedCents = scaleCents[i];
        const angle = (normalizedCents / 1200) * 2 * Math.PI - Math.PI / 2;

        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        // Determine line style
        let lineStrokeWidth = isMOS ? 4 : 3; // Increase width when it's MOS
        let lineColor = isMOS ? 'var(--mos-highlight-color)' : 'var(--mos-line-color)';
        let lineOpacity = isMOS ? 1 : 0.7;

        // Draw the generator line
        const line = mosGroup.append('line')
            .attr('class', 'mos-generator-line')
            .attr('x1', centerX)
            .attr('y1', centerY)
            .attr('x2', x)
            .attr('y2', y)
            .attr('stroke', lineColor)
            .attr('stroke-width', lineStrokeWidth)
            .attr('stroke-opacity', lineOpacity);

        // Add a circle at the end of the line
        const circle = mosGroup.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 5)
            .attr('fill', lineColor)
            .attr('stroke', 'black');

        if (alwaysOn) {
            // Display labels
            mosGroup.append('text')
                .attr('x', x + 8)
                .attr('y', y - 8)
                .text(`Stack ${i}\n${normalizedCents.toFixed(2)}¢`)
                .attr('font-size', '10px')
                .attr('fill', 'var(--text-color)');
        } else {
            // Attach tooltip event handlers to the circle
            circle.on('mouseover', function(event) {
                // Show tooltip
                const tooltip = d3.select('#tooltip');
                tooltip.style('display', 'block')
                    .html(`Stack ${i}: ${normalizedCents.toFixed(2)}¢`);

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
    }
}