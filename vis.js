// set the dimensions and margins of the graph
let margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom

// set the ranges
let x = d3.scaleBand()
    .range([0, width])
    .padding(0.1)
let y = d3.scaleLinear()
    .range([height, 0])

// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
let svg = d3.select('#my-chart').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform',
        'translate(' + margin.left + ',' + margin.top + ')')

// get the data
d3.csv('usa_nominal_gdp_top10_2021.csv').then(function (data) {

    // format the data
    data.forEach(d => {
        d.GDP = +d.GDP
    })

    // Scale the range of the data in the domains
    x.domain(data.map(d => d.State))
    y.domain([0, d3.max(data, d => d.GDP)])

    // append the rectangles for the bar chart
    svg.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.State))
        .attr('width', x.bandwidth())
        .attr('y', d => y(d.GDP))
        .attr('height', d => height - y(d.GDP))

    // add the x Axis
    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x))

    // add the y Axis
    svg.append('g')
        .call(d3.axisLeft(y))

})