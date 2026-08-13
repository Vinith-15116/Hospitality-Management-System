// ======================================================
// Hospital HMS
// Doctors Module
// ======================================================

// ---------- Local Storage ----------

const STORAGE_KEY = "hospital_doctors";

// ---------- Data ----------

let doctors = [];

let filteredDoctors = [];

let currentPage = 1;

const rowsPerPage = 5;

let editIndex = -1;

let deleteIndex = -1;

// ---------- HTML Elements ----------

const doctorTable = document.getElementById("doctorTable");

const searchBox = document.getElementById("searchDoctor");

const departmentFilter = document.getElementById("departmentFilter");

const availabilityFilter = document.getElementById("availabilityFilter");

const modal = document.getElementById("doctorModal");

const viewModal = document.getElementById("viewModal");

const deleteModal = document.getElementById("deleteModal");

// Dashboard

const totalDoctors = document.getElementById("totalDoctors");

const availableDoctors = document.getElementById("availableDoctors");

const leaveDoctors = document.getElementById("leaveDoctors");

const busyDoctors = document.getElementById("busyDoctors");

// ======================================================
// INITIALIZE
// ======================================================

document.addEventListener("DOMContentLoaded", init);

function init(){

    loadDoctors();

    registerEvents();

    applyFilters();

}
// ======================================================
// LOAD DOCTORS FROM DATABASE
// ======================================================

async function loadDoctors(){

    try {

        const response = await fetch("/api/doctors");

        const data = await response.json();

        console.log("DOCTORS FROM DATABASE:", data);

        if (!response.ok || !data.success) {

            throw new Error(
                data.error || "Failed to load doctors"
            );

        }


        doctors = data.doctors.map(doctor => ({

            id: doctor.DRID,

            name: doctor.Name,

            department: doctor.Department,

            qualification: doctor.Qualification,

            experience: doctor.Experience,

            phone: doctor.Phone,

            status: doctor.Status,

           patientCount: doctor.PatientCount || 0,

patientNames: doctor.PatientNames
    ? doctor.PatientNames.split("||")
    : []

        }));


        filteredDoctors = [...doctors];

        console.log(
            "DOCTORS LOADED:",
            doctors.length
        );


        // IMPORTANT:
        // Render the data after API finishes loading

        currentPage = 1;

        render();


    } catch(error){

        console.error(
            "DOCTOR DATABASE ERROR:",
            error
        );

        doctors = [];

        filteredDoctors = [];

        render();

    }

}

// ======================================================
// SAVE
// ======================================================

function saveDoctors(){

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(doctors)

    );

}
// ======================================================
// REGISTER EVENTS
// ======================================================

function registerEvents(){

    document.getElementById("openModal")
    .addEventListener("click",openAddModal);

    document.getElementById("closeModal")
    .addEventListener("click",closeModal);

    document.getElementById("saveDoctor")
    .addEventListener("click",saveDoctor);

    document.getElementById("closeViewModal")
    .addEventListener("click",()=>{

        viewModal.style.display="none";

    });

    document.getElementById("cancelDelete")
    .addEventListener("click",()=>{

        deleteModal.style.display="none";

    });

    document.getElementById("confirmDelete")
    .addEventListener("click",confirmDelete);

    searchBox.addEventListener("keyup",applyFilters);

    departmentFilter.addEventListener("change",applyFilters);

    availabilityFilter.addEventListener("change",applyFilters);

    document.getElementById("prevPage")
    .addEventListener("click",previousPage);

    document.getElementById("nextPage")
    .addEventListener("click",nextPage);

}
// ======================================================
// APPLY FILTERS
// ======================================================

function applyFilters(){

    const keyword=searchBox.value.toLowerCase();

    const department=departmentFilter.value;

    const availability=availabilityFilter.value;

    filteredDoctors=doctors.filter(doctor=>{

        const searchMatch=

        doctor.name.toLowerCase().includes(keyword)

        ||

        doctor.department.toLowerCase().includes(keyword)

        ||

        doctor.qualification.toLowerCase().includes(keyword);

        const departmentMatch=

        department==="All"

        ||

        doctor.department===department;

        const availabilityMatch=

        availability==="All"

        ||

        doctor.status===availability;

        return searchMatch

        &&

        departmentMatch

        &&

        availabilityMatch;

    });

    currentPage=1;

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

    totalDoctors.innerText=doctors.length;

    availableDoctors.innerText=

   doctors.filter(
    d => d.status === "Active"
).length;

    leaveDoctors.innerText=

    doctors.filter(

    d=>d.status==="On Leave"

    ).length;

    busyDoctors.innerText=

    doctors.filter(

    d=>d.status==="Busy"

    ).length;

}
// ======================================================
// RENDER TABLE
// ======================================================

