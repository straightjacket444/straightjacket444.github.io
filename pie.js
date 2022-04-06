// Declare arrays to get readable values from the indexes given in the data
const keys = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const modes = ["Major","Minor"]

// Set Pie radius
const radius = ySize/2;

// Initialise pie variable
let pie = d3.pie()
.sort(null);

// Initialise arc varibles
let keyArc = d3.arc()
    .innerRadius(radius - 100)
    .outerRadius(radius - 50);

let modeArc = d3.arc()
    .innerRadius(radius - 150)
    .outerRadius(radius - 100);


// https://stackoverflow.com/a/56239268
// Add a responsive SVG
const pieSvg = d3.select("body")
    .append("div")
    .attr("class","pie-container")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + xSize + " " + ySize)
    .append("g")
    .attr("transform","translate(" + xSize/2 + "," + radius + ")");

// Define color scales
var segmentColors = d3.scaleLinear().domain([0,11])
    .range(["#494949","#1db954"]);
var fontColor = d3.scaleLinear().domain([0,1])
    .range(["#b3b3b3","#212121"]);

/**
 * Builds the outer pie chart showing the distribution of each individual key signature
 * @param {*} dataset containing number of songs in each key in order, starting with C(0) ending in B(11) [num,num,...,num]
 */
function drawKey(dataset, yearList){ 

    //https://bl.ocks.org/d3noob/a22c42db65eb00d4e369
    // Add hidden tooltip
    var div = d3.select("body").append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0)
        .style("height","55px");

    // Append pie paths
    let path = pieSvg.selectAll(".keyPath")
        .data(pie(dataset))
        .enter().append("path")
        .attr("class","keyPath")
        .attr("fill", function(datum,index){return segmentColors(index)})
        .attr("d", keyArc)
        .attr("stroke","#b3b3b3")
        .attr("stroke-width","1px")
        .on("mouseover", function(event,data){

            //enlarge segment on mouseover
            d3.select(this)
                .transition()
                .ease(d3.easeBounce)
                .duration(1000)
                .attr('d',function(datum){return d3.arc().innerRadius(radius - 100)
                    .outerRadius((radius - 50) + 10)(datum)})
                .attr("stroke","#b3b3b3")
                .attr("stroke-width","2px");
            
            // transition the div
            div.transition()		
                .duration(200)		
                .style("opacity", 0.9)
                .style("background",function(){return segmentColors(data.index)})
                .style("color",function(){ 
                    let ind = 0;
                    if(data.index < 6){
                        ind = 0;
                     } else {
                         ind = 1;
                     }
                    return fontColor(ind)});	
            
            div.html("# of Songs" + "<br/>"  + data.data)	
                .style("left", (event.pageX + 15) + "px")		
                .style("top", (event.pageY - 28) + "px");

        }) .on("mouseout",function(){

            // hide the div
            div.transition()		
                .duration(500)		
                .style("opacity", 0);

            // shrink the segment
            d3.select(this)
                .transition()
                .ease(d3.easeBounce)
                .duration(500)
                .attr('d',function(datum){return d3.arc().innerRadius(radius - 100)
                    .outerRadius(radius - 50)(datum)})
                    .attr("stroke","#b3b3b3")
                    .attr("stroke-width","1px");
        })
        .transition()  // Smoothly interpolate between the old angle and the new angle
        .duration(1000)
        .attrTween("d", function (datum) {
            let i = d3.interpolate(datum.endAngle, datum.startAngle);
            return function (time) {
            datum.startAngle = i(time);
            return keyArc(datum);
            }
        });
    
    // Add the label to each arc
    pieSvg.selectAll('arcs')
        .data(pie(dataset))
        .enter()
        .append('text')
        .attr("class","pieLabel")
        .text(function(datum,index){return keys[index]})
        .attr("transform", function(datum) {return "translate(" + keyArc.centroid(datum) + ")";  })
        .style("text-anchor", "middle")
        .style("font-size", 17)
    
    // Add the title to the pie chart 
    pieSvg.append("text")
        .attr("x",0)
        .attr("y",-150)
        .attr("class","pieTitle")
        .text("Key Signature Distribution from "+ d3.min(yearList)+ " to " + d3.max(yearList))
        .attr("text-anchor","middle")
    
}

/**
 * Draws the inner pie chart showing distribution of major and minor key
 * @param {*} dataset containing number of songs in a major key and minor key: [major,minor]
 */
