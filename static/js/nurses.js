// ======================================================
// Hospital HMS
// Nurses Module
// ======================================================

// ---------- Local Storage ----------

const STORAGE_KEY = "hospital_nurses";

// ---------- Data ----------

let nurses = [];

let filteredNurses = [];

let currentPage = 1;

const rowsPerPage = 5;

let editIndex = -1;

let deleteIndex = -1;

// ---------- HTML Elements ----------

const nurseTable = document.getElementById("nurseTable");

const searchBox = document.getElementById("searchNurse");

const departmentFilter = document.getElementById("departmentFilter");

const shiftFilter = document.getElementById("shiftFilter");

const modal = document.getElementById("nurseModal");

const viewModal = document.getElementById("viewModal");

const deleteModal = document.getElementById("deleteModal");

// Dashboard

const totalNurses = document.getElementById("totalNurses");

const onDutyNurses = document.getElementById("onDutyNurses");

const offDutyNurses = document.getElementById("offDutyNurses");

const icuNurses = document.getElementById("icuNurses");

// ======================================================
// INITIALIZE
// ======================================================

document.addEventListener("DOMContentLoaded", init);

function init(){

    loadNurses();

    registerEvents();

    applyFilters();

}

// ======================================================
// LOAD NURSES FROM DATABASE
// ======================================================

async function loadNurses(){

    try {

        const response =
            await fetch("/api/nurses");

        const data =
            await response.json();

        console.log(
            "NURSES FROM DATABASE:",
            data
        );

        if (!response.ok || !data.success) {

            throw new Error(
                data.error ||
                "Failed to load nurses"
            );

        }

        nurses = data.nurses.map(nurse => ({

            id: nurse.NRID,

            name: nurse.Name,

            department:
                nurse.Department,

            qualification:
                nurse.Qualification,

            experience:
                nurse.Experience,

            phone:
                nurse.Phone,

            shift:
                nurse.Shift,

            status:
                nurse.Status,

            ward:
                nurse.Ward,

           patientCount:
    nurse.PatientCount || 0,

patientNames:
    nurse.PatientNames
        ? nurse.PatientNames.split("||")
        : []

        }));


        filteredNurses =
            [...nurses];


        console.log(
            "NURSES LOADED:",
            nurses.length
        );


        currentPage = 1;

        render();

    }

    catch(error){

        console.error(
            "NURSE DATABASE ERROR:",
            error
        );

        nurses = [];

        filteredNurses = [];

        render();

    }

}

// ======================================================
// SAVE
// ======================================================

function saveNurses(){

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(nurses)

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

    document.getElementById("saveNurse")
    .addEventListener("click", saveNurse);

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

    departmentFilter.addEventListener("change", applyFilters);

    shiftFilter.addEventListener("change", applyFilters);

    document.getElementById("prevPage")
    .addEventListener("click", previousPage);

    document.getElementById("nextPage")
    .addEventListener("click", nextPage);

}
// ======================================================
// APPLY FILTERS
// ======================================================

