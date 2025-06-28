// mos.js
import { attachTooltipHandlers, renderLabels, showError, clearError, ensureGroup, clearGroup } from './utils.js';

// Function to automatically detect format and convert to cents
export function convertToCents(inputValue) {
    const value = inputValue.trim();
    
    // Check for EDO steps format (contains backslash)
    if (value.includes('\\')) {
        const parts = value.split('\\');
        if (parts.length === 2) {
            const steps = parseFloat(parts[0]);
            const edoValue = parseFloat(parts[1]);
            if (!isNaN(steps) && !isNaN(edoValue) && edoValue > 0) {
                // Convert EDO steps to cents: (steps/edo) * 1200
                return (steps / edoValue) * 1200;
            }
        }
        throw new Error('Invalid EDO format. Use n\\edo (e.g., 7\\12)');
    }
    
    // Check for JI ratio format (contains forward slash)
    if (value.includes('/')) {
        const parts = value.split('/');
        if (parts.length === 2) {
            const numerator = parseFloat(parts[0]);
            const denominator = parseFloat(parts[1]);
            if (!isNaN(numerator) && !isNaN(denominator) && numerator > 0 && denominator > 0) {
                // Convert ratio to cents: 1200 * log2(n/d)
                return 1200 * Math.log2(numerator / denominator);
            }
        }
        throw new Error('Invalid ratio format. Use n/d (e.g., 3/2)');
    }
    
    // Otherwise, treat as cents (plain number)
    const cents = parseFloat(value);
    if (!isNaN(cents)) {
        return cents;
    }
    
    throw new Error('Invalid input. Use cents (e.g., 701.955), ratio (e.g., 3/2), or EDO steps (e.g., 7\\12)');
}

// Function to detect and return format info
function detectInputFormat(inputValue) {
    const value = inputValue.trim();
    
    if (value.includes('\\')) {
        return { format: 'EDO steps', example: 'e.g., 7\\12' };
    } else if (value.includes('/')) {
        return { format: 'JI ratio', example: 'e.g., 3/2' };
    } else {
        return { format: 'Cents', example: 'e.g., 701.955' };
    }
}

export function renderMOS(svg, centerX, centerY, radius) {

    // Get the generator input value
    const generatorInput = d3.select('#mos-generator-input').property('value');
    let generatorCents;
    try {
        generatorCents = convertToCents(generatorInput);
    } catch (error) {
        console.error('Generator input error:', error.message);
        showError('#mos-generator-input', error.message);
        generatorCents = 701.955;
        return;
    }
    clearError('#mos-generator-input');
    const numStacks = parseInt(d3.select('#mos-stacks-input').property('value'), 10);
    // Select and clear the MOS group using shared utilities
    let mosGroup = ensureGroup(svg, 'mos-group');
    clearGroup(mosGroup);

    // Initialize array to store notes with stack index and cents
    let scaleNotes = [];

    // Include 0 cents as Stack 0
    scaleNotes.push({ stack: 0, cents: 0 });

    // Calculate all scale degrees
    let cumulativeCents = 0;
    for (let i = 1; i <= numStacks; i++) {
        cumulativeCents += generatorCents;
        // Normalize cumulativeCents to 0-1200 cents
        const normalizedCents = ((cumulativeCents % 1200) + 1200) % 1200;
        scaleNotes.push({ stack: i, cents: normalizedCents });
    }

    // For interval calculations, extract cents values and sort them
    let scaleCentsSorted = scaleNotes.map(note => note.cents).sort((a, b) => a - b);

    // Compute the intervals between adjacent notes
    let intervals = [];
    for (let i = 0; i < scaleCentsSorted.length; i++) {
        const currentCents = scaleCentsSorted[i];
        const nextCents = scaleCentsSorted[(i + 1) % scaleCentsSorted.length]; // wrap around
        let interval = nextCents - currentCents;
        if (interval < 0) {
            interval += 1200;
        }
        intervals.push(interval);
    }

    // Find unique interval sizes
    const uniqueIntervals = [...new Set(intervals.map(interval => interval.toFixed(5)))];

    let isMOS = uniqueIntervals.length === 2;

    // MOS detection and labeling
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
            const mosTextContent = `${largeStepCount}L ${smallStepCount}s`;
            const mosText = mosGroup.select('#mos-text');
            if (mosText.empty()) {
                mosGroup.append('text')
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
            mosGroup.select('#mos-text').remove();
            // Also, set isMOS to false to prevent lines from highlighting
            isMOS = false;
        }
    } else {
        // Remove MOS text if it exists
        mosGroup.select('#mos-text').remove();
    }

    // Handle labels
    const alwaysOn = d3.select('#always-on-checkbox').property('checked');

    // Determine line style
    let lineStrokeWidth = isMOS ? 4 : 3; // Increase width when it's MOS
    let lineColor = isMOS ? 'var(--mos-highlight-color)' : 'var(--mos-line-color)';
    let lineOpacity = isMOS ? 1 : 0.7;

    // Now, draw the lines and dots using D3 data binding
    // Draw lines
    mosGroup.selectAll('line')
        .data(scaleNotes)
        .enter()
        .append('line')
        .attr('class', 'mos-generator-line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', d => {
            const angle = (d.cents / 1200) * 2 * Math.PI - Math.PI / 2;
            return centerX + radius * Math.cos(angle);
        })
        .attr('y2', d => {
            const angle = (d.cents / 1200) * 2 * Math.PI - Math.PI / 2;
            return centerY + radius * Math.sin(angle);
        })
        .attr('stroke', lineColor)
        .attr('stroke-width', lineStrokeWidth)
        .attr('stroke-opacity', lineOpacity);

    // Draw circles
    mosGroup.selectAll('circle')
        .data(scaleNotes)
        .enter()
        .append('circle')
        .attr('cx', d => {
            const angle = (d.cents / 1200) * 2 * Math.PI - Math.PI / 2;
            return centerX + radius * Math.cos(angle);
        })
        .attr('cy', d => {
            const angle = (d.cents / 1200) * 2 * Math.PI - Math.PI / 2;
            return centerY + radius * Math.sin(angle);
        })
        .attr('r', 5)
        .attr('fill', lineColor)
        .attr('stroke', 'black');

    if (alwaysOn) {
        // Display labels for all notes using shared utility
        renderLabels({
            selection: mosGroup,
            data: scaleNotes,
            getText: d => `Stack ${d.stack}: ${d.cents.toFixed(2)}¢`,
            getX: d => {
                const angle = (d.cents / 1200) * 2 * Math.PI - Math.PI / 2;
                return centerX + (radius + 10) * Math.cos(angle);
            },
            getY: d => {
                const angle = (d.cents / 1200) * 2 * Math.PI - Math.PI / 2;
                return centerY + (radius + 10) * Math.sin(angle);
            },
            fontSize: '10px',
            fill: 'var(--text-color)',
            anchor: 'middle'
        });
    } else {
        // Attach tooltip event handlers to circles using shared utility
        attachTooltipHandlers(
            mosGroup.selectAll('circle'),
            d => `Stack ${d.stack}: ${d.cents.toFixed(2)}¢`
        );
    }
}
