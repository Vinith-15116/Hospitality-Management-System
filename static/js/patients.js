// ======================================================
// HOSPITAL HOSPITALITY MANAGEMENT SYSTEM
// PATIENTS MODULE
// ======================================================


// ======================================================
// STORAGE
// ======================================================

// ======================================================
// GLOBAL VARIABLES
// ======================================================

let patients = [];

let filteredPatients = [];

let currentPage = 1;

const rowsPerPage = 5;

let editIndex = -1;

let deleteIndex = -1;


// ======================================================
// HTML ELEMENTS
// ======================================================

const patientTable =
    document.getElementById("patientTable");

const searchBox =
    document.getElementById("searchPatient");

const modal =
    document.getElementById("patientModal");

const viewModal =
    document.getElementById("viewModal");

const deleteModal =
    document.getElementById("deleteModal");

const totalPatients =
    document.getElementById("totalPatients");

const uploadInput =
    document.getElementById("csvUploadInput");

const uploadStatus =
    document.getElementById("uploadStatus");


// ======================================================
// INITIALIZATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "Patients Module Loaded Successfully"
        );


        registerEvents();


        await loadPatients();


    }
);


// ======================================================
// LOAD PATIENTS FROM FLASK + MYSQL
// ======================================================

async function loadPatients() {

    try {

        const response = await fetch(
            "/patients/data",
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.error || "Failed to load patients"
            );
        }

        patients = data.patients || [];

        console.log(
            "Patients loaded from MySQL:",
            patients.length
        );

        applyFilters();

    } catch (error) {

        console.error(
            "MySQL patient load error:",
            error
        );

        patients = [];
        applyFilters();

        showMessage(
            "Could not load patients from database.",
            "#dc2626"
        );

    }

}


// ======================================================
// DATABASE STORAGE IS HANDLED BY FLASK + MYSQL
// ======================================================


// ======================================================
// REGISTER EVENTS
// ======================================================

function registerEvents() {


    // ADD PATIENT

    const openButton =
        document.getElementById("openModal");

    if (openButton) {

        openButton.addEventListener(
            "click",
            openAddModal
        );

    }


    // CLOSE ADD/EDIT MODAL

    const closeButton =
        document.getElementById("closeModal");

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeModal
        );

    }


    // SAVE PATIENT

    const saveButton =
        document.getElementById("savePatient");

    if (saveButton) {

        saveButton.addEventListener(
            "click",
            savePatient
        );

    }


    // CLOSE VIEW MODAL

    const closeView =
        document.getElementById("closeViewModal");

    if (closeView) {

        closeView.addEventListener(
            "click",
            function () {

                viewModal.style.display = "none";

            }
        );

    }


    // CANCEL DELETE

    const cancelDelete =
        document.getElementById("cancelDelete");

    if (cancelDelete) {

        cancelDelete.addEventListener(
            "click",
            function () {

                deleteModal.style.display = "none";

            }
        );

    }


    // CONFIRM DELETE

    const confirmDeleteButton =
        document.getElementById("confirmDelete");

    if (confirmDeleteButton) {

        confirmDeleteButton.addEventListener(
            "click",
            confirmDelete
        );

    }


    // SEARCH

    if (searchBox) {

        searchBox.addEventListener(
            "input",
            applyFilters
        );

    }


    // CSV UPLOAD

    if (uploadInput) {

        uploadInput.addEventListener(
            "change",
            handleCSVUpload
        );

    }


    // PAGINATION

    const previousButton =
        document.getElementById("prevPage");

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            previousPage
        );

    }


    const nextButton =
        document.getElementById("nextPage");

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            nextPage
        );

    }

}


// ======================================================
// SEARCH
// ======================================================

function applyFilters() {

    const keyword =
        searchBox
            ? searchBox.value.toLowerCase().trim()
            : "";


    filteredPatients = patients.filter(
        function (patient) {

            const searchableText =
                Object.values(patient)
                    .join(" ")
                    .toLowerCase();

            return searchableText.includes(keyword);

        }
    );


    currentPage = 1;

    render();

}


// ======================================================
// RENDER
// ======================================================

