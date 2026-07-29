// ======================================================
// Hospital HMS
// Reports & Analytics Module
// ======================================================

// ---------- Local Storage Keys ----------

const PATIENT_KEY = "hospital_patients";
const DOCTOR_KEY = "hospital_doctors";
const NURSE_KEY = "hospital_nurses";
const BED_KEY = "hospital_beds";
const PHARMACY_KEY = "hospital_pharmacy";

// ---------- Data ----------

let patients = [];
let doctors = [];
let nurses = [];
let beds = [];
let medicines = [];

// ---------- Charts ----------

let patientChart;
let doctorChart;
let nurseChart;
let bedChart;
let medicineChart;
let revenueChart;

// ---------- Dashboard ----------

const totalPatients =
document.getElementById("totalPatients");

const totalDoctors =
document.getElementById("totalDoctors");

const totalNurses =
document.getElementById("totalNurses");

const availableBeds =
document.getElementById("availableBeds");

const totalMedicines =
document.getElementById("totalMedicines");

const totalRevenue =
document.getElementById("totalRevenue");

// ======================================================
// INITIALIZE
// ======================================================

document.addEventListener("DOMContentLoaded", init);

function init(){

    loadData();

    renderDashboard();

    renderSummary();

    renderCharts();

    registerEvents();

}
// ======================================================
// LOAD DATA
// ======================================================

function loadData(){

    patients = JSON.parse(
        localStorage.getItem(PATIENT_KEY)
    ) || [];

    doctors = JSON.parse(
        localStorage.getItem(DOCTOR_KEY)
    ) || [];

    nurses = JSON.parse(
        localStorage.getItem(NURSE_KEY)
    ) || [];

    beds = JSON.parse(
        localStorage.getItem(BED_KEY)
    ) || [];

    medicines = JSON.parse(
        localStorage.getItem(PHARMACY_KEY)
    ) || [];

}
// ======================================================
// REGISTER EVENTS
// ======================================================

function registerEvents(){

    document.getElementById("printReport")
    .addEventListener("click",()=>{

        window.print();

    });

    document.getElementById("downloadCSV")
    .addEventListener("click",exportCSV);

    document.getElementById("filterReport")
    .addEventListener("click",()=>{

        alert("Date filtering will be added in the next version.");

    });

}
// ======================================================
// DASHBOARD
// ======================================================

function renderDashboard(){

    totalPatients.innerText = patients.length;

    totalDoctors.innerText = doctors.length;

    totalNurses.innerText = nurses.length;

    totalMedicines.innerText = medicines.length;

    availableBeds.innerText =

    beds.filter(

        bed=>bed.status==="Available"

    ).length;

    calculateRevenue();

}
// ======================================================
// REVENUE
// ======================================================

function calculateRevenue(){

    let revenue = 0;

    beds.forEach(bed=>{

        revenue += Number(bed.charge || 0);

    });

    medicines.forEach(medicine=>{

        revenue += Number(medicine.price || 0);

    });

    totalRevenue.innerText =

    "₹" + revenue.toLocaleString();

}
// ======================================================
// SUMMARY TABLE
// ======================================================

function renderSummary(){

    document.getElementById("summaryPatients").innerText =
    patients.length;

    document.getElementById("summaryDoctors").innerText =
    doctors.length;

    document.getElementById("summaryNurses").innerText =
    nurses.length;

    document.getElementById("summaryBeds").innerText =
    beds.length;

    document.getElementById("summaryMedicines").innerText =
    medicines.length;

    let revenue = 0;

    beds.forEach(bed=>{

        revenue += Number(bed.charge || 0);

    });

    medicines.forEach(medicine=>{

        revenue += Number(medicine.price || 0);

    });

    document.getElementById("summaryRevenue").innerText =
    "₹" + revenue.toLocaleString();

    renderActivities();

}
// ======================================================
// RECENT ACTIVITIES
// ======================================================

function renderActivities(){

    const tbody =
    document.getElementById("activityTable");

    tbody.innerHTML = "";

    let activities = [];

    patients.slice(-3).forEach(patient=>{

        activities.push({

            date:new Date().toLocaleDateString(),

            module:"Patients",

            description:"Patient Added : " + patient.name,

            status:"Success"

        });

    });

    doctors.slice(-3).forEach(doctor=>{

        activities.push({

            date:new Date().toLocaleDateString(),

            module:"Doctors",

            description:"Doctor Added : " + doctor.name,

            status:"Success"

        });

    });

    nurses.slice(-3).forEach(nurse=>{

        activities.push({

            date:new Date().toLocaleDateString(),

            module:"Nurses",

            description:"Nurse Added : " + nurse.name,

            status:"Success"

        });

    });

    activities.reverse();

    if(activities.length===0){

        tbody.innerHTML=`

        <tr>

        <td colspan="4"

        style="text-align:center;">

        No Activities

        </td>

        </tr>

        `;

        return;

    }

    activities.forEach(activity=>{

        tbody.innerHTML += `

        <tr>

        <td>${activity.date}</td>

        <td>${activity.module}</td>

        <td>${activity.description}</td>

        <td>${activity.status}</td>

        </tr>

        `;

    });

}
// ======================================================
// MONTHLY PATIENT CHART
// ======================================================

