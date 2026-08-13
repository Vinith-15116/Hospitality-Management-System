// ===========================================
// DASHBOARD JS
// Hospital Hospitality Management System
// ===========================================


// ===========================================
// GLOBAL VARIABLES
// ===========================================

let lineChart = null;
let pieChart = null;


// ===========================================
// LOAD REAL DASHBOARD DATA
// ===========================================

async function loadDashboardData() {

    try {

        const response = await fetch("/api/dashboard-data");

        const data = await response.json();


        if (!data.success) {

            console.error(
                "Dashboard error:",
                data.error
            );

            return;
        }


        // ==========================================
        // PATIENTS
        // ==========================================

        updateDashboardValue(
            "totalPatients",
            data.patients
        );


        // ==========================================
        // DOCTORS
        // ==========================================

        updateDashboardValue(
            "totalDoctors",
            data.doctors
        );


        // ==========================================
        // NURSES
        // ==========================================

        updateDashboardValue(
            "totalNurses",
            data.nurses
        );


        // ==========================================
        // AVAILABLE BEDS
        // ==========================================

        updateDashboardValue(
            "availableBeds",
            data.available_beds
        );


        // ==========================================
        // ADMISSIONS
        // ==========================================

        updateDashboardValue(
            "totalAdmissions",
            data.admissions
        );


        // ==========================================
        // DISCHARGES
        // ==========================================

        updateDashboardValue(
            "totalDischarges",
            data.discharges
        );


        // ==========================================
        // MEDICINE STOCK
        // ==========================================

        updateDashboardValue(
            "medicineStock",
            data.medicine_stock
        );

// ==========================================
// RECENT ADMISSIONS
// ==========================================

        loadRecentAdmissions(data);
        updateDiseaseChart(data);
        updateMonthlyPatientsChart(data);
        console.log(
            "Dashboard data loaded successfully:",
            data
        );

    }

    catch (error) {

        console.error(
            "Failed to load dashboard data:",
            error
        );

    }

}

// ==========================================
// DISEASE DISTRIBUTION CHART
// ==========================================

function updateDiseaseChart(data) {

    if (!pieChart) {
        return;
    }

    const diseases =
        data.disease_distribution || [];

    if (diseases.length === 0) {
        return;
    }

    pieChart.data.labels =
        diseases.map(item => item.Disease);

    pieChart.data.datasets[0].data =
        diseases.map(item => item.total);

    pieChart.update();
}

// ==========================================
// UPDATE DASHBOARD VALUE
// ==========================================

function updateDashboardValue(
    elementId,
    value
) {

    const element =
        document.getElementById(elementId);


    if (!element) {

        console.warn(
            `Dashboard element not found: ${elementId}`
        );

        return;
    }


    element.textContent =
        Number(value || 0).toLocaleString("en-IN");

}

// ==========================================
// RECENT ADMISSIONS
// ==========================================

function loadRecentAdmissions(data) {

    const table =
        document.getElementById("recentAdmissionsTable");

    if (!table) {
        return;
    }

    table.innerHTML = "";

    const admissions = data.recent_admissions || [];

    if (admissions.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6"
                    style="text-align:center;padding:30px;">
                    No Recent Admissions
                </td>
            </tr>
        `;

        return;
    }

    admissions.forEach(patient => {

        let statusClass = "blue";

        if (patient.PatientStatus === "Admitted") {
            statusClass = "green";
        }
        else if (patient.PatientStatus === "Critical") {
            statusClass = "red";
        }

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${patient.PatientID || "-"}</td>

            <td>${patient.PatientName || "-"}</td>

            <td>${patient.DoctorAssigned || "-"}</td>

            <td>${patient.Ward || "-"}</td>

            <td>
                <span class="${statusClass}">
                    ${patient.PatientStatus || "-"}
                </span>
            </td>

            <td>
                <a href="/patients-page">
                    <button class="table-btn">
                        View
                    </button>
                </a>
            </td>
        `;

        table.appendChild(row);

    });
}

// ==========================================
// SEARCH BOX
// ==========================================

function setupSearch() {

    const search =
        document.querySelector(
            ".header-right input"
        );


    if (!search) {
        return;
    }


    search.addEventListener(
        "keyup",
        function () {

            console.log(
                "Searching:",
                this.value
            );

        }
    );

}


// ==========================================
// NOTIFICATION BELL
// ==========================================

function setupNotifications() {

    const bell =
        document.querySelector(".fa-bell");


    if (bell) {

        bell.addEventListener(
            "click",
            function () {

                alert(
                    "No New Notifications"
                );

            }
        );

    }


    const mail =
        document.querySelector(".fa-envelope");


    if (mail) {

        mail.addEventListener(
            "click",
            function () {

                alert(
                    "Inbox is Empty"
                );

            }
        );

    }

}


