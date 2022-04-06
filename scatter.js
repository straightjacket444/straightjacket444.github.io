/* Get the 'limits' of the data - the full extent (mins and max)
so the plotted data fits perfectly */

let xExtentScat;
let yExtentScat;


//X Axis
let xScat = d3.scaleLinear();

//Y Axis
let yScat = d3.scaleLinear();

// https://stackoverflow.com/a/56239268
// Add a responsive SVG
const scatSvg = d3.select("body")
    .append("div")
    .attr("class","scatter-container")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + xSize + " " + ySize)
    .append("g")
    .attr("transform","translate(" + margin + "," + 75 + ")");

/**
 * Setup the axes, the axes do not need to be updated for this plot so this is run once on init 
 * @param {*} data array of data [{tempo,field,song_name},...]
 */
function setupScatterAxes(data){

    /* Get the 'limits' of the data - the full extent (mins and max)
    so the plotted data fits perfectly */

    xExtentScat = d3.extent( data, datum=>{ return datum.x } );
    yExtentScat = d3.extent( data, datum=>{ return datum.y } );

    //X Axis
    xScat.domain([ xExtentScat[0], xExtentScat[1] ])
        .range([0, xMax]);

    //Y Axis
    yScat.domain([ 0, yExtentScat[1] ])
        .range([ yMax, 0]);

    //Bottom axis
    scatSvg.append("g")
        .attr("transform", "translate(0," + yMax + ")")
        .attr("class","ScatterXaxis")
        .transition()
        .duration(transitionSpeed)
        .call(d3.axisBottom(xScat))

    //left y axis
    scatSvg.append("g")
        .attr("class","ScatterYaxis")
        .transition()
        .duration(transitionSpeed)
        .call(d3.axisLeft(yScat));


}

/**
 * Update the points on the chart
 * @param {*} data array of data [{tempo,field,song_name},...]
 * @param {*} category The field being selected
 */
function updateScatterChart(data, category){

    var myColor = d3.scaleLinear().domain([0,212])
        .range(["dodgerblue","#1db954"]);
    
    // ----- Remove old labels and scatter points -----
    let arr = [];
    
    scatSvg.selectAll(".chartLabel")
        .data(arr)
        .exit()
        .remove();
    
    scatSvg.selectAll(".scatterPoint")
        .data(arr)
        .exit()
        .remove();

    // ----- Append chart title and axis labels -----

    scatSvg.append("text")
        .attr("x", xMax/2 - 50)
        .attr("y", yMax + 50)
        .attr("class","chartLabel")
        .text(category)

    scatSvg.append("text")
        .attr("x", "-137.5")
        .attr("y", yMax/2)
        .attr("class","chartLabel")
        .text("Tempo (bpm)")

    scatSvg.append("text")
        .attr("x", xMax/2)
        .attr("y",-50)
        .attr("class","chartLabel")
        .text(category + " against Tempo")
        .attr("text-anchor","middle")

    //https://bl.ocks.org/d3noob/a22c42db65eb00d4e369
    // Append the tooltip
    var div = d3.select("body").append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0);

    // Append new points
    scatSvg.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class","scatterPoint")
        .attr("cx", function (datum) { return xScat(datum.x) } ) // Set x and y values using the data
        .attr("cy", function (datum) { return yScat(datum.y) } )
        .attr("r", 5)
        .attr("fill", function(datum) { return myColor(datum.y) } ) // Set the color using the color scale passed in
        .attr("stroke","#212121")
        .attr("opacity","0.3")
        .on("mouseover",function(event,datum){

            // enlarge and decrease opacity
            d3.select(this)
                .transition()
                .duration(500)
                .ease(d3.easeBounce)
                .attr("opacity", "1")
                .attr("r",10);
            
            //https://bl.ocks.org/d3noob/a22c42db65eb00d4e369

            // Make the tooltip div appear and set its scale
            div.transition()		
                .duration(200)		
                .style("opacity", 0.7)
                .style("height","fit-content")
                .style("width","fit-content");	
            
            // Set the content for the tooltip
            div.html("<b>" + datum.z + "</b>" + "<br/>"  + category + ": "+ datum.x.toFixed(2) + "<br/>" + "Tempo: " + datum.y.toFixed(2))	
                .style("left", (event.pageX + 25) + "px")		
                .style("top", (event.pageY - 28) + "px");
           
    
        })
        .on("mouseout",function(){
            
            // Re-size the markers
            d3.select(this)
                .transition()
                .duration(500)
                .ease(d3.easeBounce)
                .attr("r",5)
                .attr("opacity","0.3");

            //Hide the tooltip
            div.transition()		
                .duration(500)		
                .style("opacity", 0);
            
        });
    

}