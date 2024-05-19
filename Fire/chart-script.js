// Function to fetch data
async function fetchData(sqlQuery) {
    const url = `https://data.boston.gov/api/3/action/datastore_search_sql?sql=${encodeURIComponent(sqlQuery)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.result.records;
}


// Function to process data for a chart
function processData(records, key, map = null) {
    const counts = {};
    records.forEach(record => {
        let value = record[key];
        if (map && map[value]) {
            value = map[value];
        }
        if (value) {
            counts[value] = (counts[value] || 0) + 1;
        }
    });
    return counts;
}


// Function to create a pie chart
function createPieChart(ctx, title, labels, data) {
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        }
    });
}


// Function to create a chart with a logarithmic scale
function createLogScaleChart(ctx, type, title, labels, data) {
    
    return new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'logarithmic',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Logarithmic Scale'
                    }
                },
                x: {
                    beginAtZero: true,
                    ticks: {
                        maxRotation: 90,
                        minRotation: 45
                    }
                }
            },
            plugins: {
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
}

// Function to setup the quiz
function setupQuiz() {
    const quiz = document.getElementById('quiz');
    quiz.innerHTML = `
        <p>What should you do if your clothes catch fire? 🔥</p>
        <input type="radio" id="stop" name="fire" value="stop"><label for="stop">Stop, Drop, and Roll</label><br>
        <input type="radio" id="run" name="fire" value="run"><label for="run">Run</label><br>
        <p>Where should you aim a fire extinguisher? 🧯</p>
        <input type="radio" id="base" name="extinguisher" value="base"><label for="base">At the base of the fire</label><br>
        <input type="radio" id="top" name="extinguisher" value="top"><label for="top">At the top of the flames</label><br>
        <p>What is the emergency number for fire services? ☎️</p>
        <input type="radio" id="911" name="number" value="911"><label for="911">911</label><br>
        <input type="radio" id="112" name="number" value="112"><label for="112">112</label><br>
        <p>What should you do if you see smoke while escaping a fire? 🚪</p>
        <input type="radio" id="crawl" name="smoke" value="crawl"><label for="crawl">Crawl on the floor</label><br>
        <input type="radio" id="stand" name="smoke" value="stand"><label for="stand">Stand up and run</label><br>
        <p>How often should you check your smoke alarms? 🕒</p>
        <input type="radio" id="monthly" name="alarms" value="monthly"><label for="monthly">Monthly</label><br>
        <input type="radio" id="yearly" name="alarms" value="yearly"><label for="yearly">Yearly</label><br>
        <p>What is the first thing you should do when you hear a fire alarm in a building? 🔊</p>
        <input type="radio" id="evacuate" name="alarm" value="evacuate"><label for="evacuate">Evacuate immediately</label><br>
        <input type="radio" id="investigate" name="alarm" value="investigate"><label for="investigate">Investigate the source of the alarm</label><br>
        <p>What should you do if you are trapped in a burning building? 🏢</p>
        <input type="radio" id="signal" name="trapped" value="signal"><label for="signal">Signal for help at a window</label><br>
        <input type="radio" id="hide" name="trapped" value="hide"><label for="hide">Hide in a corner</label><br>
    `;
}

// Function to submit the quiz
function submitQuiz() {
    const correctAnswers = {
        fire: 'stop',
        extinguisher: 'base',
        number: '911',
        smoke: 'crawl',
        alarms: 'monthly',
        alarm: 'evacuate',
        trapped: 'signal'
    };
    
    let score = 0;
    let total = 7;
    let answered = false;
    const incorrectAnswers = [];

    for (let key in correctAnswers) {
        const answer = document.querySelector(`input[name="${key}"]:checked`);
        if (answer) {
            answered = true;
            const label = answer.nextElementSibling;
            if (answer.value === correctAnswers[key]) {
                score++;
                label.style.color = 'green';
            } else {
                label.style.color = 'red';
                incorrectAnswers.push(key);
            }
            answer.checked = false; // Uncheck the selected answer
        }
    }

    if (!answered) {
        alert("No answer is selected. It's important to test your knowledge on fire safety!");
        return;
    }

    incorrectAnswers.forEach(key => {
        const correctAnswer = document.querySelector(`input[name="${key}"][value="${correctAnswers[key]}"]`);
        correctAnswer.nextElementSibling.style.color = 'green';
    });
    
    const resultMessage = `You scored ${score} out of ${total}.`;
    document.getElementById('quiz-result').textContent = resultMessage;

    // Reset incorrect answers after 7 seconds
    setTimeout(() => {
        incorrectAnswers.forEach(key => {
            const options = document.querySelectorAll(`input[name="${key}"]`);
            options.forEach(option => {
                option.nextElementSibling.style.color = ''; // Reset color
            });
        });
    }, 3000);
}

// Main function to render charts
async function renderCharts() {
    const incidentTypeSql = `SELECT * from "91a38b1f-8439-46df-ba47-a30c48845e06" WHERE "incident_description" IS NOT NULL`;
    const districtSql = `SELECT * from "91a38b1f-8439-46df-ba47-a30c48845e06" WHERE "district" IS NOT NULL`;
    const neighborhoodSql = `SELECT * from "91a38b1f-8439-46df-ba47-a30c48845e06" WHERE "neighborhood" IS NOT NULL`;
    const fireIncidentSql = `SELECT * from "91a38b1f-8439-46df-ba47-a30c48845e06" WHERE "incident_type" LIKE '1%'`;

    // Incident Type Chart
    const incidentRecords = await fetchData(incidentTypeSql);
    const incidentTypeCounts = processData(incidentRecords, 'incident_description');
    const incidentTypeCtx = document.getElementById('incidentTypeChart').getContext('2d');
    let incidentTypeChart = createLogScaleChart(incidentTypeCtx, 'bar', 'Incident Types', Object.keys(incidentTypeCounts), Object.values(incidentTypeCounts));



    // Event listener for chart type toggle
    document.getElementById('toggleChartType').addEventListener('click', function() {
        const currentType = incidentTypeChart.config.type;
        const newType = currentType === 'bar' ? 'line' : 'bar';
        incidentTypeChart.destroy();
        incidentTypeChart = createLogScaleChart(incidentTypeCtx, newType, 'Incident Types', Object.keys(incidentTypeCounts), Object.values(incidentTypeCounts));
    });

    // Display top incident
    const topIncident = Object.entries(incidentTypeCounts).sort(([,a], [,b]) => b - a)[0];
    document.getElementById('topIncident').innerText = `Top Incident: ${topIncident[0]} (${topIncident[1]} incidents)`;

    // Event listener for top 10 incidents toggle
    document.getElementById('toggleTop10').addEventListener('click', function() {
        const top10 = Object.entries(incidentTypeCounts).sort(([,a], [,b]) => b - a).slice(0, 10);
        const top10Labels = top10.map(entry => entry[0]);
        const top10Data = top10.map(entry => entry[1]);
        incidentTypeChart.destroy();
        incidentTypeChart = createLogScaleChart(incidentTypeCtx, 'bar', 'Top 10 Incident Types', top10Labels, top10Data);
    });
    
    

    // Neighborhood Pie Chart
    const neighborhoodRecords = await fetchData(neighborhoodSql);
    const neighborhoodCounts = processData(neighborhoodRecords, 'neighborhood');
    const neighborhoodCtx = document.getElementById('neighborhoodPieChart').getContext('2d');
    createPieChart(neighborhoodCtx, 'Incidents by Neighborhood', Object.keys(neighborhoodCounts), Object.values(neighborhoodCounts));

   

    setupQuiz();
}

renderCharts();


var map = L.map('mapHydrant').setView([42.3601, -71.0589], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 18,
}).addTo(map);

var markers = L.layerGroup().addTo(map);

function addMarkers(data) {
    markers.clearLayers();
    data.forEach(function(hydrant) {
        var marker = L.marker([hydrant.Y, hydrant.X]).bindPopup(
            'Hydrant ID: ' + hydrant._id + '<br>' +
            'Address: ' + hydrant.ADDRESS_NU + ' ' + hydrant.STREET_FEA + '<br>' +
            'Owner Code: ' + hydrant.OWNER_CODE
        );
        markers.addLayer(marker);
    });
}

document.getElementById('yearSelect').addEventListener('change', function() {
    var year = this.value;
    if (year) {
        var sqlQuery = encodeURIComponent(`SELECT * FROM "1479a183-dde0-46a6-a828-f526df010a03" WHERE "MANUFACTUR" LIKE '${year}'`);
        axios.get(`https://data.boston.gov/api/3/action/datastore_search_sql?sql=${sqlQuery}`)
            .then(function(response) {
                addMarkers(response.data.result.records);
            })
            .catch(function(error) {
                console.error('Error fetching data:', error);
            });
    } else {
        markers.clearLayers();
    }
});