function render() {

    renderTable();

    renderDashboard();

    renderPagination();

}


// ======================================================
// DASHBOARD
// ======================================================

function renderDashboard() {

    if (totalPatients) {

        totalPatients.innerText =
            patients.length;

    }

}


// ======================================================
// TABLE
// ======================================================

function renderTable() {

    patientTable.innerHTML = "";


    if (patients.length === 0) {

        patientTable.innerHTML = `

            <tr>

                <td
                    colspan="20"
                    style="
                        text-align:center;
                        padding:40px;
                    "
                >

                    No Patients Found

                </td>

            </tr>

        `;

        return;

    }


    // --------------------------------------------------
    // GET ALL COLUMNS
    // --------------------------------------------------

    const columns = getColumns();


    // --------------------------------------------------
    // CREATE TABLE HEADER
    // --------------------------------------------------

    const thead =
        document.querySelector(".table-box thead");

    thead.innerHTML = "";


    const headerRow =
        document.createElement("tr");


    columns.forEach(function (column) {

        const th =
            document.createElement("th");

        th.innerText =
            formatColumnName(column);

        headerRow.appendChild(th);

    });


    const actionHeader =
        document.createElement("th");

    actionHeader.innerText = "Actions";

    headerRow.appendChild(actionHeader);

    thead.appendChild(headerRow);


    // --------------------------------------------------
    // PAGINATION
    // --------------------------------------------------

    const start =
        (currentPage - 1) * rowsPerPage;

    const end =
        start + rowsPerPage;

    const pagePatients =
        filteredPatients.slice(start, end);


    // --------------------------------------------------
    // CREATE ROWS
    // --------------------------------------------------

    pagePatients.forEach(function (patient) {

        const actualIndex =
            patients.indexOf(patient);


        const row =
            document.createElement("tr");


        columns.forEach(function (column) {

            const td =
                document.createElement("td");


            let value =
                patient[column];


            if (
                column.toLowerCase() === "status" ||
                column.toLowerCase() === "patientstatus"
            ) {

                td.innerHTML =
                    getStatusBadge(value);

            }

            else {

                td.innerText =
                    value ?? "";

            }


            row.appendChild(td);

        });


        // ACTIONS

        const actionCell =
            document.createElement("td");


        actionCell.innerHTML = `

            <button
                class="view-btn"
                onclick="viewPatient(${actualIndex})"
                title="View"
            >

                <i class="fa-solid fa-eye"></i>

            </button>


            <button
                class="edit-btn"
                onclick="editPatient(${actualIndex})"
                title="Edit"
            >

                <i class="fa-solid fa-pen"></i>

            </button>


            <button
                class="delete-btn"
                onclick="deletePatient(${actualIndex})"
                title="Delete"
            >

                <i class="fa-solid fa-trash"></i>

            </button>

        `;


        row.appendChild(actionCell);

        patientTable.appendChild(row);

    });

}


// ======================================================
// GET TABLE COLUMNS
// ======================================================
// ======================================================
// GET TABLE COLUMNS
// ======================================================

function getColumns() {

    if (!patients || patients.length === 0) {
        return [];
    }

    return Object.keys(patients[0]);

}


// ======================================================
// FORMAT COLUMN NAME
// ======================================================

function formatColumnName(column) {

    return column
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, function (text) {
            return text.toUpperCase();
        });

}


// ======================================================
// STATUS BADGE
// ======================================================

function getStatusBadge(status) {

    if (!status) {
        return "";
    }


    const normalized =
        String(status)
            .toLowerCase()
            .trim();


    let className = "admitted";


    if (
        normalized === "under treatment" ||
        normalized === "recovering"
    ) {

        className = "recovering";

    }

    else if (
        normalized === "critical"
    ) {

        className = "critical";

    }

    else if (
        normalized === "recovered" ||
        normalized === "discharged"
    ) {

        className = "discharged";

    }


    return `

        <span class="${className}">

            ${status}

        </span>

    `;

}


// ======================================================
// OPEN ADD PATIENT MODAL
// ======================================================

