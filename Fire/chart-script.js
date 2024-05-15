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

// Function to create a chart
function createChart(ctx, title, labels, data) {
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

function setupQuiz() {
    const quiz = document.getElementById('quiz');
    quiz.innerHTML = '<p>What should you do if your clothes catch fire?</p>' +
                     '<input type="radio" id="stop" name="fire" value="stop"><label for="stop">Stop, Drop, and Roll</label><br>' +
                     '<input type="radio" id="run" name="fire" value="run"><label for="run">Run</label><br>';
}

function submitQuiz() {
    const answer = document.querySelector('input[name="fire"]:checked').value;
    alert(answer === "stop" ? "Correct!" : "Oops! The right answer is Stop, Drop, and Roll.");
}




// Main function to render charts
async function renderCharts() {
    const incidentTypeSql = `SELECT * from "91a38b1f-8439-46df-ba47-a30c48845e06" WHERE "incident_description" IS NOT NULL`;
    const districtSql = `SELECT * from "91a38b1f-8439-46df-ba47-a30c48845e06" WHERE "district" IS NOT NULL`;

    // Incident Type Chart
    const incidentRecords = await fetchData(incidentTypeSql);
    const incidentTypeCounts = processData(incidentRecords, 'incident_description');
    const incidentTypeCtx = document.getElementById('incidentTypeChart').getContext('2d');
    createChart(incidentTypeCtx, 'Incident Types', Object.keys(incidentTypeCounts), Object.values(incidentTypeCounts));

    // District Chart
    const districtRecords = await fetchData(districtSql);
    const districtCounts = processData(districtRecords, 'district');
    const districtCtx = document.getElementById('districtChart').getContext('2d');
    createChart(districtCtx, 'Incidents by District', Object.keys(districtCounts), Object.values(districtCounts));

    const geojson = L.geoJson(geojsonFeature, {
    style: function (feature) {
        return {
            fillColor: getColor(feature.properties.incidents),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }
}).addTo(map);
}

renderCharts();

document.onload = setupQuiz();
