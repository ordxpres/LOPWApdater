// --- HELPER FUNCTION (Format AWB) ---
function formatAwbInput(event) {
    const input = event.target;
    let value = input.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters

    if (value.length > 3) {
        // Insert hyphen after the 3rd digit
        value = value.substring(0, 3) + '-' + value.substring(3);
    }

    // Limit total length (3 digits + hyphen + 8 digits = 12 chars)
    if (value.length > 12) {
        value = value.substring(0, 12);
    }

    // Update the input field value only if it changed
    if (input.value !== value) {
        input.value = value;
    }

    // After formatting, also check for saved data (important for auto-fill)
    tryLoadShipmentDetails(); // Ensure this function is defined globally or called correctly
}

// --- HELPER FUNCTION (Date) ---
function formatDateToDDMMM(dateString) {
    if (!dateString) {
        console.error("formatDateToDDMMM received invalid dateString:", dateString);
        return "ERRDT"; // Return error string instead of undefined
    }
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    try {
        const date = new Date(dateString + 'T00:00:00');
        if (isNaN(date)) {
             console.error("formatDateToDDMMM failed to parse date:", dateString);
             return "ERRDT";
        }
        const day = String(date.getDate()).padStart(2, '0');
        const month = months[date.getMonth()];
        return day + month;
    } catch(e) {
        console.error("Error in formatDateToDDMMM:", e);
        return "ERRDT";
    }
}

// --- HELPER FUNCTION (Time) ---
function formatTimeToHHMM(timeString) {
    if (!timeString || !timeString.includes(':')) {
        console.error("formatTimeToHHMM received invalid timeString:", timeString);
        return "ERRTM"; // Return error string
    }
    try {
        return timeString.replace(":", "");
    } catch(e) {
        console.error("Error in formatTimeToHHMM:", e);
        return "ERRTM";
    }
}

// --- HELPER FUNCTION (Set Time) ---
function setCurrentTime(inputId) {
    try {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const timeInput = document.getElementById(inputId);
        if (timeInput) {
            timeInput.value = `${hours}:${minutes}`;
            console.log(`Set current time for ${inputId}: ${hours}:${minutes}`);
        } else {
             console.error(`setCurrentTime: Could not find element with ID ${inputId}`);
        }
    } catch (e) { console.error("Error in setCurrentTime:", e); }
}

// --- HELPER FUNCTION (Set Date) ---
function setCurrentDate(inputId) {
     try {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const dateInput = document.getElementById(inputId);
        if (dateInput) {
            dateInput.value = `${year}-${month}-${day}`;
            console.log(`Set current date for ${inputId}: ${year}-${month}-${day}`);
        } else {
            console.error(`setCurrentDate: Could not find element with ID ${inputId}`);
        }
    } catch (e) { console.error("Error in setCurrentDate:", e); }
}

// --- HELPER FUNCTION (Copy) ---
function copyValue(sourceId, destinationId) {
     try {
        const sourceEl = document.getElementById(sourceId);
        const destEl = document.getElementById(destinationId);
        if (sourceEl && destEl) {
            destEl.value = sourceEl.value;
            console.log(`Copied value from ${sourceId} to ${destinationId}`);
        } else {
            console.error(`copyValue: Could not find source (${sourceId}) or destination (${destinationId})`);
        }
    } catch (e) { console.error("Error in copyValue:", e); }
}

// --- LocalStorage Keys ---
const SHIPMENT_DATA_KEY = 'fsuShipmentsData';
const COMMON_DATA_PREFIX = 'fsu_last_';

