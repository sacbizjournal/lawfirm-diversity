// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', () => {
    // Get data from global scope
    const data = window.lawFirmsData;
    
    // Set up the chart dimensions
    const margin = { top: 40, right: 200, bottom: 60, left: 40 };
    const width = 1200 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create tooltip div
    const tooltip = d3.select('#chart')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    // Create the SVG container
    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, width]);

    // Scale for circle sizes
    const sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.totalAttorney)])
        .range([4, 25]);

    // Draw the center line
    svg.append('line')
        .attr('class', 'center-line')
        .attr('x1', xScale(0.5))
        .attr('y1', 0)
        .attr('x2', xScale(0.5))
        .attr('y2', height)
        .style('stroke', '#999')
        .style('stroke-width', '1px')
        .style('stroke-dasharray', '4');

    // Create a group for the dots
    const dotsGroup = svg.append('g')
        .attr('class', 'dots');

    // Initialize the dots with starting positions
    const dots = dotsGroup.selectAll('.dot')
        .data(data)
        .join('circle')
        .attr('class', 'dot')
        .attr('r', d => sizeScale(d.totalAttorney))
        .attr('cx', d => xScale(d.fPercentage))
        .attr('cy', height / 2)
        .style('fill', d => d.locallyBased === 'Y' ? '#4e79a7' : '#e15759')
        .style('stroke', '#fff')
        .style('stroke-width', '1px')
        .style('opacity', 0.7);

    // Add mouse events for tooltips
    dots.on('mouseover', function(event, d) {
        const [mouseX, mouseY] = d3.pointer(event, document.body);
        
        d3.select(this)
            .style('opacity', 1)
            .style('stroke', '#000')
            .style('stroke-width', '2px');
            
        tooltip.transition()
            .duration(200)
            .style('opacity', 1);
            
        tooltip.html(`
            <div class="firm-name">${d.name}</div>
            <div class="info-row">Total Attorneys: ${d.totalAttorney}</div>
            <div class="info-row">Female Attorneys: ${(d.fPercentage * 100).toFixed(1)}%</div>
            <div class="info-row">${d.locallyBased === 'Y' ? 'Locally Based' : 'Non-Local'}</div>
        `)
        .style('left', `${mouseX + 10}px`)
        .style('top', `${mouseY - 10}px`);
    })
    .on('mousemove', function(event) {
        const [mouseX, mouseY] = d3.pointer(event, document.body);
        tooltip
            .style('left', `${mouseX + 10}px`)
            .style('top', `${mouseY - 10}px`);
    })
    .on('mouseout', function() {
        d3.select(this)
            .style('opacity', 0.7)
            .style('stroke', '#fff')
            .style('stroke-width', '1px');
            
        tooltip.transition()
            .duration(500)
            .style('opacity', 0);
    });

    // Create and start the simulation
    const simulation = d3.forceSimulation(data)
        .force('x', d3.forceX(d => xScale(d.fPercentage)).strength(1))
        .force('y', d3.forceY(height / 2).strength(0.1))
        .force('collision', d3.forceCollide().radius(d => sizeScale(d.totalAttorney) + 1).strength(0.7))
        .alphaDecay(0.01);

    // Update dot positions on each tick of the simulation
    simulation.on('tick', () => {
        dots
            .attr('cx', d => Math.max(sizeScale(d.totalAttorney), Math.min(width - sizeScale(d.totalAttorney), d.x)))
            .attr('cy', d => Math.max(sizeScale(d.totalAttorney), Math.min(height - sizeScale(d.totalAttorney), d.y)));
    });

    // Add x-axis
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format('.0%'))
        .ticks(10);
    
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);

    // Add labels
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('x', width / 2)
        .attr('y', height + 40)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Percentage of Female Attorneys');

    // Add legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width + 20}, 20)`);

    // Legend for locally based
    legend.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .attr('font-weight', 'bold')
        .text('Location');

    legend.append('circle')
        .attr('cx', 10)
        .attr('cy', 20)
        .attr('r', 6)
        .style('fill', '#4e79a7');

    legend.append('text')
        .attr('x', 25)
        .attr('y', 25)
        .text('Locally Based');

    legend.append('circle')
        .attr('cx', 10)
        .attr('cy', 45)
        .attr('r', 6)
        .style('fill', '#e15759');

    legend.append('text')
        .attr('x', 25)
        .attr('y', 50)
        .text('Non-Local');

    // Legend for size
    legend.append('text')
        .attr('x', 0)
        .attr('y', 80)
        .attr('font-weight', 'bold')
        .text('Total Attorneys');

    const sizeLegendValues = [75, 40, 10];
    sizeLegendValues.forEach((value, i) => {
        legend.append('circle')
            .attr('cx', 10)
            .attr('cy', 110 + i * 25)
            .attr('r', sizeScale(value))
            .style('fill', 'none')
            .style('stroke', '#666');

        legend.append('text')
            .attr('x', 25)
            .attr('y', 115 + i * 25)
            .text(value);
    });
}); 