// Initially fetch all data to populate year dropdown
var initialSql = encodeURIComponent(`SELECT * FROM "1479a183-dde0-46a6-a828-f526df010a03"`);
axios.get(`https://data.boston.gov/api/3/action/datastore_search_sql?sql=${initialSql}`)
    .then(function(response) {
        // Populate year dropdown from unique years in data
        var years = [...new Set(response.data.result.records.map(h => h.MANUFACTUR))];
        var knownYears = years.filter(year => !['-999', '0', '200', '209'].includes(year));
        knownYears.sort(); // Sort years in ascending order

        var select = document.getElementById('yearSelect');
        knownYears.forEach(function(year) {
            var option = document.createElement('option');
            option.value = year;
            option.text = year;
            select.appendChild(option);
        });
    })
    .catch(function(error) {
        console.error('Error initializing data:', error);
    });


const sqlDeptQuery = `SELECT * FROM "e4ab410d-5119-4126-8411-8f7700d3c0bf"`;

        axios.get(`https://data.boston.gov/api/3/action/datastore_search_sql?sql=${encodeURIComponent(sqlDeptQuery)}`)
            .then(function(response) {
                const data = response.data.result.records;

                // Process data for chart
                const counts = d3.nest()
                    .key(function(d) { return d.PD; })
                    .rollup(function(v) { return v.length; })
                    .entries(data)
                    .map(function(d) { return { name: d.key, value: d.value }; });

                const chartData = counts.map(d => d.value);
                const chartCategories = counts.map(d => d.name);

                // Create ApexCharts line chart with stepline curve
                var options = {
                    series: [{
                        name:'Total Number',
                        data: chartData
                    }],
                    chart: {
                        type: 'line',
                        height: 350
                    },
                    stroke: {
                        curve: 'stepline',
                    },
                    dataLabels: {
                        enabled: false
                    },
                    title: {
                        align: 'left'
                    },
                    xaxis: {
                        categories: chartCategories,
                        title: {
                            text: 'Location'
                        }
                    },
                    yaxis: {
                        title: {
                            text: 'Count'
                        }
                    },
                    markers: {
                        hover: {
                            sizeOffset: 4
                        }
                    }
                };

                var chart = new ApexCharts(document.querySelector("#chartDept"), options);
                chart.render();

                // Map Visualization
                var map = L.map('mapDept').setView([42.3601, -71.0589], 12);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
                    maxZoom: 18,
                }).addTo(map);

                var markers = L.markerClusterGroup().addTo(map);

                data.forEach(function(row) {
                    var marker = L.marker([row.Y, row.X]).bindPopup(
                        row.LOCNAME + '<br>Contact: ' + row.LOCCONTACT + '<br>Address: ' + row.LOCADDR
                    );
                    markers.addLayer(marker);
                });

                // Highlight areas and count fire departments in each area
                var areaCounts = d3.nest()
                    .key(function(d) { return d.PD; })
                    .rollup(function(leaves) { return leaves.length; })
                    .entries(data);

                areaCounts.forEach(function(area) {
                    var areaData = data.filter(function(d) { return d.PD === area.key; });
                    var areaLat = d3.mean(areaData, function(d) { return +d.Y; });
                    var areaLon = d3.mean(areaData, function(d) { return +d.X; });

                    L.circleMarker([areaLat, areaLon], {
                        radius: 10,
                        color: 'blue',
                        fillColor: 'blue',
                        fillOpacity: 0.6
                    }).bindPopup(area.key + '<br>Fire Departments: ' + area.value).addTo(map);
                });
            })
            .catch(function(error) {
                console.error('Error fetching data:', error);
            });
