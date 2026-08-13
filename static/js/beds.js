// ======================================================
// Hospital HMS
// Beds Module
// ======================================================

// ---------- Local Storage ----------

const STORAGE_KEY = "hospital_beds";

// ---------- Data ----------

let beds = [];

let filteredBeds = [];

let currentPage = 1;

const rowsPerPage = 5;

let editIndex = -1;

let deleteIndex = -1;

// ---------- HTML Elements ----------

const bedTable = document.getElementById("bedTable");

const searchBox = document.getElementById("searchBed");

const wardFilter = document.getElementById("wardFilter");

const statusFilter = document.getElementById("statusFilter");

const modal = document.getElementById("bedModal");

const viewModal = document.getElementById("viewModal");

const deleteModal = document.getElementById("deleteModal");

// Dashboard

const totalBeds = document.getElementById("totalBeds");

const availableBeds = document.getElementById("availableBeds");

const occupiedBeds = document.getElementById("occupiedBeds");

const maintenanceBeds = document.getElementById("maintenanceBeds");

// ======================================================
// INITIALIZE
// ======================================================

document.addEventListener("DOMContentLoaded", init);

async function init(){

    await loadBeds();

    registerEvents();

    applyFilters();

}

// ======================================================
// LOAD BEDS
// ======================================================

async function loadBeds() {

    try {

        const response = await fetch("/api/beds");

        const data = await response.json();

        console.log("Beds API Response:", data);

        if (!data.success) {

            console.error("Failed to load beds:", data.error);

            beds = [];

            filteredBeds = [];

            return;
        }

        beds = data.beds.map(bed => ({

            id: bed.BedID || bed["Bed ID"] || bed.id || "",

            ward: bed.Ward || bed.ward || "",

            room: String(
                bed.Room || bed.room || ""
            ),

            bedNumber: String(
                bed["Bed No."] ||
                bed.BedNo ||
                bed.Bed_Number ||
                bed.bedNumber ||
                ""
            ),

            type: bed.Type || bed.type || "",

            patient: bed.Patient || bed.patient || "",

            nurse: bed.Nurse || bed.nurse || "",

            charge: bed.Charge || bed.charge || 0,

            status: bed.Status || bed.status || ""

        }));

        filteredBeds = [...beds];

        console.log("Beds loaded from MySQL:", beds);

    }

    catch (error) {

        console.error("GET BEDS ERROR:", error);

        beds = [];

        filteredBeds = [];

    }

}

// ======================================================
// SAVE
// ======================================================

function saveBeds(){

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(beds)

    );

}
// ======================================================
// REGISTER EVENTS
// ======================================================

function registerEvents(){

    document.getElementById("openModal")
    .addEventListener("click", openAddModal);

    document.getElementById("closeModal")
    .addEventListener("click", closeModal);

    document.getElementById("saveBed")
    .addEventListener("click", saveBed);

    document.getElementById("closeViewModal")
    .addEventListener("click", ()=>{

        viewModal.style.display="none";

    });

    document.getElementById("cancelDelete")
    .addEventListener("click", ()=>{

        deleteModal.style.display="none";

    });

    document.getElementById("confirmDelete")
    .addEventListener("click", confirmDelete);

    searchBox.addEventListener("keyup", applyFilters);

    wardFilter.addEventListener("change", applyFilters);

    statusFilter.addEventListener("change", applyFilters);

    document.getElementById("prevPage")
    .addEventListener("click", previousPage);

    document.getElementById("nextPage")
    .addEventListener("click", nextPage);

}
// ======================================================
// APPLY FILTERS
// ======================================================
function applyFilters(){

    const keyword = searchBox.value.toLowerCase().trim();

    const ward = wardFilter.value;

    const status = statusFilter.value;

    filteredBeds = beds.filter(bed => {

        const searchMatch =

            String(bed.id || "")
                .toLowerCase()
                .includes(keyword)

            ||

            String(bed.room || "")
                .toLowerCase()
                .includes(keyword)

            ||

            String(bed.patient || "")
                .toLowerCase()
                .includes(keyword)

            ||

            String(bed.ward || "")
                .toLowerCase()
                .includes(keyword);

        const wardMatch =
            ward === "All" ||
            bed.ward === ward;

        const statusMatch =
            status === "All" ||
            bed.status === status;

        return searchMatch &&
               wardMatch &&
               statusMatch;

    });

    currentPage = 1;

    render();

}

// ======================================================
// RENDER
// ======================================================

function render(){

    renderTable();

    renderDashboard();

    renderPagination();

}