function renderTable(){

    doctorTable.innerHTML="";

    const start=(currentPage-1)*rowsPerPage;

    const end=start+rowsPerPage;

    const pageDoctors=filteredDoctors.slice(start,end);

    if(pageDoctors.length===0){

        doctorTable.innerHTML=`

        <tr>

            <td colspan="9" style="text-align:center;padding:30px;">

                No Doctors Found

            </td>

        </tr>

        `;

        return;

    }

    pageDoctors.forEach(doctor=>{

        const index=doctors.indexOf(doctor);

        const row=document.createElement("tr");

        row.innerHTML=`

        <td>${doctor.id}</td>

        <td>${doctor.name}</td>

        <td>${doctor.department}</td>

        <td>${doctor.qualification}</td>

        <td>${doctor.experience} Years</td>

        <td>${doctor.phone}</td>

        <td>${getStatusBadge(doctor.status)}</td>

<td class="patient-list">
    ${
        doctor.patientNames && doctor.patientNames.length > 0
        ?
        doctor.patientNames.map(
            patient => `<div class="patient-name">${patient}</div>`
        ).join("")
        :
        `<span class="no-patient">No patients</span>`
    }
</td>

<td>
    <button
        class="view-btn"
        onclick="viewDoctor(${index})">

            <i class="fa-solid fa-eye"></i>

            </button>

            <button

            class="edit-btn"

            onclick="editDoctor(${index})">

            <i class="fa-solid fa-pen"></i>

            </button>

            <button

            class="delete-btn"

            onclick="deleteDoctor(${index})">

            <i class="fa-solid fa-trash"></i>

            </button>

        </td>

        `;

        doctorTable.appendChild(row);

    });

}
// ======================================================
// STATUS BADGES
// ======================================================

function getStatusBadge(status){

    switch(status){

        case "Active":

            return `<span class="active">

            Active

            </span>`;

        case "Busy":

            return `<span class="busy">

            Busy

            </span>`;

        case "On Leave":

            return `<span class="onleave">

            On Leave

            </span>`;

        default:

            return status;

    }

}
// ======================================================
// OPEN ADD DOCTOR MODAL
// ======================================================

function openAddModal(){

    editIndex = -1;

    document.getElementById("modalTitle").innerText = "Add Doctor";

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

    document.getElementById("doctorName").value = "";

    document.getElementById("doctorAge").value = "";

    document.getElementById("doctorGender").value = "";

    document.getElementById("doctorDepartment").value = "";

    document.getElementById("doctorQualification").value = "";

    document.getElementById("doctorExperience").value = "";

    document.getElementById("doctorPhone").value = "";

    document.getElementById("doctorEmail").value = "";

    document.getElementById("doctorFee").value = "";

    document.getElementById("doctorShift").value = "Morning";

    document.getElementById("doctorStatus").value = "Active";

    document.getElementById("doctorRoom").value = "";

    document.getElementById("doctorJoiningDate").value = "";

}
// ======================================================
// SAVE DOCTOR
// ======================================================

