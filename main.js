let loc = "https://raw.githubusercontent.com/cd94/f20dv_lab4/master/data.csv";

let dataMap = new Map();
let keyMap = new Map();
let MajMinMap = new Map();
let SongMap = new Map();

let acousticness = [];
let danceability = [];
let energy = [];
let instrumentalness = [];
let liveness = [];
let speechiness = [];
let KeyPie = [];
let ModePie= [];
let scatter = [];
let PopList = [];

let first = {id:"",pop:0};
let second = {id:"",pop:0};
let third = {id:"",pop:0};
let fourth = {id:"",pop:0};


let yearList = [];

let currCategory = "Acousticness"

const data = ["Acousticness", "Danceability", "Energy", "Instrumentalness", "Liveness", "Speechiness"]

// Dropdown found at: https://stackoverflow.com/questions/33777272/creating-a-drop-down-with-d3-js
const dropdown = d3.select("body")
    .append("div")
    .attr("class","dropdown-container")
    .append("select")
    .attr("class","selection")

const options = dropdown.selectAll("option")
    .data(data)
    .enter()
    .append("option")

const button = d3.select(".dropdown-container")
        .append("input")
        .attr("type","button")
        .attr("class","resetButton")
        .attr("value","Reset Zoom")
        .attr("onclick","buildData(yearList,\"update\")");

options.text(data=>data)
    .attr("value", data=>data)

d3.select("select")
    .on("change",()=>{ var selected = d3.select("select").node().value; onSelection(selected);})

d3.csv(loc,function(data){
    return data;
}).then(function(data){

    console.log("reading data...");

    let year = "1928";
    let yearSongs = [];

    for(let i = 0; i<data.length;i++){
        if(data[i].release_date.split("-")[0] == year){
            yearSongs.push(data[i]);
        } else{
            dataMap.set(year,yearSongs);
            yearSongs = [];
            year = data[i].release_date.split("-")[0];
            yearSongs.push(data[i]);
        }
        SongMap.set(data[i].id,data[i]);
    }

    // Value is unused but must remain as the first variable of a function in a for each is always the value
    dataMap.forEach(function(value,key){
        let date = new Date(`${key}-01-01`)
        yearList.push(date.getFullYear())
    });

    yearList.sort(function(firstItem,secondItem){
        return firstItem.x - secondItem.x;
    });


    console.log("data imported.");

    console.log("building datasets...");
    
    buildData(yearList,"init","acousticness");

    console.log("datasets built.");
});

/**
 * Updates the line chart with the values for the specified field
 * @param {*} selected category returned from the selection of the dropdown menu
 */
function onSelection(selected){
    switch(selected){
        case "Acousticness" :
            // Set the global current category
            currCategory = "Acousticness";
            // Update the axes and add line
            updateAxes(acousticness, "Acousticness");
            addLine(acousticness);
            // Update the scatter 
            buildData(yearList,"scatter","acousticness");
            break;
        case "Danceability" :
            currCategory = "Danceability";
            updateAxes(danceability, "Danceability");
            addLine(danceability);
            buildData(yearList,"scatter","danceability");
            break;
        case "Energy" :
            currCategory = "Energy";
            updateAxes(energy, "Energy");
            addLine(energy);
            buildData(yearList,"scatter","energy");
            break;
        case "Instrumentalness" :
            currCategory = "Instrumentalness";
            updateAxes(instrumentalness, "Instrumentalness");
            addLine(instrumentalness);
            buildData(yearList,"scatter","instrumentalness");
            break;
        case "Liveness" :
            currCategory = "Liveness";
            updateAxes(liveness, "Liveness");
            addLine(liveness);
            buildData(yearList,"scatter","liveness");
            break;
        case "Speechiness" :
            currCategory = "Speechiness";
            updateAxes(speechiness, "Speechiness");
            addLine(speechiness);
            buildData(yearList,"scatter","speechiness");
            break;
    }
}