// ======================================================
// DASHBOARD
// ======================================================

function renderDashboard(){

    totalBeds.innerText = beds.length;

    availableBeds.innerText =

    beds.filter(

    bed=>bed.status==="Available"

    ).length;

    occupiedBeds.innerText =

    beds.filter(

    bed=>bed.status==="Occupied"

    ).length;

    maintenanceBeds.innerText =

    beds.filter(

    bed=>bed.status==="Maintenance"

    ).length;

}
// ======================================================
// RENDER TABLE
// ======================================================

function renderTable(){

    bedTable.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;

    const end = start + rowsPerPage;

    const pageBeds = filteredBeds.slice(start, end);

    if(pageBeds.length === 0){

        bedTable.innerHTML = `

        <tr>

            <td colspan="8" style="text-align:center;padding:30px;">

                No Beds Found

            </td>

        </tr>

        `;

        return;

    }

    pageBeds.forEach(bed=>{

        const index = beds.indexOf(bed);

        const row = document.createElement("tr");

        row.innerHTML = `

        <td>${bed.id}</td>

        <td>${bed.ward}</td>

        <td>${bed.room}</td>

        <td>${bed.bedNumber}</td>

        <td>${bed.type}</td>

        <td>${bed.patient || "-"}</td>

        <td>${getStatusBadge(bed.status)}</td>

        <td>

            <button

            class="view-btn"

            onclick="viewBed(${index})">

            <i class="fa-solid fa-eye"></i>

            </button>

            <button

            class="edit-btn"

            onclick="editBed(${index})">

            <i class="fa-solid fa-pen"></i>

            </button>

            <button

            class="delete-btn"

            onclick="deleteBed(${index})">

            <i class="fa-solid fa-trash"></i>

            </button>

        </td>

        `;

        bedTable.appendChild(row);

    });

}
// ======================================================
// STATUS BADGES
// ======================================================

function getStatusBadge(status){

    switch(status){

        case "Available":

            return `

            <span class="available">

            Available

            </span>

            `;

        case "Occupied":

            return `

            <span class="occupied">

            Occupied

            </span>

            `;

        case "Maintenance":

            return `

            <span class="maintenance">

            Maintenance

            </span>

            `;

        default:

            return status;

    }

}
// ======================================================
// OPEN ADD BED MODAL
// ======================================================

function openAddModal(){

    editIndex = -1;

    document.getElementById("modalTitle").innerText = "Add Bed";

    clearForm();

    modal.style.display = "flex";

}

// ======================================================
// CLOSE MODAL
// ======================================================

function closeModal(){

    modal.style.display = "none";

}

// ======================================================
// CLEAR FORM
// ======================================================

function clearForm(){

    document.getElementById("bedId").value = "";

    document.getElementById("bedWard").value = "";

    document.getElementById("roomNumber").value = "";

    document.getElementById("bedNumber").value = "";

    document.getElementById("bedType").value = "";

    document.getElementById("assignedPatient").value = "";

    document.getElementById("assignedNurse").value = "";

    document.getElementById("dailyCharge").value = "";

    document.getElementById("bedStatus").value = "Available";

}
// ======================================================
// SAVE BED
// ======================================================

