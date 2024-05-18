// Function to fetch data
async function fetchData(sqlQuery) {
    const url = `https://data.boston.gov/api/3/action/datastore_search_sql?sql=${encodeURIComponent(sqlQuery)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.result.records;
}

// Function to process data for a chart
function processData(records, key) {
    const counts = {};
    records.forEach(record => {
        if (record[key]) {
            counts[record[key]] = (counts[record[key]] || 0) + 1;
        }
    });
    return counts;
}

// Function to create a bar chart with colors
function createBarChart(ctx, title, labels, data) {
    const colors = labels.map((_, i) => `hsl(${(i * 360 / labels.length)}, 70%, 50%)`);
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
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

// Function to create a chart with a logarithmic scale
function createLogScaleChart(ctx, type, title, labels, data) {
    const colors = labels.map((_, i) => `hsl(${(i * 360 / labels.length)}, 70%, 50%)`);
    return new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: colors,
                borderColor: colors,
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

    // Display top incident
    const topIncident = Object.entries(incidentTypeCounts).sort(([,a], [,b]) => b - a)[0];
    document.getElementById('topIncident').innerText = `Top Incident: ${topIncident[0]} (${topIncident[1]} incidents)`;

    // Event listener for chart type toggle
    document.getElementById('toggleChartType').addEventListener('click', function() {
        const currentType = incidentTypeChart.config.type;
        const newType = currentType === 'bar' ? 'line' : 'bar';
        incidentTypeChart.destroy();
        incidentTypeChart = createLogScaleChart(incidentTypeCtx, newType, 'Incident Types', Object.keys(incidentTypeCounts), Object.values(incidentTypeCounts));
    });

    // District Chart
    const districtRecords = await fetchData(districtSql);
    const districtCounts = processData(districtRecords, 'district');
    const districtCtx = document.getElementById('districtChart').getContext('2d');
    createBarChart(districtCtx, 'Incidents by District', Object.keys(districtCounts), Object.values(districtCounts));

    // Neighborhood Pie Chart
    const neighborhoodRecords = await fetchData(neighborhoodSql);
    const neighborhoodCounts = processData(neighborhoodRecords, 'neighborhood');
    const neighborhoodCtx = document.getElementById('neighborhoodPieChart').getContext('2d');
    createPieChart(neighborhoodCtx, 'Incidents by Neighborhood', Object.keys(neighborhoodCounts), Object.values(neighborhoodCounts));

    // Fire Incident Line Chart
    const fireIncidentRecords = await fetchData(fireIncidentSql);
    const fireIncidentCounts = processData(fireIncidentRecords, 'alarm_date');
    const fireIncidentCtx = document.getElementById('fireIncidentLineChart').getContext('2d');
    createLineChart(fireIncidentCtx, 'Fire Incidents Over Time', Object.keys(fireIncidentCounts), Object.values(fireIncidentCounts));

    setupQuiz();
}

renderCharts();