function drawMode(dataset){ 
    //https://bl.ocks.org/d3noob/a22c42db65eb00d4e369
    //Append tooltip
    var div = d3.select("body").append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0)
        .style("height","55px");

    // Append pie paths
    let path = pieSvg.selectAll(".modePath")
        .data(pie(dataset))
        .enter().append("path")
        .attr("class","modePath")
        .attr("fill", function(datum,index){
            if(index == 0){
                return segmentColors(11)
            } else{
                return segmentColors(0)
            }
            })
        .attr("d", modeArc)
        .attr("stroke","#b3b3b3")
        .attr("stroke-width","1px")
        .on("mouseover", function(event,data){

            // enlarge the arc on mouseover 
            d3.select(this)
                .transition()
                .ease(d3.easeBounce)
                .duration(1000)
                .attr('d',function(datum){return d3.arc().innerRadius((radius - 150))
                    .outerRadius((radius - 100)-10)(datum)})
                .attr("stroke","#b3b3b3")
                .attr("stroke-width","2px");
            
            // make the tooltip visible
            div.transition()		
                .duration(200)		
                .style("opacity", 0.9)
                .style("background",function(){
                    if(data.index == 0){
                    return segmentColors(11)
                    } else{
                        return segmentColors(0)
                    }})
                .style("color",function(){
                    let color; 
                    if(data.index ==1){
                        color = "#b3b3b3"
                    } else{
                        color = "#212121"
                    }
                    return color});	
            
            div.html("# of Songs" + "<br/>"  + data.data)	
                .style("left", (event.pageX + 15) + "px")		
                .style("top", (event.pageY - 28) + "px");

        }) .on("mouseout",function(){
            // hide the tooltip
            div.transition()		
                .duration(500)		
                .style("opacity", 0);
            //shrink the pie
            d3.select(this)
                .transition()
                .ease(d3.easeBounce)
                .duration(500)
                .attr('d',function(datum){return d3.arc().innerRadius(radius - 150)
                    .outerRadius(radius - 100)(datum)})
                    .attr("stroke","#b3b3b3")
                    .attr("stroke-width","1px");
        })
        .transition()  // Smoothly interpolate between the old angle and the new angle
        .duration(1000)
        .attrTween("d", function (datum) {
            let i = d3.interpolate(datum.endAngle, datum.startAngle);
            return function (time) {
            datum.startAngle = i(time);
            return modeArc(datum);
            }
        });

    // add label
    pieSvg.selectAll('arcs')
        .data(pie(dataset))
        .enter()
        .append('text')
        .attr("class","pieLabel")
        .text(function(datum,index){return modes[index]})
        .attr("transform", function(datum) {return "translate(" + modeArc.centroid(datum) + ")";  })
        .style("text-anchor", "middle")
        .style("font-size", 17);
    
}

/**
 * Transition the current data in the key pie chart to the new data 
 * @param {*} dataset array containing the count of key signatures [num,num,...,num]
 * @param {*} yearList list of selected years
 */
function updateKey(dataset, yearList){
    
    // Tween the path to change the pie chart
    let path = pieSvg.selectAll(".keyPath")
        .data(pie(dataset))
        .transition()
        .duration(1000)
        .attrTween("d", function(datum){

            //https://bl.ocks.org/jonsadka/fa05f8d53d4e8b5f262e

            var interpolar = d3.interpolate(this._current, datum);
            this._current = interpolar(0);
            return function(time) {
                return keyArc(interpolar(time));
            };
        });
    
    // ----- remove old titles and labels and append new ones -----
    let arr = [];
    d3.selectAll(".pieTitle")
        .data(arr)
        .exit()
        .remove();
    
    d3.selectAll(".pieLabel")
        .data(arr)
        .exit()
        .remove();

    pieSvg.append("text")
        .attr("x",0)
        .attr("y",-150)
        .attr("class","pieTitle")
        .text("Key Signature Distribution from "+ d3.min(yearList)+ " to " + d3.max(yearList))
        .attr("text-anchor","middle");

    pieSvg.selectAll('arcs')
        .data(pie(dataset))
        .enter()
        .append('text')
        .attr("class","pieLabel")
        .text(function(datum,index){return keys[index]})
        .attr("transform", function(datum) {return "translate(" + keyArc.centroid(datum) + ")";  })
        .style("text-anchor", "middle")
        .style("font-size", 17);
    
}

/**
 * Transition the current data in the mode pie chart to the new data 
 * @param {*} dataset array containing the count of modes [num,num]
 * @param {*} yearList list of selected years
 */
function updateMode(dataset){

    // Tween the path to change the pie chart
    let path = pieSvg.selectAll(".modePath")
        .data(pie(dataset))
        .transition()
        .duration(1000)
        .attrTween("d", function(datum){

            //https://bl.ocks.org/jonsadka/fa05f8d53d4e8b5f262e

            var interpolar = d3.interpolate(this._current, datum);
            this._current = interpolar(0);
            return function(time) {
                return modeArc(interpolar(time));
            };
        });
    
    // ----- remove old titles and labels and append new ones -----
    pieSvg.selectAll('arcs')
        .data(pie(dataset))
        .enter()
        .append('text')
        .attr("class","pieLabel")
        .text(function(datum,index){return modes[index]})
        .attr("transform", function(datum) {return "translate(" + modeArc.centroid(datum) + ")";  })
        .style("text-anchor", "middle")
        .style("font-size", 17);
}