// ==========================================
// SIDEBAR ACTIVE MENU
// ==========================================

function setupSidebar() {

    const menu =
        document.querySelectorAll(
            ".sidebar ul li"
        );


    menu.forEach(item => {

        item.addEventListener(
            "click",
            function () {

                menu.forEach(i => {

                    i.classList.remove(
                        "active"
                    );

                });


                this.classList.add(
                    "active"
                );

            }
        );

    });

}


// ==========================================
// CARD HOVER EFFECT
// ==========================================

function setupCardHover() {

    document
        .querySelectorAll(".card")
        .forEach(card => {

            card.addEventListener(
                "mouseenter",
                () => {

                    card.style.transform =
                        "translateY(-8px)";

                }
            );


            card.addEventListener(
                "mouseleave",
                () => {

                    card.style.transform =
                        "translateY(0px)";

                }
            );

        });

}


// ==========================================
// QUICK ACTION HOVER
// ==========================================

function setupQuickActions() {

    document
        .querySelectorAll(".action")
        .forEach(action => {

            action.addEventListener(
                "mouseenter",
                () => {

                    action.style.transform =
                        "translateY(-8px)";

                }
            );


            action.addEventListener(
                "mouseleave",
                () => {

                    action.style.transform =
                        "translateY(0px)";

                }
            );

        });

}


// ==========================================
// LINE CHART
// ==========================================