// --- Shipment Data Helpers ---
function getShipments() {
    try {
        const data = localStorage.getItem(SHIPMENT_DATA_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) { console.error("Error reading shipment data", e); return {}; }
}
function saveShipments(shipments) {
    try { localStorage.setItem(SHIPMENT_DATA_KEY, JSON.stringify(shipments)); }
    catch (e) { console.error("Error saving shipment data", e); }
}
function saveShipmentDetails(awb) {
    const originInput = document.getElementById('origin');
    const destInput = document.getElementById('destination');
    const totalPiecesInput = document.getElementById('totalPieces');
    const totalWeightInput = document.getElementById('totalWeight');
    if (!awb || !originInput || !destInput || !totalPiecesInput || !totalWeightInput) return;
    const shipments = getShipments();
    shipments[awb] = {
        origin: originInput.value, destination: destInput.value,
        totalPieces: totalPiecesInput.value, totalWeight: totalWeightInput.value
    };
    saveShipments(shipments);
    console.log(`Saved details for AWB: ${awb}`);
}
function tryLoadShipmentDetails() {
    const awbInput = document.getElementById('awb');
    const originInput = document.getElementById('origin');
    const destInput = document.getElementById('destination');
    const totalPiecesInput = document.getElementById('totalPieces');
    const totalWeightInput = document.getElementById('totalWeight');
    if (!awbInput || !originInput || !destInput || !totalPiecesInput || !totalWeightInput) return;
    const currentAwb = awbInput.value;
    // Check format *after* potential auto-hyphenation
    if (/^\d{3}-?\d{0,8}$/.test(currentAwb)) { // Allow partial numbers after hyphen for typing
        const lookupAwb = currentAwb.replace('-', ''); // Use hyphen-less for lookup key if needed, or keep hyphenated
        // Adjust lookup key based on how you save in saveShipmentDetails if necessary
        if (/^\d{3}-\d{8}$/.test(currentAwb)) { // Only load if complete format is typed
            const shipments = getShipments();
            if (shipments[currentAwb]) { // Assuming key includes hyphen
                const data = shipments[currentAwb];
                originInput.value = data.origin || 'WAW';
                destInput.value = data.destination || 'TBS';
                totalPiecesInput.value = data.totalPieces || '';
                totalWeightInput.value = data.totalWeight || '';
                console.log(`Loaded details for AWB: ${currentAwb}`);
            } else {
                console.log(`No saved details found for AWB: ${currentAwb}`);
            }
        }
    }
}
function deleteShipmentDetails(awb) {
    if (!awb) return;
    const shipments = getShipments();
    if (shipments[awb]) { // Assuming key includes hyphen
        delete shipments[awb];
        saveShipments(shipments);
        console.log(`Deleted details for AWB: ${awb}`);
    }
}

// --- SAVE/LOAD *LAST USED* COMMON DATA FUNCTIONS ---
function saveCommonData() {
    try {
        const awbInput = document.getElementById('awb');
        const originInput = document.getElementById('origin');
        const destInput = document.getElementById('destination');
        const totalPiecesInput = document.getElementById('totalPieces');
        const totalWeightInput = document.getElementById('totalWeight');
        if (awbInput) localStorage.setItem(COMMON_DATA_PREFIX + 'awb', awbInput.value);
        if (originInput) localStorage.setItem(COMMON_DATA_PREFIX + 'origin', originInput.value);
        if (destInput) localStorage.setItem(COMMON_DATA_PREFIX + 'destination', destInput.value);
        if (totalPiecesInput) localStorage.setItem(COMMON_DATA_PREFIX + 'totalPieces', totalPiecesInput.value);
        if (totalWeightInput) localStorage.setItem(COMMON_DATA_PREFIX + 'totalWeight', totalWeightInput.value);
    } catch (e) { console.error("Could not save common data", e); }
}
function loadCommonData() {
    console.log("loadCommonData called");
    try {
        const awbInput = document.getElementById('awb');
        const originInput = document.getElementById('origin');
        const destInput = document.getElementById('destination');
        const totalPiecesInput = document.getElementById('totalPieces');
        const totalWeightInput = document.getElementById('totalWeight');
        if (awbInput) awbInput.value = localStorage.getItem(COMMON_DATA_PREFIX + 'awb') || '';
        if (originInput) originInput.value = localStorage.getItem(COMMON_DATA_PREFIX + 'origin') || 'WAW';
        if (destInput) destInput.value = localStorage.getItem(COMMON_DATA_PREFIX + 'destination') || 'TBS';
        if (totalPiecesInput) totalPiecesInput.value = localStorage.getItem(COMMON_DATA_PREFIX + 'totalPieces') || '';
        if (totalWeightInput) totalWeightInput.value = localStorage.getItem(COMMON_DATA_PREFIX + 'totalWeight') || '';
        console.log("Common data loaded successfully");
    } catch (e) { console.error("Could not load common data", e); }
    // Attempt to load specific shipment data if AWB was loaded and matches format
    tryLoadShipmentDetails();
}

// --- CLEAR FUNCTIONS ---
function clearAwbDetails() {
    const awbInput = document.getElementById('awb');
    const piecesInput = document.getElementById('totalPieces');
    const weightInput = document.getElementById('totalWeight');
    if (awbInput) awbInput.value = '';
    if (piecesInput) piecesInput.value = '';
    if (weightInput) weightInput.value = '';
    console.log("Cleared AWB Details");
}
function clearAllFields() {
    const statusForm = document.getElementById('statusForm');
    if (statusForm) statusForm.reset();
    clearAwbDetails();
    const originInput = document.getElementById('origin');
    const destInput = document.getElementById('destination');
    const arrivalPortInput = document.getElementById('arrivalPort');
    const pickupPortInput = document.getElementById('pickupPort');
    const outputTextInput = document.getElementById('outputText');
    if (originInput) originInput.value = 'WAW';
    if (destInput) destInput.value = 'TBS';
    if (arrivalPortInput) arrivalPortInput.value = 'TBS';
    if (pickupPortInput) pickupPortInput.value = 'TBS';
    if (outputTextInput) outputTextInput.value = '';

    const commonFieldsDiv = document.getElementById('commonFields');
    const rcfFieldsDiv = document.getElementById('rcfFields');
    const dlvFieldsDiv = document.getElementById('dlvFields');
    const outputContainerDiv = document.getElementById('outputContainer');
    const utilityButtonsDiv = document.getElementById('utilityButtons');
    if (commonFieldsDiv) commonFieldsDiv.style.display = 'none';
    if (rcfFieldsDiv) rcfFieldsDiv.style.display = 'none';
    if (dlvFieldsDiv) dlvFieldsDiv.style.display = 'none';
    if (outputContainerDiv) outputContainerDiv.style.display = 'none';
    if (utilityButtonsDiv) utilityButtonsDiv.style.display = 'none';

    try {
        localStorage.removeItem(COMMON_DATA_PREFIX + 'awb');
        localStorage.removeItem(COMMON_DATA_PREFIX + 'origin');
        localStorage.removeItem(COMMON_DATA_PREFIX + 'destination');
        localStorage.removeItem(COMMON_DATA_PREFIX + 'totalPieces');
        localStorage.removeItem(COMMON_DATA_PREFIX + 'totalWeight');
    } catch (e) { console.error("Could not clear common localStorage", e); }
    try {
        localStorage.removeItem(SHIPMENT_DATA_KEY);
        console.log("Cleared all saved shipment details.");
    } catch (e) { console.error("Could not clear shipment data localStorage", e); }
}

// --- FORM DISPLAY FUNCTIONS ---
function showRcfForm() {
    console.log("showRcfForm called");
    const commonFieldsDiv = document.getElementById('commonFields');
    const rcfFieldsDiv = document.getElementById('rcfFields');
    const dlvFieldsDiv = document.getElementById('dlvFields');
    const outputContainerDiv = document.getElementById('outputContainer');
    const utilityButtonsDiv = document.getElementById('utilityButtons');
    if (commonFieldsDiv) commonFieldsDiv.style.setProperty('display', 'block', 'important');
    if (rcfFieldsDiv) rcfFieldsDiv.style.setProperty('display', 'block', 'important');
    if (dlvFieldsDiv) dlvFieldsDiv.style.setProperty('display', 'none', 'important');
    if (outputContainerDiv) outputContainerDiv.style.setProperty('display', 'none', 'important');
    if (utilityButtonsDiv) utilityButtonsDiv.style.setProperty('display', 'grid', 'important');
    tryLoadShipmentDetails();
}
function showDlvForm() {
    console.log("showDlvForm called");
    const commonFieldsDiv = document.getElementById('commonFields');
    const rcfFieldsDiv = document.getElementById('rcfFields');
    const dlvFieldsDiv = document.getElementById('dlvFields');
    const outputContainerDiv = document.getElementById('outputContainer');
    const utilityButtonsDiv = document.getElementById('utilityButtons');
    if (commonFieldsDiv) commonFieldsDiv.style.setProperty('display', 'block', 'important');
    if (dlvFieldsDiv) dlvFieldsDiv.style.setProperty('display', 'block', 'important');
    if (rcfFieldsDiv) rcfFieldsDiv.style.setProperty('display', 'none', 'important');
    if (outputContainerDiv) outputContainerDiv.style.setProperty('display', 'none', 'important');
    if (utilityButtonsDiv) utilityButtonsDiv.style.setProperty('display', 'grid', 'important');
    tryLoadShipmentDetails();
}

// --- RCF OUTPUT GENERATION ---
function generateRcfOutput() {
    console.log("generateRcfOutput called");
    const awbInput = document.getElementById('awb');
    const originInput = document.getElementById('origin');
    const destInput = document.getElementById('destination');
    const totalPiecesInput = document.getElementById('totalPieces');
    const totalWeightInput = document.getElementById('totalWeight');
    const flightInput = document.getElementById('flight');
    const arrivalDateInput = document.getElementById('arrivalDate');
    const arrTimeInput = document.getElementById('arrTime');
    const arrivalPortInput = document.getElementById('arrivalPort');
    const arrivedPiecesInput = document.getElementById('arrivedPieces');
    const arrivedWeightInput = document.getElementById('arrivedWeight');
    const outputContainerDiv = document.getElementById('outputContainer');
    const outputTextInput = document.getElementById('outputText');
    const submitBtn = document.getElementById('submitBtn');

    if (!awbInput || !/^\d{3}-\d{8}$/.test(awbInput.value)) { alert('Error: AWB must be in the format NNN-NNNNNNNN.'); return; }
    if (!flightInput || !/^\d{1,4}$/.test(flightInput.value)) { alert('Error: Arriving flight must be 1 to 4 digits.'); return; }
    if (!arrivalDateInput || arrivalDateInput.value === '') { alert('Error: Please select an arrival date.'); return; }
    if (!arrTimeInput || arrTimeInput.value === '') { alert('Error: Please select an arrival time.'); return; }

    const awbValue = awbInput.value;
    const originValue = originInput ? originInput.value.toUpperCase() : 'ERR';
    const destValue = destInput ? destInput.value.toUpperCase() : 'ERR';
    const totalPiecesValue = totalPiecesInput ? totalPiecesInput.value : 'ERR';
    const totalWeightValue = totalWeightInput ? totalWeightInput.value : 'ERR';
    const arrivedPiecesValue = arrivedPiecesInput ? arrivedPiecesInput.value : 'ERR';
    const arrivedWeightValue = arrivedWeightInput ? arrivedWeightInput.value : 'ERR';
    const flightValue = `LO${flightInput.value}`;
    const rawDateValue = arrivalDateInput.value;
    const rawTimeValue = arrTimeInput.value;
    console.log("Raw RCF Date:", rawDateValue, "Raw RCF Time:", rawTimeValue);
    const dateValue = formatDateToDDMMM(rawDateValue);
    const timeValue = formatTimeToHHMM(rawTimeValue);
    const portValue = arrivalPortInput ? arrivalPortInput.value.toUpperCase() : 'ERR';

    const line1 = `FSU/15`;
    const line2 = `${awbValue}${originValue}${destValue}/T${totalPiecesValue}K${totalWeightValue}`;
    const line3 = `RCF/${flightValue}/${dateValue}${timeValue}/${portValue}/T${arrivedPiecesValue}K${arrivedWeightValue}`;
    const finalOutput = `${line1}\n${line2}\n${line3}`;
    console.log("Generated RCF Output:", finalOutput);

    if (outputContainerDiv && outputTextInput && submitBtn) {
        outputTextInput.value = finalOutput;
        outputContainerDiv.style.setProperty('display', 'block', 'important');
        submitBtn.style.setProperty('display', 'block', 'important');
        outputContainerDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else { console.error("Could not find output elements to display result."); }

    saveCommonData();
    saveShipmentDetails(awbValue);
}

// --- DLV OUTPUT GENERATION ---
function generateDlvOutput() {
    console.log("generateDlvOutput called");
    const awbInput = document.getElementById('awb');
    const originInput = document.getElementById('origin');
    const destInput = document.getElementById('destination');
    const totalPiecesInput = document.getElementById('totalPieces');
    const totalWeightInput = document.getElementById('totalWeight');
    const pickupDateInput = document.getElementById('pickupDate');
    const pickupTimeInput = document.getElementById('pickupTime');
    const pickupPortInput = document.getElementById('pickupPort');
    const deliveredPiecesInput = document.getElementById('deliveredPieces');
    const deliveredWeightInput = document.getElementById('deliveredWeight');
    const pickedUpByInput = document.getElementById('pickedUpBy');
    const outputContainerDiv = document.getElementById('outputContainer');
    const outputTextInput = document.getElementById('outputText');
    const submitBtn = document.getElementById('submitBtn');

    if (!awbInput || !/^\d{3}-\d{8}$/.test(awbInput.value)) { alert('Error: AWB must be in the format NNN-NNNNNNNN.'); return; }
    if (!pickupDateInput || pickupDateInput.value === '') { alert('Error: Please select a pick-up date.'); return; }
    if (!pickupTimeInput || pickupTimeInput.value === '') { alert('Error: Please select a pick-up time.'); return; }
    if (!pickedUpByInput || pickedUpByInput.value.trim() === '') { alert('Error: "Picked up by" field cannot be empty.'); return; }

    const awbValue = awbInput.value;
    const originValue = originInput ? originInput.value.toUpperCase() : 'ERR';
    const destValue = destInput ? destInput.value.toUpperCase() : 'ERR';
    const totalPiecesValue = totalPiecesInput ? totalPiecesInput.value : 'ERR';
    const totalWeightValue = totalWeightInput ? totalWeightInput.value : 'ERR';
    const deliveredPiecesValue = deliveredPiecesInput ? deliveredPiecesInput.value : 'ERR';
    const deliveredWeightValue = deliveredWeightInput ? deliveredWeightInput.value : 'ERR';
    const rawDateValue = pickupDateInput.value;
    const rawTimeValue = pickupTimeInput.value;
    console.log("Raw DLV Date:", rawDateValue, "Raw DLV Time:", rawTimeValue);
    const dateValue = formatDateToDDMMM(rawDateValue);
    const timeValue = formatTimeToHHMM(rawTimeValue);
    const portValue = pickupPortInput ? pickupPortInput.value.toUpperCase() : 'ERR';
    const pickedUpByValue = pickedUpByInput.value.toUpperCase();

    const line1 = `FSU/12`;
    const line2 = `${awbValue}${originValue}${destValue}/T${totalPiecesValue}K${totalWeightValue}`;
    const line3 = `DLV/${dateValue}${timeValue}/${portValue}/T${deliveredPiecesValue}K${deliveredWeightValue}/${pickedUpByValue}`;
    const finalOutput = `${line1}\n${line2}\n${line3}`;
    console.log("Generated DLV Output:", finalOutput);

    if (outputContainerDiv && outputTextInput && submitBtn) {
        outputTextInput.value = finalOutput;
        outputContainerDiv.style.setProperty('display', 'block', 'important');
        submitBtn.style.setProperty('display', 'block', 'important');
        outputContainerDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else { console.error("Could not find output elements to display result."); }

    saveCommonData();
    deleteShipmentDetails(awbValue);
}

// --- GENERIC EMAIL SUBMISSION ---
function submitEmail() {
    console.log("submitEmail called");
    const awbInput = document.getElementById('awb');
    const outputTextInput = document.getElementById('outputText');
    if (!awbInput || !outputTextInput) { console.error("Cannot submit email, missing AWB or output text."); return; }
    const recipient = 'CHACSLO@EDI.CHAMP.AERO';
    const awbValue = awbInput.value;
    const subject = `FSU Status Update for AWB ${awbValue}`;
    const body = outputTextInput.value;
    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
}


// --- This runs once the DOM is ready ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    // Get elements
    const btnShowRcf = document.getElementById('btnShowRcf');
    const btnShowDlv = document.getElementById('btnShowDlv');
    const btnGenRcf = document.getElementById('btnGenRcf');
    const btnGenDlv = document.getElementById('btnGenDlv');
    const submitBtn = document.getElementById('submitBtn');
    const statusForm = document.getElementById('statusForm');
    const arrTimeNowBtn = document.getElementById('arrTimeNow');
    const pickupTimeNowBtn = document.getElementById('pickupTimeNow');
    const arrDateTodayBtn = document.getElementById('arrivalDateToday');
    const pickupDateTodayBtn = document.getElementById('pickupDateToday');
    const copyArrivedPiecesBtn = document.getElementById('copyArrivedPiecesBtn');
    const copyArrivedWeightBtn = document.getElementById('copyArrivedWeightBtn');
    const copyDeliveredPiecesBtn = document.getElementById('copyDeliveredPiecesBtn');
    const copyDeliveredWeightBtn = document.getElementById('copyDeliveredWeightBtn');
    const btnClearAwb = document.getElementById('btnClearAwb');
    const btnClearAll = document.getElementById('btnClearAll');
    const awbInput = document.getElementById('awb');

    // Attach listeners
    if (btnShowRcf) btnShowRcf.addEventListener('click', showRcfForm); else console.error("MISSING: btnShowRcf");
    if (btnShowDlv) btnShowDlv.addEventListener('click', showDlvForm); else console.error("MISSING: btnShowDlv");
    if (btnGenRcf) btnGenRcf.addEventListener('click', generateRcfOutput); else console.error("MISSING: btnGenRcf");
    if (btnGenDlv) btnGenDlv.addEventListener('click', generateDlvOutput); else console.error("MISSING: btnGenDlv");
    if (submitBtn) submitBtn.addEventListener('click', submitEmail); else console.error("MISSING: submitBtn");
    if (statusForm) statusForm.addEventListener('submit', (event) => event.preventDefault()); else console.error("MISSING: statusForm");
    if (arrTimeNowBtn) arrTimeNowBtn.addEventListener('click', () => setCurrentTime('arrTime')); else console.error("MISSING: arrTimeNowBtn");
    if (pickupTimeNowBtn) pickupTimeNowBtn.addEventListener('click', () => setCurrentTime('pickupTime')); else console.error("MISSING: pickupTimeNowBtn");
    if (arrDateTodayBtn) arrDateTodayBtn.addEventListener('click', () => setCurrentDate('arrivalDate')); else console.error("MISSING: arrDateTodayBtn");
    if (pickupDateTodayBtn) pickupDateTodayBtn.addEventListener('click', () => setCurrentDate('pickupDate')); else console.error("MISSING: pickupDateTodayBtn");
    if (copyArrivedPiecesBtn) copyArrivedPiecesBtn.addEventListener('click', () => copyValue('totalPieces', 'arrivedPieces')); else console.error("MISSING: copyArrivedPiecesBtn");
    if (copyArrivedWeightBtn) copyArrivedWeightBtn.addEventListener('click', () => copyValue('totalWeight', 'arrivedWeight')); else console.error("MISSING: copyArrivedWeightBtn");
    if (copyDeliveredPiecesBtn) copyDeliveredPiecesBtn.addEventListener('click', () => copyValue('totalPieces', 'deliveredPieces')); else console.error("MISSING: copyDeliveredPiecesBtn");
    if (copyDeliveredWeightBtn) copyDeliveredWeightBtn.addEventListener('click', () => copyValue('totalWeight', 'deliveredWeight')); else console.error("MISSING: copyDeliveredWeightBtn");
    if (btnClearAwb) btnClearAwb.addEventListener('click', clearAwbDetails); else console.error("MISSING: btnClearAwb");
    if (btnClearAll) btnClearAll.addEventListener('click', clearAllFields); else console.error("MISSING: btnClearAll");
    if (awbInput) {
        awbInput.addEventListener('input', formatAwbInput); // Call formatter on input
    } else { console.error("MISSING: awbInput"); }

    // PWA Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(registration => console.log('ServiceWorker registration successful'))
                .catch(error => console.log('ServiceWorker registration failed: ', error));
        });
    }

    // Load initial data
    loadCommonData();
});