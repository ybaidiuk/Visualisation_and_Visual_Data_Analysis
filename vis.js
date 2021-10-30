const width = 960;
const height = 500;
const margin = 200;
const padding = 200;
const adj = 30;
// we are appending SVG first
const svg = d3.select("div#container").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "-"
        + adj + " -"
        + adj + " "
        + (width + adj *3) + " "
        + (height + adj*3))
    .style("padding", `0 ${padding}`)
    .style("margin", `0 ${margin}`)
    .classed("svg-content", true);

//-----------------------------DATA-----------------------------//
const timeConv = d3.timeParse("%d-%b-%Y");
const dataset = d3.csv("data.csv");
dataset.then(data =>{
    let slices = data.columns.slice(1).map(id=> { // slice(1) for removing first item 'dataNames'
        return {
            id: id,
            values: data.map(d=>{
                return {
                    date: timeConv(d.date),
                    measurement: +d[id]
                };
            })
        };
    });
    console.log(data)
    console.log('slices, ',slices)
    // [
    //     {
    //         "id": "A",
    //         "values": [
    //             {
    //                 "date": "2019-07-19T22:00:00.000Z",
    //                 "measurement": 10
    //             },
    //             {
    //                 "date": "2019-07-20T22:00:00.000Z",
    //                 "measurement": 11
    //             }
    //         ]
    //     }
    // ]

//----------------------------SCALES----------------------------//
    const xScale = d3.scaleTime().range([0,width]);
    const yScale = d3.scaleLinear().rangeRound([height, 0]);
    xScale.domain(d3.extent(data, d=>{
        return timeConv(d.date)}));
    yScale.domain([(0), d3.max(slices, c=> {
        return d3.max(c.values, d=> {
            return d.measurement + 4; });
    })
    ]);

//-----------------------------AXES-----------------------------//
    const yaxis = d3.axisLeft()
        .ticks((slices[0].values).length)
        .scale(yScale);

    const xaxis = d3.axisBottom()
        .ticks(d3.timeDay.every(1))
        .tickFormat(d3.timeFormat('%b %d'))
        .scale(xScale);

//----------------------------LINES-----------------------------//
    const line = d3.line()
        .x(d=> { return xScale(d.date); })
        .y(d=> { return yScale(d.measurement); });

    // let id = 0;
    // const ids =  () => "line-"+id++;
//-------------------------2. DRAWING---------------------------//
//-----------------------------AXES-----------------------------//
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xaxis);

    svg.append("g")
        .attr("class", "axis")
        .call(yaxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", ".75em")
        .attr("y", 6)
        .style("text-anchor", "end")
        .text("Frequency");

//----------------------------LINES-----------------------------//
    const lines = svg.selectAll("lines")
        .data(slices)
        .enter()
        .append("g");

    lines.append("path")
        .attr("class", "line-2")
        .attr("d", d=> { return line(d.values); });

    lines.append("text")
        .attr("class","serie_label")
        .datum(d=> {
            return {
                id: d.id,
                value: d.values[d.values.length - 1]}; })
        .attr("transform", d=> {
            return "translate(" + (xScale(d.value.date) + 10)
                + "," + (yScale(d.value.measurement) + 5 ) + ")"; })
        .attr("x", 5)
        .text(d=> { return ("Serie ") + d.id; });

});