async function saveBed() {

    const bed = {

        BedID:
            document.getElementById("bedId").value.trim(),

        Ward:
            document.getElementById("bedWard").value,

        Room:
            document.getElementById("roomNumber").value.trim(),

        BedNo:
            document.getElementById("bedNumber").value.trim(),

        Type:
            document.getElementById("bedType").value,

        Patient:
            document.getElementById("assignedPatient").value.trim(),

        Status:
            document.getElementById("bedStatus").value
    };


    // ============================================
    // VALIDATION
    // ============================================

    if (
        bed.BedID === "" ||
        bed.Ward === "" ||
        bed.Room === "" ||
        bed.BedNo === "" ||
        bed.Type === ""
    ) {

        alert("Please fill all required fields.");

        return;
    }


    try {

        let response;


        // ========================================
        // ADD BED
        // ========================================

        if (editIndex === -1) {

            response = await fetch("/api/beds", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(bed)

            });

        }


        // ========================================
        // UPDATE BED
        // ========================================

        else {

            const existingBed = beds[editIndex];

            response = await fetch(
                `/api/beds/${encodeURIComponent(existingBed.id)}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(bed)
                }
            );

        }


        const result = await response.json();


        // ========================================
        // API ERROR
        // ========================================

        if (!response.ok || !result.success) {

            alert(
                result.error ||
                "Unable to save bed."
            );

            return;
        }


        // ========================================
        // SUCCESS
        // ========================================

        alert(
            editIndex === -1
                ? "Bed added successfully!"
                : "Bed updated successfully!"
        );


        closeModal();


        // Reload from MySQL

        await loadBeds();

        applyFilters();


    }

    catch (error) {

        console.error(
            "SAVE BED ERROR:",
            error
        );

        alert(
            "Server error while saving bed."
        );

    }

}

// ======================================================
// EDIT BED
// ======================================================

function editBed(index){

    editIndex=index;

    const bed=beds[index];

    document.getElementById("modalTitle").innerText="Edit Bed";

    document.getElementById("bedId").value=bed.id;

    document.getElementById("bedWard").value=bed.ward;

    document.getElementById("roomNumber").value=bed.room;

    document.getElementById("bedNumber").value=bed.bedNumber;

    document.getElementById("bedType").value=bed.type;

    document.getElementById("assignedPatient").value=bed.patient;

    document.getElementById("assignedNurse").value=bed.nurse;

    document.getElementById("dailyCharge").value=bed.charge;

    document.getElementById("bedStatus").value=bed.status;

    modal.style.display="flex";

}
// ======================================================
// VIEW BED
// ======================================================

function viewBed(index){

    const bed = beds[index];

    document.getElementById("viewBedData").innerHTML = `

        <p><strong>Bed ID:</strong> ${bed.id}</p>

        <p><strong>Ward:</strong> ${bed.ward}</p>

        <p><strong>Room Number:</strong> ${bed.room}</p>

        <p><strong>Bed Number:</strong> ${bed.bedNumber}</p>

        <p><strong>Bed Type:</strong> ${bed.type}</p>

        <p><strong>Assigned Patient:</strong> ${bed.patient || "-"}</p>

        <p><strong>Assigned Nurse:</strong> ${bed.nurse || "-"}</p>

        <p><strong>Daily Charge:</strong> ₹${bed.charge}</p>

        <p><strong>Status:</strong> ${bed.status}</p>

    `;

    viewModal.style.display = "flex";

}

// ======================================================
// DELETE BED
// ======================================================

function deleteBed(index){

    deleteIndex = index;

    deleteModal.style.display = "flex";

}

async function confirmDelete() {

    if (deleteIndex === -1) {
        return;
    }


    const bed = beds[deleteIndex];


    if (!bed || !bed.id) {

        alert("Invalid bed selected.");

        return;
    }


    try {

        const response = await fetch(
            `/api/beds/${encodeURIComponent(bed.id)}`,
            {
                method: "DELETE"
            }
        );


        const result = await response.json();


        if (!response.ok || !result.success) {

            alert(
                result.error ||
                "Unable to delete bed."
            );

            return;
        }


        alert("Bed deleted successfully!");


        deleteIndex = -1;

        deleteModal.style.display = "none";


        // Reload from MySQL

        await loadBeds();

        applyFilters();


    }

    catch (error) {

        console.error(
            "DELETE BED ERROR:",
            error
        );

        alert(
            "Server error while deleting bed."
        );

    }

}
// ======================================================
// PAGINATION
// ======================================================

function renderPagination(){

    const totalPages = Math.max(

        1,

        Math.ceil(filteredBeds.length / rowsPerPage)

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

        Math.ceil(filteredBeds.length / rowsPerPage)

    );

    if(currentPage < totalPages){

        currentPage++;

        render();

    }

}
// ======================================================
// EXPORT CSV
// ======================================================

function exportBedsCSV(){

    let csv =
"Bed ID,Ward,Room,Bed Number,Bed Type,Patient,Nurse,Daily Charge,Status\n";

    beds.forEach(bed=>{

        csv +=

`${bed.id},${bed.ward},${bed.room},${bed.bedNumber},${bed.type},${bed.patient},${bed.nurse},${bed.charge},${bed.status}\n`;

    });

    const blob = new Blob([csv],{

        type:"text/csv"

    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "beds.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}
// ======================================================
// CLOSE MODALS
// ======================================================

window.addEventListener("click",(e)=>{

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
// ESC KEY SUPPORT
// ======================================================

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        closeModal();

        viewModal.style.display="none";

        deleteModal.style.display="none";

    }

});

// ======================================================
// AUTO SAVE
// ======================================================

window.addEventListener("beforeunload",()=>{

    saveBeds();

});

// ======================================================
// INITIALIZATION COMPLETE
// ======================================================

console.log("====================================");

console.log("Hospital HMS");

console.log("Beds Module Loaded Successfully");

console.log("====================================");