function renderPatientChart(){

    const ctx =
    document.getElementById("patientChart");

    patientChart = new Chart(ctx,{

        type:"line",

        data:{

            labels:[

                "Jan","Feb","Mar",

                "Apr","May","Jun",

                "Jul","Aug","Sep",

                "Oct","Nov","Dec"

            ],

            datasets:[{

                label:"Patients",

                data:[

                    12,19,22,25,

                    31,36,42,40,

                    38,46,52,60

                ],

                borderWidth:3,

                tension:.4,

                fill:false

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false

        }

    });

}
// ======================================================
// BED OCCUPANCY CHART
// ======================================================

function renderBedChart(){

    const available =

    beds.filter(

        bed=>bed.status==="Available"

    ).length;

    const occupied =

    beds.filter(

        bed=>bed.status==="Occupied"

    ).length;

    const maintenance =

    beds.filter(

        bed=>bed.status==="Maintenance"

    ).length;

    bedChart = new Chart(

        document.getElementById("bedChart"),

        {

        type:"doughnut",

        data:{

            labels:[

                "Available",

                "Occupied",

                "Maintenance"

            ],

            datasets:[{

                data:[

                    available,

                    occupied,

                    maintenance

                ]

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false

        }

    });

}
// ======================================================
// MEDICINE STOCK CHART
// ======================================================

function renderMedicineChart(){

    const inStock =

    medicines.filter(

        m=>m.status==="In Stock"

    ).length;

    const lowStock =

    medicines.filter(

        m=>m.status==="Low Stock"

    ).length;

    const expired =

    medicines.filter(

        m=>m.status==="Expired"

    ).length;

    medicineChart = new Chart(

        document.getElementById("medicineChart"),

        {

        type:"pie",

        data:{

            labels:[

                "In Stock",

                "Low Stock",

                "Expired"

            ],

            datasets:[{

                data:[

                    inStock,

                    lowStock,

                    expired

                ]

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false

        }

    });

}
// ======================================================
// DOCTORS BY DEPARTMENT CHART
// ======================================================

function renderDoctorChart(){

    const departments = {};

    doctors.forEach(doctor=>{

        const dept = doctor.department || "Unknown";

        departments[dept] = (departments[dept] || 0) + 1;

    });

    doctorChart = new Chart(

        document.getElementById("doctorChart"),

        {

            type:"bar",

            data:{

                labels:Object.keys(departments),

                datasets:[{

                    label:"Doctors",

                    data:Object.values(departments),

                    borderWidth:1

                }]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false,

                plugins:{

                    legend:{

                        display:false

                    }

                }

            }

        }

    );

}
// ======================================================
// NURSES BY SHIFT CHART
// ======================================================

function renderNurseChart(){

    const shifts = {};

    nurses.forEach(nurse=>{

        const shift = nurse.shift || "Unknown";

        shifts[shift] = (shifts[shift] || 0) + 1;

    });

    nurseChart = new Chart(

        document.getElementById("nurseChart"),

        {

            type:"polarArea",

            data:{

                labels:Object.keys(shifts),

                datasets:[{

                    data:Object.values(shifts)

                }]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false

            }

        }

    );

}
// ======================================================
// REVENUE CHART
// ======================================================

function renderRevenueChart(){

    let medicineRevenue = 0;

    let bedRevenue = 0;

    medicines.forEach(medicine=>{

        medicineRevenue += Number(medicine.price || 0);

    });

    beds.forEach(bed=>{

        bedRevenue += Number(bed.charge || 0);

    });

    revenueChart = new Chart(

        document.getElementById("revenueChart"),

        {

            type:"bar",

            data:{

                labels:[

                    "Bed Revenue",

                    "Medicine Revenue"

                ],

                datasets:[{

                    label:"Revenue (₹)",

                    data:[

                        bedRevenue,

                        medicineRevenue

                    ],

                    borderWidth:1

                }]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false

            }

        }

    );

}
// ======================================================
// RENDER ALL CHARTS
// ======================================================

function renderCharts(){

    renderPatientChart();

    renderBedChart();

    renderMedicineChart();

    renderDoctorChart();

    renderNurseChart();

    renderRevenueChart();

}
// ======================================================
// EXPORT REPORT TO CSV
// ======================================================

function exportCSV(){

    let csv =
`Category,Count
Patients,${patients.length}
Doctors,${doctors.length}
Nurses,${nurses.length}
Beds,${beds.length}
Medicines,${medicines.length}
Available Beds,${beds.filter(b=>b.status==="Available").length}
Occupied Beds,${beds.filter(b=>b.status==="Occupied").length}
Maintenance Beds,${beds.filter(b=>b.status==="Maintenance").length}
Low Stock Medicines,${medicines.filter(m=>m.status==="Low Stock").length}
Expired Medicines,${medicines.filter(m=>m.status==="Expired").length}
Revenue,${totalRevenue.innerText}
`;

    const blob = new Blob([csv],{

        type:"text/csv"

    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "Hospital_Report.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}
// ======================================================
// DATE FILTER
// ======================================================

function filterByDate(){

    const from = document.getElementById("fromDate").value;

    const to = document.getElementById("toDate").value;

    if(from==="" || to===""){

        alert("Please select both dates.");

        return;

    }

    alert(

        "Report generated from\n\n"

        + from +

        "\n\nto\n\n"

        + to +

        "\n\n(Current version shows all data. Backend filtering will be added later.)"

    );

}
// ======================================================
// REGISTER EVENTS
// ======================================================

function registerEvents(){

    document.getElementById("printReport")
    .addEventListener("click",()=>{

        window.print();

    });

    document.getElementById("downloadCSV")
    .addEventListener("click",exportCSV);

    document.getElementById("filterReport")
    .addEventListener("click",filterByDate);

}
// ======================================================
// REFRESH DASHBOARD
// ======================================================

function refreshDashboard(){

    loadData();

    renderDashboard();

    renderSummary();

    refreshCharts();

}
// ======================================================
// DESTROY OLD CHARTS
// ======================================================

function refreshCharts(){

    if(patientChart){

        patientChart.destroy();

    }

    if(doctorChart){

        doctorChart.destroy();

    }

    if(nurseChart){

        nurseChart.destroy();

    }

    if(bedChart){

        bedChart.destroy();

    }

    if(medicineChart){

        medicineChart.destroy();

    }

    if(revenueChart){

        revenueChart.destroy();

    }

    renderCharts();

}
// ======================================================
// AUTO REFRESH EVERY 30 SECONDS
// ======================================================

setInterval(()=>{

    refreshDashboard();

},30000);
// ======================================================
// HOSPITAL PERFORMANCE SCORE
// ======================================================

function calculatePerformanceScore(){

    let score = 100;

    const occupiedBeds = beds.filter(
        bed => bed.status === "Occupied"
    ).length;

    const maintenanceBeds = beds.filter(
        bed => bed.status === "Maintenance"
    ).length;

    const lowStockMedicines = medicines.filter(
        medicine => medicine.status === "Low Stock"
    ).length;

    const expiredMedicinesCount = medicines.filter(
        medicine => medicine.status === "Expired"
    ).length;

    score -= maintenanceBeds * 5;

    score -= lowStockMedicines * 2;

    score -= expiredMedicinesCount * 5;

    if(score < 0){

        score = 0;

    }

    return {

        score,

        occupiedBeds,

        maintenanceBeds,

        lowStockMedicines,

        expiredMedicinesCount

    };

}
// ======================================================
// EXECUTIVE SUMMARY
// ======================================================

function renderExecutiveSummary(){

    const data = calculatePerformanceScore();

    const tbody = document.getElementById("activityTable");

    tbody.innerHTML += `

    <tr>

        <td>${new Date().toLocaleDateString()}</td>

        <td>Analytics</td>

        <td>

        Hospital Performance Score :

        ${data.score}%

        </td>

        <td>

        Excellent

        </td>

    </tr>

    `;

}
// ======================================================
// LOW STOCK ALERT
// ======================================================

function showInventoryAlerts(){

    const lowStock = medicines.filter(

        medicine => medicine.status === "Low Stock"

    ).length;

    const expired = medicines.filter(

        medicine => medicine.status === "Expired"

    ).length;

    if(lowStock > 0){

        console.warn(

            lowStock +

            " medicines are running low."

        );

    }

    if(expired > 0){

        console.warn(

            expired +

            " medicines have expired."

        );

    }

}
// ======================================================
// BED ALERT
// ======================================================

function showBedAlerts(){

    const available = beds.filter(

        bed => bed.status === "Available"

    ).length;

    if(available <= 5){

        console.warn(

            "Warning: Low Bed Availability."

        );

    }

}
// ======================================================
// INITIALIZE
// ======================================================

function init(){

    loadData();

    renderDashboard();

    renderSummary();

    renderCharts();

    renderExecutiveSummary();

    showInventoryAlerts();

    showBedAlerts();

    registerEvents();

}
// ======================================================
// MODULE READY
// ======================================================

console.log("====================================");

console.log("Hospital HMS");

console.log("Reports & Analytics Module Ready");

console.log("====================================");