/**
 * Function to populate all of the arrays for ranged data: acousticness, danceability, energy, instrumentalness, liveness and speechiness.
 * @param {*} years The range of years selected using brushing, default 1921-2020
 * @param {*} update string value determining how to update the graphs
 */
function buildData(years,update,category){

    // ----- EMPTY INTERIM ARRAYS, MAPS AND VARIABLES -----
    acousticness = [];
    danceability = [];
    energy = [];
    instrumentalness = [];
    liveness = [];
    speechiness = [];
    KeyPie = [];
    ModePie = [];
    scatter = [];
    PopList = [];

    keyMap.clear();
    MajMinMap.clear();
   
    first = {id:"",pop:0};
    second = {id:"",pop:0};
    third = {id:"",pop:0};
    fourth = {id:"",pop:0};


    // for each element in the data map, check if the year is in the selcted range and then build the datasets
    dataMap.forEach(function(value,key){
        let date = new Date(`${key}-01-01`)
        if(years.includes(date.getFullYear())){
            buildAcousticData(value,key);
            buildDanceData(value,key);
            buildEnergyData(value,key);
            buildInstrumentalData(value,key);
            buildLivenessData(value,key);
            buildSpeechinessData(value,key);

            buildKeyData(value,key);

            buildScatterData(value,category);
        }
    });

    
    // for eachn element in the song map, check if the year is in the selected range and then populate popularity variables
    SongMap.forEach(function(value,key){
        let date = new Date(`${value.year}-01-01`)
        if(years.includes(date.getFullYear())){
            buildPopularityData(value,key)
        }
    })

    // once variables are populated, add them to the list

    PopList.push(SongMap.get(first.id),SongMap.get(second.id),SongMap.get(third.id),SongMap.get(fourth.id))

    // Push from map to array and then order

    keyMap.forEach(function(value,key){
        KeyPie.push({x:key,y:value});
    });

    MajMinMap.forEach(function(value,key){
        ModePie.push(value);
    });

    KeyPie.sort(function(a,b){
        return a.x - b.x;
    })

    // remove unnecessary key 
    for(let i = 0; i<KeyPie.length; i++){
        let val = KeyPie[i].y
        KeyPie[i] = val;
    }

    // if init, initialise the pie charts and draw the axes, if scatter update the scatter plot, if update, update the remaining plots
    if(update == "init"){
        drawMode(ModePie);
        drawKey(KeyPie,years);

        setupAxes(acousticness, currCategory);

        setupScatterAxes(scatter);
        updateScatterChart(scatter, currCategory);

        addLine(acousticness);

        updateList(PopList,years);

    } else if(update == "scatter"){
        updateScatterChart(scatter, currCategory);

    } else if(update == "update"){

        updateKey(KeyPie,years);
        updateMode(ModePie);

        updateList(PopList,years);

        onSelection(currCategory);

    }
    
}

/**
 * Populates the Acousticness array with pairs {year, average acousticness}
 * @param {*} array of songs from a specific year
 * @param {*} string given year for the data array
 */
function buildAcousticData(data,year){
    
    let acouSum = 0;

    for(let i = 0; i<data.length; i++){   
        acouSum += parseFloat(data[i].acousticness);
    }
    let acouAvg = acouSum/data.length;

    let date = new Date(`${year}-01-01`)

    acousticness.push({x:date,y:acouAvg});

    acousticness.sort(function(a,b){
        return a.x - b.x;
    })
}

/**
 * Populates the Danceability array with pairs {year, average danceability
 * @param {*} array of songs from a specific year
 * @param {*} string given year for the data array
 */
function buildDanceData(data,year){
    
    let danceSum = 0;

    for(let i = 0; i<data.length; i++){   
        danceSum += parseFloat(data[i].danceability);
    }
    let danceAvg = danceSum/data.length;

    let date = new Date(`${year}-01-01`)
    
    danceability.push({x:date,y:danceAvg});

    danceability.sort(function(a,b){
        return a.x - b.x;
    })
}

/**
 * Populates the Energy array with pairs {year, average energy
 * @param {*} array of songs from a specific year
 * @param {*} string given year for the data array
 */