function openAddModal() {

    editIndex = -1;


    const modalTitle =
        document.getElementById("modalTitle");


    if (modalTitle) {

        modalTitle.innerText =
            "Add Patient";

    }


    clearForm();


    modal.style.display =
        "flex";

}


// ======================================================
// CLEAR FORM
// ======================================================

function clearForm() {

    const fields = [

        "patientName",
        "patientAge",
        "patientGender",
        "patientBloodGroup",
        "patientPhone",
        "patientEmail",
        "patientAddress",
        "patientDisease",
        "patientDoctor",
        "patientWard",
        "patientBed",
        "patientInsurance",
        "patientEmergency",
        "patientAdmissionDate",
        "patientStatus"

    ];


    fields.forEach(function (id) {

        const element =
            document.getElementById(id);


        if (element) {

            element.value = "";

        }

    });


    const status =
        document.getElementById(
            "patientStatus"
        );


    if (status) {

        status.value =
            "Admitted";

    }


    const insurance =
        document.getElementById(
            "patientInsurance"
        );


    if (insurance) {

        insurance.value =
            "No";

    }


    const editField =
        document.getElementById(
            "editIndex"
        );


    if (editField) {

        editField.value = "";

    }

}


// ======================================================
// CLOSE MODAL
// ======================================================

function closeModal() {

    if (modal) {

        modal.style.display =
            "none";

    }


    editIndex = -1;

}


// ======================================================
// GET INPUT VALUE
// ======================================================

function getValue(id) {

    const element =
        document.getElementById(id);


    if (!element) {

        return "";

    }


    return element.value.trim();

}


// ======================================================
// SAVE PATIENT
// ADD OR EDIT
// ======================================================

async function savePatient() {

    const patient = {

    PatientID:
        getValue("patientID"),

    PatientName:
        getValue("patientName"),

    Age:
        getValue("patientAge"),

    Gender:
        getValue("patientGender"),

    Disease:
        getValue("patientDisease"),

    Allergies:
        getValue("patientAllergies"),

    PreviousDiseases:
        getValue("patientPreviousDiseases"),

    LabTestResults:
        getValue("patientLabTestResults"),

    AdmissionDate:
        getValue("patientAdmissionDate"),

    RoomNumber:
        getValue("patientRoomNumber"),

    BedID:
        getValue("patientBedID"),

    BedType:
        getValue("patientBedType"),

    NurseID:
        getValue("patientNurseID"),

    DoctorAssigned:
        getValue("patientDoctor"),

    MedicineRequired:
        getValue("patientMedicineRequired"),

    MedicineTime:
        getValue("patientMedicineTime"),

    PatientStatus:
        getValue("patientStatus"),

    EmergencyContact:
        getValue("patientEmergency"),

    DischargeDate:
        getValue("patientDischargeDate"),

    Temperature:
        getValue("patientTemperature"),

    BloodPressure:
        getValue("patientBloodPressure"),

    SugarLevel:
        getValue("patientSugarLevel"),

    HeartRate:
        getValue("patientHeartRate"),

    OxygenLevel:
        getValue("patientOxygenLevel"),

    WBCCount:
        getValue("patientWBCCount"),

    PlateletCount:
        getValue("patientPlateletCount"),

    Hemoglobin:
        getValue("patientHemoglobin"),

    FeverSymptom:
        getValue("patientFeverSymptom"),

    Cough:
        getValue("patientCough"),

    Vomiting:
        getValue("patientVomiting"),

    ChestPain:
        getValue("patientChestPain"),

    Headache:
        getValue("patientHeadache"),

    ShortnessOfBreath:
        getValue("patientShortnessOfBreath"),

    SeverityLevel:
        getValue("patientSeverityLevel"),

    MedicineQuantityUsed:
        getValue("patientMedicineQuantityUsed"),

    CurrentMedicineStock:
        getValue("patientCurrentMedicineStock"),

    Season:
        getValue("patientSeason")

};

    // ==================================================
    // VALIDATION
    // ==================================================

    if (
        patient.PatientName === "" ||
        patient.Age === "" ||
        patient.Gender === "" ||
        patient.Disease === "" ||
        patient.DoctorAssigned === ""
    ) {

        alert(
            "Please fill Name, Age, Gender, Disease and Doctor."
        );

        return;

    }


    try {

        let response;


        // ==================================================
        // EDIT EXISTING PATIENT
        // ==================================================

        if (editIndex !== -1) {

            const existingPatient =
                patients[editIndex];


            if (!existingPatient) {

                throw new Error(
                    "Patient not found."
                );

            }


            response = await fetch(

                `/patients/${existingPatient.id}`,

                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(patient)

                }

            );

        }


        // ==================================================
        // ADD NEW PATIENT
        // ==================================================

        else {

            patient.PatientID =
                generatePatientID();


            response = await fetch(

                "/patients",

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(patient)

                }

            );

        }


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.error ||
                "Patient operation failed."
            );

        }


        // ==================================================
        // SUCCESS MESSAGE
        // ==================================================

        if (editIndex === -1) {

            showMessage(
                "Patient added successfully!"
            );

        }

        else {

            showMessage(
                "Patient updated successfully!"
            );

        }


        // Close modal

        closeModal();


        // Reload directly from MySQL

        await loadPatients();

    }


    catch (error) {

        console.error(
            "Save patient error:",
            error
        );


        showMessage(

            "Could not save patient: " +
            error.message,

            "#dc2626"

        );

    }

}


