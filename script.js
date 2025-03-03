// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', () => {
    // Get data from global scope
    const data = window.lawFirmsData;

    // Set up initial chart dimensions
    const margin = { top: 40, right: 200, bottom: 60, left: 40 };
    let width = document.getElementById('chart').clientWidth - margin.left - margin.right;
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
    const xScale = d3.scaleLinear().domain([0, 1]).range([0, width]);
    const sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.totalAttorney)])
        .range([3, 18]);

    // Draw the center 50% line
    const centerLine = svg.append('line')
        .attr('class', 'center-line')
        .style('stroke', '#999')
        .style('stroke-width', '1px')
        .style('stroke-dasharray', '4');

    // Create a group for the dots
    const dotsGroup = svg.append('g').attr('class', 'dots');

    // Initialize the dots
    const dots = dotsGroup.selectAll('.dot')
        .data(data)
        .join('circle')
        .attr('class', 'dot')
        .attr('r', d => sizeScale(d.totalAttorney))
        .style('fill', d => d.locallyBased === 'Y' ? '#4e79a7' : '#e15759')
        .style('stroke', '#fff')
        .style('stroke-width', '1px')
        .style('opacity', 0.7);

    // Add mouse events for tooltips
    dots.on('mouseover', function (event, d) {
        d3.select(this).style('opacity', 1).style('stroke', '#000').style('stroke-width', '2px');

        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(`
            <div class="firm-name">${d.name}</div>
            <div class="info-row">Total Attorneys: ${d.totalAttorney}</div>
            <div class="info-row">Female Attorneys: ${(d.fPercentage * 100).toFixed(1)}%</div>
            <div class="info-row">${d.locallyBased === 'Y' ? 'Locally Based' : 'Non-Local'}</div>
        `)
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 10}px`);
    })
    .on('mousemove', function (event) {
        tooltip.style('left', `${event.pageX + 10}px`).style('top', `${event.pageY - 10}px`);
    })
    .on('mouseout', function () {
        d3.select(this).style('opacity', 0.7).style('stroke', '#fff').style('stroke-width', '1px');
        tooltip.transition().duration(500).style('opacity', 0);
    });

    // Create and start the simulation
    const simulation = d3.forceSimulation(data)
        .force('x', d3.forceX(d => xScale(d.fPercentage)).strength(1))
        .force('y', d3.forceY(height / 2).strength(0.1))
        .force('collision', d3.forceCollide().radius(d => sizeScale(d.totalAttorney) + 2).strength(0.8))
        .alphaDecay(0.01);

    simulation.on('tick', () => {
        dots.attr('cx', d => Math.max(sizeScale(d.totalAttorney), Math.min(width - sizeScale(d.totalAttorney), d.x)))
            .attr('cy', d => Math.max(sizeScale(d.totalAttorney), Math.min(height - sizeScale(d.totalAttorney), d.y)));
    });

    // Add x-axis
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('.0%')).ticks(10);
    const xAxisGroup = svg.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${height})`);
    xAxisGroup.call(xAxis);

    // Add axis label
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('x', width / 2)
        .attr('y', height + 40)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Percentage of female attorneys');

    // Add legend
    const legend = svg.append('g');

    function updateChart() {
        width = document.getElementById('chart').clientWidth - margin.left - margin.right;
        xScale.range([0, width]);

        d3.select('svg').attr('width', width + margin.left + margin.right);
        xAxisGroup.call(xAxis);

        // update center line
        centerLine.attr('x1', xScale(0.5)).attr('y1', 0).attr('x2', xScale(0.5)).attr('y2', height);

        // update axis label
        d3.select('.axis-label')
            .attr('x', width / 2); // Update position dynamically

        // update legend position
        legend.attr('transform', `translate(5, 5)`).html(`
            <text x="0" y="0" font-weight="bold">Location</text>
            <circle cx="10" cy="20" r="6" fill="#4e79a7"></circle>
            <text x="25" y="25">Locally Based</text>
            <circle cx="10" cy="45" r="6" fill="#e15759"></circle>
            <text x="25" y="50">Non-Local</text>
        `);            
        // <text x="0" y="80" font-weight="bold">Total Attorneys</text>

        // // Size legend dynamically
        // const sizeLegendValues = [75, 40, 10];
        // sizeLegendValues.forEach((value, i) => {
        //     legend.append('circle')
        //         .attr('cx', 10)
        //         .attr('cy', 110 + i * 25)
        //         .attr('r', sizeScale(value))
        //         .style('fill', 'none')
        //         .style('stroke', '#666');

        //     legend.append('text')
        //         .attr('x', 25)
        //         .attr('y', 115 + i * 25)
        //         .text(value);
        // });

        simulation.force('x', d3.forceX(d => xScale(d.fPercentage)).strength(1));
        simulation.alpha(1).restart();
    }

    // Resize event listener
    window.addEventListener('resize', updateChart);
    updateChart();
});