function buildEnergyData(data,year){
    
    let energySum = 0;

    for(let i = 0; i<data.length; i++){   
        energySum += parseFloat(data[i].energy);
    }
    let energyAvg = energySum/data.length;

    let date = new Date(`${year}-01-01`)
    
    energy.push({x:date,y:energyAvg});

    energy.sort(function(a,b){
        return a.x - b.x;
    })
}

/**
 * Populates the Instrumentalness array with pairs {year, average instrumentalness
 * @param {*} array of songs from a specific year
 * @param {*} string given year for the data array
 */
function buildInstrumentalData(data,year){
    
    let instrumentalSum = 0;

    for(let i = 0; i<data.length; i++){   
        instrumentalSum += parseFloat(data[i].instrumentalness);
    }
    let instrumentalAvg = instrumentalSum/data.length;

    let date = new Date(`${year}-01-01`)
    
    instrumentalness.push({x:date,y:instrumentalAvg});

    instrumentalness.sort(function(a,b){
        return a.x - b.x;
    })
}

/**
 * Populates the Liveness array with pairs {year, average liveness
 * @param {*} array of songs from a specific year
 * @param {*} string given year for the data array
 */
function buildLivenessData(data,year){
    
    let liveSum = 0;

    for(let i = 0; i<data.length; i++){   
        liveSum += parseFloat(data[i].liveness);
    }
    let liveAvg = liveSum/data.length;

    let date = new Date(`${year}-01-01`)
    
    liveness.push({x:date,y:liveAvg});

    liveness.sort(function(a,b){
        return a.x - b.x;
    })
}

/**
 * Populates the Speechiness array with pairs {year, average speechiness
 * @param {*} array of songs from a specific year
 * @param {*} string given year for the data array
 */
function buildSpeechinessData(data,year){
    
    let speechSum = 0;

    for(let i = 0; i<data.length; i++){   
        speechSum += parseFloat(data[i].speechiness);
    }
    let speechAvg = speechSum/data.length;

    let date = new Date(`${year}-01-01`)
    
    speechiness.push({x:date,y:speechAvg});

    speechiness.sort(function(a,b){
        return a.x - b.x;
    })
}

/**
 * Populates the keyMap with counts of each key signature 
 * @param {*} array of songs from a specific year
 */
function buildKeyData(data){

    for(let i = 0; i<data.length; i++){
        let base = parseInt(data[i].key);
        if(keyMap.get(base) == null){
            keyMap.set(base, 1);
        } else{
            keyMap.set(base, keyMap.get(base)+1);
        }
        
        let mode = parseInt(data[i].mode);
        if(MajMinMap.get(mode) == null){
            MajMinMap.set(mode, 1);
        } else{
            MajMinMap.set(mode, MajMinMap.get(mode)+1);
        }
    }
}

/**
 * Build Data for scatter plot [{float,float,string},...]
 * @param {*} data array of songs from a specific year
 * @param {*} field string describing the comparator field (what variable the scatter plot will compare with tempo)
 */
function buildScatterData(data,field){
    for(let i=0; i<data.length; i++){
        if(parseFloat(data[i][field]) > 0.05 && parseFloat(data[i][field]) < 0.95 ){
            scatter.push({x:parseFloat(data[i][field]),y:parseFloat(data[i].tempo),z:data[i].name});
        }
        i = i*2;
    }
}

/**
 * Set the first->fourth most popular songs in a given year range
 * @param {*} data Individual song enrty
 * @param {*} id The ID of the given song
 */
function buildPopularityData(data, id){

    if(data.popularity>first.pop){
        first.id = id;
        first.pop = data.popularity; 
    } else if(data.popularity>second.pop){
        second.id = id;
        second.pop = data.popularity; 
    } else if(data.popularity>third.pop){
        third.id = id;
        third.pop = data.popularity; 
    } else if(data.popularity>fourth.pop){
        fourth.id = id;
        fourth.pop = data.popularity; 
    } 
}