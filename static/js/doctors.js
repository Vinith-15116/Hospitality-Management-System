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
// LOAD DOCTORS
// ======================================================

function loadDoctors(){

    const data = localStorage.getItem(STORAGE_KEY);

    if(data){

        doctors = JSON.parse(data);

    }

    else{

        doctors = [

            {

                id:1,

                name:"Dr. Rajesh Mehta",

                department:"Cardiology",

                qualification:"MBBS, MD",

                experience:12,

                phone:"9876543210",

                email:"rajesh@gmail.com",

                fee:800,

                shift:"Morning",

                status:"Available",

                room:"101",

                joiningDate:"2024-02-12"

            },

            {

                id:2,

                name:"Dr. Priya Sharma",

                department:"Neurology",

                qualification:"MBBS, DM",

                experience:8,

                phone:"9123456789",

                email:"priya@gmail.com",

                fee:900,

                shift:"Evening",

                status:"Busy",

                room:"205",

                joiningDate:"2023-08-20"

            }

        ];

        saveDoctors();

    }

    filteredDoctors = [...doctors];

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

    d=>d.status==="Available"

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

            <td colspan="8" style="text-align:center;padding:30px;">

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

        case "Available":

            return `<span class="available">

            Available

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

    document.getElementById("doctorStatus").value = "Available";

    document.getElementById("doctorRoom").value = "";

    document.getElementById("doctorJoiningDate").value = "";

}
// ======================================================
// SAVE DOCTOR
// ======================================================

function saveDoctor(){

    const doctor={

        id: editIndex===-1 ? Date.now() : doctors[editIndex].id,

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
