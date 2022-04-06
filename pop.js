// https://stackoverflow.com/a/56239268
// Add a responsive SVG
const listSvg = d3.select("body")
    .append("div")
    .attr("class","list-container")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + xSize + " " + ySize)
    .append("g")
    .attr("transform","translate(" + margin + "," + 75 + ")");

// API Access token

// ----- THIS TOKEN IS TEMPORARY AND WILL REQUIRE UPDATING FROM THE SPOTIFY CONSOLE -----
// ----- SPOTIFY CONSOLE: https://developer.spotify.com/console/get-track/?id -----
const token = "BQBtycdhusFjEQHeX-2x7MgPMxCO2Q_OhLRJXwyOsniB1xYOY5GLsR8kikG0meWAKX3k8Sp9I_8dLQYl56R1nVaZnw7mUmmlAEfesxACDtqudgVBqbeBow5JbhZ0eDZoehfJByMcP5Fgklk";

/**
 * Updates the current list of most popular songs
 * @param {*} data list of songs
 * @param {*} yearList year range
 */
function updateList(data,yearList){

    // Fade out old text
    listSvg.selectAll("text")
        .attr("opacity",1)
        .transition()
        .duration(transitionSpeed)
        .attr("opacity",0)

    // Append header
    listSvg.append("text")
        .attr("x", xMax/2)
        .attr("y",-50)
        .attr("class","listLabel")
        .text("Most Popular Songs from " + d3.min(yearList) + " to " + d3.max(yearList))
        .attr("text-anchor","middle")
        .attr("opacity",0)
        .transition()
        .duration(transitionSpeed)
        .attr("opacity",1);
    
    
    d3.selectAll(".listitem")
        .remove();
    

    // Initialise the preview with the most popular song
    initPreview(data[0])
    
    for(let i = 0; i<data.length; i++){

        // Append each item to the list
        listSvg.append("text")
            .attr("x", -125)
            .attr("y",(75 * i))
            .attr("class","listitem")
            .style("font-size",()=>(20-2*i)+"px")
            .text((i+1) + ". " + data[i].name)
            .on("mouseover",function(){
                // on mouseover, update the preview
                initPreview(data[i]);

                d3.select(this).style("cursor", "pointer");

            })
            .on("click",function(){
                getLink(data[i])
            });
    }
   
}

/**
 * appends the text for each individual song and gets their album cover
 * @param {*} data individual song
 */
function initPreview(data){

    // Get the album Cover
    getAlbumCover(data)

    // Remove the old label
    d3.selectAll(".previewText")
        .remove();

    // ----- Append new labels -----
    listSvg.append("text")
        .attr("class","previewText")
        .attr("x",xMax-50)
        .attr("y",150)
        .text("Artist(s): " + data.artists)
        .attr("text-anchor","middle")
    
    listSvg.append("text")
        .attr("class","previewText")
        .attr("x",xMax-50)
        .attr("y",187.5)
        .text("Popularity: " + data.popularity)
        .attr("text-anchor","middle")
    
    listSvg.append("text")
        .attr("class","previewText")
        .attr("x",xMax-50)
        .attr("y",225)
        .text("Released: " + data.release_date)
        .attr("text-anchor","middle")




}

/**
 * Function to get the album cover for each song
 * @param {*} data individual song
 */
function getAlbumCover(data){
    
    // Define the endpoint
    let url = "https://api.spotify.com/v1/tracks/" + data.id;

    // Using XHR https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest 
    // Open a new GET request
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    // https://developer.spotify.com/documentation/web-api/reference/#/operations/get-track
    // Append requisite headers
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    // Check for statechange
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            
            // Parse JSON response
            let response = xhr.responseText;
            let jsonResponse = JSON.parse(response)
            let image = jsonResponse["album"]["images"][1]["url"];

            // Remove old image
            d3.select("#image")
                .remove();

            // Append new album cover
            listSvg
                .append("svg:image")
                .attr("xlink:href", image)
                .attr("width", 150)
                .attr("height", 150)
                .attr("x", xMax - 125)
                .attr("y", -25)
                .attr("id","image");

            // ----- remove old artefacts -----
            d3.selectAll("audio")
                .remove();

            d3.select("#audio-container")
                .selectAll("p")
                .remove();

            // https://stackoverflow.com/a/46761870 
            
            // Add current title label
            d3.select("#audio-container")
                .append("p")
                .text("Current track: " + data.name)
                .style("color","#1db954")

            // Add HTML audio element    
            d3.select("#audio-container")
                .append("audio")
                .attr("controls","controls")
                    .append("source")
                    .attr("src",jsonResponse["preview_url"]) // Set the source to be the spotify preview found in the JSON response
                    .attr("type","audio/mpeg")

        }
    };
    // Send Request
    xhr.send();
}

/**
 * Function to open the song in spotify in a new tab
 * @param {*} data individual song
 */
function getLink(data){
     // Define the endpoint
     let url = "https://api.spotify.com/v1/tracks/" + data.id;

     // Using XHR https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest 
     // Open a new GET request
     let xhr = new XMLHttpRequest();
     xhr.open("GET", url);
    
     // https://developer.spotify.com/documentation/web-api/reference/#/operations/get-track
     // Append requisite headers
     xhr.setRequestHeader("Accept", "application/json");
     xhr.setRequestHeader("Content-Type", "application/json");
     xhr.setRequestHeader("Authorization", `Bearer ${token}`);
     
    
     // Check for statechange
     xhr.onreadystatechange = () => {
         if (xhr.readyState === 4) {
             
             // Parse JSON response
             let response = xhr.responseText;
             let jsonResponse = JSON.parse(response)
             let link = jsonResponse["external_urls"]["spotify"];

             // open spotify in a new window
             window.open(link)
         }
     };
     // Send Request
     xhr.send();
}