// ======================================================
// GENERATE PATIENT ID
// ======================================================

function generatePatientID() {

    return "P" +

        Math.floor(

            10000 +
            Math.random() * 90000

        );

}


// ======================================================
// EDIT PATIENT
// ======================================================

function editPatient(index) {

    const patient =
        patients[index];


    if (!patient) {

        return;

    }


    editIndex =
        index;


    const modalTitle =
        document.getElementById(
            "modalTitle"
        );


    if (modalTitle) {

        modalTitle.innerText =
            "Edit Patient";

    }


    // --------------------------------------------------
    // BASIC DETAILS
    // --------------------------------------------------

    setValue(
        "patientName",
        patient.PatientName
    );


    setValue(
        "patientAge",
        patient.Age
    );


    setValue(
        "patientGender",
        patient.Gender
    );


    setValue(
        "patientBloodGroup",
        patient.BloodGroup
    );


    // --------------------------------------------------
    // CONTACT DETAILS
    // --------------------------------------------------

    setValue(
        "patientPhone",
        patient.Phone
    );


    setValue(
        "patientEmail",
        patient.Email
    );


    setValue(
        "patientAddress",
        patient.Address
    );


    // --------------------------------------------------
    // MEDICAL DETAILS
    // --------------------------------------------------

    setValue(
        "patientDisease",
        patient.Disease
    );


    setValue(
        "patientDoctor",
        patient.DoctorAssigned
    );


    // --------------------------------------------------
    // WARD / BED
    // --------------------------------------------------

    setValue(
        "patientWard",
        patient.Ward
    );


    setValue(
        "patientBed",
        patient.BedID ||
        patient.BedNumber
    );


    // --------------------------------------------------
    // INSURANCE
    // --------------------------------------------------

    setValue(
        "patientInsurance",
        patient.Insurance
    );


    // --------------------------------------------------
    // EMERGENCY CONTACT
    // --------------------------------------------------

    setValue(
        "patientEmergency",
        patient.EmergencyContact
    );


    // --------------------------------------------------
    // ADMISSION DATE
    // --------------------------------------------------

    setValue(
        "patientAdmissionDate",
        patient.AdmissionDate
    );


    // --------------------------------------------------
    // STATUS
    // --------------------------------------------------

    setValue(
        "patientStatus",
        patient.PatientStatus
    );


    // --------------------------------------------------
    // HIDDEN INDEX
    // --------------------------------------------------

    const editField =
        document.getElementById(
            "editIndex"
        );


    if (editField) {

        editField.value =
            index;

    }


    // --------------------------------------------------
    // OPEN MODAL
    // --------------------------------------------------

    modal.style.display =
        "flex";

}


// ======================================================
// SET INPUT VALUE
// ======================================================

