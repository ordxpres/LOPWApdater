// Wait for the HTML document to be fully loaded before running ANY code
document.addEventListener('DOMContentLoaded', () => {

    // --- Get all the elements by their IDs ---
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

    // --- Get the section divs ---
    const commonFieldsDiv = document.getElementById('commonFields');
    const rcfFieldsDiv = document.getElementById('rcfFields');
    const dlvFieldsDiv = document.getElementById('dlvFields');
    const outputContainerDiv = document.getElementById('outputContainer');
    const utilityButtonsDiv = document.getElementById('utilityButtons');

    // --- HELPER FUNCTION (Date) ---
    function formatDateToDDMMM(dateString) {
        if (!dateString) return "";
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const date = new Date(dateString + 'T00:00:00');
        const day = String(date.getDate()).padStart(2, '0');
        const month = months[date.getMonth()];
        return day + month;
    }

    // --- HELPER FUNCTION (Time) ---
    function formatTimeToHHMM(timeString) {
        if (!timeString) return "";
        return timeString.replace(":", "");
    }

    // --- HELPER FUNCTION (Set Time) ---
    function setCurrentTime(inputId) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        const timeInput = document.getElementById(inputId);
        if (timeInput) {
            timeInput.value = `${hours}:${minutes}`;
        }
    }

    // --- HELPER FUNCTION (Set Date) ---
    function setCurrentDate(inputId) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        const dateInput = document.getElementById(inputId);
        if (dateInput) {
            dateInput.value = `${year}-${month}-${day}`;
        }
    }

    // --- HELPER FUNCTION (Copy) ---
    function copyValue(sourceId, destinationId) {
        const sourceEl = document.getElementById(sourceId);
        const destEl = document.getElementById(destinationId);
        if (sourceEl && destEl) {
            destEl.value = sourceEl.value;
        }
    }

    // --- SAVE/LOAD DATA FUNCTIONS ---
    function saveCommonData() {
        try {
            localStorage.setItem('fsu_awb', document.getElementById('awb').value);
            localStorage.setItem('fsu_origin', document.getElementById('origin').value);
            localStorage.setItem('fsu_destination', document.getElementById('destination').value);
            localStorage.setItem('fsu_totalPieces', document.getElementById('totalPieces').value);
            localStorage.setItem('fsu_totalWeight', document.getElementById('totalWeight').value);
        } catch (e) {
            console.error("Could not save data to localStorage", e);
        }
    }

    function loadCommonData() {
        console.log("loadCommonData called"); // Add log
        try {
            const awbInput = document.getElementById('awb');
            const originInput = document.getElementById('origin');
            const destInput = document.getElementById('destination');
            const piecesInput = document.getElementById('totalPieces');
            const weightInput = document.getElementById('totalWeight');

            if (awbInput) awbInput.value = localStorage.getItem('fsu_awb') || '';
            if (originInput) originInput.value = localStorage.getItem('fsu_origin') || 'WAW';
            if (destInput) destInput.value = localStorage.getItem('fsu_destination') || 'TBS';
            if (piecesInput) piecesInput.value = localStorage.getItem('fsu_totalPieces') || '';
            if (weightInput) weightInput.value = localStorage.getItem('fsu_totalWeight') || '';
            console.log("Data loaded successfully"); // Add log
        } catch (e) {
            console.error("Could not load data from localStorage", e);
        }
    }

    // --- CLEAR FUNCTIONS ---
    function clearAwbDetails() {
        const awbInput = document.getElementById('awb');
        const piecesInput = document.getElementById('totalPieces');
        const weightInput = document.getElementById('totalWeight');
        if (awbInput) awbInput.value = '';
        if (piecesInput) piecesInput.value = '';
        if (weightInput) weightInput.value = '';
    }

    function clearAllFields() {
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


        if (commonFieldsDiv) commonFieldsDiv.style.display = 'none';
        if (rcfFieldsDiv) rcfFieldsDiv.style.display = 'none';
        if (dlvFieldsDiv) dlvFieldsDiv.style.display = 'none';
        if (outputContainerDiv) outputContainerDiv.style.display = 'none';
        if (utilityButtonsDiv) utilityButtonsDiv.style.display = 'none';

        try {
            localStorage.removeItem('fsu_awb');
            localStorage.removeItem('fsu_origin');
            localStorage.removeItem('fsu_destination');
            localStorage.removeItem('fsu_totalPieces');
            localStorage.removeItem('fsu_totalWeight');
        } catch (e) {
            console.error("Could not clear localStorage", e);
        }
    }


    // --- FORM DISPLAY FUNCTIONS ---
    function showRcfForm() {
        console.log("showRcfForm called");
        if (commonFieldsDiv) commonFieldsDiv.style.display = 'block';
        if (rcfFieldsDiv) rcfFieldsDiv.style.display = 'block';
        if (dlvFieldsDiv) dlvFieldsDiv.style.display = 'none';
        if (outputContainerDiv) outputContainerDiv.style.display = 'none';
        if (utilityButtonsDiv) utilityButtonsDiv.style.display = 'grid';
    }

    function showDlvForm() {
        console.log("showDlvForm called");
        if (commonFieldsDiv) commonFieldsDiv.style.display = 'block';
        if (dlvFieldsDiv) dlvFieldsDiv.style.display = 'block';
        if (rcfFieldsDiv) rcfFieldsDiv.style.display = 'none';
        if (outputContainerDiv) outputContainerDiv.style.display = 'none';
        if (utilityButtonsDiv) utilityButtonsDiv.style.display = 'grid';
    }

    // --- RCF OUTPUT GENERATION ---
    function generateRcfOutput() {
        console.log("generateRcfOutput called");
        // --- Input Validation ---
        if (!/^\d{3}-\d{8}$/.test(document.getElementById('awb').value)) { alert('Error: AWB must be in the format NNN-NNNNNNNN.'); return; }
        if (!/^\d{1,4}$/.test(document.getElementById('flight').value)) { alert('Error: Arriving flight must be 1 to 4 digits.'); return; }
        if (document.getElementById('arrivalDate').value === '') { alert('Error: Please select an arrival date.'); return; }
        if (document.getElementById('arrTime').value === '') { alert('Error: Please select an arrival time.'); return; }

        // --- Get Form Values ---
        const awbValue = document.getElementById('awb').value;
        const originValue = document.getElementById('origin').value.toUpperCase();
        const destValue = document.getElementById('destination').value.toUpperCase();
        const totalPiecesValue = document.getElementById('totalPieces').value;
        const totalWeightValue = document.getElementById('totalWeight').value;
        const arrivedPiecesValue = document.getElementById('arrivedPieces').value;
        const arrivedWeightValue = document.getElementById('arrivedWeight').value;
        const flightValue = `LO${document.getElementById('flight').value}`;
        const dateValue = formatDateToDDMMM(document.getElementById('arrivalDate').value);
        const timeValue = formatTimeToHHMM(document.getElementById('arrTime').value);
        const portValue = document.getElementById('arrivalPort').value.toUpperCase();


        // --- Format Output ---
         const line1 = `FSU/15`;
         const line2 = `${awbValue}${originValue}${destValue}/T${totalPiecesValue}K${totalWeightValue}`;
         const line3 = `RCF/${flightValue}/${dateValue}${timeValue}/${portValue}/T${arrivedPiecesValue}K${arrivedWeightValue}`;
         const finalOutput = `${line1}\n${line2}\n${line3}`;


        // --- Display Output ---
        if (outputContainerDiv) {
            const outputText = document.getElementById('outputText');
            if(outputText) outputText.value = finalOutput;
            outputContainerDiv.style.display = 'block';
            if (submitBtn) submitBtn.style.display = 'block';

            // === ADDED: Scroll to output ===
            outputContainerDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // --- SAVE DATA ---
        saveCommonData();
    }

    // --- DLV OUTPUT GENERATION ---
    function generateDlvOutput() {
        console.log("generateDlvOutput called");
        // --- Input Validation ---
        if (!/^\d{3}-\d{8}$/.test(document.getElementById('awb').value)) { alert('Error: AWB must be in the format NNN-NNNNNNNN.'); return; }
        if (document.getElementById('pickupDate').value === '') { alert('Error: Please select a pick-up date.'); return; }
        if (document.getElementById('pickupTime').value === '') { alert('Error: Please select a pick-up time.'); return; }
        if (document.getElementById('pickedUpBy').value.trim() === '') { alert('Error: "Picked up by" field cannot be empty.'); return; }

        // --- Get Form Values ---
        const awbValue = document.getElementById('awb').value;
        const originValue = document.getElementById('origin').value.toUpperCase();
        const destValue = document.getElementById('destination').value.toUpperCase();
        const totalPiecesValue = document.getElementById('totalPieces').value;
        const totalWeightValue = document.getElementById('totalWeight').value;
        const deliveredPiecesValue = document.getElementById('deliveredPieces').value;
        const deliveredWeightValue = document.getElementById('deliveredWeight').value;
        const dateValue = formatDateToDDMMM(document.getElementById('pickupDate').value);
        const timeValue = formatTimeToHHMM(document.getElementById('pickupTime').value);
        const portValue = document.getElementById('pickupPort').value.toUpperCase();
        const pickedUpByValue = document.getElementById('pickedUpBy').value.toUpperCase();

        // --- Format Output ---
        const line1 = `FSU/12`;
        const line2 = `${awbValue}${originValue}${destValue}/T${totalPiecesValue}K${totalWeightValue}`;
        const line3 = `DLV/${dateValue}${timeValue}/${portValue}/T${deliveredPiecesValue}K${deliveredWeightValue}/${pickedUpByValue}`;
        const finalOutput = `${line1}\n${line2}\n${line3}`;


        // --- Display Output ---
         if (outputContainerDiv) {
            const outputText = document.getElementById('outputText');
            if(outputText) outputText.value = finalOutput;
            outputContainerDiv.style.display = 'block';
            if (submitBtn) submitBtn.style.display = 'block';

            // === ADDED: Scroll to output ===
            outputContainerDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // --- SAVE DATA ---
        saveCommonData();
    }

    // --- GENERIC EMAIL SUBMISSION ---
    function submitEmail() {
        console.log("submitEmail called");
        const recipient = 'CHACSLO@EDI.CHAMP.AERO';
        const awbValue = document.getElementById('awb').value;
        const subject = `FSU Status Update for AWB ${awbValue}`;
        const body = document.getElementById('outputText').value;

        const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    }

    // --- Attach event listeners ---
    if(btnShowRcf) btnShowRcf.addEventListener('click', showRcfForm);
    if(btnShowDlv) btnShowDlv.addEventListener('click', showDlvForm);
    if(btnGenRcf) btnGenRcf.addEventListener('click', generateRcfOutput);
    if(btnGenDlv) btnGenDlv.addEventListener('click', generateDlvOutput);
    if(submitBtn) submitBtn.addEventListener('click', submitEmail);
    if(statusForm) statusForm.addEventListener('submit', (event) => event.preventDefault());
    if (arrTimeNowBtn) arrTimeNowBtn.addEventListener('click', () => setCurrentTime('arrTime'));
    if (pickupTimeNowBtn) pickupTimeNowBtn.addEventListener('click', () => setCurrentTime('pickupTime'));
    if (arrDateTodayBtn) arrDateTodayBtn.addEventListener('click', () => setCurrentDate('arrivalDate'));
    if (pickupDateTodayBtn) pickupDateTodayBtn.addEventListener('click', () => setCurrentDate('pickupDate'));
    if (copyArrivedPiecesBtn) copyArrivedPiecesBtn.addEventListener('click', () => copyValue('totalPieces', 'arrivedPieces'));
    if (copyArrivedWeightBtn) copyArrivedWeightBtn.addEventListener('click', () => copyValue('totalWeight', 'arrivedWeight'));
    if (copyDeliveredPiecesBtn) copyDeliveredPiecesBtn.addEventListener('click', () => copyValue('totalPieces', 'deliveredPieces'));
    if (copyDeliveredWeightBtn) copyDeliveredWeightBtn.addEventListener('click', () => copyValue('totalWeight', 'deliveredWeight'));
    if (btnClearAwb) btnClearAwb.addEventListener('click', clearAwbDetails);
    if (btnClearAll) btnClearAll.addEventListener('click', clearAllFields);

    // --- PWA Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(registration => console.log('ServiceWorker registration successful'))
                .catch(error => console.log('ServiceWorker registration failed: ', error));
        });
    }

    // --- Load initial data ---
    loadCommonData();

}); // <-- Final closing bracket