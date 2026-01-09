const theme = {
    text: '#1f2737',
    muted: '#5b6b84',
    grid: 'rgba(31, 39, 55, 0.14)',
    accent: '#ffb65d',
    accentSoft: 'rgba(255, 182, 93, 0.35)',
    palette: ['#ffb65d', '#f7d26a', '#35c7b8', '#8cd96a', '#4f8cff', '#f47c7c', '#9f7aea']
};

if (window.Chart) {
    Chart.defaults.color = theme.text;
    Chart.defaults.font.family = '"Space Grotesk", sans-serif';
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
}

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

function getIncidentCoordinates(record) {
    const latFields = ['latitude', 'Latitude', 'LATITUDE', 'lat', 'Y'];
    const lonFields = ['longitude', 'Longitude', 'LONGITUDE', 'lon', 'lng', 'X'];
    let lat = null;
    let lon = null;

    latFields.forEach(field => {
        if (lat === null && record[field] !== undefined && record[field] !== null) {
            lat = parseFloat(record[field]);
        }
    });

    lonFields.forEach(field => {
        if (lon === null && record[field] !== undefined && record[field] !== null) {
            lon = parseFloat(record[field]);
        }
    });

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return null;
    }

    return { lat, lon };
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
                backgroundColor: theme.palette,
                borderColor: 'rgba(15, 20, 32, 0.6)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: theme.text
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 20, 32, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#dbe2f5',
                    borderColor: theme.grid,
                    borderWidth: 1
                }
            }
        }
    });
}


// Function to create a chart with a logarithmic scale
function createLogScaleChart(ctx, type, title, labels, data) {
    const dataset = {
        label: title,
        data: data,
        backgroundColor: theme.accentSoft,
        borderColor: theme.accent,
        borderWidth: 2
    };

    if (type === 'line') {
        dataset.tension = 0.35;
        dataset.fill = true;
    } else {
        dataset.borderRadius = 6;
    }

    return new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [dataset]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'logarithmic',
                    beginAtZero: true,
                    grid: {
                        color: theme.grid
                    },
                    ticks: {
                        color: theme.muted
                    },
                    title: {
                        display: true,
                        text: 'Incident Volume (log scale)',
                        color: theme.muted
                    }
                },
                x: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.04)'
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 20,
                        color: theme.muted
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: theme.text
                    }
                },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 20, 32, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#dbe2f5',
                    borderColor: theme.grid,
                    borderWidth: 1
                }
            }
        }
    });
}

// Function to setup the quiz
function setupQuiz() {
    const quiz = document.getElementById('quiz');
    const questions = [
        {
            name: 'fire',
            prompt: 'If your clothes catch fire, what is the safest response?',
            options: [
                { value: 'stop', label: 'Stop, drop, and roll' },
                { value: 'run', label: 'Run outside' }
            ]
        },
        {
            name: 'extinguisher',
            prompt: 'Where should you aim a fire extinguisher?',
            options: [
                { value: 'base', label: 'At the base of the fire' },
                { value: 'top', label: 'At the top of the flames' }
            ]
        },
        {
            name: 'pass',
            prompt: 'What does PASS stand for?',
            options: [
                { value: 'pull', label: 'Pull, Aim, Squeeze, Sweep' },
                { value: 'push', label: 'Push, Aim, Spray, Stop' }
            ]
        },
        {
            name: 'smoke',
            prompt: 'How should you move through a smoky room?',
            options: [
                { value: 'crawl', label: 'Stay low and crawl' },
                { value: 'stand', label: 'Stand and run' }
            ]
        },
        {
            name: 'alarms',
            prompt: 'How often should you test smoke alarms?',
            options: [
                { value: 'monthly', label: 'Every month' },
                { value: 'yearly', label: 'Once a year' }
            ]
        },
        {
            name: 'alarm',
            prompt: 'When you hear a fire alarm, what should you do first?',
            options: [
                { value: 'evacuate', label: 'Evacuate immediately' },
                { value: 'investigate', label: 'Investigate the source' }
            ]
        },
        {
            name: 'trapped',
            prompt: 'If you are trapped in a burning building, what is best?',
            options: [
                { value: 'signal', label: 'Signal for help at a window' },
                { value: 'hide', label: 'Hide in a corner' }
            ]
        }
    ];

    quiz.innerHTML = questions.map((question, index) => `
        <div class="quiz-question">
            <p>${index + 1}. ${question.prompt}</p>
            ${question.options.map((option) => `
                <label>
                    <input type="radio" name="${question.name}" value="${option.value}">
                    ${option.label}
                </label>
            `).join('')}
        </div>
    `).join('');
}

