const width = 960
const height = 500
const margin = 300
const padding = 100
const adj = 100
// we are appending SVG first
const svg = d3.select('div#container').append('svg')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', '-'
        + adj + ' -'
        + adj + ' '
        + (width + adj * 3) + ' '
        + (height + adj * 3))
    .style('padding', `0 ${padding}`)
    .style('margin', `0 ${margin}`)
    .classed('svg-content', true)

const svgBrush = d3.select('div#container-brush').append('svg')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', '-'
        + adj + ' -'
        + adj + ' '
        + (width + adj * 3) + ' '
        + (height/5 + adj * 3))
    .style('padding', `0 ${padding}`)
    .style('margin', `0 ${margin}`)
    .classed('svg-content', true)


//-----------------------------DATA-----------------------------//
const dataset = d3.csv('usa_nominal_gdp_1997-2020.csv')
dataset.then(data => {
    console.log(data)
    let slices = data.map(obj => { //remove last one. (columns names)

        return {
            id: obj.State,
            values: Object.keys(obj).filter(x => x !== 'State').map(key => {
                return {
                    date: key,
                    measurement: +obj[key]
                }
            })
        }
    })

    console.log('slices, ', slices)

//----------------------------SCALES----------------------------//
    const yearsArr = data.columns.slice(1)
    const xScale = d3.scaleLinear().range([0, width])
    const yScale = d3.scaleLinear().range([height, 0])
    xScale.domain(d3.extent(yearsArr, d => d))
    yScale.domain([(0), d3.max(slices, c => d3.max(c.values, d => d.measurement + 4))
    ])

    const brushScaleY = d3.scaleLinear().range([height/5, 0])
    brushScaleY.domain([(0), d3.max(slices, c => d3.max(c.values, d => d.measurement + 4))
    ])


//-----------------------------AXES-----------------------------//
    const yaxis = d3.axisLeft()
        .tickFormat(n => n / 1000000 + ' M')
        .ticks((slices[0].values).length/5)
        .scale(yScale)

    const xaxis = d3.axisBottom()
        .tickFormat(d3.format('d'))
        .ticks(yearsArr.length)
        .scale(xScale)

//----------------------------LINES-----------------------------//
    const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.measurement))

    const brushLine = d3.line()
        .x(d => xScale(d.date))
        .y(d => brushScaleY(d.measurement))

//-------------------------2. DRAWING---------------------------//
//-----------------------------AXES-----------------------------//
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xaxis)
        .append('text')
        .attr('dy', '4em')
        .attr('dx', '40em')
        .style('text-anchor', 'end')
        .text('YEARS')

    svg.append('g')
        .attr('class', 'axis')
        .call(yaxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('dy', '-5em')
        .attr('dx', '-10em')
        .style('text-anchor', 'end')
        .text('Nominal GDP(Millions of current dollars)')

    svgBrush.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + height /5 + ')')
        .call(xaxis)

//----------------------------LINES-----------------------------//
    const lines = svg.selectAll('lines')
        .data(slices)
        .enter()
        .append('g')
        .on('mouseover', e => {
            d3.select(e.currentTarget).append('text')
                .attr('class', 'mouseover')
                .attr('d', d => line(d.values))
                .datum(d => {
                    return {
                        id: d.id,
                        value: d.values[d.values.length - 1]
                    }
                })
                .attr('transform', d => 'translate(' + (xScale(d.value.date) + 10) + ',' + (yScale(d.value.measurement) + 5) + ')')
                .attr('x', 5)
                .attr("id", "lineName")
                .text(d => d.id)
        })
        .on('mouseout',  e => {
            d3.select("#lineName").remove();
        })

    lines.append('path')
        .attr('class', 'line')
        .attr('d', d => line(d.values))

    const updateChart = e => {
        if (e.selection) {
            xScale.domain(d3.extent(yearsArr, d => d))
            const begin = e.selection[0]
            const end = e.selection[1]
            xScale.domain([xScale.invert(begin), xScale.invert(end)])

            svg.selectAll('.line')
                .transition()
                .duration(1000)
                .attr('d', d =>
                    line(d.values)
                )
        }
    }
    const brushX = d3.brushX().on('end', updateChart)
    const linesBrush = svgBrush.selectAll('lines')
        .data(slices)
        .enter()
        .append('g')
        .call(brushX)

    linesBrush.append('path')
        .attr('class', 'line')
        .attr('d', d => brushLine(d.values))

});


// todo color for selected lines
// margins. 