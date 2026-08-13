// ======================================================
// HOSPITAL HMS
// REPORTS MODULE
// ======================================================

let patientChart;
let bedChart;
let medicineChart;
let doctorChart;
let nurseChart;


// ======================================================
// INITIALIZE
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    loadReports();

    // Print
    document.getElementById("printReport")
        ?.addEventListener("click", function () {
            window.print();
        });

    // Export CSV
    document.getElementById("downloadCSV")
        ?.addEventListener("click", exportCSV);

    // Generate Report
   document.getElementById("filterReport")
    ?.addEventListener("click", function () {

        loadReports(true);

    });
});


// ======================================================
// LOAD REPORT DATA
// ======================================================

function loadReports(useFilter = false) {

    let url = "/api/reports-data";


    if (useFilter) {

        const fromDate =
            document.getElementById("fromDate").value;

        const toDate =
            document.getElementById("toDate").value;


        if (fromDate && toDate) {

            if (fromDate > toDate) {

                alert(
                    "From date cannot be after To date."
                );

                return;
            }


            url +=
                "?from=" +
                encodeURIComponent(fromDate) +
                "&to=" +
                encodeURIComponent(toDate);

        }

        else if (fromDate) {

            url +=
                "?from=" +
                encodeURIComponent(fromDate);

        }

        else if (toDate) {

            url +=
                "?to=" +
                encodeURIComponent(toDate);

        }

    }


    fetch(url)

        .then(response => response.json())

        .then(data => {

            if (!data.success) {

                console.error(
                    "Reports API Error:",
                    data.error
                );

                return;
            }


            updateCards(data);

            updateSummary(data);

            renderPatientChart(
                data.monthly_patients
            );

            renderBedChart(data);

            renderMedicineChart(data);

            renderDoctorChart(data);

            renderNurseChart(data);

            renderActivities(
                data.recent_activities
            );


            console.log(
                "Reports data loaded:",
                data
            );

        })

        .catch(error => {

            console.error(
                "Reports connection error:",
                error
            );

        });

}

// ======================================================
// UPDATE DASHBOARD CARDS
// ======================================================

function updateCards(data) {

    document.getElementById(
        "totalPatients"
    ).innerText =
        Number(
            data.patients || 0
        ).toLocaleString();


    document.getElementById(
        "totalDoctors"
    ).innerText =
        Number(
            data.doctors || 0
        ).toLocaleString();


    document.getElementById(
        "totalNurses"
    ).innerText =
        Number(
            data.nurses || 0
        ).toLocaleString();


    document.getElementById(
        "availableBeds"
    ).innerText =
        Number(
            data.available_beds || 0
        ).toLocaleString();


    document.getElementById(
        "totalMedicines"
    ).innerText =
        Number(
            data.total_medicines || 0
        ).toLocaleString();

}


// ======================================================
// UPDATE SUMMARY TABLE
// ======================================================

function updateSummary(data) {

    document.getElementById(
        "summaryPatients"
    ).innerText =
        Number(
            data.patients || 0
        ).toLocaleString();


    document.getElementById(
        "summaryDoctors"
    ).innerText =
        Number(
            data.doctors || 0
        ).toLocaleString();


    document.getElementById(
        "summaryNurses"
    ).innerText =
        Number(
            data.nurses || 0
        ).toLocaleString();


    document.getElementById(
        "summaryBeds"
    ).innerText =
        Number(
            data.beds || 0
        ).toLocaleString();


    document.getElementById(
        "summaryMedicines"
    ).innerText =
        Number(
            data.total_medicines || 0
        ).toLocaleString();

}


// ======================================================
// MONTHLY PATIENT CHART
// ======================================================

function renderPatientChart(
    monthlyPatients
) {

    const canvas =
        document.getElementById(
            "patientChart"
        );


    if (!canvas) {
        return;
    }


    if (patientChart) {
        patientChart.destroy();
    }


    monthlyPatients =
        monthlyPatients || [];


    const labels =
        monthlyPatients.map(
            item => formatMonth(
                item.month
            )
        );


    const values =
        monthlyPatients.map(
            item => Number(
                item.total
            )
        );


    patientChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [{

                        label:
                            "Patients",

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
// BED OCCUPANCY CHART
// ======================================================

function renderBedChart(data) {

    const canvas =
        document.getElementById(
            "bedChart"
        );


    if (!canvas) {
        return;
    }


    if (bedChart) {
        bedChart.destroy();
    }


    bedChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels: [

                        "Available",

                        "Occupied",

                        "Maintenance"

                    ],

                    datasets: [{

                        data: [

                            Number(
                                data.available_beds || 0
                            ),

                            Number(
                                data.occupied_beds || 0
                            ),

                            Number(
                                data.maintenance_beds || 0
                            )

                        ],

                        borderWidth: 1

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position:
                                "bottom"

                        }

                    }

                }

            }
        );

}


