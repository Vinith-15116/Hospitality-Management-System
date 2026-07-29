// ======================================================
// Hospital Hospitality Management System
// Patients Module
// ======================================================

// ---------- Local Storage Key ----------

const STORAGE_KEY = "hospital_patients";

// ---------- Global Variables ----------

let patients = [];

let filteredPatients = [];

let currentPage = 1;

const rowsPerPage = 5;

let editIndex = -1;

let deleteIndex = -1;

// ---------- HTML Elements ----------

const patientTable = document.getElementById("patientTable");

const searchBox = document.getElementById("searchPatient");

const statusFilter = document.getElementById("statusFilter");

const genderFilter = document.getElementById("genderFilter");

const modal = document.getElementById("patientModal");

const viewModal = document.getElementById("viewModal");

const deleteModal = document.getElementById("deleteModal");

const totalPatients = document.getElementById("totalPatients");

const criticalPatients = document.getElementById("criticalPatients");

const recoveringPatients = document.getElementById("recoveringPatients");

const dischargedPatients = document.getElementById("dischargedPatients");

// ---------- Initialization ----------

document.addEventListener("DOMContentLoaded", init);

function init() {

    loadPatients();

    registerEvents();

    applyFilters();

}

// ---------- Load Patients ----------

function loadPatients() {

    console.log("loadPatients() called");

    const data = localStorage.getItem(STORAGE_KEY);

    if (data) {
        try {
            patients = JSON.parse(data) || [];
        } catch (e) {
            console.error("Failed to parse patients from storage:", e);
            patients = [];
        }
    } else {
        patients = [
            {
                name: "Rahul Sharma",
                age: 32,
                gender: "Male",
                disease: "Heart Disease",
                doctor: "Dr. Mehta",
                status: "Admitted"
            },
            {
                name: "Anjali Gupta",
                age: 28,
                gender: "Female",
                disease: "Fever",
                doctor: "Dr. Singh",
                status: "Recovering"
            },
            {
                name: "Ramesh Kumar",
                age: 54,
                gender: "Male",
                disease: "Stroke",
                doctor: "Dr. Khan",
                status: "Critical"
            }
        ];
        savePatients();
    }

}

// ---------- Save Patients ----------

function savePatients(){

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(patients)

    );

}
// ======================================================
// Register Events
// ======================================================

function registerEvents() {

    document.getElementById("openModal")
        .addEventListener("click", openAddModal);

    document.getElementById("closeModal")
        .addEventListener("click", closeModal);

    document.getElementById("savePatient")
        .addEventListener("click", savePatient);

    document.getElementById("closeViewModal")
        .addEventListener("click", () => {

            viewModal.style.display = "none";

        });

    document.getElementById("cancelDelete")
        .addEventListener("click", () => {

            deleteModal.style.display = "none";

        });

    document.getElementById("confirmDelete")
        .addEventListener("click", confirmDelete);

    searchBox.addEventListener("keyup", applyFilters);

    statusFilter.addEventListener("change", applyFilters);

    genderFilter.addEventListener("change", applyFilters);

    document.getElementById("prevPage")
        .addEventListener("click", previousPage);

    document.getElementById("nextPage")
        .addEventListener("click", nextPage);

}

// ======================================================
// Apply Search & Filters
// ======================================================

function applyFilters() {

    const keyword = searchBox.value.toLowerCase();

    const status = statusFilter.value;

    const gender = genderFilter.value;

    filteredPatients = patients.filter(patient => {

        const searchMatch =

            patient.name.toLowerCase().includes(keyword) ||

            patient.disease.toLowerCase().includes(keyword) ||

            patient.doctor.toLowerCase().includes(keyword);

        const statusMatch =

            status === "All" ||

            patient.status === status;

        const genderMatch =

            gender === "All" ||

            patient.gender === gender;

        return searchMatch && statusMatch && genderMatch;

    });

    currentPage = 1;

    render();

}
// ======================================================
// Render Everything
// ======================================================

