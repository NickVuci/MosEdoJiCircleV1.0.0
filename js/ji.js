// ji.js
import { attachTooltipHandlers, renderLabels, ensureGroup, clearGroup, parseInput, showError, clearError } from './utils.js';

export function renderJI(svg, centerX, centerY, radius) {
    // Ensure and clear the JI group using shared utilities
    const jiGroup = ensureGroup(svg, 'ji-group');
    clearGroup(jiGroup);

    // Get selected primes
    const selectedPrimes = d3.selectAll('#prime-checkboxes input[type="checkbox"]')
        .nodes()
        .filter(node => node.checked)
        .map(node => {
            try {
                return parseInput(node.value, {
                    type: 'int',
                    min: 2,
                    selector: null, // No selector for checkboxes
                    label: 'Prime'
                });
            } catch (err) {
                // Ignore invalid primes (should not happen)
                return null;
            }
        })
        .filter(v => v !== null);

    // Get the odd limit using robust validation
    let oddLimit;
    try {
        oddLimit = parseInput(
            d3.select('#odd-limit-input').property('value'),
            {
                type: 'int',
                min: 1,
                selector: '#odd-limit-input',
                label: 'Odd Limit'
            }
        );
    } catch (err) {
        showError('#odd-limit-input', err.message);
        return;
    }

    // Check if dark mode is enabled
    const darkModeEnabled = document.body.classList.contains('dark-mode');

    // Define colors for primes
    const primeColors = {
        3: darkModeEnabled ? '#FF9999' : '#FF0000',   // Lighter red in dark mode
        5: darkModeEnabled ? '#9999FF' : '#0000FF',   // Lighter blue
        7: darkModeEnabled ? '#FFD580' : '#FFA500',   // Lighter orange
        11: darkModeEnabled ? '#FF99FF' : '#800080',  // Lighter purple
        13: darkModeEnabled ? '#80FF80' : '#008000',  // Lighter green
        17: darkModeEnabled ? '#80FFFF' : '#00FFFF',  // Lighter cyan
        19: darkModeEnabled ? '#FFFF80' : '#FFD700'   // Lighter gold
    };

    // Helper function to calculate GCD
    function gcd(a, b) {
        if (!b) return a;
        return gcd(b, a % b);
    }

    // Helper function to get prime factors
    function getPrimeFactors(n) {
        const factors = [];
        let divisor = 2;
        while (n >= 2) {
            if (n % divisor === 0) {
                factors.push(divisor);
                n = n / divisor;
            } else {
                divisor++;
            }
        }
        // Return unique factors
        return [...new Set(factors)];
    }

    // Function to adjust fraction to within the octave and simplify
    function reduceToOctave(numerator, denominator) {
        // Adjust the fraction to be within [1, 2)
        while (numerator / denominator >= 2) {
            denominator *= 2;
        }
        while (numerator / denominator < 1) {
            numerator *= 2;
        }
        // Simplify fraction
        const gcdValue = gcd(numerator, denominator);
        numerator = numerator / gcdValue;
        denominator = denominator / gcdValue;
        return { numerator, denominator };
    }

    // Generate JI intervals
    let intervals = [];

    for (let num = 1; num <= oddLimit; num += 2) {
        for (let den = 1; den <= oddLimit; den += 2) {
            if (num === den) continue;

            const primeFactors = getPrimeFactors(num).concat(getPrimeFactors(den));

            // Check if all prime factors are in selectedPrimes
            const allPrimesSelected = primeFactors.every(p => selectedPrimes.includes(p));

            if (allPrimesSelected) {
                // Reduce the fraction to within the octave and simplify
                let { numerator, denominator } = reduceToOctave(num, den);

                const fractionValue = numerator / denominator;
                const cents = 1200 * Math.log2(fractionValue);

                intervals.push({
                    cents: cents,
                    primes: primeFactors,
                    numerator: numerator,
                    denominator: denominator,
                    fraction: `${numerator}/${denominator}`
                });
            }
        }
    }

    // Remove duplicates based on cents value
    intervals = intervals.filter((interval, index, self) =>
        index === self.findIndex((t) => Math.abs(t.cents - interval.cents) < 1e-6)
    );

    // Handle labels
    const alwaysOn = d3.select('#always-on-checkbox').property('checked');

    // Draw JI lines
    const jiLines = svg.select('#ji-group').selectAll('line')
        .data(intervals)
        .enter()
        .append('line')
        .attr('class', 'ji-line')
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
        .attr('stroke', d => {
            // Get the highest prime factor for color coding
            const highestPrime = Math.max(...d.primes);
            return primeColors[highestPrime] || (darkModeEnabled ? '#ffffff' : '#000000');
        })
        .attr('stroke-width', 2);

    if (alwaysOn) {
        // Display labels for all intervals using shared utility
        renderLabels({
            selection: svg.select('#ji-group'),
            data: intervals,
            getText: d => `${d.fraction}\n${d.cents.toFixed(2)}¢`,
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
        // Attach tooltip event handlers using shared utility
        attachTooltipHandlers(
            jiLines,
            d => `Interval: ${d.fraction}<br>${d.cents.toFixed(2)}¢`
        );
    }
}
