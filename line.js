// ----- DECLARING GLOBAL DIMENSIONS -----
const xSize = 900; const ySize = 350;
const margin = 150;
const xMax = xSize - margin*2;
const yMax = ySize - margin;

const transitionSpeed = 1000;

let brushing = false;

let xExtent;
let yExtent;

//X Axis
let x = d3.scaleLinear();

//Y Axis
let y = d3.scaleLinear();

let selectedYears = [];

// https://stackoverflow.com/a/56239268
// Add a responsive SVG

const svg = d3.select("body")
    .append("div")
    .attr("class","chart-container")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + xSize + " " + ySize)
    .append("g")
    .attr("transform","translate(" + margin + "," + 75 + ")");


// Add the brushing toggle button
const toggle = d3.select(".dropdown-container")
    .append("input")
    .attr("type","button")
    .attr("class","resetButton")
    .attr("value","Toggle Brushing")
    .attr("onclick","toggleBrush()");

/**
 * Setup the axes on initialisation
 * @param {*} data array of [{x,y}] datapoints for the graph
 * @param {*} category the field currently being shown on the graph 
 */
function setupAxes(data,category){

    /* Get the 'limits' of the data - the full extent (mins and max)
    so the plotted data fits perfectly */

    xExtent = d3.extent( data, datum=>{ return datum.x } );
    yExtent = d3.extent( data, datum=>{ return datum.y } );

    //X Axis
    x.domain([ xExtent[0], xExtent[1] ])
        .range([0, xMax]);
     //Y Axis
    y.domain([ 0, 1 ])
        .range([ yMax, 0]);

    //bottom
    svg.append("g")
        .attr("transform", "translate(0," + yMax + ")")
        .attr("class","Xaxis")
        .transition()
        .duration(transitionSpeed)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y"))) // https://stackoverflow.com/a/48267979

    // Apend X Axis label
    svg.append("text")
        .attr("class","axisLabel")
        .attr("opacity",0)
        .attr("x",xMax/2)
        .attr("y",yMax + 50)
        .transition()
        .duration(transitionSpeed)
        .attr("opacity",1.0)
        .attr("fill","#212121")
        .text("Year")
        .attr("text-anchor","middle");

    //left y axis
    svg.append("g")
        .attr("class","Yaxis")
        .transition()
        .duration(transitionSpeed)
        .call(d3.axisLeft(y));

    // Append Y Axis label
    svg.append("text")
        .attr("class","axisLabel")
        .attr("opacity",0)
        .attr("x",-139)
        .attr("y",yMax /2)
        .transition()
        .duration(transitionSpeed)
        .attr("opacity",1.0)
        .attr("fill","#212121")
        .text("Avgerage Score");

    // Apend heading
    svg.append("text")
        .attr("class","title")
        .text("Average "+category+" Per Year")
        .attr("x",xMax/2)
        .attr("y",-50)
        .attr("fill","#212121")
        .attr("text-anchor","middle");

}

/**
 * Updates the extents to represent the new data and transitions the axes
 * @param {*} data array of [{x,y}] datapoints for the graph
 * @param {*} category the field currently being shown on the graph 
 */
function updateAxes(data, category){

    let tmp = [];

    // Remove old heading
    svg.selectAll(".title")
        .data(tmp)
        .exit()
        .remove()
    
    // Append a new heading
    svg.append("text")
        .attr("class","title")
        .text("Average "+category+" Per Year")
        .attr("x",xMax/2)
        .attr("y",-50)
        .attr("fill","#212121")
        .attr("text-anchor","middle");
    
    // Change the extents so that the axes smoothly transition 
    xExtent = d3.extent( data, datum=>{ return datum.x } );
    yExtent = d3.extent( data, datum=>{ return datum.y } );

    //X Axis
    x.domain([ xExtent[0], xExtent[1] ])
        .range([0, xMax]);

    //Y Axis
    y.domain([ 0, 1 ])
        .range([ yMax, 0]);


    // ----- TRANSITION AXES -----

    svg.selectAll(".Xaxis")
        .transition()
        .duration(transitionSpeed)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")))

    svg.selectAll(".Yaxis")
        .transition()
        .duration(transitionSpeed)
        .call(d3.axisLeft(y))
}

/**
 * Function to draw the line onto the graph, either drawing a fresh line or mergine an existing line to a new line
 * @param {*} data array of [{x,y}] datapoints for the graph
 */
function addLine(data){

    let tmp = [];
    
    // Remove old artifacts 

    svg.selectAll(".marker")
        .data(tmp)
        .exit()
        .remove()

    // ----- MERGE PATHS TO TRANSITION TO NEW GRAPH -----

    var l = svg.selectAll(".line")
        .data([data],datum=>datum.x)

    l.enter()
        .append("path")
        .attr("class","line")
        .merge(l)
        .transition()
        .duration(transitionSpeed)
        .attr("d", d3.line()
        .x(function(datum) { return x(datum.x) })
        .y(function(datum) { return y(datum.y) })
        )
        .attr("stroke", "#1db954")
        .attr("fill", "none")
        .attr("stroke-width", 2.25);

    //https://bl.ocks.org/d3noob/a22c42db65eb00d4e369
    // append hidden tooltip div
    var div = d3.select("body").append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0)

    svg.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class","marker")
        .attr("cx", function (datum) { return x(datum.x) } )
        .attr("cy", function (datum) { return y(datum.y) } )
        .attr("r", 5)
        .attr("stroke","#212121")
        .style("opacity", 0)
        .on("mouseover",function(event,datum){

            // Make the marker visible
            d3.select(this)
                .style("opacity",0.5)
                .attr("fill","#494949");

            //https://bl.ocks.org/d3noob/a22c42db65eb00d4e369
            // Mave the tooltip visible, set its contents and position
            div.transition()		
                .duration(200)		
                .style("opacity", 0.7);	
            
            div	.html(datum.x.getFullYear() + "<br/>"  + datum.y.toFixed(2))	
                .style("left", (event.pageX + 15) + "px")		
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout",function(){
            //Hide marker
            d3.select(this)
                .style("opacity",0);
            //Hide Tooltip
            div.transition()		
                .duration(500)		
                .style("opacity", 0);
        });        
}

/**
 * Function to determine if a point has been selected
 * @param {*} brushArea the extent of the brush area [xmin,xmax]
 * @param {*} x the coordinate of the marker
 * @param {*} date the date associated with this marker
 * @returns 
 */
function isBrushed(brushArea, x, date){
    let x0 = brushArea[0],
        x1 = brushArea[1];

    let id;
    if(x0 <= x && x <= x1){
        id = "selected";
        selectedYears.push(date.getFullYear())
        //console.log(date.getFullYear())
    } else{
        id = "unselected";
    }

    return id;
}

/**
 * Function to either remove or add brushing functionality
 */
function toggleBrush(){
    brushing = !brushing;
    if(brushing){
        //append a brush 
        var brush = svg.append("g")
        .attr("class","brushG")
        .call(d3.brushX()
        .extent([[0,0],[xMax,yMax]])
        .on("end",function(event){
            // Get the limits of the brush area
            extent = event.selection;
            selectedYears = [];
            if(extent != null){
                svg.selectAll(".marker")
                    .attr("id",function(d){
                        return isBrushed(extent,x(d.x), d.x)
                    })
                    buildData(selectedYears, "update");
                }
                d3.select(".brushG").call(d3.brush().clear)
            }
        ));

    } else{
        //remove the brush
        d3.select(".brushG").remove()
    }
}