function render() {

    console.log("1");
    renderTable();

    console.log("2");
    renderDashboard();

    console.log("3");
    renderPagination();

    console.log("4");

}

// ======================================================
// Dashboard
// ======================================================

function renderDashboard(){

    totalPatients.innerText = patients.length;

    criticalPatients.innerText =

        patients.filter(p =>

            p.status === "Critical"

        ).length;

    recoveringPatients.innerText =

        patients.filter(p =>

            p.status === "Recovering"

        ).length;

    dischargedPatients.innerText =

        patients.filter(p =>

            p.status === "Discharged"

        ).length;

}
// ======================================================
// Render Table
// ======================================================

function renderTable(){

    patientTable.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;

    const end = start + rowsPerPage;

    const pagePatients = filteredPatients.slice(start, end);

    if(pagePatients.length === 0){

        patientTable.innerHTML = `

        <tr>

            <td colspan="8" style="text-align:center;padding:30px;">

                No Patients Found

            </td>

        </tr>

        `;

        return;

    }

    pagePatients.forEach(patient=>{

        const index = patients.indexOf(patient);

        const row = document.createElement("tr");

        row.innerHTML = `

        <td>${index+1}</td>

        <td>${patient.name}</td>

        <td>${patient.age}</td>

        <td>${patient.gender}</td>

        <td>${patient.disease}</td>

        <td>${patient.doctor}</td>

        <td>

            ${getStatusBadge(patient.status)}

        </td>

        <td>

            <button

            class="view-btn"

            onclick="viewPatient(${index})">

            <i class="fa-solid fa-eye"></i>

            </button>

            <button

            class="edit-btn"

            onclick="editPatient(${index})">

            <i class="fa-solid fa-pen"></i>

            </button>

            <button

            class="delete-btn"

            onclick="deletePatient(${index})">

            <i class="fa-solid fa-trash"></i>

            </button>

        </td>

        `;

        patientTable.appendChild(row);

    });

}
// ======================================================
// Status Badge
// ======================================================

function getStatusBadge(status){

    switch(status){

        case "Admitted":

            return `<span class="admitted">

            Admitted

            </span>`;

        case "Recovering":

            return `<span class="recovering">

            Recovering

            </span>`;

        case "Critical":

            return `<span class="critical">

            Critical

            </span>`;

        case "Discharged":

            return `<span class="discharged">

            Discharged

            </span>`;

        default:

            return status;

    }

}
// ======================================================
// Open Add Patient Modal
// ======================================================

function openAddModal(){

    editIndex = -1;

    document.getElementById("modalTitle").innerText = "Add Patient";

    clearForm();

    modal.style.display = "flex";

}

// ======================================================
// Close Modal
// ======================================================

function closeModal(){

    modal.style.display = "none";

}

// ======================================================
// Clear Form
// ======================================================

function clearForm(){

    document.getElementById("patientName").value = "";

    document.getElementById("patientAge").value = "";

    document.getElementById("patientGender").value = "";

    document.getElementById("patientDisease").value = "";

    document.getElementById("patientDoctor").value = "";

    document.getElementById("patientStatus").value = "Admitted";

}
// ======================================================
// Save Patient
// ======================================================

