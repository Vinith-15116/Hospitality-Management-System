// ===========================================
// DASHBOARD JS
// Hospital Hospitality Management System
// ===========================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Dashboard Loaded Successfully");

    //----------------------------------
    // Animated Counter
    //----------------------------------

    const counters = document.querySelectorAll(".card h2");

    counters.forEach(counter => {

        let text = counter.innerText;

        let target = text.replace(/[^\d]/g, "");

        if(target==="") return;

        target = parseInt(target);

        let count = 0;

        const speed = Math.ceil(target / 80);

        function updateCounter(){

            count += speed;

            if(count >= target){

                count = target;

            }

            if(text.includes("₹")){

                counter.innerText = "₹" + count + "K";

            }

            else{

                counter.innerText = count;

            }

            if(count < target){

                requestAnimationFrame(updateCounter);

            }

        }

        updateCounter();

    });

    //----------------------------------
    // Search Box
    //----------------------------------

    const search = document.querySelector(".header-right input");

    if(search){

        search.addEventListener("keyup",function(){

            console.log("Searching : " + this.value);

        });

    }

    //----------------------------------
    // Notification Bell
    //----------------------------------

    const bell = document.querySelector(".fa-bell");

    if(bell){

        bell.addEventListener("click",function(){

            alert("No New Notifications");

        });

    }

    //----------------------------------
    // Mail Icon
    //----------------------------------

    const mail = document.querySelector(".fa-envelope");

    if(mail){

        mail.addEventListener("click",function(){

            alert("Inbox is Empty");

        });

    }

    //----------------------------------
    // Sidebar Active Menu
    //----------------------------------

    const menu = document.querySelectorAll(".sidebar ul li");

    menu.forEach(item=>{

        item.addEventListener("click",function(){

            menu.forEach(i=>{

                i.classList.remove("active");

            });

            this.classList.add("active");

        });

    });

    //----------------------------------
    // Card Hover Effect
    //----------------------------------

    document.querySelectorAll(".card").forEach(card=>{

        card.addEventListener("mouseenter",()=>{

            card.style.transform="translateY(-8px)";

        });

        card.addEventListener("mouseleave",()=>{

            card.style.transform="translateY(0px)";

        });

    });

    //----------------------------------
    // Quick Actions
    //----------------------------------

    document.querySelectorAll(".action").forEach(action=>{

        action.addEventListener("mouseenter",()=>{

            action.style.transform="translateY(-8px)";

        });

        action.addEventListener("mouseleave",()=>{

            action.style.transform="translateY(0px)";

        });

    });
        //----------------------------------
    // Line Chart
    //----------------------------------

    const lineCanvas = document.getElementById("lineChart");

    if(lineCanvas){

        new Chart(lineCanvas,{

            type:"line",

            data:{

                labels:[
                    "Jan","Feb","Mar","Apr","May","Jun","Jul"
                ],

                datasets:[{

                    label:"Patients",

                    data:[120,150,180,170,220,250,290],

                    borderColor:"#2563eb",

                    backgroundColor:"rgba(37,99,235,.15)",

                    fill:true,

                    tension:.4,

                    borderWidth:3,

                    pointRadius:5,

                    pointBackgroundColor:"#2563eb"

                }]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false,

                plugins:{

                    legend:{

                        display:true

                    }

                }

            }

        });

    }

    //----------------------------------
    // Pie Chart
    //----------------------------------

    const pieCanvas=document.getElementById("pieChart");

    if(pieCanvas){

        new Chart(pieCanvas,{

            type:"pie",

            data:{

                labels:[
                    "Cardiology",
                    "Neurology",
                    "Orthopedic",
                    "ICU",
                    "General"
                ],

                datasets:[{

                    data:[25,18,15,12,30],

                    backgroundColor:[
                        "#2563eb",
                        "#16a34a",
                        "#db2777",
                        "#ea580c",
                        "#7c3aed"
                    ]

                }]

            },

            options:{

                responsive:true,

                plugins:{

                    legend:{

                        position:"bottom"

                    }

                }

            }

        });

    }

    //----------------------------------
    // View Buttons
    //----------------------------------

    document.querySelectorAll(".table-btn").forEach(button=>{

        button.addEventListener("mouseenter",()=>{

            button.style.transform="translateY(-2px)";

        });

        button.addEventListener("mouseleave",()=>{

            button.style.transform="translateY(0px)";

        });

    });

    //----------------------------------
    // View All Buttons
    //----------------------------------

    document.querySelectorAll(".view-all-btn").forEach(button=>{

        button.addEventListener("mouseenter",()=>{

            button.style.opacity=".8";

        });

        button.addEventListener("mouseleave",()=>{

            button.style.opacity="1";

        });

    });

    //----------------------------------
    // Notification Animation
    //----------------------------------

    document.querySelectorAll(".note").forEach((note,index)=>{

        note.style.opacity="0";

        note.style.transform="translateX(-30px)";

        setTimeout(()=>{

            note.style.transition=".5s";

            note.style.opacity="1";

            note.style.transform="translateX(0px)";

        },index*120);

    });

    //----------------------------------
    // Table Hover
    //----------------------------------

    document.querySelectorAll(".table-box tbody tr").forEach(row=>{

        row.addEventListener("mouseenter",()=>{

            row.style.background="#eef4ff";

        });

        row.addEventListener("mouseleave",()=>{

            row.style.background="";

        });

    });
        //----------------------------------
    // Prediction Cards Animation
    //----------------------------------

    document.querySelectorAll(".prediction-card").forEach(card=>{

        card.addEventListener("mouseenter",()=>{

            card.style.transform="translateY(-8px)";

        });

        card.addEventListener("mouseleave",()=>{

            card.style.transform="translateY(0px)";

        });

    });

    //----------------------------------
    // Graph Hover Effect
    //----------------------------------

    document.querySelectorAll(".graph").forEach(graph=>{

        graph.addEventListener("mouseenter",()=>{

            graph.style.transform="translateY(-6px)";

        });

        graph.addEventListener("mouseleave",()=>{

            graph.style.transform="translateY(0px)";

        });

    });

    //----------------------------------
    // Live Clock
    //----------------------------------

    function updateClock(){

        const clock=document.getElementById("clock");

        if(clock){

            const now=new Date();

            clock.innerHTML=now.toLocaleTimeString();

        }

    }

    updateClock();

    setInterval(updateClock,1000);

    //----------------------------------
    // Dashboard Fade Animation
    //----------------------------------

    document.querySelectorAll(".card,.action,.prediction-card,.graph,.table-box,.notifications").forEach((item,index)=>{

        item.style.opacity="0";

        item.style.transform="translateY(25px)";

        setTimeout(()=>{

            item.style.transition=".5s";

            item.style.opacity="1";

            item.style.transform="translateY(0px)";

        },index*80);

    });

    //----------------------------------
    // Ctrl + F Shortcut
    //----------------------------------

    document.addEventListener("keydown",function(e){

        if(e.ctrlKey && e.key.toLowerCase()==="f"){

            e.preventDefault();

            const search=document.querySelector(".header-right input");

            if(search){

                search.focus();

            }

        }

    });

    //----------------------------------
    // Auto Refresh Demo
    //----------------------------------

    setInterval(()=>{

        console.log("Dashboard Auto Refresh : " + new Date().toLocaleTimeString());

    },60000);

    //----------------------------------
    // Welcome Message
    //----------------------------------

    console.log("================================");

    console.log("Hospital Hospitality Management");

    console.log("Dashboard Loaded Successfully");

    console.log("================================");

});