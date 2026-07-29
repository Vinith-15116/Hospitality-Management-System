// ======================================================
// Hospital HMS
// Analytics Dashboard
// ======================================================

// ---------- Local Storage ----------

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

let admissionChart;
let diseaseChart;
let incomeChart;
let medicineChart;

// ======================================================
// INITIALIZE
// ======================================================

document.addEventListener("DOMContentLoaded", init);

function init(){

    loadData();

    renderCards();

    renderCharts();

    renderAIInsights();

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
// KPI CARDS
// ======================================================

function renderCards(){

    // Patient Growth

    document.getElementById("patientGrowth").innerText =

        patients.length + "%";

    // Revenue

    let revenue = 0;

    beds.forEach(bed=>{

        revenue += Number(bed.charge || 0);

    });

    medicines.forEach(medicine=>{

        revenue += Number(medicine.price || 0);

    });

    document.getElementById("analyticsRevenue").innerText =

        "₹" + revenue.toLocaleString();

    // Bed Occupancy

    const occupied = beds.filter(

        bed=>bed.status==="Occupied"

    ).length;

    const occupancy =

        beds.length===0

        ? 0

        : Math.round(

            occupied / beds.length * 100

        );

    document.getElementById("occupancyRate").innerText =

        occupancy + "%";

    // Medicine Usage

    let totalMedicine = 0;

    medicines.forEach(medicine=>{

        totalMedicine += Number(

            medicine.quantity || 0

        );

    });

    document.getElementById("medicineUsage").innerText =

        totalMedicine;

}
// ======================================================
// RENDER ALL CHARTS
// ======================================================

function renderCharts(){

    renderAdmissionChart();

    renderDiseaseChart();

    renderIncomeChart();

    renderMedicineChart();

}
// ======================================================
// PATIENT ADMISSION CHART
// ======================================================

function renderAdmissionChart(){

    admissionChart = new Chart(

        document.getElementById("admissionChart"),

        {

            type:"line",

            data:{

                labels:[

                    "Jan","Feb","Mar",

                    "Apr","May","Jun",

                    "Jul","Aug","Sep",

                    "Oct","Nov","Dec"

                ],

                datasets:[{

                    label:"Patient Admissions",

                    data:[

                        15,22,28,35,

                        42,50,55,60,

                        65,70,78,85

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

        }

    );

}
// ======================================================
// DISEASE DISTRIBUTION CHART
// ======================================================

function renderDiseaseChart(){

    const diseases = {};

    patients.forEach(patient=>{

        const disease = patient.disease || "Unknown";

        diseases[disease] =

        (diseases[disease] || 0) + 1;

    });

    diseaseChart = new Chart(

        document.getElementById("diseaseChart"),

        {

            type:"pie",

            data:{

                labels:Object.keys(diseases),

                datasets:[{

                    data:Object.values(diseases)

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
// REVENUE ANALYSIS CHART
// ======================================================

function renderIncomeChart(){

    let bedRevenue = 0;

    let medicineRevenue = 0;

    beds.forEach(bed=>{

        bedRevenue += Number(

            bed.charge || 0

        );

    });

    medicines.forEach(medicine=>{

        medicineRevenue += Number(

            medicine.price || 0

        );

    });

    incomeChart = new Chart(

        document.getElementById("incomeChart"),

        {

            type:"bar",

            data:{

                labels:[

                    "Beds",

                    "Medicines"

                ],

                datasets:[{

                    label:"Revenue",

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
// MEDICINE CONSUMPTION CHART
// ======================================================

function renderMedicineChart(){

    const categories = {};

    medicines.forEach(medicine=>{

        const category =

        medicine.category || "Other";

        categories[category] =

        (categories[category] || 0)

        +

        Number(medicine.quantity || 0);

    });

    medicineChart = new Chart(

        document.getElementById("medicineChart"),

        {

            type:"doughnut",

            data:{

                labels:Object.keys(categories),

                datasets:[{

                    data:Object.values(categories)

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
// AI INSIGHTS
// ======================================================

function renderAIInsights(){

    const table = document.getElementById("aiInsights");

    // Most Common Disease

    const diseaseCount = {};

    patients.forEach(patient=>{

        const disease = patient.disease || "Unknown";

        diseaseCount[disease] =

        (diseaseCount[disease] || 0) + 1;

    });

    let commonDisease = "N/A";

    let max = 0;

    for(const disease in diseaseCount){

        if(diseaseCount[disease] > max){

            max = diseaseCount[disease];

            commonDisease = disease;

        }

    }

    // Expected Growth

    const expectedGrowth =

    Math.round(

        patients.length * 1.15

    );

    // Medicine Demand

    const lowStock = medicines.filter(

        medicine=>medicine.status==="Low Stock"

    ).length;

    // Performance Score

    const occupiedBeds = beds.filter(

        bed=>bed.status==="Occupied"

    ).length;

    const occupancyRate =

    beds.length===0

    ? 0

    : Math.round(

        occupiedBeds/beds.length*100

    );

    let performance = "Excellent";

    if(occupancyRate>90){

        performance="Busy";

    }

    if(lowStock>10){

        performance="Attention Needed";

    }

    table.innerHTML = `

    <tr>

        <td>Most Common Disease</td>

        <td>${commonDisease}</td>

    </tr>

    <tr>

        <td>Expected Patient Count (Next Month)</td>

        <td>${expectedGrowth}</td>

    </tr>

    <tr>

        <td>Low Stock Medicines</td>

        <td>${lowStock}</td>

    </tr>

    <tr>

        <td>Hospital Performance</td>

        <td>${performance}</td>

    </tr>

    `;

}
// ======================================================
// ALERTS
// ======================================================

function showAlerts(){

    const expired = medicines.filter(

        medicine=>medicine.status==="Expired"

    ).length;

    const availableBeds = beds.filter(

        bed=>bed.status==="Available"

    ).length;

    if(expired>0){

        console.warn(

            expired +

            " expired medicines found."

        );

    }

    if(availableBeds<5){

        console.warn(

            "Low bed availability."

        );

    }

}
// ======================================================
// AUTO REFRESH
// ======================================================

function refreshAnalytics(){

    if(admissionChart) admissionChart.destroy();

    if(diseaseChart) diseaseChart.destroy();

    if(incomeChart) incomeChart.destroy();

    if(medicineChart) medicineChart.destroy();

    loadData();

    renderCards();

    renderCharts();

    renderAIInsights();

}

setInterval(refreshAnalytics,30000);
// ======================================================
// INITIALIZE
// ======================================================

function init(){

    loadData();

    renderCards();

    renderCharts();

    renderAIInsights();

    showAlerts();

}
// ======================================================
// MODULE READY
// ======================================================

console.log("====================================");

console.log("Hospital HMS");

console.log("Analytics Dashboard Loaded");

console.log("====================================");
