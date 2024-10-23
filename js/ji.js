// ji.js

export function renderJI(svg, centerX, centerY, radius) {
    // Get selected primes
    const selectedPrimes = d3.selectAll('#prime-checkboxes input[type="checkbox"]')
        .nodes()
        .filter(node => node.checked)
        .map(node => parseInt(node.value));

    // Get the odd limit
    const oddLimit = parseInt(d3.select('#odd-limit-input').property('value'), 10);

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

    // Draw JI lines
    svg.select('#ji-group').selectAll('line')
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
        .attr('stroke-width', 2)
        .on('mouseover', function(event, d) {
            // Show tooltip
            const tooltip = d3.select('#tooltip');
            tooltip.style('display', 'block')
                .html(`${d.fraction}<br>${d.cents.toFixed(2)}¢`);

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
