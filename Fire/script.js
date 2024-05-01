// Function to fetch GeoJSON
async function fetchGeoJSON() {
    const response = await fetch('Fire\massachusetts.geojson');
    return await response.json();
}

// Function to fetch fire incident data
async function fetchData() {
    const apiUrl = "https://data.boston.gov/api/3/action/datastore_search_sql";
    const sqlQuery = `SELECT * FROM "resource_id" WHERE "date" >= '${lastWeek}'`; // Update 'resource_id' and 'date' field name appropriately
    const response = await fetch(`${apiUrl}?sql=${encodeURIComponent(sqlQuery)}`);
    const data = await response.json();
    return data.result.records;
}

// Load the map of Massachusetts
fetchGeoJSON().then(function(maMap) {
    // Set up map projection and SVG
    const projection = d3.geoMercator().fitSize([960, 600], maMap);
    const svg = d3.select("#map").append("svg")
        .attr("width", 960)
        .attr("height", 600);

    // Draw the map
    svg.selectAll("path")
        .data(maMap.features)
        .enter().append("path")
        .attr("d", d3.geoPath().projection(projection))
        .attr("fill", "#ccc");

    // Fetch and display the fire incident data
    fetchData().then(data => {
        svg.selectAll(".fireTruck")
            .data(data)
            .enter().append("image")
            .attr("xlink:href", "fire_truck_emoji.png")
            .attr("width", 20)
            .attr("height", 20)
            .attr("x", d => projection([d.longitude, d.latitude])[0])
            .attr("y", d => projection([d.longitude, d.latitude])[1]);
    });
});

// Call fetchData every 10 minutes to update the map
setInterval(fetchData, 600000);
