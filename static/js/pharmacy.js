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

async function init(){

    await loadMedicines();

    registerEvents();

    applyFilters();

}

// ======================================================
// LOAD MEDICINES
// ======================================================

async function loadMedicines() {

    try {

        const response = await fetch("/api/pharmacy");

        const data = await response.json();

        console.log("Pharmacy API Response:", data);

        if (!data.success) {

            console.error(
                "Failed to load medicines:",
                data.error
            );

            medicines = [];
            filteredMedicines = [];

            return;
        }


        medicines = data.medicines.map(medicine => ({

            id:
                medicine.MedicineID || "",

            name:
                medicine.MedicineName || "",

            category:
                medicine.Category || "",

            quantity:
                Number(medicine.Quantity || 0),

            price:
                Number(medicine.Price || 0),

            expiry:
                medicine.ExpiryDate || "",

            status:
                medicine.Status || ""

        }));


        filteredMedicines = [...medicines];


        console.log(
            "Medicines loaded from MySQL:",
            medicines
        );

    }

    catch (error) {

        console.error(
            "GET PHARMACY ERROR:",
            error
        );

        medicines = [];

        filteredMedicines = [];

    }

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

async function saveMedicine() {

    const quantity = parseInt(
        document.getElementById("medicineQuantity").value
    );

    const expiry =
        document.getElementById("medicineExpiry").value;

    const medicine = {

        MedicineID:
            editIndex === -1
                ? document.getElementById("medicineId").value.trim()
                : medicines[editIndex].id,

        MedicineName:
            document.getElementById("medicineName").value.trim(),

        Category:
            document.getElementById("medicineCategory").value,

        Quantity:
            quantity,

        Price:
            document.getElementById("medicinePrice").value,

        ExpiryDate:
            expiry

    };


    // ============================================
    // VALIDATION
    // ============================================

    if (
        medicine.MedicineID === "" ||
        medicine.MedicineName === "" ||
        medicine.Category === "" ||
        isNaN(medicine.Quantity) ||
        medicine.ExpiryDate === ""
    ) {

        alert("Please fill all required fields.");

        return;
    }


    try {

        let response;


        // ============================================
        // ADD MEDICINE
        // ============================================

        if (editIndex === -1) {

            response = await fetch(
                "/api/pharmacy",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(medicine)
                }
            );

        }


        // ============================================
        // EDIT MEDICINE
        // ============================================

        else {

            const existingMedicine =
                medicines[editIndex];


            response = await fetch(
                `/api/pharmacy/${encodeURIComponent(
                    existingMedicine.id
                )}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(medicine)
                }
            );

        }


        // ============================================
        // API RESPONSE
        // ============================================

        const result = await response.json();


        // ============================================
        // ERROR
        // ============================================

        if (!response.ok || !result.success) {

            alert(
                result.error ||
                "Unable to save medicine."
            );

            return;
        }


        // ============================================
        // SUCCESS
        // ============================================

        alert(
            editIndex === -1
                ? "Medicine added successfully!"
                : "Medicine updated successfully!"
        );


        closeModal();


        // ============================================
        // RELOAD FROM MYSQL
        // ============================================

        await loadMedicines();

        applyFilters();

    }

    catch (error) {

        console.error(
            "SAVE MEDICINE ERROR:",
            error
        );

        alert(
            "Server error while saving medicine."
        );

    }

}
// ======================================================
// EDIT MEDICINE
// ======================================================

function editMedicine(index) {

    editIndex = index;

    const medicine = medicines[index];

    if (!medicine) {

        alert("Medicine not found.");

        return;
    }


    document.getElementById("modalTitle").innerText =
        "Edit Medicine";


    document.getElementById("medicineId").value =
        medicine.id || "";


    document.getElementById("medicineName").value =
        medicine.name || "";


    document.getElementById("medicineCategory").value =
        medicine.category || "";


    document.getElementById("medicineQuantity").value =
        medicine.quantity || 0;


    document.getElementById("medicinePrice").value =
        medicine.price || 0;


    document.getElementById("medicineExpiry").value =
        medicine.expiry || "";


    // Supplier is not currently stored in MySQL
    document.getElementById("medicineSupplier").value =
        medicine.supplier || "";


    document.getElementById("medicineStatus").value =
        medicine.status || "In Stock";


    // Medicine ID should not be changed during edit
    document.getElementById("medicineId").readOnly = true;


    modal.style.display = "flex";

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

async function confirmDelete() {

    if (deleteIndex === -1) {
        return;
    }

    const medicine = medicines[deleteIndex];

    if (!medicine || !medicine.id) {

        alert("Invalid medicine selected.");

        return;
    }

    try {

        const response = await fetch(
            `/api/pharmacy/${encodeURIComponent(medicine.id)}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {

            alert(
                result.error ||
                "Unable to delete medicine."
            );

            return;
        }

        alert("Medicine deleted successfully!");

        deleteIndex = -1;

        deleteModal.style.display = "none";

        // Reload directly from MySQL

        await loadMedicines();

        applyFilters();

    }

    catch (error) {

        console.error(
            "DELETE MEDICINE ERROR:",
            error
        );

        alert(
            "Server error while deleting medicine."
        );

    }

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