function saveDoctor(){

    const doctor={

        DRID: editIndex===-1 ? Date.now() : doctors[editIndex].DRID,

        name:document.getElementById("doctorName").value.trim(),

        age:document.getElementById("doctorAge").value,

        gender:document.getElementById("doctorGender").value,

        department:document.getElementById("doctorDepartment").value.trim(),

        qualification:document.getElementById("doctorQualification").value.trim(),

        experience:document.getElementById("doctorExperience").value,

        phone:document.getElementById("doctorPhone").value.trim(),

        email:document.getElementById("doctorEmail").value.trim(),

        fee:document.getElementById("doctorFee").value,

        shift:document.getElementById("doctorShift").value,

        status:document.getElementById("doctorStatus").value,

        room:document.getElementById("doctorRoom").value.trim(),

        joiningDate:document.getElementById("doctorJoiningDate").value

    };

    if(

        doctor.name==="" ||

        doctor.department==="" ||

        doctor.qualification==="" ||

        doctor.phone===""

    ){

        alert("Please fill all required fields.");

        return;

    }

    if(editIndex===-1){

        doctors.push(doctor);

    }

    else{

        doctors[editIndex]=doctor;

    }

    saveDoctors();

    applyFilters();

    closeModal();

}
// ======================================================
// EDIT DOCTOR
// ======================================================

function editDoctor(index){

    editIndex=index;

    const doctor=doctors[index];

    document.getElementById("modalTitle").innerText="Edit Doctor";

    document.getElementById("doctorName").value=doctor.name;

    document.getElementById("doctorAge").value=doctor.age;

    document.getElementById("doctorGender").value=doctor.gender;

    document.getElementById("doctorDepartment").value=doctor.department;

    document.getElementById("doctorQualification").value=doctor.qualification;

    document.getElementById("doctorExperience").value=doctor.experience;

    document.getElementById("doctorPhone").value=doctor.phone;

    document.getElementById("doctorEmail").value=doctor.email;

    document.getElementById("doctorFee").value=doctor.fee;

    document.getElementById("doctorShift").value=doctor.shift;

    document.getElementById("doctorStatus").value=doctor.status;

    document.getElementById("doctorRoom").value=doctor.room;

    document.getElementById("doctorJoiningDate").value=doctor.joiningDate;

    modal.style.display="flex";

}
// ======================================================
// VIEW DOCTOR
// ======================================================

function viewDoctor(index){

    const doctor = doctors[index];

    document.getElementById("viewDoctorData").innerHTML = `

        <p><strong>ID:</strong> ${doctor.id}</p>

        <p><strong>Name:</strong> ${doctor.name}</p>

        <p><strong>Age:</strong> ${doctor.age}</p>

        <p><strong>Gender:</strong> ${doctor.gender}</p>

        <p><strong>Department:</strong> ${doctor.department}</p>

        <p><strong>Qualification:</strong> ${doctor.qualification}</p>

        <p><strong>Experience:</strong> ${doctor.experience} Years</p>

        <p><strong>Phone:</strong> ${doctor.phone}</p>

        <p><strong>Email:</strong> ${doctor.email}</p>

        <p><strong>Consultation Fee:</strong> ₹${doctor.fee}</p>

        <p><strong>Shift:</strong> ${doctor.shift}</p>

        <p><strong>Room:</strong> ${doctor.room}</p>

        <p><strong>Status:</strong> ${doctor.status}</p>

        <p><strong>Joining Date:</strong> ${doctor.joiningDate}</p>

    `;

    viewModal.style.display = "flex";

}

// ======================================================
// DELETE DOCTOR
// ======================================================

function deleteDoctor(index){

    deleteIndex = index;

    deleteModal.style.display = "flex";

}

function confirmDelete(){

    if(deleteIndex === -1) return;

    doctors.splice(deleteIndex,1);

    deleteIndex = -1;

    saveDoctors();

    applyFilters();

    deleteModal.style.display = "none";

}
// ======================================================
// PAGINATION
// ======================================================

function renderPagination(){

    const totalPages = Math.max(
        1,
        Math.ceil(filteredDoctors.length / rowsPerPage)
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
        Math.ceil(filteredDoctors.length / rowsPerPage)
    );

    if(currentPage < totalPages){

        currentPage++;

        render();

    }

}
// ======================================================
// EXPORT CSV
// ======================================================

function exportDoctorsCSV(){

    let csv =
"ID,Name,Department,Qualification,Experience,Phone,Status\n";

    doctors.forEach(doctor=>{

        csv +=

`${doctor.id},${doctor.name},${doctor.department},${doctor.qualification},${doctor.experience},${doctor.phone},${doctor.status}\n`;

    });

    const blob = new Blob([csv],{

        type:"text/csv"

    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "doctors.csv";

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

console.log("Doctors Module Loaded Successfully");

console.log("===================================");