function createLineChart() {

    const lineCanvas =
        document.getElementById("lineChart");

    if (!lineCanvas) {
        return;
    }

    if (lineChart) {
        lineChart.destroy();
    }

    lineChart = new Chart(
        lineCanvas,
        {

            type: "line",

            data: {

                labels: [],

                datasets: [

                    {

                        label: "Patients",

                        data: [],

                        fill: false,

                        tension: 0.4,

                        borderWidth: 3,

                        pointRadius: 4

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: true
                    }

                },

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

// ==========================================
// UPDATE MONTHLY PATIENTS CHART
// ==========================================

function updateMonthlyPatientsChart(data) {

    if (!lineChart) {
        return;
    }

    const monthlyPatients =
        data.monthly_patients || [];

    if (monthlyPatients.length === 0) {
        return;
    }

    lineChart.data.labels =
        monthlyPatients.map(item => {

            const parts =
                item.month.split("-");

            const year = parts[0];

            const month = parts[1];

            const date =
                new Date(
                    Number(year),
                    Number(month) - 1
                );

            return date.toLocaleString(
                "en-US",
                {
                    month: "short",
                    year: "numeric"
                }
            );

        });

    lineChart.data.datasets[0].data =
        monthlyPatients.map(
            item => item.total
        );

    lineChart.update();

}

// ==========================================
// PIE CHART
// ==========================================

function createPieChart() {

    const pieCanvas =
        document.getElementById("pieChart");

    if (!pieCanvas) {
        return;
    }

    if (pieChart) {
        pieChart.destroy();
    }

    pieChart = new Chart(
        pieCanvas,
        {

            type: "pie",

            data: {

                labels: [],

                datasets: [

                    {

                        data: [],

                        backgroundColor: [
                            "#2563eb",
                            "#16a34a",
                            "#db2777",
                            "#ea580c",
                            "#7c3aed",
                            "#0891b2",
                            "#ca8a04",
                            "#dc2626",
                            "#4f46e5",
                            "#059669"
                        ]

                    }

                ]

            },

            options: {

                responsive: true,

                plugins: {

                    legend: {

                        position: "bottom"

                    }

                }

            }

        }
    );

}

// ==========================================
// UPDATE DISEASE CHART
// ==========================================

function updateDiseaseChart(data) {

    if (!pieChart) {
        return;
    }

    const diseases =
        data.disease_distribution || [];

    if (diseases.length === 0) {
        return;
    }

    pieChart.data.labels =
        diseases.map(
            item => item.Disease
        );

    pieChart.data.datasets[0].data =
        diseases.map(
            item => item.total
        );

    pieChart.update();

}


// ==========================================
// VIEW BUTTON HOVER
// ==========================================

function setupTableButtons() {

    document
        .querySelectorAll(".table-btn")
        .forEach(button => {

            button.addEventListener(
                "mouseenter",
                () => {

                    button.style.transform =
                        "translateY(-2px)";

                }
            );


            button.addEventListener(
                "mouseleave",
                () => {

                    button.style.transform =
                        "translateY(0px)";

                }
            );

        });

}


// ==========================================
// VIEW ALL BUTTONS
// ==========================================

function setupViewAllButtons() {

    document
        .querySelectorAll(".view-all-btn")
        .forEach(button => {

            button.addEventListener(
                "mouseenter",
                () => {

                    button.style.opacity = "0.8";

                }
            );


            button.addEventListener(
                "mouseleave",
                () => {

                    button.style.opacity = "1";

                }
            );

        });

}


// ==========================================
// NOTIFICATION ANIMATION
// ==========================================

function setupNotificationAnimation() {

    document
        .querySelectorAll(".note")
        .forEach((note, index) => {

            note.style.opacity = "0";

            note.style.transform =
                "translateX(-30px)";


            setTimeout(() => {

                note.style.transition = "0.5s";

                note.style.opacity = "1";

                note.style.transform =
                    "translateX(0px)";

            }, index * 120);

        });

}


// ==========================================
// TABLE HOVER
// ==========================================

function setupTableHover() {

    document
        .querySelectorAll(
            ".table-box tbody tr"
        )
        .forEach(row => {

            row.addEventListener(
                "mouseenter",
                () => {

                    row.style.background =
                        "#eef4ff";

                }
            );


            row.addEventListener(
                "mouseleave",
                () => {

                    row.style.background = "";

                }
            );

        });

}


// ==========================================
// PREDICTION CARD ANIMATION
// ==========================================

function setupPredictionCards() {

    document
        .querySelectorAll(".prediction-card")
        .forEach(card => {

            card.addEventListener(
                "mouseenter",
                () => {

                    card.style.transform =
                        "translateY(-8px)";

                }
            );


            card.addEventListener(
                "mouseleave",
                () => {

                    card.style.transform =
                        "translateY(0px)";

                }
            );

        });

}


// ==========================================
// GRAPH HOVER
// ==========================================

function setupGraphHover() {

    document
        .querySelectorAll(".graph")
        .forEach(graph => {

            graph.addEventListener(
                "mouseenter",
                () => {

                    graph.style.transform =
                        "translateY(-6px)";

                }
            );


            graph.addEventListener(
                "mouseleave",
                () => {

                    graph.style.transform =
                        "translateY(0px)";

                }
            );

        });

}


// ==========================================
// LIVE CLOCK
// ==========================================

function setupClock() {

    function updateClock() {

        const clock =
            document.getElementById("clock");


        if (clock) {

            const now = new Date();

            clock.innerHTML =
                now.toLocaleTimeString();

        }

    }


    updateClock();

    setInterval(
        updateClock,
        1000
    );

}


// ==========================================
// DASHBOARD FADE ANIMATION
// ==========================================

function setupFadeAnimation() {

    document
        .querySelectorAll(
            ".card,.action,.prediction-card,.graph,.table-box,.notifications"
        )
        .forEach((item, index) => {

            item.style.opacity = "0";

            item.style.transform =
                "translateY(25px)";


            setTimeout(() => {

                item.style.transition =
                    "0.5s";

                item.style.opacity = "1";

                item.style.transform =
                    "translateY(0px)";

            }, index * 80);

        });

}


// ==========================================
// CTRL + F SEARCH SHORTCUT
// ==========================================

function setupSearchShortcut() {

    document.addEventListener(
        "keydown",
        function (e) {

            if (
                e.ctrlKey &&
                e.key.toLowerCase() === "f"
            ) {

                e.preventDefault();


                const search =
                    document.querySelector(
                        ".header-right input"
                    );


                if (search) {

                    search.focus();

                }

            }

        }
    );

}


// ==========================================
// INITIALIZE DASHBOARD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "================================"
        );

        console.log(
            "Hospital Hospitality Management"
        );

        console.log(
            "Dashboard Loaded Successfully"
        );

        console.log(
            "================================"
        );


        // Load real database data

        loadDashboardData();


        // UI functions

        setupSearch();

        setupNotifications();

        setupSidebar();

        setupCardHover();

        setupQuickActions();

        setupTableButtons();

        setupViewAllButtons();

        setupNotificationAnimation();

        setupTableHover();

        setupPredictionCards();

        setupGraphHover();

        setupClock();

        setupFadeAnimation();

        setupSearchShortcut();


        // Charts

        createLineChart();

        createPieChart();

    }
);


// ==========================================
// AUTO REFRESH DATABASE DATA
// ==========================================

setInterval(
    function () {

        loadDashboardData();

    },
    10000
);


// ==========================================
// DASHBOARD AUTO REFRESH LOG
// ==========================================

setInterval(
    function () {

        console.log(
            "Dashboard Auto Refresh:",
            new Date().toLocaleTimeString()
        );

    },
    60000
);