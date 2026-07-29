// ==========================================
// DASHBOARD COUNTERS
// ==========================================

let diseaseCount = 0;
let medicineCount = 0;
let stayCount = 0;
let predictionHistory = [];

// ==========================================
// MODALS
// ==========================================

const diseaseModal = document.getElementById("diseaseModal");
const medicineModal = document.getElementById("medicineModal");
const stayModal = document.getElementById("stayModal");

// ==========================================
// OPEN BUTTONS
// ==========================================

document.getElementById("openDiseasePrediction").onclick = () => {

    diseaseModal.style.display = "flex";

};

document.getElementById("openMedicinePrediction").onclick = () => {

    medicineModal.style.display = "flex";

};

document.getElementById("openStayPrediction").onclick = () => {

    stayModal.style.display = "flex";

};

// ==========================================
// CLOSE BUTTONS
// ==========================================

document.getElementById("closeDiseaseModal").onclick = () => {

    diseaseModal.style.display = "none";

};

document.getElementById("closeMedicineModal").onclick = () => {

    medicineModal.style.display = "none";

};

document.getElementById("closeStayModal").onclick = () => {

    stayModal.style.display = "none";

};

// ==========================================
// CLOSE WHEN CLICK OUTSIDE
// ==========================================

window.onclick = function(event){

    if(event.target==diseaseModal)
        diseaseModal.style.display="none";

    if(event.target==medicineModal)
        medicineModal.style.display="none";

    if(event.target==stayModal)
        stayModal.style.display="none";

};

// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboard(){

    document.getElementById("diseaseCount").textContent=diseaseCount;

    document.getElementById("medicineCount").textContent=medicineCount;

    document.getElementById("stayCount").textContent=stayCount;

    document.getElementById("totalPrediction").textContent=

        diseaseCount+medicineCount+stayCount;

}
// ==========================================
// DISEASE PREDICTION
// ==========================================

document.getElementById("predictDisease").onclick = function(){

    const diseases = [

        "Viral Fever",
        "Malaria",
        "Typhoid",
        "Diabetes",
        "Hypertension",
        "Pneumonia"

    ];

    const result = diseases[Math.floor(Math.random()*diseases.length)];

    document.getElementById("diseaseResult").textContent = result;

    diseaseCount++;

    addHistory("Disease Prediction", result);

    updateDashboard();

};

// ==========================================
// MEDICINE DEMAND PREDICTION
// ==========================================

document.getElementById("predictMedicine").onclick = function(){

    const demand = Math.floor(Math.random()*500)+100;

    document.getElementById("medicineResult").textContent =

        demand + " Units";

    medicineCount++;

    addHistory("Medicine Demand", demand + " Units");

    updateDashboard();

};

// ==========================================
// LENGTH OF STAY PREDICTION
// ==========================================

document.getElementById("predictStay").onclick = function(){

    const days = Math.floor(Math.random()*10)+1;

    document.getElementById("stayResult").textContent =

        days + " Days";

    stayCount++;

    addHistory("Length of Stay", days + " Days");

    updateDashboard();

};

// ==========================================
// ADD HISTORY
// ==========================================

function addHistory(type,result){

    const history={

        id:predictionHistory.length+1,

        type:type,

        patient:"Patient "+(predictionHistory.length+1),

        result:result,

        date:new Date().toLocaleString(),

        status:"Completed"

    };

    predictionHistory.unshift(history);

    renderHistory();

}
// ==========================================
// RENDER HISTORY
// ==========================================

function renderHistory(){

    const table=document.getElementById("predictionTable");

    table.innerHTML="";

    predictionHistory.forEach((item,index)=>{

        table.innerHTML+=`

        <tr>

            <td>${item.id}</td>

            <td>${item.type}</td>

            <td>${item.patient}</td>

            <td>${item.result}</td>

            <td>${item.date}</td>

            <td>

                <span class="status">

                    ${item.status}

                </span>

            </td>

            <td>

                <button

                    class="view-btn"

                    onclick="viewPrediction(${index})">

                    <i class="fa-solid fa-eye"></i>

                </button>

                <button

                    class="delete-btn"

                    onclick="deletePrediction(${index})">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

}

// ==========================================
// VIEW PREDICTION
// ==========================================

function viewPrediction(index){

    const p=predictionHistory[index];

    alert(

`Prediction Details

Type : ${p.type}

Patient : ${p.patient}

Result : ${p.result}

Date : ${p.date}

Status : ${p.status}`

    );

}

// ==========================================
// DELETE PREDICTION
// ==========================================

function deletePrediction(index){

    if(confirm("Delete this prediction?")){

        predictionHistory.splice(index,1);

        renderHistory();

    }

}
// ==========================================
// SEARCH
// ==========================================

document

.getElementById("searchPrediction")

.addEventListener("keyup",function(){

    const value=this.value.toLowerCase();

    const rows=document.querySelectorAll("#predictionTable tr");

    rows.forEach(row=>{

        row.style.display=

        row.innerText.toLowerCase().includes(value)

        ?""

        :"none";

    });

});

// ==========================================
// REFRESH BUTTON
// ==========================================

document

.getElementById("refreshPrediction")

.onclick=function(){

    updateDashboard();

    renderHistory();

};
// ==========================================
// INITIALIZE PAGE
// ==========================================

updateDashboard();

renderHistory();

console.log("Prediction Module Loaded Successfully");