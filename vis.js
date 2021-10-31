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

//-----------------------------AXES-----------------------------//
    const yaxis = d3.axisLeft()
        .tickFormat(n => n / 1000000 + ' M')
        .ticks((slices[0].values).length)
        .scale(yScale)

    const xaxis = d3.axisBottom()
        .tickFormat(d3.format('d'))
        .ticks(yearsArr.length)
        .scale(xScale)

//----------------------------LINES-----------------------------//
    const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.measurement))

//-------------------------2. DRAWING---------------------------//
//-----------------------------AXES-----------------------------//
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xaxis)

    svg.append('g')
        .attr('class', 'axis')
        .call(yaxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('dy', '-5em')
        .attr('dx', '-10em')
        .style('text-anchor', 'end')
        .text('Nominal GDP(Millions of current dollars)')

//----------------------------LINES-----------------------------//
    const lines = svg.selectAll('lines')
        .data(slices)
        .enter()
        .append('g')

    lines.append('path')
        .attr('class', 'line-0')
        .attr('d', d => line(d.values))

    lines.append('text')
        .attr('class', 'serie_label')
        .datum(d => {
            return {
                id: d.id,
                value: d.values[d.values.length - 1]
            }
        })
        .attr('transform', d => 'translate(' + (xScale(d.value.date) + 10)
            + ',' + (yScale(d.value.measurement) + 5) + ')')
        .attr('x', 5)
        .text(d => d.id)

});