// ======================================================
// MEDICINE STOCK CHART
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


    const total =
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
            total -
            lowStock -
            expired,
            0
        );


    medicineChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels: [

                        "In Stock",

                        "Low Stock",

                        "Expired"

                    ],

                    datasets: [{

                        label:
                            "Medicines",

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
// DOCTORS BY DEPARTMENT
// ======================================================

function renderDoctorChart(data) {

    const canvas =
        document.getElementById(
            "doctorChart"
        );


    if (!canvas) {
        return;
    }


    if (doctorChart) {
        doctorChart.destroy();
    }


    // The current Reports API does not provide
    // department-wise doctor data.
    // Therefore this chart uses the total doctor count.

    doctorChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels: [
                        "Total Doctors"
                    ],

                    datasets: [{

                        label:
                            "Doctors",

                        data: [
                            Number(
                                data.doctors || 0
                            )
                        ],

                        borderWidth: 1

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
// NURSES BY SHIFT
// ======================================================

function renderNurseChart(data) {

    const canvas =
        document.getElementById(
            "nurseChart"
        );


    if (!canvas) {
        return;
    }


    if (nurseChart) {
        nurseChart.destroy();
    }


    // The current Reports API does not provide
    // shift-wise nurse data.
    // Therefore this chart uses total nurses.

    nurseChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels: [
                        "Total Nurses"
                    ],

                    datasets: [{

                        label:
                            "Nurses",

                        data: [
                            Number(
                                data.nurses || 0
                            )
                        ],

                        borderWidth: 1

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
// RECENT ACTIVITIES
// ======================================================

function renderActivities(
    activities
) {

    const table =
        document.getElementById(
            "activityTable"
        );


    if (!table) {
        return;
    }


    activities =
        activities || [];


    if (activities.length === 0) {

        table.innerHTML = `

            <tr>

                <td colspan="4"
                    style="text-align:center;">

                    No Recent Activities

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML = "";


    activities.forEach(
        activity => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${activity.AdmissionDate || "-"}
                </td>

                <td>
                    Patients
                </td>

                <td>
                    ${activity.PatientName || "-"}
                    -
                    ${activity.PatientStatus || "-"}
                </td>

                <td>
                    ${activity.PatientStatus || "-"}
                </td>

            `;


            table.appendChild(row);

        }
    );

}


// ======================================================
// EXPORT CSV
// ======================================================

function exportCSV() {

    fetch("/api/reports-data")

        .then(response =>
            response.json()
        )

        .then(data => {

            if (!data.success) {
                return;
            }


            const rows = [

                [
                    "Category",
                    "Total"
                ],

                [
                    "Patients",
                    data.patients
                ],

                [
                    "Doctors",
                    data.doctors
                ],

                [
                    "Nurses",
                    data.nurses
                ],

                [
                    "Total Beds",
                    data.beds
                ],

                [
                    "Available Beds",
                    data.available_beds
                ],

                [
                    "Occupied Beds",
                    data.occupied_beds
                ],

                [
                    "Maintenance Beds",
                    data.maintenance_beds
                ],

                [
                    "Total Medicines",
                    data.total_medicines
                ],

                [
                    "Medicine Stock",
                    data.medicine_stock
                ],

                [
                    "Low Stock Medicines",
                    data.low_stock
                ],

                [
                    "Expired Medicines",
                    data.expired_medicines
                ]

            ];


            const csv =
                rows.map(
                    row =>
                        row.join(",")
                ).join("\n");


            const blob =
                new Blob(
                    [csv],
                    {
                        type:
                            "text/csv;charset=utf-8;"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href = url;

            link.download =
                "hospital_report.csv";


            link.click();


            URL.revokeObjectURL(url);

        })

        .catch(error => {

            console.error(
                "CSV export error:",
                error
            );

        });

}


// ======================================================
// DATE FORMAT
// ======================================================

function formatMonth(
    monthValue
) {

    if (!monthValue) {
        return "-";
    }


    const parts =
        monthValue.split("-");


    if (parts.length !== 2) {
        return monthValue;
    }


    const date =
        new Date(
            Number(parts[0]),
            Number(parts[1]) - 1
        );


    return date.toLocaleString(
        "en-US",
        {
            month: "short",
            year: "numeric"
        }
    );

}


// ======================================================
// AUTO REFRESH
// ======================================================

setInterval(
    loadReports,
    30000
);


console.log(
    "Hospital HMS Reports Loaded"
);