function setValue(id, value) {

    const element =
        document.getElementById(id);


    if (!element) {

        return;

    }


    if (
        value === null ||
        value === undefined
    ) {

        element.value = "";

    }

    else {

        element.value = value;

    }

}


// ======================================================
// VIEW PATIENT
// ======================================================

function viewPatient(index) {

    const patient =
        patients[index];


    if (!patient) {

        return;

    }


    const container =
        document.getElementById(
            "viewPatientData"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    Object.keys(patient).forEach(
        function (key) {

            const value =
                patient[key];


            const row =
                document.createElement("div");


            row.style.display =
                "flex";

            row.style.justifyContent =
                "space-between";

            row.style.gap =
                "20px";

            row.style.padding =
                "10px 0";

            row.style.borderBottom =
                "1px solid #e5e7eb";


            const label =
                document.createElement("strong");


            label.innerText =
                formatColumnName(key);


            const valueElement =
                document.createElement("span");


            valueElement.innerText =
                value ?? "";


            row.appendChild(label);

            row.appendChild(
                valueElement
            );


            container.appendChild(row);

        }
    );


    viewModal.style.display =
        "flex";

}


// ======================================================
// DELETE PATIENT
// ======================================================

function deletePatient(index) {

    if (!patients[index]) {

        return;

    }


    deleteIndex =
        index;


    const hiddenField =
        document.getElementById(
            "deleteIndex"
        );


    if (hiddenField) {

        hiddenField.value =
            index;

    }


    deleteModal.style.display =
        "flex";

}


// ======================================================
// CONFIRM DELETE
// ======================================================

async function confirmDelete() {

    if (deleteIndex === -1) {

        return;

    }


    const patient =
        patients[deleteIndex];


    if (!patient) {

        return;

    }


    try {

        const response =
            await fetch(

                `/patients/${patient.id}`,

                {

                    method: "DELETE"

                }

            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.error ||
                "Delete failed"
            );

        }


        deleteIndex = -1;


        if (deleteModal) {

            deleteModal.style.display =
                "none";

        }


        showMessage(
            "Patient deleted successfully!",
            "#dc2626"
        );


        await loadPatients();

    }


    catch (error) {

        console.error(
            "Delete error:",
            error
        );


        showMessage(
            "Could not delete patient.",
            "#dc2626"
        );

    }

}


// ======================================================
// PAGINATION
// ======================================================
// ======================================================
// PAGINATION
// ======================================================

function renderPagination() {

    const pageNumber =
        document.getElementById("pageNumber");

    if (pageNumber) {

        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    filteredPatients.length /
                    rowsPerPage
                )
            );

        pageNumber.innerText =
            `${currentPage} / ${totalPages}`;

    }


    const previousButton =
        document.getElementById("prevPage");

    const nextButton =
        document.getElementById("nextPage");


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredPatients.length /
                rowsPerPage
            )
        );


    if (previousButton) {

        previousButton.disabled =
            currentPage <= 1;

    }


    if (nextButton) {

        nextButton.disabled =
            currentPage >= totalPages;

    }

}


// ======================================================
// PREVIOUS PAGE
// ======================================================

function previousPage() {

    if (currentPage > 1) {

        currentPage--;

        render();

    }

}


// ======================================================
// NEXT PAGE
// ======================================================

function nextPage() {

    const totalPages =
        Math.ceil(
            filteredPatients.length /
            rowsPerPage
        );


    if (currentPage < totalPages) {

        currentPage++;

        render();

    }

}


// ======================================================
// CSV UPLOAD
// ======================================================

