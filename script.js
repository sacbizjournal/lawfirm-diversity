// Create the visualization with given dimensions
function createVisualization(width, height, filterType = 'all') {
    // Clear any existing visualization and set up container
    const chartContainer = d3.select('#chart')
        .style('position', 'relative')
        .style('width', '100%')
        .style('height', 'auto')
        .style('overflow', 'hidden');
        
    chartContainer.selectAll('*').remove();

    // Get data from global scope
    let fullData = window.lawFirmsData;
    
    // Set up the chart dimensions with adjusted margins
    const margin = { 
        top: width < 600 ? 120 : 100,    // Reduced top margin
        right: 30,
        bottom: 40,  // Reduced bottom margin
        left: 40
    };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Scale for circle sizes - make circles smaller on small screens
    const sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(fullData, d => d.totalAttorney)])
        .range([width < 600 ? 2 : 4, Math.min(width < 600 ? 15 : 25, chartWidth / 40)]);

    // Then filter data based on type
    let data = fullData;
    if (filterType === 'local') {
        data = data.filter(d => d.locallyBased === 'Y');
    } else if (filterType === 'nonlocal') {
        data = data.filter(d => d.locallyBased === 'N');
    }

    // Create scales first
    const xScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, chartWidth]);

    // Create tooltip div with absolute positioning
    const tooltip = chartContainer
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('pointer-events', 'none')
        .style('opacity', 0);

    // Create the SVG container with fixed aspect ratio
    const svg = chartContainer
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('display', 'block')  // Prevent inline spacing issues
        .style('max-width', '100%')
        .style('height', 'auto')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add title and subtitle with adjusted positioning
    const titleGroup = svg.append('g')
        .attr('transform', `translate(${chartWidth/2}, ${-margin.top/2 + 10})`);  // Adjusted title position

    // Calculate responsive font size based on chart width
    const titleFontSize = Math.max(14, Math.min(18, width / 50));  // Reduced font size range

    titleGroup.append('text')
        .attr('class', 'chart-title')
        .attr('text-anchor', 'middle')
        .attr('y', 0)
        .style('font-size', `${titleFontSize}px`)
        .style('font-weight', 'normal')
        .text('Distribution of Sacramento-area law firms by gender and size');

    // Add legends at the top left with improved responsive positioning
    const legendGroup = svg.append('g')
        .attr('transform', `translate(0, ${-margin.top/2 + 40})`);  // Reduced spacing

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
        .text('Locally based');

    locationLegend.append('circle')
        .attr('cx', locationSpacing + 2)  // Added same offset
        .attr('cy', 0)
        .attr('r', width < 600 ? 4 : 6)
        .style('fill', '#e15759');

    locationLegend.append('text')
        .attr('x', locationSpacing + 14)  // Adjusted to maintain same spacing
        .attr('y', 4)
        .style('font-size', width < 600 ? '11px' : '14px')
        .text('Non-local');

    // Second row of legends (Total Attorneys) with improved spacing
    const sizeLegend = legendGroup.append('g')
        .attr('transform', `translate(0, ${width < 600 ? 45 : 50})`);  // Increased vertical spacing for size legend

    sizeLegend.append('text')
        .attr('x', 0)
        .attr('y', -15)  // Increased negative value to move text up more
        .attr('font-weight', 'bold')
        .style('font-size', width < 600 ? '12px' : '14px')
        .text('Total attorneys');

    const sizeLegendValues = [75, 30, 5];  // Updated values
    const maxRadius = sizeScale(sizeLegendValues[0]);
    const baseY = maxRadius + 30;  // Increased from 20 to 30 to move circles down
    const centerX = maxRadius + 10;

    // Create circles from largest to smallest
    sizeLegendValues.forEach((value) => {
        const radius = sizeScale(value);
        
        // Add circle - align all circles at the bottom
        sizeLegend.append('circle')
            .attr('cx', centerX)
            .attr('cy', baseY - radius)  // Adjust cy to align bottom edges
            .attr('r', radius)
            .style('fill', 'none')
            .style('stroke', '#666')
            .style('stroke-width', '1px');

        // Add dashed line - start from top edge of circle
        sizeLegend.append('line')
            .attr('x1', centerX)  // Start from center x
            .attr('y1', baseY - radius * 2)  // Start from top of circle
            .attr('x2', centerX + maxRadius + 20)  // Extend line to the right
            .attr('y2', baseY - radius * 2)  // Keep line horizontal
            .style('stroke', '#666')
            .style('stroke-width', '1px')
            .style('stroke-dasharray', '2,2');  // Smaller dashes

        // Add text
        sizeLegend.append('text')
            .attr('x', centerX + maxRadius + 25)  // Position text at end of line
            .attr('y', baseY - radius * 2)  // Align with the dashed line
            .attr('dy', '0.3em')  // Slight vertical adjustment for centering
            .attr('text-anchor', 'start')
            .style('font-size', width < 600 ? '11px' : '14px')
            .text(value);
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

    // Initialize the dots with starting positions and transitions
    const dots = dotsGroup.selectAll('.dot')
        .data(data, d => d.name)  // Use firm name as key for smooth transitions
        .join(
            enter => enter.append('circle')
                .attr('class', 'dot')
                .attr('r', d => sizeScale(d.totalAttorney))
                .attr('cx', d => xScale(d.fPercentage))
                .attr('cy', chartHeight * 0.6)  // Move dots down to 60% of chart height
                .style('fill', d => d.locallyBased === 'Y' ? '#4e79a7' : '#e15759')
                .style('stroke', '#fff')
                .style('stroke-width', '1px')
                .style('opacity', 0)
                .call(enter => enter.transition()
                    .duration(750)
                    .style('opacity', 0.7)),
            update => update
                .call(update => update.transition()
                    .duration(750)
                    .attr('r', d => sizeScale(d.totalAttorney))
                    .attr('cx', d => xScale(d.fPercentage))
                    .style('fill', d => d.locallyBased === 'Y' ? '#4e79a7' : '#e15759')),
            exit => exit
                .call(exit => exit.transition()
                    .duration(750)
                    .style('opacity', 0)
                    .remove())
        );

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
            <div class="info-row">Total attorneys: ${d.totalAttorney}</div>
            <div class="info-row">Female attorneys: ${(d.fPercentage * 100)}%</div>
            <div class="info-row">${d.locallyBased === 'Y' ? 'Locally based' : 'Not locally based'}</div>
        `);

        // Get window width and tooltip width
        const windowWidth = window.innerWidth;
        const tooltipWidth = tooltip.node().getBoundingClientRect().width;
        
        // If tooltip would extend beyond right edge, show it on the left side instead
        const tooltipX = mouseX + tooltipWidth + 10 > windowWidth 
            ? mouseX - tooltipWidth - 10 
            : mouseX + 10;
            
        tooltip
            .style('left', `${tooltipX}px`)
            .style('top', `${mouseY - 10}px`);
    })
    .on('mousemove', function(event) {
        const [mouseX, mouseY] = d3.pointer(event, document.body);
        
        // Get window width and tooltip width
        const windowWidth = window.innerWidth;
        const tooltipWidth = tooltip.node().getBoundingClientRect().width;
        
        // If tooltip would extend beyond right edge, show it on the left side instead
        const tooltipX = mouseX + tooltipWidth + 10 > windowWidth 
            ? mouseX - tooltipWidth - 10 
            : mouseX + 10;
            
        tooltip
            .style('left', `${tooltipX}px`)
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
        .force('y', d3.forceY(chartHeight * 0.5).strength(0.1))  // Moved dots up slightly
        .force('collision', d3.forceCollide().radius(d => sizeScale(d.totalAttorney) + 1).strength(0.8))  // Reduced collision padding
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
        .text('Percentage of female attorneys');
}

// Initial creation and tab handling
document.addEventListener('DOMContentLoaded', () => {
    // Get the initial size of the container
    const container = document.getElementById('chart');
    const width = Math.min(1200, container.clientWidth);
    const height = Math.min(500, window.innerHeight * 0.7);  // Restored to original larger height

    // Initial creation
    createVisualization(width, height, 'all');

    // Add tab click handlers
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('.tab-button').forEach(btn => 
                btn.classList.remove('active'));
            button.classList.add('active');

            // Recreate visualization with filter
            createVisualization(width, height, button.dataset.type);
        });
    });

    // Add resize listener with debouncing
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const newWidth = Math.min(1200, container.clientWidth);
            const newHeight = Math.min(500, window.innerHeight * 0.7);  // Match initial larger height
            const activeType = document.querySelector('.tab-button.active').dataset.type;
            createVisualization(newWidth, newHeight, activeType);
        }, 250);
    });
}); 