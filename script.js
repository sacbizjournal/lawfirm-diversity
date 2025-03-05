// Create the visualization with given dimensions
function createVisualization(width, height) {
    // Clear any existing visualization
    d3.select('#chart').selectAll('*').remove();

    // Get data from global scope
    const data = window.lawFirmsData;
    
    // Set up the chart dimensions with adjusted margins
    const margin = { 
        top: width < 600 ? 180 : 140,    // Increased top margin further
        right: 40,
        bottom: 60,
        left: 40
    };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create scales first
    const xScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, chartWidth]);

    // Scale for circle sizes - make circles smaller on small screens
    const sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.totalAttorney)])
        .range([width < 600 ? 2 : 4, Math.min(width < 600 ? 15 : 25, chartWidth / 40)]);

    // Create tooltip div
    const tooltip = d3.select('#chart')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    // Create the SVG container with viewBox
    const svg = d3.select('#chart')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('width', '100%')
        .style('height', 'auto')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add title and subtitle with adjusted positioning
    const titleGroup = svg.append('g')
        .attr('transform', `translate(${chartWidth/2}, ${-margin.top/2 - (width < 600 ? 35 : 45)})`);

    titleGroup.append('text')
        .attr('class', 'chart-title')
        .attr('text-anchor', 'middle')
        .attr('y', 0)
        .style('font-size', width < 600 ? '16px' : '20px')
        .style('font-weight', 'bold')
        .text('Distribution of Sacramento-area law firms by gender and size');

    // Add legends at the top left with improved responsive positioning
    const legendGroup = svg.append('g')
        .attr('transform', `translate(0, ${-margin.top/2 + (width < 600 ? 35 : 30)})`);

    // Legend for locally based
    legendGroup.append('text')
        .attr('x', 0)
        .attr('y', -15)  // Move text back up above the circles
        .attr('font-weight', 'bold')
        .style('font-size', width < 600 ? '12px' : '14px')
        .text('Location');

    // First row of legends (Location) with adjusted spacing
    const locationLegend = legendGroup.append('g');
    const locationSpacing = width < 600 ? 90 : 120;

    locationLegend.append('circle')
        .attr('cx', 2)  // Add slight offset to align with text
        .attr('cy', 0)
        .attr('r', width < 600 ? 4 : 6)
        .style('fill', '#4e79a7');

    locationLegend.append('text')
        .attr('x', 14)  // Adjusted to maintain same spacing from circle
        .attr('y', 4)
        .style('font-size', width < 600 ? '11px' : '14px')
        .text('Locally Based');

    locationLegend.append('circle')
        .attr('cx', locationSpacing + 2)  // Added same offset
        .attr('cy', 0)
        .attr('r', width < 600 ? 4 : 6)
        .style('fill', '#e15759');

    locationLegend.append('text')
        .attr('x', locationSpacing + 14)  // Adjusted to maintain same spacing
        .attr('y', 4)
        .style('font-size', width < 600 ? '11px' : '14px')
        .text('Non-Local');

    // Second row of legends (Total Attorneys) with improved spacing
    const sizeLegend = legendGroup.append('g')
        .attr('transform', `translate(0, ${width < 600 ? 35 : 40})`);

    sizeLegend.append('text')
        .attr('x', 0)
        .attr('y', -5)
        .attr('font-weight', 'bold')
        .style('font-size', width < 600 ? '12px' : '14px')
        .text('Total Attorneys');

    const sizeLegendValues = [75, 40, 10];
    let currentX = 0;
    const circleSpacing = width < 600 ? 10 : 20;  // Reduced spacing values

    sizeLegendValues.forEach((value, i) => {
        const radius = sizeScale(value);
        
        // Add circle with adjusted positioning
        sizeLegend.append('circle')
            .attr('cx', currentX + radius)
            .attr('cy', radius)
            .attr('r', radius)
            .style('fill', 'none')
            .style('stroke', '#666');

        // Add label with improved responsive positioning
        sizeLegend.append('text')
            .attr('x', currentX)
            .attr('y', radius * 2 + (width < 600 ? 10 : 15))
            .attr('text-anchor', 'start')
            .style('font-size', width < 600 ? '11px' : '14px')
            .text(value);

        // Update X position with tighter spacing
        currentX += (radius * 2) + circleSpacing;  // Removed additional radius from spacing
    });

    // Draw the center line
    svg.append('line')
        .attr('class', 'center-line')
        .attr('x1', xScale(0.5))
        .attr('y1', 0)
        .attr('x2', xScale(0.5))
        .attr('y2', chartHeight)
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
        .attr('cy', chartHeight / 2)
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
        .force('y', d3.forceY(chartHeight / 2).strength(0.1))
        .force('collision', d3.forceCollide().radius(d => sizeScale(d.totalAttorney) + 2).strength(0.8))
        .alphaDecay(0.01);

    // Update dot positions on each tick of the simulation
    simulation.on('tick', () => {
        dots
            .attr('cx', d => Math.max(sizeScale(d.totalAttorney), Math.min(chartWidth - sizeScale(d.totalAttorney), d.x)))
            .attr('cy', d => Math.max(sizeScale(d.totalAttorney), Math.min(chartHeight - sizeScale(d.totalAttorney), d.y)));
    });

    // Add x-axis
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format('.0%'))
        .ticks(10);
    
    svg.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(xAxis);

    // Add labels
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight + 40)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Percentage of Female Attorneys');
}

// Initial creation
document.addEventListener('DOMContentLoaded', () => {
    // Get the initial size of the container
    const container = document.getElementById('chart');
    const width = Math.min(1200, container.clientWidth); // Cap maximum width
    const height = Math.min(500, window.innerHeight * 0.7); // Cap maximum height

    createVisualization(width, height);

    // Add resize listener
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const newWidth = Math.min(1200, container.clientWidth);
            const newHeight = Math.min(500, window.innerHeight * 0.7);
            createVisualization(newWidth, newHeight);
        }, 250); // Debounce resize events
    });
}); 