async function handleCSVUpload(event) {

    const file =
        event.target.files[0];


    if (!file) {

        return;

    }


    console.log(
        "CSV file selected:",
        file.name
    );


    console.log(
        "CSV file type:",
        file.type
    );


    console.log(
        "CSV file size:",
        file.size
    );


    // --------------------------------------------------
    // CHECK FILE TYPE
    // --------------------------------------------------

    if (
        !file.name
            .toLowerCase()
            .endsWith(".csv")
    ) {

        showMessage(
            "Please select a valid CSV file.",
            "#dc2626"
        );


        event.target.value = "";

        return;

    }


    try {

        // ------------------------------------------------
        // UPLOAD MESSAGE
        // ------------------------------------------------

        if (uploadStatus) {

            uploadStatus.innerText =
                "Uploading CSV to MySQL...";

            uploadStatus.style.color =
                "#2563eb";

        }


        // ------------------------------------------------
        // CREATE FORM DATA
        // ------------------------------------------------

        const formData =
            new FormData();


        formData.append(
            "file",
            file
        );


        // ------------------------------------------------
        // SEND FILE TO FLASK
        // ------------------------------------------------

        const response =
            await fetch(
                "/patients/upload-csv",
                {

                    method: "POST",

                    body: formData

                }
            );


        // ------------------------------------------------
        // READ RESPONSE
        // ------------------------------------------------

        const data =
            await response.json();


        console.log(
            "CSV server response:",
            data
        );


        // ------------------------------------------------
        // CHECK RESPONSE
        // ------------------------------------------------

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.error ||
                "CSV upload failed."
            );

        }


        // ------------------------------------------------
        // SUCCESS
        // ------------------------------------------------

        const importedCount =
            data.count || 0;


        if (uploadStatus) {

            uploadStatus.innerText =
                importedCount +
                " patient(s) imported successfully.";

            uploadStatus.style.color =
                "#16a34a";

        }


        showMessage(
            importedCount +
            " patient(s) imported successfully!"
        );


        // ------------------------------------------------
        // RELOAD PATIENTS FROM MYSQL
        // ------------------------------------------------

        await loadPatients();


    }

    catch (error) {

        console.error(
            "CSV upload error:",
            error
        );


        if (uploadStatus) {

            uploadStatus.innerText =
                "CSV upload failed: " +
                error.message;

            uploadStatus.style.color =
                "#dc2626";

        }


        showMessage(
            error.message ||
            "Could not upload CSV file.",
            "#dc2626"
        );

    }


    // --------------------------------------------------
    // RESET FILE INPUT
    // --------------------------------------------------

    event.target.value = "";

}


// ======================================================
// REFRESH PATIENT STATISTICS
// ======================================================