// Function to submit the quiz
function submitQuiz() {
    const correctAnswers = {
        fire: 'stop',
        extinguisher: 'base',
        pass: 'pull',
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

    // Incident Map
    const incidentMap = L.map('incidentMap').setView([42.3601, -71.0589], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(incidentMap);
    setTimeout(() => incidentMap.invalidateSize(), 300);

    const incidentMarkers = L.markerClusterGroup();
    incidentMap.addLayer(incidentMarkers);

    incidentRecords.slice(0, 400).forEach(record => {
        const coords = getIncidentCoordinates(record);
        if (!coords) {
            return;
        }
        const marker = L.circleMarker([coords.lat, coords.lon], {
            radius: 4,
            color: theme.accent,
            fillColor: theme.accent,
            fillOpacity: 0.7
        }).bindPopup(
            `<strong>${record.incident_description || 'Fire incident'}</strong><br>` +
            `Neighborhood: ${record.neighborhood || 'Unknown'}<br>` +
            `Date: ${record.alarm_date || 'N/A'}`
        );
        incidentMarkers.addLayer(marker);
    });

    setupQuiz();
}

renderCharts();


const hydrantMap = L.map('mapHydrant').setView([42.3601, -71.0589], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 18,
}).addTo(hydrantMap);
setTimeout(() => hydrantMap.invalidateSize(), 300);

const hydrantMarkers = L.layerGroup().addTo(hydrantMap);

function addMarkers(data) {
    hydrantMarkers.clearLayers();
    data.forEach(function(hydrant) {
        var marker = L.marker([hydrant.Y, hydrant.X]).bindPopup(
            'Hydrant ID: ' + hydrant._id + '<br>' +
            'Address: ' + hydrant.ADDRESS_NU + ' ' + hydrant.STREET_FEA + '<br>' +
            'Owner Code: ' + hydrant.OWNER_CODE
        );
        hydrantMarkers.addLayer(marker);
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
const deptMap = L.map('mapDept').setView([42.3601, -71.0589], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 18,
}).addTo(deptMap);
setTimeout(() => deptMap.invalidateSize(), 300);

const deptMarkerLayer = L.markerClusterGroup ? L.markerClusterGroup() : L.layerGroup();
deptMarkerLayer.addTo(deptMap);

axios.get(`https://data.boston.gov/api/3/action/datastore_search_sql?sql=${encodeURIComponent(sqlDeptQuery)}`)
    .then(function(response) {
        const data = response.data.result.records || [];

        // Process data for chart
        const counts = d3.nest()
            .key(function(d) { return d.PD; })
            .rollup(function(v) { return v.length; })
            .entries(data)
            .map(function(d) { return { name: d.key, value: d.value }; });

        const chartData = counts.map(d => d.value);
        const chartCategories = counts.map(d => d.name);

        // Create ApexCharts line chart with stepline curve
        const options = {
            series: [{
                name: 'Total Number',
                data: chartData
            }],
            chart: {
                type: 'line',
                height: 350,
                toolbar: { show: false },
                foreColor: theme.muted
            },
            colors: [theme.accent],
            stroke: {
                curve: 'smooth',
                width: 3
            },
            dataLabels: {
                enabled: false
            },
            grid: {
                borderColor: theme.grid
            },
            title: {
                align: 'left',
                style: {
                    color: theme.text
                }
            },
            xaxis: {
                categories: chartCategories,
                title: {
                    text: 'Location',
                    style: { color: theme.muted }
                }
            },
            yaxis: {
                title: {
                    text: 'Count',
                    style: { color: theme.muted }
                }
            },
            markers: {
                size: 4,
                strokeColors: theme.accent,
                hover: {
                    sizeOffset: 4
                }
            }
        };

        const chart = new ApexCharts(document.querySelector("#chartDept"), options);
        chart.render();

        data.forEach(function(row) {
            const lat = parseFloat(row.Y);
            const lon = parseFloat(row.X);
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
                return;
            }
            const marker = L.marker([lat, lon]).bindPopup(
                row.LOCNAME + '<br>Contact: ' + row.LOCCONTACT + '<br>Address: ' + row.LOCADDR
            );
            deptMarkerLayer.addLayer(marker);
        });

        // Highlight areas and count fire departments in each area
        const areaCounts = d3.nest()
            .key(function(d) { return d.PD; })
            .rollup(function(leaves) { return leaves.length; })
            .entries(data);

        areaCounts.forEach(function(area) {
            const areaData = data.filter(function(d) { return d.PD === area.key; });
            const areaPoints = areaData.filter(function(d) {
                return Number.isFinite(+d.Y) && Number.isFinite(+d.X);
            });
            if (!areaPoints.length) {
                return;
            }
            const areaLat = d3.mean(areaPoints, function(d) { return +d.Y; });
            const areaLon = d3.mean(areaPoints, function(d) { return +d.X; });

            L.circleMarker([areaLat, areaLon], {
                radius: 10,
                color: theme.accent,
                fillColor: theme.accent,
                fillOpacity: 0.6
            }).bindPopup(area.key + '<br>Fire Departments: ' + area.value).addTo(deptMap);
        });
    })
    .catch(function(error) {
        console.error('Error fetching data:', error);
    });


async function fetchFireHydrantData() {
            const sqlHydrantQuery = `SELECT * FROM "1479a183-dde0-46a6-a828-f526df010a03"`;
            const url = `https://data.boston.gov/api/3/action/datastore_search_sql?sql=${encodeURIComponent(sqlHydrantQuery)}`;
            const response = await axios.get(url);
            return response.data.result.records;
        }

        function processHydrantData(records) {
            const intervalCounts = {};
            for (let year = 1900; year <= 2024; year += 10) {
                intervalCounts[year] = 0;
            }

            records.forEach(record => {
                const year = parseInt(record.MANUFACTUR);
                if (!isNaN(year) && year > 0) {
                    const interval = Math.floor(year / 10) * 10;
                    if (intervalCounts[interval] !== undefined) {
                        intervalCounts[interval]++;
                    }
                }
            });
            return Object.entries(intervalCounts).sort((a, b) => a[0] - b[0]);
        }

        async function renderChart() {
            const records = await fetchFireHydrantData();
            const intervalData = processHydrantData(records);
            const years = intervalData.map(item => item[0]);
            const counts = intervalData.map(item => item[1]);

            var options = {
                series: [{
                    name: "Fire Hydrants",
                    data: counts
                }],
                chart: {
                    height: 350,
                    type: 'line',
                    zoom: {
                        enabled: false
                    },
                    toolbar: { show: false },
                    foreColor: theme.muted
                },
                colors: [theme.accent],
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    curve: 'smooth',
                    width: 3
                },
                title: {
                    align: 'left',
                    style: { color: theme.text }
                },
                grid: {
                    borderColor: theme.grid
                },
                xaxis: {
                    categories: years,
                    title: {
                        text: 'Manufacture Year',
                        style: { color: theme.muted }
                    }
                },
                yaxis: {
                    title: {
                        text: 'Number of Fire Hydrants',
                        style: { color: theme.muted }
                    }
                }
            };

            var chart = new ApexCharts(document.querySelector("#chartHydrant"), options);
            chart.render();
        }

        renderChart();
