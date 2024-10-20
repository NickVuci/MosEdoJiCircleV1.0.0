// ji.js

export function renderJI(svg, centerX, centerY, radius) {
    // Get selected primes (excluding 2, which is always included)
    const selectedPrimes = [];
    d3.selectAll('#prime-checkboxes input[type="checkbox"]:checked').each(function() {
        selectedPrimes.push(+this.value);
    });

    // Get odd limit
    const oddLimit = parseInt(d3.select('#odd-limit-input').property('value'), 10);

    // Generate intervals
    const intervals = generateIntervals(selectedPrimes, oddLimit);

    // Scale for line length (extend lines 20% beyond the circle's radius)
    const lineLength = radius * 1.2;

    // Fixed color mapping for prime limits
    const primeColors = {
        2: '#1f77b4',   // Blue
        3: '#ff7f0e',   // Orange
        5: '#2ca02c',   // Green
        7: '#d62728',   // Red
        11: '#9467bd',  // Purple
        13: '#8c564b',  // Brown
        17: '#e377c2',  // Pink
        19: '#7f7f7f',  // Gray
    };

    // Draw lines and add tooltips
    const jiGroup = svg.select('#ji-group');
    if (jiGroup.empty()) {
        svg.append('g').attr('id', 'ji-group');
    } else {
        jiGroup.selectAll('*').remove();
    }

    intervals.forEach(interval => {
        const angle = (interval.cents / 1200) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + lineLength * Math.cos(angle);
        const y = centerY + lineLength * Math.sin(angle);

        // Determine line color based on prime limit
        const lineColor = primeColors[interval.primeLimit];

        // Draw line
        svg.select('#ji-group')
            .append('line')
            .attr('x1', centerX)
            .attr('y1', centerY)
            .attr('x2', x)
            .attr('y2', y)
            .attr('stroke', lineColor)
            .attr('stroke-width', 2)
            .attr('class', 'ji-line')
            .on('mouseover', function(event) {
                // Animate line on hover
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('stroke-width', 4)
                    .attr('stroke-opacity', 0.7);

                // Show tooltip
                const tooltip = d3.select('#tooltip');
                tooltip.style('display', 'block')
                    .html(`${interval.numerator}/${interval.denominator}, ${interval.cents.toFixed(2)}¢`);

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
                // Reset line style
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('stroke-width', 2)
                    .attr('stroke-opacity', 1);

                // Hide tooltip
                d3.select('#tooltip').style('display', 'none');
            });
    });
}

// Function to generate intervals based on selected primes and odd limit
function generateIntervals(selectedPrimes, oddLimit) {
    const intervals = [];

    for (let num = 1; num <= oddLimit; num++) {
        for (let den = 1; den <= oddLimit; den++) {
            if (den === 0) continue;

            // Simplify the fraction
            const gcdValue = gcd(num, den);
            let simplifiedNum = num / gcdValue;
            let simplifiedDen = den / gcdValue;

            // Skip if fraction is not in reduced form within the odd limit
            const maxOddInNum = maxOddFactor(simplifiedNum);
            const maxOddInDen = maxOddFactor(simplifiedDen);
            const maxOdd = Math.max(maxOddInNum, maxOddInDen);
            if (maxOdd > oddLimit) continue;

            let ratio = simplifiedNum / simplifiedDen;

            // Adjust the ratio to be within [1, 2)
            while (ratio < 1) {
                ratio *= 2;
                simplifiedNum *= 2;
            }
            while (ratio >= 2) {
                ratio /= 2;
                simplifiedNum /= 2;
            }

            // Ensure numerator and denominator are integers after adjustments
            if (!Number.isInteger(simplifiedNum) || !Number.isInteger(simplifiedDen)) continue;

            // Skip if numerator is not greater than denominator
            if (simplifiedNum <= simplifiedDen) continue;

            // Calculate cents value
            const cents = 1200 * Math.log2(ratio);

            // Only include intervals within 0 to 1200 cents
            if (cents < 0 || cents >= 1200) continue;

            // Calculate prime limit (excluding 2)
            const primesInNum = primeFactors(simplifiedNum);
            const primesInDen = primeFactors(simplifiedDen);
            const allPrimes = [...new Set([...primesInNum, ...primesInDen])];

            // Remove 2 from the list of primes for prime limit calculation
            const primesExcludingTwo = allPrimes.filter(prime => prime !== 2);
            const primeLimit = primesExcludingTwo.length > 0 ? Math.max(...primesExcludingTwo) : 2;

            // Check if the interval's prime limit (excluding 2) is in the selected primes
            if (!selectedPrimes.includes(primeLimit)) continue;

            intervals.push({
                numerator: simplifiedNum,
                denominator: simplifiedDen,
                ratio: ratio,
                cents: cents,
                primeLimit: primeLimit
            });
        }
    }

    return intervals;
}

// Function to calculate GCD
function gcd(a, b) {
    if (!b) return a;
    return gcd(b, a % b);
}

// Function to get prime factors of a number
function primeFactors(n) {
    const factors = [];
    let divisor = 2;
    while (n >= 2) {
        if (n % divisor === 0) {
            factors.push(divisor);
            n /= divisor;
        } else {
            divisor++;
        }
    }
    return factors;
}

// Function to get the highest odd factor of a number
function maxOddFactor(n) {
    let maxOdd = 1;
    for (let i = 1; i <= n; i += 2) {
        if (n % i === 0) {
            maxOdd = i;
        }
    }
    return maxOdd;
}
