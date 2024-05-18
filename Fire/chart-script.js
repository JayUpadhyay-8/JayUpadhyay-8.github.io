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

    for (let key in correctAnswers) {
        const answer = document.querySelector(`input[name="${key}"]:checked`);
        if (answer) {
            const label = answer.nextElementSibling;
            if (answer.value === correctAnswers[key]) {
                score++;
                label.style.color = 'green';
            } else {
                label.style.color = 'red';
                const correctAnswer = document.querySelector(`input[name="${key}"][value="${correctAnswers[key]}"]`);
                correctAnswer.nextElementSibling.style.color = 'green';
            }
            answer.checked = false; // Uncheck the selected answer
        } else {
            const correctAnswer = document.querySelector(`input[name="${key}"][value="${correctAnswers[key]}"]`);
            correctAnswer.nextElementSibling.style.color = 'green';
        }
    }
    
    const resultMessage = `You scored ${score} out of ${total}.`;
    document.getElementById('quiz-result').textContent = resultMessage;
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

