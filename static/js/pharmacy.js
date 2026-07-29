// ======================================================
// Hospital HMS
// Pharmacy Module
// ======================================================

// ---------- Local Storage ----------

const STORAGE_KEY = "hospital_pharmacy";

// ---------- Data ----------

let medicines = [];

let filteredMedicines = [];

let currentPage = 1;

const rowsPerPage = 5;

let editIndex = -1;

let deleteIndex = -1;

// ---------- HTML Elements ----------

const medicineTable = document.getElementById("medicineTable");

const searchBox = document.getElementById("searchMedicine");

const categoryFilter = document.getElementById("categoryFilter");

const stockFilter = document.getElementById("stockFilter");

const modal = document.getElementById("medicineModal");

const viewModal = document.getElementById("viewModal");

const deleteModal = document.getElementById("deleteModal");

// Dashboard

const totalMedicines = document.getElementById("totalMedicines");

const inStock = document.getElementById("inStock");

const lowStock = document.getElementById("lowStock");

const expiredMedicines = document.getElementById("expiredMedicines");

// ======================================================
// INITIALIZE
// ======================================================

document.addEventListener("DOMContentLoaded", init);

function init(){

    loadMedicines();

    registerEvents();

    applyFilters();

}
// ======================================================
// LOAD MEDICINES
// ======================================================

function loadMedicines(){

    const data = localStorage.getItem(STORAGE_KEY);

    if(data){

        medicines = JSON.parse(data);

    }

    else{

        medicines = [

            {

                id:"MED001",

                name:"Paracetamol 500mg",

                category:"Tablet",

                quantity:250,

                price:15,

                expiry:"2027-06-15",

                supplier:"Sun Pharma",

                status:"In Stock"

            },

            {

                id:"MED002",

                name:"Amoxicillin",

                category:"Capsule",

                quantity:15,

                price:120,

                expiry:"2026-08-20",

                supplier:"Cipla",

                status:"Low Stock"

            }

        ];

        saveMedicines();

    }

    filteredMedicines = [...medicines];

}

// ======================================================
// SAVE
// ======================================================

