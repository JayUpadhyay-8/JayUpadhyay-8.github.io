const map = L.map('map').setView([42.3601, -71.0589], 10); // Centered on Boston
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

async function fetchData() {
    const url = 'https://data.boston.gov/api/3/action/datastore_search?limit=5&resource_id=91a38b1f-8439-46df-ba47-a30c48845e06';
    const response = await fetch(url);
    const data = await response.json();
    const incidents = data.result.records;

    incidents.forEach(incident => {
        // Replace 'latitude' and 'longitude' with the correct property names if they are different
        const latitude = incident.latitude; // Ensure this property name matches your data
        const longitude = incident.longitude; // Ensure this property name matches your data

        if (latitude && longitude) { // Check if both latitude and longitude are not undefined
            const address = `${incident.street_number || ''} ${incident.street_name || ''}, ${incident.neighborhood || ''}, ${incident.zip || ''}`;
            L.marker([latitude, longitude])
                .addTo(map)
                .bindPopup(`<strong>Incident Type:</strong> ${incident.incident_description}<br>
                            <strong>Date:</strong> ${incident.alarm_date} ${incident.alarm_time}<br>
                            <strong>Address:</strong> ${address}`);
        }
    });
}


fetchData();