function savePatient(){

    const patient = {

    id: editIndex === -1
        ? Date.now()
        : patients[editIndex].id,

    name: document.getElementById("patientName").value.trim(),

    age: document.getElementById("patientAge").value,

    gender: document.getElementById("patientGender").value,

    bloodGroup: document.getElementById("patientBloodGroup").value,

    phone: document.getElementById("patientPhone").value.trim(),

    email: document.getElementById("patientEmail").value.trim(),

    address: document.getElementById("patientAddress").value.trim(),

    disease: document.getElementById("patientDisease").value.trim(),

    doctor: document.getElementById("patientDoctor").value.trim(),

    ward: document.getElementById("patientWard").value,

    bed: document.getElementById("patientBed").value,

    insurance: document.getElementById("patientInsurance").value,

    emergency: document.getElementById("patientEmergency").value.trim(),

    admissionDate: document.getElementById("patientAdmissionDate").value,

    status: document.getElementById("patientStatus").value

};

    // Validation

    if(

        patient.name==="" ||

        patient.age==="" ||

        patient.gender==="" ||

        patient.disease==="" ||

        patient.doctor===""

    ){

        alert("Please fill all fields.");

        return;

    }

    // Add

    if(editIndex===-1){

        patients.push(patient);

    }

    // Update

    else{

        patients[editIndex]=patient;

    }

    savePatients();

    applyFilters();

    closeModal();

}
// ======================================================
// Edit Patient
// ======================================================

function editPatient(index){

    editIndex = index;

    const patient = patients[index];

    document.getElementById("modalTitle").innerText = "Edit Patient";

    document.getElementById("patientName").value = patient.name;

    document.getElementById("patientAge").value = patient.age;

    document.getElementById("patientGender").value = patient.gender;

    document.getElementById("patientBloodGroup").value = patient.bloodGroup || "";

    document.getElementById("patientPhone").value = patient.phone || "";

    document.getElementById("patientEmail").value = patient.email || "";

    document.getElementById("patientAddress").value = patient.address || "";

    document.getElementById("patientDisease").value = patient.disease;

    document.getElementById("patientDoctor").value = patient.doctor;

    document.getElementById("patientWard").value = patient.ward || "";

    document.getElementById("patientBed").value = patient.bed || "";

    document.getElementById("patientInsurance").value = patient.insurance || "No";

    document.getElementById("patientEmergency").value = patient.emergency || "";

    document.getElementById("patientAdmissionDate").value = patient.admissionDate || "";

    document.getElementById("patientStatus").value = patient.status;

    modal.style.display = "flex";

}
// ======================================================
// PAGINATION
// ======================================================

function renderPagination() {

    const totalPages = Math.max(1, Math.ceil(filteredPatients.length / rowsPerPage));

    document.getElementById("pageNumber").innerText =
        currentPage + " / " + totalPages;

}

function previousPage() {

    if (currentPage > 1) {

        currentPage--;

        render();

    }

}

function nextPage() {

    const totalPages = Math.max(1, Math.ceil(filteredPatients.length / rowsPerPage));

    if (currentPage < totalPages) {

        currentPage++;

        render();

    }

}
// ======================================================
// DELETE
// ======================================================

function confirmDelete() {

    if (deleteIndex == -1) return;

    patients.splice(deleteIndex, 1);

    deleteIndex = -1;

    savePatients();

    applyFilters();

    deleteModal.style.display = "none";

}
// ======================================================
// VIEW PATIENT
// ======================================================

function viewPatient(index){

    const patient = patients[index];

    document.getElementById("viewPatientData").innerHTML = `

        <p><strong>Name:</strong> ${patient.name}</p>

        <p><strong>Age:</strong> ${patient.age}</p>

        <p><strong>Gender:</strong> ${patient.gender}</p>

        <p><strong>Blood Group:</strong> ${patient.bloodGroup || "-"}</p>

        <p><strong>Phone:</strong> ${patient.phone || "-"}</p>

        <p><strong>Email:</strong> ${patient.email || "-"}</p>

        <p><strong>Address:</strong> ${patient.address || "-"}</p>

        <p><strong>Disease:</strong> ${patient.disease}</p>

        <p><strong>Doctor:</strong> ${patient.doctor}</p>

        <p><strong>Ward:</strong> ${patient.ward || "-"}</p>

        <p><strong>Bed:</strong> ${patient.bed || "-"}</p>

        <p><strong>Insurance:</strong> ${patient.insurance || "-"}</p>

        <p><strong>Emergency Contact:</strong> ${patient.emergency || "-"}</p>

        <p><strong>Admission Date:</strong> ${patient.admissionDate || "-"}</p>

        <p><strong>Status:</strong> ${patient.status}</p>

    `;

    viewModal.style.display = "flex";

}