function saveMedicines(){

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(medicines)

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

    document.getElementById("saveMedicine")
    .addEventListener("click", saveMedicine);

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

    categoryFilter.addEventListener("change", applyFilters);

    stockFilter.addEventListener("change", applyFilters);

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

    const category = categoryFilter.value;

    const stock = stockFilter.value;

    filteredMedicines = medicines.filter(medicine=>{

        const searchMatch =

        medicine.name.toLowerCase().includes(keyword)

        ||

        medicine.id.toLowerCase().includes(keyword)

        ||

        medicine.supplier.toLowerCase().includes(keyword);

        const categoryMatch =

        category==="All"

        ||

        medicine.category===category;

        const stockMatch =

        stock==="All"

        ||

        medicine.status===stock;

        return searchMatch

        &&

        categoryMatch

        &&

        stockMatch;

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

    totalMedicines.innerText = medicines.length;

    inStock.innerText =

    medicines.filter(

    m=>m.status==="In Stock"

    ).length;

    lowStock.innerText =

    medicines.filter(

    m=>m.status==="Low Stock"

    ).length;

    expiredMedicines.innerText =

    medicines.filter(

    m=>m.status==="Expired"

    ).length;

}
// ======================================================
// RENDER TABLE
// ======================================================

function renderTable(){

    medicineTable.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;

    const end = start + rowsPerPage;

    const pageMedicines = filteredMedicines.slice(start, end);

    if(pageMedicines.length === 0){

        medicineTable.innerHTML = `

        <tr>

            <td colspan="8" style="text-align:center;padding:30px;">

                No Medicines Found

            </td>

        </tr>

        `;

        return;

    }

    pageMedicines.forEach(medicine=>{

        const index = medicines.indexOf(medicine);

        const row = document.createElement("tr");

        row.innerHTML = `

        <td>${medicine.id}</td>

        <td>${medicine.name}</td>

        <td>${medicine.category}</td>

        <td>${medicine.quantity}</td>

        <td>₹${medicine.price}</td>

        <td>${medicine.expiry}</td>

        <td>${getStatusBadge(medicine.status)}</td>

        <td>

            <button

            class="view-btn"

            onclick="viewMedicine(${index})">

            <i class="fa-solid fa-eye"></i>

            </button>

            <button

            class="edit-btn"

            onclick="editMedicine(${index})">

            <i class="fa-solid fa-pen"></i>

            </button>

            <button

            class="delete-btn"

            onclick="deleteMedicine(${index})">

            <i class="fa-solid fa-trash"></i>

            </button>

        </td>

        `;

        medicineTable.appendChild(row);

    });

}
// ======================================================
// STATUS BADGES
// ======================================================

function getStatusBadge(status){

    switch(status){

        case "In Stock":

            return `

            <span class="instock">

            In Stock

            </span>

            `;

        case "Low Stock":

            return `

            <span class="lowstock">

            Low Stock

            </span>

            `;

        case "Out of Stock":

            return `

            <span class="outstock">

            Out of Stock

            </span>

            `;

        case "Expired":

            return `

            <span class="expired">

            Expired

            </span>

            `;

        default:

            return status;

    }

}
// ======================================================
// OPEN ADD MEDICINE MODAL
// ======================================================

function openAddModal(){

    editIndex = -1;

    document.getElementById("modalTitle").innerText = "Add Medicine";

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

    document.getElementById("medicineId").value = "";

    document.getElementById("medicineName").value = "";

    document.getElementById("medicineCategory").value = "";

    document.getElementById("medicineQuantity").value = "";

    document.getElementById("medicinePrice").value = "";

    document.getElementById("medicineExpiry").value = "";

    document.getElementById("medicineSupplier").value = "";

    document.getElementById("medicineStatus").value = "In Stock";

}
// ======================================================
// SAVE MEDICINE
// ======================================================

function saveMedicine(){

    let quantity = parseInt(
        document.getElementById("medicineQuantity").value
    );

    const expiry = document.getElementById("medicineExpiry").value;

    let status = document.getElementById("medicineStatus").value;

    // ---------- Auto Status ----------

    const today = new Date();

    const expiryDate = new Date(expiry);

    if(expiry && expiryDate < today){

        status = "Expired";

    }

    else if(quantity === 0){

        status = "Out of Stock";

    }

    else if(quantity <= 20){

        status = "Low Stock";

    }

    else{

        status = "In Stock";

    }

    const medicine={

        id: editIndex===-1

            ? document.getElementById("medicineId").value.trim()

            : medicines[editIndex].id,

        name:document.getElementById("medicineName").value.trim(),

        category:document.getElementById("medicineCategory").value,

        quantity:quantity,

        price:document.getElementById("medicinePrice").value,

        expiry:expiry,

        supplier:document.getElementById("medicineSupplier").value.trim(),

        status:status

    };

    if(

        medicine.id==="" ||

        medicine.name==="" ||

        medicine.category===""

    ){

        alert("Please fill all required fields.");

        return;

    }

    if(editIndex===-1){

        medicines.push(medicine);

    }

    else{

        medicines[editIndex]=medicine;

    }

    saveMedicines();

    applyFilters();

    closeModal();

}
// ======================================================
// EDIT MEDICINE
// ======================================================

function editMedicine(index){

    editIndex=index;

    const medicine=medicines[index];

    document.getElementById("modalTitle").innerText="Edit Medicine";

    document.getElementById("medicineId").value=medicine.id;

    document.getElementById("medicineName").value=medicine.name;

    document.getElementById("medicineCategory").value=medicine.category;

    document.getElementById("medicineQuantity").value=medicine.quantity;

    document.getElementById("medicinePrice").value=medicine.price;

    document.getElementById("medicineExpiry").value=medicine.expiry;

    document.getElementById("medicineSupplier").value=medicine.supplier;

    document.getElementById("medicineStatus").value=medicine.status;

    modal.style.display="flex";

}
// ======================================================
// VIEW MEDICINE
// ======================================================

function viewMedicine(index){

    const medicine = medicines[index];

    document.getElementById("viewMedicineData").innerHTML = `

        <p><strong>Medicine ID:</strong> ${medicine.id}</p>

        <p><strong>Medicine Name:</strong> ${medicine.name}</p>

        <p><strong>Category:</strong> ${medicine.category}</p>

        <p><strong>Quantity:</strong> ${medicine.quantity}</p>

        <p><strong>Price:</strong> ₹${medicine.price}</p>

        <p><strong>Supplier:</strong> ${medicine.supplier}</p>

        <p><strong>Expiry Date:</strong> ${medicine.expiry}</p>

        <p><strong>Status:</strong> ${medicine.status}</p>

    `;

    viewModal.style.display = "flex";

}

// ======================================================
// DELETE MEDICINE
// ======================================================

function deleteMedicine(index){

    deleteIndex = index;

    deleteModal.style.display = "flex";

}

function confirmDelete(){

    if(deleteIndex === -1) return;

    medicines.splice(deleteIndex,1);

    deleteIndex = -1;

    saveMedicines();

    applyFilters();

    deleteModal.style.display = "none";

}
// ======================================================
// PAGINATION
// ======================================================

function renderPagination(){

    const totalPages = Math.max(

        1,

        Math.ceil(filteredMedicines.length / rowsPerPage)

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

        Math.ceil(filteredMedicines.length / rowsPerPage)

    );

    if(currentPage < totalPages){

        currentPage++;

        render();

    }

}
// ======================================================
// EXPORT CSV
// ======================================================

function exportMedicinesCSV(){

    let csv =
"Medicine ID,Medicine Name,Category,Quantity,Price,Supplier,Expiry Date,Status\n";

    medicines.forEach(medicine=>{

        csv +=

`${medicine.id},${medicine.name},${medicine.category},${medicine.quantity},${medicine.price},${medicine.supplier},${medicine.expiry},${medicine.status}\n`;

    });

    const blob = new Blob([csv],{

        type:"text/csv"

    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "pharmacy_inventory.csv";

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

    saveMedicines();

});

// ======================================================
// INITIALIZATION COMPLETE
// ======================================================

console.log("====================================");

console.log("Hospital HMS");

console.log("Pharmacy Module Loaded Successfully");

console.log("====================================");
