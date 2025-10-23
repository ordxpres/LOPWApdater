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

    // === NEW "TODAY" BUTTONS ===
    const arrDateTodayBtn = document.getElementById('arrivalDateToday');
    const pickupDateTodayBtn = document.getElementById('pickupDateToday');


    // --- Attach event listeners ---
    if(btnShowRcf) {
        btnShowRcf.addEventListener('click', showRcfForm);
    }
    if(btnShowDlv) {
        btnShowDlv.addEventListener('click', showDlvForm);
    }
    if(btnGenRcf) {
        btnGenRcf.addEventListener('click', generateRcfOutput);
    }
    if(btnGenDlv) {
        btnGenDlv.addEventListener('click', generateDlvOutput);
    }
    if(submitBtn) {
        submitBtn.addEventListener('click', submitEmail);
    }
    if(statusForm) {
        statusForm.addEventListener('submit', (event) => {
            event.preventDefault();
        });
    }

    if (arrTimeNowBtn) {
        arrTimeNowBtn.addEventListener('click', () => setCurrentTime('arrTime'));
    }
    if (pickupTimeNowBtn) {
        pickupTimeNowBtn.addEventListener('click', () => setCurrentTime('pickupTime'));
    }

    // === NEW "TODAY" BUTTON LISTENERS ===
    if (arrDateTodayBtn) {
        arrDateTodayBtn.addEventListener('click', () => setCurrentDate('arrivalDate'));
    }
    if (pickupDateTodayBtn) {
        pickupDateTodayBtn.addEventListener('click', () => setCurrentDate('pickupDate'));
    }

    // --- PWA Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful');
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed: ', error);
                });
        });
    }

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

    // === NEW HELPER FUNCTION TO SET CURRENT DATE ===
    function setCurrentDate(inputId) {
        const now = new Date();
        // Format as YYYY-MM-DD for the date input
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(now.getDate()).padStart(2, '0');
        
        const dateInput = document.getElementById(inputId);
        if (dateInput) {
            dateInput.value = `${year}-${month}-${day}`;
        }
    }


    // --- FORM DISPLAY FUNCTIONS ---
    function showRcfForm() {
        document.getElementById('commonFields').style.display = 'block';
        document.getElementById('rcfFields').style.display = 'block';
        document.getElementById('dlvFields').style.display = 'none';
        document.getElementById('outputContainer').style.display = 'none';
    }

    function showDlvForm() {
        document.getElementById('commonFields').style.display = 'block';
        document.getElementById('dlvFields').style.display = 'block';
        document.getElementById('rcfFields').style.display = 'none';
        document.getElementById('outputContainer').style.display = 'none';
    }

    // --- RCF OUTPUT GENERATION ---
    function generateRcfOutput() {
        // --- Input Validation ---
        if (!/^\d{3}-\d{8}$/.test(document.getElementById('awb').value)) {
            alert('Error: AWB must be in the format NNN-NNNNNNNN.');
            return;
        }
        if (!/^\d{1,4}$/.test(document.getElementById('flight').value)) {
            alert('Error: Arriving flight must be 1 to 4 digits.');
            return;
        }
        if (document.getElementById('arrivalDate').value === '') {
            alert('Error: Please select an arrival date.');
            return;
        }
        if (document.getElementById('arrTime').value === '') {
            alert('Error: Please select an arrival time.');
            return;
        }

        // --- Get Form Values ---
        const form = document.getElementById('statusForm');
        const awbValue = form.elements['awb'].value;
        const originValue = form.elements['origin'].value.toUpperCase();
        const destValue = form.elements['destination'].value.toUpperCase();
        const totalPiecesValue = form.elements['totalPieces'].value;
        const totalWeightValue = form.elements['totalWeight'].value;
        const arrivedPiecesValue = form.elements['arrivedPieces'].value;
        const arrivedWeightValue = form.elements['arrivedWeight'].value;
        const flightValue = `LO${form.elements['flight'].value}`;
        const dateValue = formatDateToDDMMM(form.elements['arrivalDate'].value);
        const timeValue = formatTimeToHHMM(form.elements['arrTime'].value);
        const portValue = form.elements['arrivalPort'].value.toUpperCase();

        // --- Format Output ---
        const line1 = `FSU/15`;
        const line2 = `${awbValue}${originValue}${destValue}/T${totalPiecesValue}K${totalWeightValue}`;
        const line3 = `RCF/${flightValue}/${dateValue}${timeValue}/${portValue}/T${arrivedPiecesValue}K${arrivedWeightValue}`;
        const finalOutput = `${line1}\n${line2}\n${line3}`;

        // --- Display Output ---
        document.getElementById('outputText').value = finalOutput;
        document.getElementById('outputContainer').style.display = 'block';
        document.getElementById('submitBtn').style.display = 'block';
    }

    // --- DLV OUTPUT GENERATION ---
    function generateDlvOutput() {
        // --- Input Validation ---
        if (!/^\d{3}-\d{8}$/.test(document.getElementById('awb').value)) {
            alert('Error: AWB must be in the format NNN-NNNNNNNN.');
            return;
        }
        if (document.getElementById('pickupDate').value === '') {
            alert('Error: Please select a pick-up date.');
            return;
        }
        if (document.getElementById('pickupTime').value === '') {
            alert('Error: Please select a pick-up time.');
            return;
        }
        if (document.getElementById('pickedUpBy').value.trim() === '') {
            alert('Error: "Picked up by" field cannot be empty.');
            return;
        }

        // --- Get Form Values ---
        const form = document.getElementById('statusForm');
        const awbValue = form.elements['awb'].value;
        const originValue = form.elements['origin'].value.toUpperCase();
        const destValue = form.elements['destination'].value.toUpperCase();
        const totalPiecesValue = form.elements['totalPieces'].value;
        const totalWeightValue = form.elements['totalWeight'].value;
        const deliveredPiecesValue = form.elements['deliveredPieces'].value;
        const deliveredWeightValue = form.elements['deliveredWeight'].value;
        const dateValue = formatDateToDDMMM(form.elements['pickupDate'].value);
        const timeValue = formatTimeToHHMM(form.elements['pickupTime'].value);
        const portValue = form.elements['pickupPort'].value.toUpperCase();
        const pickedUpByValue = form.elements['pickedUpBy'].value.toUpperCase();

        // --- Format Output ---
        const line1 = `FSU/12`;
        const line2 = `${awbValue}${originValue}${destValue}/T${totalPiecesValue}K${totalWeightValue}`;
        const line3 = `DLV/${dateValue}${timeValue}/${portValue}/T${deliveredPiecesValue}K${deliveredWeightValue}/${pickedUpByValue}`;
        const finalOutput = `${line1}\n${line2}\n${line3}`;

        // --- Display Output ---
        document.getElementById('outputText').value = finalOutput;
        document.getElementById('outputContainer').style.display = 'block';
        document.getElementById('submitBtn').style.display = 'block';
    }

    // --- GENERIC EMAIL SUBMISSION ---
    function submitEmail() {
        const recipient = 'CHACSLO@EDI.CHAMP.AERO';
        const awbValue = document.getElementById('awb').value;
        const subject = `FSU Status Update for AWB ${awbValue}`;
        const body = document.getElementById('outputText').value;

        // Create the mailto link and encode the subject and body
        const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // Open the email client
        window.location.href = mailtoLink;
    }

}); // <-- This is the final closing bracket for the 'DOMContentLoaded' listener