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

// Function to create a line chart
function createLineChart(ctx, title, labels, data) {
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                title: {
                    display: true,
                    text: title
                }
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Number of Incidents'
                    }
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
    `;
}

// Function to submit the quiz
function submitQuiz() {
    const correctAnswers = {
        fire: 'stop',
        extinguisher: 'base',
        number: '911',
        smoke: 'crawl',
        alarms: 'monthly'
    };
    
    let score = 0;
    let total = 5;
    
    for (let key in correctAnswers) {
        const answer = document.querySelector(`input[name="${key}"]:checked`);
        if (answer && answer.value === correctAnswers[key]) {
            score++;
        }
    }
    
    alert(`You scored ${score} out of ${total}.`);
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
    createBarChart(incidentTypeCtx, 'Incident Types', Object.keys(incidentTypeCounts), Object.values(incidentTypeCounts));

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
