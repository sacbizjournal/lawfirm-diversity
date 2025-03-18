// Create the visualization with given dimensions
function createVisualization(width, height, filterType = 'all') {
    // Clear any existing visualization and set up container
    const chartContainer = d3.select('#chart')
        .style('position', 'relative')
        .style('width', '100%')
        .style('height', 'auto')
        .style('overflow', 'visible');
        
    chartContainer.selectAll('*').remove();

    // Get data from global scope
    let fullData = window.lawFirmsData;
    
    // Set up the chart dimensions 
    const margin = { 
        top: 30,
        right: 30,
        bottom: 50,
        left: 10
    };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Scale for circle sizes - make circles smaller on small screens
    const sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(fullData, d => d.totalAttorney)])
        .range([width < 600 ? 2 : 4, Math.min(width < 600 ? 15 : 25, chartWidth / 40)]);

    // filter data based on type
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

    // Create the SVG container with proper viewBox
    const svg = chartContainer
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height])
        .style('display', 'block')
        .style('max-width', '100%')
        .style('overflow', 'visible')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // // Add title with adjusted positioning
    // const titleGroup = svg.append('g')
    //     .attr('transform', `translate(${chartWidth/2}, ${-margin.top/2})`);

    // titleGroup.append('text')
    //     .attr('class', 'chart-title')
    //     .attr('text-anchor', 'middle')
    //     .attr('y', 0)
    //     .style('font-size', `${Math.max(14, Math.min(18, width / 50))}px`)
    //     .style('font-weight', 'bold')
    //     .text('Distribution of Sacramento-area law firms by gender and size');

    // Add legends at the top 
    const legendGroup = svg.append('g')
        .attr('transform', `translate(${chartWidth - 150}, ${-margin.top + 5})`);


    // legendGroup.append('text')
    //     .attr('x', 0)
    //     .attr('y', 0)
    //     .attr('font-weight', 'bold')
    //     .style('font-size', width < 600 ? '12px' : '14px')
    //     .text('Gender');

    // Legend for gender
    // First row of legends (Gender)
    const genderSpacing = width < 600 ? 90 : 80;
    const genderLegend = legendGroup.append('g')
        .attr('transform', 'translate(0, 25)');

    genderLegend.append('circle')
        .attr('cx', 2)
        .attr('cy', 0)
        .attr('r', width < 600 ? 4 : 6)
        .style('fill', '#347acc');

    genderLegend.append('text')
        .attr('x', 14)
        .attr('y', 4)
        .style('font-size', width < 600 ? '11px' : '14px')
        .text('Male');

    genderLegend.append('circle')
        .attr('cx', genderSpacing + 2)
        .attr('cy', 0)
        .attr('r', width < 600 ? 4 : 6)
        .style('fill', '#ff4c4c');

    genderLegend.append('text')
        .attr('x', genderSpacing + 14)
        .attr('y', 4)
        .style('font-size', width < 600 ? '11px' : '14px')
        .text('Female');

    // Second row of legends (Total Attorneys)
    const sizeLegend = legendGroup.append('g')
        .attr('transform', `translate(0, ${width < 600 ? 70 : 80})`);

    sizeLegend.append('text')
        .attr('x', 0)
        .attr('y', -15)
        .attr('font-weight', 'bold')
        .style('font-size', width < 600 ? '12px' : '14px')
        .text('Total attorneys');

    const sizeLegendValues = [75, 30, 5];
    const maxRadius = sizeScale(sizeLegendValues[0]);
    const baseY = maxRadius + 30;
    const centerX = maxRadius + 10;

    // Create circles from largest to smallest
    sizeLegendValues.forEach((value) => {
        const radius = sizeScale(value);
        
        // Add circle - align all circles at the bottom
        sizeLegend.append('circle')
            .attr('cx', centerX)
            .attr('cy', baseY - radius)
            .attr('r', radius)
            .style('fill', 'none')
            .style('stroke', '#666')
            .style('stroke-width', '1px');

        // Add dashed line
        sizeLegend.append('line')
            .attr('x1', centerX)
            .attr('y1', baseY - radius * 2)
            .attr('x2', centerX + maxRadius + 20)
            .attr('y2', baseY - radius * 2)
            .style('stroke', '#666')
            .style('stroke-width', '1px')
            .style('stroke-dasharray', '2,2');

        // Add text
        sizeLegend.append('text')
            .attr('x', centerX + maxRadius + 25)
            .attr('y', baseY - radius * 2)
            .attr('dy', '0.3em')
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
        .attr('y2', chartHeight - 30)  // Stop at x-axis position
        .style('stroke', '#999')
        .style('stroke-width', '1px')
        .style('stroke-dasharray', '4');

    // Create a group for the dots
    const dotsGroup = svg.append('g')
        .attr('class', 'dots');

    // Create color scales for male and female percentages
    const maleColorScale = d3.scaleLinear()
        .domain([0.5, 0.3, 0.2])  // 50% to 70% to 80% male
        .range(['#cccccc', '#6b90d4', '#0066cc']);  // grey to light blue to dark blue

    const femaleColorScale = d3.scaleLinear()
        .domain([0.5, 0.7, 0.8])  // 50% to 70% to 80% female
        .range(['#cccccc', '#ff9999', '#ff0000']);  // grey to light red to dark red

    // Initialize the dots with color scheme
    const dots = dotsGroup.selectAll('.dot')
        .data(data, d => d.name)
        .join(
            enter => enter.append('circle')
                .attr('class', 'dot')
                .attr('r', d => sizeScale(d.totalAttorney))
                .attr('cx', d => xScale(d.fPercentage))
                .attr('cy', chartHeight * 0.5)
                .style('fill', d => d.fPercentage <= 0.5 ? 
                    maleColorScale(d.fPercentage) : 
                    femaleColorScale(d.fPercentage))
                .style('stroke', '#666666')  // Changed to darker grey
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
                    .style('fill', d => d.fPercentage <= 0.5 ? 
                        maleColorScale(d.fPercentage) : 
                        femaleColorScale(d.fPercentage))),
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
    // In the mouseout event, update the stroke color to match
    .on('mouseout', function() {
        d3.select(this)
            .style('opacity', 0.7)
            .style('stroke', '#666666')  // Changed to darker grey
            .style('stroke-width', '1px');
            
        tooltip.transition()
            .duration(500)
            .style('opacity', 0);
    });

    // Create and start the simulation with adjusted vertical position
    const simulation = d3.forceSimulation(data)
        .force('x', d3.forceX(d => xScale(d.fPercentage)).strength(1))
        .force('y', d3.forceY(chartHeight * 0.5).strength(0.1))  // Moved dots down
        .force('collision', d3.forceCollide().radius(d => sizeScale(d.totalAttorney) + 1).strength(0.8))
        .alphaDecay(0.01);

    // Update dot positions on each tick of the simulation
    simulation.on('tick', () => {
        dots
            .attr('cx', d => Math.max(sizeScale(d.totalAttorney), Math.min(chartWidth - sizeScale(d.totalAttorney), d.x)))
            .attr('cy', d => Math.max(sizeScale(d.totalAttorney), Math.min(chartHeight - sizeScale(d.totalAttorney) - 20, d.y)));
    });

    // Add x-axis
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d => {
            const malePercentage = Math.round((1 - d) * 100);
            const femalePercentage = Math.round(d * 100);
            if (d === 0.5) return '50/50';
            if (d === 0) return `${malePercentage}% \nMale`;
            if (d === 1) return `${femalePercentage}% \nFemale`;
            return d < 0.5 ? `${malePercentage}%` : `${femalePercentage}%`;
        })
        .ticks(10);
    
    const xAxisGroup = svg.append('g')
        .attr('transform', `translate(0,${chartHeight - 20})`)
        .call(xAxis);

    // Color the axis labels
    xAxisGroup.selectAll('.tick text')
        .style('fill', d => {
            if (d === 0.5) return '#cccccc';
            return d < 0.5 ? maleColorScale(d) : femaleColorScale(d);
        });

    // Add x-axis label
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight + 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Gender distribution');
}

// Initial creation and tab handling
document.addEventListener('DOMContentLoaded', () => {
    // Get the initial size of the container
    const container = document.getElementById('chart');
    const width = Math.min(1200, container.clientWidth);
    const height = 500;  // Fixed height

    // Store initial dimensions
    const initialDimensions = { width, height };

    // Initial creation
    createVisualization(initialDimensions.width, initialDimensions.height, 'all');

    // Add tab click handlers
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('.tab-button').forEach(btn => 
                btn.classList.remove('active'));
            button.classList.add('active');

            // Use current container width instead of initial width
            const currentWidth = Math.min(1200, container.clientWidth);
            createVisualization(currentWidth, initialDimensions.height, button.dataset.type);
        });
    });

    // Add resize listener with debouncing
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const currentWidth = Math.min(1200, container.clientWidth);
            const activeType = document.querySelector('.tab-button.active').dataset.type;
            createVisualization(currentWidth, initialDimensions.height, activeType);
        }, 250);
    });
});