function applyFilters(){

    const keyword = searchBox.value.toLowerCase();

    const department = departmentFilter.value;

    const shift = shiftFilter.value;

    filteredNurses = nurses.filter(nurse => {

        const searchMatch =

            nurse.name.toLowerCase().includes(keyword)

            ||

            nurse.department.toLowerCase().includes(keyword)

            ||

            nurse.qualification.toLowerCase().includes(keyword);

        const departmentMatch =

            department === "All"

            ||

            nurse.department === department;

        const shiftMatch =

            shift === "All"

            ||

            nurse.shift === shift;

        return searchMatch

            &&

            departmentMatch

            &&

            shiftMatch;

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

    // Total nurses
    totalNurses.innerText = nurses.length;


    // Active nurses = On Duty
    onDutyNurses.innerText =
        nurses.filter(
            nurse =>
                String(nurse.status).toLowerCase() === "active"
        ).length;


    // Non-active nurses = Off Duty
    offDutyNurses.innerText =
        nurses.filter(
            nurse =>
                String(nurse.status).toLowerCase() !== "active"
        ).length;


    // ICU nurses
    icuNurses.innerText =
        nurses.filter(
            nurse =>
                String(nurse.department).toLowerCase() === "icu"
        ).length;

}

// ======================================================
// RENDER TABLE
// ======================================================

function renderTable(){

    nurseTable.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;

    const end = start + rowsPerPage;

    const pageNurses = filteredNurses.slice(start, end);


    // ============================================
    // NO NURSES
    // ============================================

    if(pageNurses.length === 0){

        nurseTable.innerHTML = `

        <tr>

            <td colspan="10"
                style="text-align:center;padding:30px;">

                No Nurses Found

            </td>

        </tr>

        `;

        return;
    }


    // ============================================
    // DISPLAY NURSES
    // ============================================

    pageNurses.forEach(nurse => {

        const index = nurses.indexOf(nurse);

        const row = document.createElement("tr");


        // ========================================
        // PATIENT NAMES
        // ========================================

        let patientHTML = "";

        if(
            nurse.patientNames &&
            nurse.patientNames.length > 0
        ){

            patientHTML =
                nurse.patientNames.map(
                    patient => `
                        <div class="patient-name">
                            ${patient}
                        </div>
                    `
                ).join("");

        } else {

            patientHTML = `
                <span class="no-patient">
                    No patients
                </span>
            `;

        }


        // ========================================
        // ROW
        // ========================================

        row.innerHTML = `

            <td>
                ${nurse.id}
            </td>

            <td>
                ${nurse.name}
            </td>

            <td>
                ${nurse.department}
            </td>

            <td>
                ${nurse.ward || "-"}
            </td>

            <td>
                ${nurse.qualification}
            </td>

            <td>
                ${nurse.experience} Years
            </td>

            <td>
                ${nurse.shift}
            </td>

            <td>
                ${getStatusBadge(nurse.status)}
            </td>


            <!-- PATIENTS -->

            <td class="patient-list">

                ${patientHTML}

            </td>


            <!-- ACTIONS -->

            <td>

                <button
                    class="view-btn"
                    onclick="viewNurse(${index})">

                    <i class="fa-solid fa-eye"></i>

                </button>


                <button
                    class="edit-btn"
                    onclick="editNurse(${index})">

                    <i class="fa-solid fa-pen"></i>

                </button>


                <button
                    class="delete-btn"
                    onclick="deleteNurse(${index})">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        `;


        nurseTable.appendChild(row);

    });

}
// ======================================================
// STATUS BADGES
// ======================================================

function getStatusBadge(status){

    switch(status){

        case "On Duty":

            return `

            <span class="onduty">

            Active

            </span>

            `;

        case "Off Duty":

            return `

            <span class="offduty">

            on Leave

            </span>

            `;

        default:

            return status;

    }

}
// ======================================================
// OPEN ADD NURSE MODAL
// ======================================================

function openAddModal(){

    editIndex = -1;

    document.getElementById("modalTitle").innerText = "Add Nurse";

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

    document.getElementById("nurseName").value = "";

    document.getElementById("nurseAge").value = "";

    document.getElementById("nurseGender").value = "";

    document.getElementById("nurseDepartment").value = "";

    document.getElementById("nurseQualification").value = "";

    document.getElementById("nurseExperience").value = "";

    document.getElementById("nursePhone").value = "";

    document.getElementById("nurseEmail").value = "";

    document.getElementById("nurseShift").value = "Morning";

    document.getElementById("nurseStatus").value = "Active";

    document.getElementById("nurseWard").value = "";

    document.getElementById("nurseJoiningDate").value = "";

}
// ======================================================
// SAVE NURSE
// ======================================================

function saveNurse(){

    const nurse={

        id: editIndex===-1 ? Date.now() : nurses[editIndex].id,

        name:document.getElementById("nurseName").value.trim(),

        age:document.getElementById("nurseAge").value,

        gender:document.getElementById("nurseGender").value,

        department:document.getElementById("nurseDepartment").value.trim(),

        qualification:document.getElementById("nurseQualification").value.trim(),

        experience:document.getElementById("nurseExperience").value,

        phone:document.getElementById("nursePhone").value.trim(),

        email:document.getElementById("nurseEmail").value.trim(),

        shift:document.getElementById("nurseShift").value,

        status:document.getElementById("nurseStatus").value,

        ward:document.getElementById("nurseWard").value.trim(),

        joiningDate:document.getElementById("nurseJoiningDate").value

    };

    if(

        nurse.name==="" ||

        nurse.department==="" ||

        nurse.qualification==="" ||

        nurse.phone===""

    ){

        alert("Please fill all required fields.");

        return;

    }

    if(editIndex===-1){

        nurses.push(nurse);

    }

    else{

        nurses[editIndex]=nurse;

    }

    saveNurses();

    applyFilters();

    closeModal();

}
// ======================================================
// EDIT NURSE
// ======================================================

function editNurse(index){

    editIndex=index;

    const nurse=nurses[index];

    document.getElementById("modalTitle").innerText="Edit Nurse";

    document.getElementById("nurseName").value=nurse.name;

    document.getElementById("nurseAge").value=nurse.age;

    document.getElementById("nurseGender").value=nurse.gender;

    document.getElementById("nurseDepartment").value=nurse.department;

    document.getElementById("nurseQualification").value=nurse.qualification;

    document.getElementById("nurseExperience").value=nurse.experience;

    document.getElementById("nursePhone").value=nurse.phone;

    document.getElementById("nurseEmail").value=nurse.email;

    document.getElementById("nurseShift").value=nurse.shift;

    document.getElementById("nurseStatus").value=nurse.status;

    document.getElementById("nurseWard").value=nurse.ward;

    document.getElementById("nurseJoiningDate").value=nurse.joiningDate;

    modal.style.display="flex";

}
// ======================================================
// VIEW NURSE
// ======================================================

function viewNurse(index){

    const nurse = nurses[index];

    document.getElementById("viewNurseData").innerHTML = `

        <p><strong>ID:</strong> ${nurse.id}</p>

        <p><strong>Name:</strong> ${nurse.name}</p>

        <p><strong>Age:</strong> ${nurse.age}</p>

        <p><strong>Gender:</strong> ${nurse.gender}</p>

        <p><strong>Department:</strong> ${nurse.department}</p>

        <p><strong>Qualification:</strong> ${nurse.qualification}</p>

        <p><strong>Experience:</strong> ${nurse.experience} Years</p>

        <p><strong>Phone:</strong> ${nurse.phone}</p>

        <p><strong>Email:</strong> ${nurse.email}</p>

        <p><strong>Shift:</strong> ${nurse.shift}</p>

        <p><strong>Status:</strong> ${nurse.status}</p>

        <p><strong>Ward:</strong> ${nurse.ward}</p>

        <p><strong>Joining Date:</strong> ${nurse.joiningDate}</p>

    `;

    viewModal.style.display = "flex";

}

// ======================================================
// DELETE NURSE
// ======================================================

function deleteNurse(index){

    deleteIndex = index;

    deleteModal.style.display = "flex";

}

function confirmDelete(){

    if(deleteIndex === -1) return;

    nurses.splice(deleteIndex,1);

    deleteIndex = -1;

    saveNurses();

    applyFilters();

    deleteModal.style.display = "none";

}
// ======================================================
// PAGINATION
// ======================================================

function renderPagination(){

    const totalPages = Math.max(

        1,

        Math.ceil(filteredNurses.length / rowsPerPage)

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

        Math.ceil(filteredNurses.length / rowsPerPage)

    );

    if(currentPage < totalPages){

        currentPage++;

        render();

    }

}
// ======================================================
// EXPORT CSV
// ======================================================

function exportNursesCSV(){

    let csv =

"ID,Name,Department,Qualification,Experience,Shift,Status\n";

    nurses.forEach(nurse=>{

        csv +=

`${nurse.id},${nurse.name},${nurse.department},${nurse.qualification},${nurse.experience},${nurse.shift},${nurse.status}\n`;

    });

    const blob = new Blob([csv],{

        type:"text/csv"

    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "nurses.csv";

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
// ESC KEY
// ======================================================

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        closeModal();

        viewModal.style.display="none";

        deleteModal.style.display="none";

    }

});

console.log("===================================");

console.log("Hospital HMS");

console.log("Nurses Module Loaded Successfully");

console.log("===================================");
