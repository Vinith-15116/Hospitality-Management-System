// ======================================================
// Hospital HMS
// Analytics Dashboard
// ======================================================


// ======================================================
// CHART VARIABLES
// ======================================================

let admissionChart;
let diseaseChart;
let medicineChart;


// ======================================================
// INITIALIZE
// ======================================================

document.addEventListener("DOMContentLoaded", init);


function init() {

    loadAnalyticsData();

}


// ======================================================
// LOAD ANALYTICS DATA
// ======================================================

function loadAnalyticsData() {

    fetch("/api/dashboard-data")

        .then(response => response.json())

        .then(data => {

            if (!data.success) {

                console.error(
                    "Analytics API Error:",
                    data.error
                );

                return;
            }


            // ==========================================
            // KPI CARDS
            // ==========================================

            updateCards(data);


            // ==========================================
            // CHARTS
            // ==========================================

            renderAdmissionChart(
                data.monthly_patients
            );

            renderDiseaseChart(
                data.disease_distribution
            );

            renderMedicineChart(
                data
            );


            // ==========================================
            // AI INSIGHTS
            // ==========================================

            renderAIInsights(data);


            console.log(
                "Analytics data loaded:",
                data
            );

        })

        .catch(error => {

            console.error(
                "Analytics connection error:",
                error
            );

        });

}


// ======================================================
// KPI CARDS
// ======================================================

function updateCards(data) {

    // ==========================================
    // PATIENT GROWTH
    // ==========================================

    const monthly =
        data.monthly_patients || [];

    let growthText = "N/A";


    if (monthly.length >= 2) {

        const previousItem =
            monthly[monthly.length - 2];

        const currentItem =
            monthly[monthly.length - 1];


        const previousDate =
            new Date(
                previousItem.month + "-01"
            );

        const currentDate =
            new Date(
                currentItem.month + "-01"
            );


        // Check whether the two records are
        // consecutive months

        const monthDifference =
            (
                currentDate.getFullYear() -
                previousDate.getFullYear()
            ) * 12
            +
            (
                currentDate.getMonth() -
                previousDate.getMonth()
            );


        const previous =
            Number(previousItem.total);

        const current =
            Number(currentItem.total);


        if (
            monthDifference === 1 &&
            previous > 0
        ) {

            const growth =
                Math.round(
                    (
                        (current - previous)
                        / previous
                    ) * 100
                );

            growthText =
                growth + "%";

        }

    }


    document.getElementById(
        "patientGrowth"
    ).innerText = growthText;


    // ==========================================
    // BED OCCUPANCY
    // ==========================================

    const totalBeds =
        Number(data.beds || 0);

    const occupiedBeds =
        Number(data.occupied_beds || 0);


    let occupancy = 0;


    if (totalBeds > 0) {

        occupancy =
            Math.round(
                (occupiedBeds / totalBeds) * 100
            );

    }


    document.getElementById(
        "occupancyRate"
    ).innerText =
        occupancy + "%";


    // ==========================================
    // MEDICINE USAGE
    // ==========================================

    document.getElementById(
        "medicineUsage"
    ).innerText =
        Number(
            data.medicine_stock || 0
        ).toLocaleString();

}


// ======================================================
// PATIENT ADMISSION CHART
// ======================================================

function renderAdmissionChart(monthlyPatients) {


    const canvas =
        document.getElementById(
            "admissionChart"
        );


    if (!canvas) {
        return;
    }


    if (admissionChart) {

        admissionChart.destroy();

    }


    monthlyPatients =
        monthlyPatients || [];


    const labels =
        monthlyPatients.map(item => {

            const parts =
                item.month.split("-");


            const year =
                Number(parts[0]);


            const month =
                Number(parts[1]);


            const date =
                new Date(
                    year,
                    month - 1
                );


            return date.toLocaleString(
                "en-US",
                {
                    month: "short",
                    year: "numeric"
                }
            );

        });


    const values =
        monthlyPatients.map(
            item => Number(item.total)
        );


    admissionChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [{

                        label:
                            "Patient Admissions",

                        data: values,

                        borderWidth: 3,

                        tension: 0.4,

                        fill: false

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                precision: 0

                            }

                        }

                    }

                }

            }
        );

}