async function refreshPatientStatistics() {

    try {

        const response =
            await fetch(
                "/patients/stats",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP error: ${response.status}`
            );

        }


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.error ||
                "Statistics loading failed."
            );

        }


        console.log(
            "Patient statistics:",
            data
        );


        const statistics =
            data.patients;


        if (totalPatients) {

            totalPatients.innerText =
                statistics.total;

        }


        // ------------------------------------------------
        // OPTIONAL STATUS CARDS
        // ------------------------------------------------

        updateStatusCard(
            "Admitted",
            statistics.admitted
        );


        updateStatusCard(
            "Under Treatment",
            statistics.under_treatment
        );


        updateStatusCard(
            "Recovered",
            statistics.recovered
        );


    }

    catch (error) {

        console.error(
            "Statistics error:",
            error
        );

    }

}


// ======================================================
// UPDATE STATUS CARD
// ======================================================

function updateStatusCard(
    status,
    value
) {

    const cards =
        document.querySelectorAll(
            "#statusCards .card"
        );


    cards.forEach(
        function (card) {

            const heading =
                card.querySelector("h3");


            if (!heading) {

                return;

            }


            if (
                heading.innerText
                    .trim()
                    .toLowerCase() ===
                status
                    .toLowerCase()
            ) {

                const number =
                    card.querySelector("h2");


                if (number) {

                    number.innerText =
                        Number(value)
                            .toLocaleString();

                }

            }

        }
    );

}


// ======================================================
// REFRESH EVERYTHING
// ======================================================

async function refreshPatients() {

    await loadPatients();

    await refreshPatientStatistics();

}


// ======================================================
// AUTO REFRESH DATABASE DATA
// ======================================================

// Refresh every 10 seconds

setInterval(
    refreshPatients,
    10000
);


// ======================================================
// CLOSE MODALS WHEN CLICKING OUTSIDE
// ======================================================

window.addEventListener(
    "click",
    function (event) {

        if (
            event.target === modal
        ) {

            closeModal();

        }


        if (
            event.target === viewModal
        ) {

            viewModal.style.display =
                "none";

        }


        if (
            event.target === deleteModal
        ) {

            deleteModal.style.display =
                "none";

        }

    }
);


// ======================================================
// ESC KEY
// ======================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key !== "Escape") {

            return;

        }


        if (
            modal &&
            modal.style.display === "flex"
        ) {

            closeModal();

        }


        if (
            viewModal &&
            viewModal.style.display === "flex"
        ) {

            viewModal.style.display =
                "none";

        }


        if (
            deleteModal &&
            deleteModal.style.display === "flex"
        ) {

            deleteModal.style.display =
                "none";

        }

    }
);
// ======================================================
// SHOW MESSAGE
// ======================================================

function showMessage(
    message,
    background = "#16a34a"
) {

    const existing =
        document.querySelector(
            ".patient-message"
        );


    if (existing) {

        existing.remove();

    }


    const messageBox =
        document.createElement("div");


    messageBox.className =
        "patient-message";


    messageBox.innerText =
        message;


    messageBox.style.position =
        "fixed";

    messageBox.style.top =
        "20px";

    messageBox.style.right =
        "20px";

    messageBox.style.zIndex =
        "9999";

    messageBox.style.background =
        background;

    messageBox.style.color =
        "white";

    messageBox.style.padding =
        "14px 22px";

    messageBox.style.borderRadius =
        "10px";

    messageBox.style.fontWeight =
        "600";

    messageBox.style.boxShadow =
        "0 10px 25px rgba(0,0,0,.15)";


    document.body.appendChild(
        messageBox
    );


    setTimeout(
        function () {

            messageBox.remove();

        },
        3000
    );

}


// ======================================================
// INITIAL STATISTICS LOAD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        refreshPatientStatistics();

    }
);

// =========================================================
// PATIENT FORM - WARD / BED / NURSE / DOCTOR / MEDICINE
// =========================================================

async function loadWards() {

    const wardSelect = document.getElementById("patientWard");

    if (!wardSelect) {
        console.error("patientWard not found");
        return;
    }

    wardSelect.innerHTML =
        `<option value="">Select Ward</option>`;

    try {

        const response = await fetch("/patients/wards");
        const data = await response.json();

        console.log("WARD DATA:", data);

        if (!data.success) {
            throw new Error(data.error || "Ward loading failed");
        }

        data.wards.forEach(ward => {

            const option = document.createElement("option");

            option.value = ward;
            option.textContent = ward;

            wardSelect.appendChild(option);

        });

    } catch (error) {

        console.error("WARD ERROR:", error);

    }
}


// =========================================================
// LOAD BEDS
// =========================================================

async function loadBedsByWard(ward) {

    const bedSelect =
        document.getElementById("patientBedID");

    const roomInput =
        document.getElementById("patientRoomNumber");

    if (!bedSelect) {
        console.error("patientBedID not found");
        return;
    }

    bedSelect.innerHTML =
        `<option value="">Select Bed</option>`;

    if (roomInput) {
        roomInput.value = "";
    }

    if (!ward) return;

    try {

        const response =
            await fetch(
                `/patients/beds/${encodeURIComponent(ward)}`
            );

        const data = await response.json();

        console.log("BED DATA:", data);

        if (!data.success) {
            throw new Error(data.error || "Bed loading failed");
        }

        data.beds.forEach(bed => {

            const option =
                document.createElement("option");

            option.value = bed["Bed ID"];

            option.textContent =
                `${bed["Bed ID"]} | Room ${bed.Room} | Bed ${bed["Bed No."]}`;

            option.dataset.room = bed.Room;

            bedSelect.appendChild(option);

        });

    } catch (error) {

        console.error("BED ERROR:", error);

    }
}


// =========================================================
// LOAD NURSES
// =========================================================

async function loadNursesByWard(ward) {

    const nurseSelect =
        document.getElementById("patientNurseID");

    if (!nurseSelect) {
        console.error("patientNurseID not found");
        return;
    }

    nurseSelect.innerHTML =
        `<option value="">Select Nurse</option>`;

    if (!ward) return;

    try {

        const response =
            await fetch(
                `/patients/nurses/${encodeURIComponent(ward)}`
            );

        const data = await response.json();

        console.log("NURSE DATA:", data);

        if (!data.success) {
            throw new Error(data.error || "Nurse loading failed");
        }

        data.nurses.forEach(nurse => {

            const option =
                document.createElement("option");

            option.value = nurse.NRID;

            option.textContent =
                `${nurse.Name} (${nurse.NRID})`;

            nurseSelect.appendChild(option);

        });

    } catch (error) {

        console.error("NURSE ERROR:", error);

    }
}


// =========================================================
// WARD CHANGE
// =========================================================

document.addEventListener("change", function(event) {

    if (event.target.id === "patientWard") {

        const ward = event.target.value;

        console.log("SELECTED WARD:", ward);

        loadBedsByWard(ward);
        loadNursesByWard(ward);
    }

});


// =========================================================
// BED CHANGE
// =========================================================

document.addEventListener("change", function(event) {

    if (event.target.id === "patientBedID") {

        const selected =
            event.target.options[
                event.target.selectedIndex
            ];

        const roomInput =
            document.getElementById("patientRoomNumber");

        if (roomInput) {

            roomInput.value =
                selected.dataset.room || "";

        }

    }

});

// =========================================================
// LOAD DOCTORS
// =========================================================

async function loadDoctors() {

    const doctorSelect =
        document.getElementById("patientDoctor");

    if (!doctorSelect) {
        console.error("patientDoctor not found");
        return;
    }

    doctorSelect.innerHTML =
        `<option value="">Select Doctor</option>`;

    try {

        const response =
            await fetch("/patients/doctors");

        const data =
            await response.json();

        console.log("DOCTOR DATA:", data);

        if (!response.ok || !data.success) {
            throw new Error(
                data.error || "Doctor loading failed"
            );
        }

        data.doctors.forEach(doctor => {

            const option =
                document.createElement("option");

            option.value = doctor.Name;

            option.textContent =
                `${doctor.Name} (${doctor.DRID}) - ${doctor.Department}`;

            doctorSelect.appendChild(option);

        });

    } catch (error) {

        console.error(
            "DOCTOR ERROR:",
            error
        );

    }
}

// =========================================================
// LOAD MEDICINES
// =========================================================

async function loadMedicines() {

    const medicineField =
        document.getElementById("patientMedicineRequired");

    if (!medicineField) {
        console.error("patientMedicineRequired not found");
        return;
    }

    try {

        const response =
            await fetch("/patients/medicines");

        const data =
            await response.json();

        console.log("MEDICINE DATA:", data);

        if (!response.ok || !data.success) {
            throw new Error(
                data.error || "Medicine loading failed"
            );
        }

        // Create dropdown if currently an input
        if (medicineField.tagName !== "SELECT") {

            const medicineSelect =
                document.createElement("select");

            medicineSelect.id =
                "patientMedicineRequired";

            medicineSelect.name =
                "patientMedicineRequired";

            medicineField.replaceWith(medicineSelect);
        }

        const medicineSelect =
            document.getElementById(
                "patientMedicineRequired"
            );

        medicineSelect.innerHTML =
            `<option value="">Select Medicine</option>`;

        data.medicines.forEach(medicine => {

            const option =
                document.createElement("option");

            option.value =
                medicine["Medicine Name"];

            option.textContent =
                `${medicine["Medicine Name"]} | Stock: ${medicine.Quantity}`;

            medicineSelect.appendChild(option);

        });

    } catch (error) {

        console.error(
            "MEDICINE ERROR:",
            error
        );

    }
}

// =========================================================
// LOAD EVERYTHING
// =========================================================

document.addEventListener("DOMContentLoaded", function() {

    loadWards();

    loadDoctors();

    loadMedicines();

});

// ======================================================
// EXPORT FUNCTIONS
// ======================================================

window.viewPatient =
    viewPatient;

window.editPatient =
    editPatient;

window.deletePatient =
    deletePatient;

window.nextPage =
    nextPage;

window.previousPage =
    previousPage;