// ======================================================
// DELETE PATIENT
// ======================================================

function deletePatient(index){

    deleteIndex = index;

    deleteModal.style.display = "flex";

}

function confirmDelete(){

    if(deleteIndex === -1) return;

    patients.splice(deleteIndex,1);

    deleteIndex = -1;

    savePatients();

    applyFilters();

    deleteModal.style.display = "none";

}

// ======================================================
// EXPORT CSV
// ======================================================

function exportPatientsCSV(){

    let csv = "Name,Age,Gender,Disease,Doctor,Status\n";

    patients.forEach(patient=>{

        csv +=

`${patient.name},${patient.age},${patient.gender},${patient.disease},${patient.doctor},${patient.status}\n`;

    });

    const blob = new Blob([csv],{

        type:"text/csv"

    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "patients.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}

// ======================================================
// PAGINATION
// ======================================================

function renderPagination(){

    const totalPages = Math.max(

        1,

        Math.ceil(filteredPatients.length / rowsPerPage)

    );

    document.getElementById("pageNumber").innerText =

    currentPage + " / " + totalPages;

}

function previousPage(){

    if(currentPage > 1){

        currentPage--;

        render();

    }

}

function nextPage(){

    const totalPages = Math.max(

        1,

        Math.ceil(filteredPatients.length / rowsPerPage)

    );

    if(currentPage < totalPages){

        currentPage++;

        render();

    }

}

// ======================================================
// CLOSE MODALS
// ======================================================

window.addEventListener("click",function(e){

    if(e.target===modal){

        closeModal();

    }

    if(e.target===viewModal){

        viewModal.style.display="none";

    }

    if(e.target===deleteModal){

        deleteModal.style.display="none";

    }

});

// ======================================================
// ESC KEY
// ======================================================

document.addEventListener("keydown",function(e){

    if(e.key==="Escape"){

        closeModal();

        viewModal.style.display="none";

        deleteModal.style.display="none";

    }

});

console.log("Patients Module Loaded Successfully");
// ======================================================
// SUCCESS MESSAGE
// ======================================================

function showMessage(message, color = "#16a34a") {

    let toast = document.getElementById("toast");

    if (!toast) {

        toast = document.createElement("div");

        toast.id = "toast";

        document.body.appendChild(toast);

    }

    toast.innerText = message;

    toast.style.background = color;

    toast.style.position = "fixed";

    toast.style.top = "20px";

    toast.style.right = "20px";

    toast.style.padding = "15px 25px";

    toast.style.color = "#fff";

    toast.style.borderRadius = "10px";

    toast.style.fontWeight = "600";

    toast.style.boxShadow = "0 5px 15px rgba(0,0,0,.2)";

    toast.style.zIndex = "9999";

    toast.style.display = "block";

    setTimeout(() => {

        toast.style.display = "none";

    }, 3000);

}
// ======================================================
// RESET STORAGE
// ======================================================

function resetPatients() {

    if (!confirm("Delete all patient records?")) return;

    localStorage.removeItem(STORAGE_KEY);

    patients = [];

    filteredPatients = [];

    render();

    showMessage("All Patients Deleted", "#dc2626");

}
// ======================================================
// TOTAL PATIENTS
// ======================================================

function totalPatientCount() {

    return patients.length;

}

function admittedCount() {

    return patients.filter(

        p => p.status === "Admitted"

    ).length;

}

function recoveringCount() {

    return patients.filter(

        p => p.status === "Recovering"

    ).length;

}

function criticalCount() {

    return patients.filter(

        p => p.status === "Critical"

    ).length;

}

function dischargedCount() {

    return patients.filter(

        p => p.status === "Discharged"

    ).length;

}
// ======================================================
// AUTO SAVE
// ======================================================

window.addEventListener("beforeunload", () => {

    savePatients();

});