// ======================================================
// DISEASE DISTRIBUTION
// ======================================================

function renderDiseaseChart(
    diseaseData
) {


    const canvas =
        document.getElementById(
            "diseaseChart"
        );


    if (!canvas) {
        return;
    }


    if (diseaseChart) {

        diseaseChart.destroy();

    }


    diseaseData =
        diseaseData || [];


    const labels =
        diseaseData.map(
            item => item.Disease
        );


    const values =
        diseaseData.map(
            item => Number(item.total)
        );


    diseaseChart =
        new Chart(
            canvas,
            {

                type: "pie",

                data: {

                    labels: labels,

                    datasets: [{

                        data: values,

                        borderWidth: 1

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position: "bottom"

                        }

                    }

                }

            }
        );

}


// ======================================================
// MEDICINE CONSUMPTION
// ======================================================

function renderMedicineChart(data) {


    const canvas =
        document.getElementById(
            "medicineChart"
        );


    if (!canvas) {
        return;
    }


    if (medicineChart) {

        medicineChart.destroy();

    }


    const totalMedicines =
        Number(
            data.total_medicines || 0
        );


    const lowStock =
        Number(
            data.low_stock || 0
        );


    const expired =
        Number(
            data.expired_medicines || 0
        );


    const inStock =
        Math.max(
            totalMedicines -
            lowStock -
            expired,
            0
        );


    medicineChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels: [

                        "In Stock",

                        "Low Stock",

                        "Expired"

                    ],

                    datasets: [{

                        data: [

                            inStock,

                            lowStock,

                            expired

                        ],

                        borderWidth: 1

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position: "bottom"

                        }

                    }

                }

            }
        );

}


// ======================================================
// AI INSIGHTS
// ======================================================

function renderAIInsights(data) {


    const table =
        document.getElementById(
            "aiInsights"
        );


    if (!table) {
        return;
    }


    const diseases =
        data.disease_distribution || [];


    // ==========================================
    // MOST COMMON DISEASE
    // ==========================================

    let commonDisease = "N/A";


    if (diseases.length > 0) {

        commonDisease =
            diseases[0].Disease;

    }


    // ==========================================
    // EXPECTED PATIENT GROWTH
    // ==========================================

    const monthly =
        data.monthly_patients || [];


    let expectedPatients = 0;


    if (monthly.length > 0) {

        const latest =
            Number(
                monthly[monthly.length - 1].total
            );


        expectedPatients =
            Math.round(
                latest * 1.15
            );

    }


    // ==========================================
    // LOW STOCK
    // ==========================================

    const lowStock =
        Number(
            data.low_stock || 0
        );


    // ==========================================
    // HOSPITAL PERFORMANCE
    // ==========================================

    const totalBeds =
        Number(data.beds || 0);


    const occupiedBeds =
        Number(data.occupied_beds || 0);


    let occupancyRate = 0;


    if (totalBeds > 0) {

        occupancyRate =
            Math.round(
                (occupiedBeds / totalBeds) * 100
            );

    }


    let performance =
        "Excellent";


    if (occupancyRate > 90) {

        performance = "Busy";

    }
    else if (occupancyRate > 75) {

        performance = "Good";

    }


    if (lowStock > 10) {

        performance =
            "Attention Needed";

    }


    // ==========================================
    // DISPLAY
    // ==========================================

    table.innerHTML = `

        <tr>

            <td>
                Most Common Disease
            </td>

            <td>
                ${commonDisease}
            </td>

        </tr>


        <tr>

            <td>
                Expected Patient Count (Next Month)
            </td>

            <td>
                ${expectedPatients}
            </td>

        </tr>


        <tr>

            <td>
                Low Stock Medicines
            </td>

            <td>
                ${lowStock}
            </td>

        </tr>


        <tr>

            <td>
                Hospital Performance
            </td>

            <td>
                ${performance}
            </td>

        </tr>

    `;

}


// ======================================================
// AUTO REFRESH
// ======================================================

setInterval(
    loadAnalyticsData,
    30000
);


// ======================================================
// MODULE READY
// ======================================================

console.log(
    "===================================="
);

console.log(
    "Hospital HMS"
);

console.log(
    "Analytics Dashboard Loaded"
);

console.log(
    "Database Connected Analytics"
);

console.log(
    "===================================="
);