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

// Function to create a bar chart
function createBarChart(ctx, title, labels, data) {
    new Chart(ctx, {
        type: 'bar',
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
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Function to create a radar chart
function createRadarChart(ctx, title, labels, data) {
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true
                }
            }
        }
    });
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

// Function to setup the quiz
function setupQuiz() {
    const quiz = document.getElementById('quiz');
    quiz.innerHTML = '<p>What should you do if your clothes catch fire?</p>' +
                     '<input type="radio" id="stop" name="fire" value="stop"><label for="stop">Stop, Drop, and Roll</label><br>' +
                     '<input type="radio" id="run" name="fire" value="run"><label for="run">Run</label><br>';
}

// Function to submit the quiz
function submitQuiz() {
    const answer = document.querySelector('input[name="fire"]:checked').value;
    alert(answer === "stop" ? "Correct!" : "Oops! The right answer is Stop, Drop, and Roll.");
}

// Main function to render charts
async function renderCharts() {
    const incidentTypeSql = `SELECT * from "91a38b1f-8439-46df-ba47-a30c48845e06" WHERE "incident_description" IS NOT NULL`;
    const districtSql = `SELECT * from "91a38b1f-8439-46df-ba47-a30c48845e06" WHERE "district" IS NOT NULL`;
    const neighborhoodSql = `SELECT * from "91a38b1f-8439-46df-ba47-a30c48845e06" WHERE "neighborhood" IS NOT NULL`;

    // Incident Type Chart
    const incidentRecords = await fetchData(incidentTypeSql);
    const incidentTypeCounts = processData(incidentRecords, 'incident_description');
    const incidentTypeCtx = document.getElementById('incidentTypeChart').getContext('2d');
    createBarChart(incidentTypeCtx, 'Incident Types', Object.keys(incidentTypeCounts), Object.values(incidentTypeCounts));

    // District Chart
    const districtRecords = await fetchData(districtSql);
    const districtCounts = processData(districtRecords, 'district');
    const districtCtx = document.getElementById('districtChart').getContext('2d');
    createBarChart(districtCtx, 'Incidents by District', Object.keys(districtCounts), Object.values(districtCounts));

    // Radar Chart for Incident Types
    const incidentRadarCtx = document.getElementById('incidentRadarChart').getContext('2d');
    createRadarChart(incidentRadarCtx, 'Incident Types (Radar)', Object.keys(incidentTypeCounts), Object.values(incidentTypeCounts));

    // Neighborhood Pie Chart
    const neighborhoodRecords = await fetchData(neighborhoodSql);
    const neighborhoodCounts = processData(neighborhoodRecords, 'neighborhood');
    const neighborhoodCtx = document.getElementById('neighborhoodPieChart').getContext('2d');
    createPieChart(neighborhoodCtx, 'Incidents by Neighborhood', Object.keys(neighborhoodCounts), Object.values(neighborhoodCounts));

    setupQuiz();
}

renderCharts();
