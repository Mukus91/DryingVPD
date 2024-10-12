function populateVPDOptions() {
    const minVPDSelect = document.getElementById('min-vpd');
    const maxVPDSelect = document.getElementById('max-vpd');

    for (let vpd = 0.5; vpd <= 1.5; vpd += 0.1) {
        let optionMin = document.createElement('option');
        optionMin.value = vpd.toFixed(1);
        optionMin.textContent = vpd.toFixed(1);
        minVPDSelect.appendChild(optionMin);

        let optionMax = document.createElement('option');
        optionMax.value = vpd.toFixed(1);
        optionMax.textContent = vpd.toFixed(1);
        maxVPDSelect.appendChild(optionMax);
    }

    minVPDSelect.value = "0.8";
    maxVPDSelect.value = "1.1";
}

function estimateDryingDays(VPD) {
    const vpdValues = [0.4, 0.6, 0.8, 1.2, 1.4, 2.2];
    const dryingDays = [19, 12, 10, 6, 5, 3];

    // If VPD is outside the range, return min/max days
    if (VPD <= vpdValues[0]) {
        return dryingDays[0];
    } else if (VPD >= vpdValues[vpdValues.length - 1]) {
        return dryingDays[dryingDays.length - 1];
    }

    // Interpolate between the known VPD values
    for (let i = 0; i < vpdValues.length - 1; i++) {
        if (VPD >= vpdValues[i] && VPD <= vpdValues[i + 1]) {
            const ratio = (VPD - vpdValues[i]) / (vpdValues[i + 1] - vpdValues[i]);
            return dryingDays[i] + ratio * (dryingDays[i + 1] - dryingDays[i]);
        }
    }

    // Default return if no match found
    return "Unknown";
}

function calculateVPD() {
    const temperature = parseFloat(document.getElementById('temperature').value);
    const humidity = parseFloat(document.getElementById('humidity').value);
    const tempUnit = document.querySelector('input[name="temp-unit"]:checked').value;
    const minVPD = parseFloat(document.getElementById('min-vpd').value);
    const maxVPD = parseFloat(document.getElementById('max-vpd').value);

    if (isNaN(temperature) || isNaN(humidity)) {
        alert("Please enter valid values for temperature and humidity.");
        return;
    }

    let tempCelsius = temperature;
    if (tempUnit === 'fahrenheit') {
        tempCelsius = (temperature - 32) * 5 / 9;
    }

    const SVP = 0.6108 * Math.exp((17.27 * tempCelsius) / (tempCelsius + 237.3));
    const VPD = (1 - (humidity / 100)) * SVP;

    document.getElementById('vpd-value').textContent = VPD.toFixed(2);

    let statusText = "";
    let statusClass = "";

    if (VPD >= minVPD && VPD <= maxVPD) {
        statusText = "Perfect for drying";
        statusClass = "green";
    } else if (VPD >= (minVPD - 0.1) && VPD <= (maxVPD + 0.1)) {
        statusText = "Okay for drying";
        statusClass = "yellow";
    } else {
        statusText = "Bad for drying";
        statusClass = "red";
    }

    const statusElement = document.getElementById('vpd-status');
    statusElement.textContent = statusText;
    statusElement.className = statusClass;

    const warningElement = document.getElementById('terpene-warning');
    if (tempUnit === 'celsius' && tempCelsius > 21) {
        warningElement.innerHTML = 'You might start losing terpenes beyond 21°C <a href="#ref-1"><sup>1</sup></a>';
    } else if (tempUnit === 'fahrenheit' && temperature > 70) {
        warningElement.innerHTML = 'You might start losing terpenes beyond 70°F <a href="#ref-1"><sup>1</sup></a>';
    } else {
        warningElement.textContent = "";
    }

    // Calculate and display estimated drying time
    const dryingDays = estimateDryingDays(VPD);
    const dryingTimeElement = document.getElementById('drying-time');
    dryingTimeElement.textContent = `Estimated drying time: ${dryingDays.toFixed(1)} days`;
}

// Call the populateVPDOptions function on page load
window.onload = populateVPDOptions;
