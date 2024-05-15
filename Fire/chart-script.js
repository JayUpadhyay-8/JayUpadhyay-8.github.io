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

// Function to fetch data
async function fetchData(sqlQuery) {
    const url = `https://data.boston.gov/api/3/action/datastore_search_sql?sql=${encodeURIComponent(sqlQuery)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.result.records;
}

// Function to process data for a chart
function processData(records) {
    const incidentTypes = {};
    records.forEach(record => {
        const incidentType = record['incident_description'];
        const district = record['district'];

        if (!incidentTypes[incidentType]) {
            incidentTypes[incidentType] = {};
        }

        if (incidentTypes[incidentType][district]) {
            incidentTypes[incidentType][district] += 1;
        } else {
            incidentTypes[incidentType][district] = 1;
        }
    });

    const labels = Object.keys(incidentTypes);
    const datasets = Object.keys(incidentTypes[labels[0]]).map(district => {
        return {
            label: district,
            data: labels.map(incident => incidentTypes[incident][district] || 0),
            backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`,
            borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
            borderWidth: 1
        };
    });

    return { labels, datasets };
}

// Function to create a radar chart
function createRadarChart(ctx, title, labels, datasets) {
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: datasets
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

// Main function to render charts
async function renderCharts() {
    const sqlQuery = `SELECT * from "91a38b1f-8439-46df-ba47-a30c48845e06" WHERE "incident_description" IS NOT NULL AND "district" IS NOT NULL`;
    const records = await fetchData(sqlQuery);
    const { labels, datasets } = processData(records);

    const incidentRadarCtx = document.getElementById('incidentRadarChart').getContext('2d');
    createRadarChart(incidentRadarCtx, 'Incident Types by District', labels, datasets);
}

renderCharts();
