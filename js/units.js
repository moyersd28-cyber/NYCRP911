/*
====================================================
EmpireCAD v2.2.1
Units Module
Professional Dispatch Unit Management
====================================================

Features
✔ Firebase Authentication
✔ Live Firestore Sync
✔ Add / Delete Units
✔ Manual Status Updates
✔ Department Ready
✔ Future MDT Integration
====================================================
*/

import {
    auth,
    db,

    onAuthStateChanged,
    signOut,

    collection,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,

    onSnapshot,

    serverTimestamp

} from "./firebase-config.js";

/*====================================================
GLOBAL VARIABLES
====================================================*/

const unitsCollection = collection(db, "units");

let currentUser = null;

let units = [];

/*====================================================
AUTHENTICATION
====================================================*/

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "../index.html";

        return;

    }

    currentUser = user;

    document.getElementById("userName").textContent =
        user.email;

});

/*====================================================
LOGOUT
====================================================*/

document
    .getElementById("logoutButton")
    .addEventListener("click", async () => {

        await signOut(auth);

        window.location.href = "../index.html";

});

/*====================================================
ELEMENT REFERENCES
====================================================*/

const callsignInput =
    document.getElementById("callsign");

const departmentInput =
    document.getElementById("dept");

const statusInput =
    document.getElementById("status");

const addButton =
    document.getElementById("addUnitBtn");

const tableBody =
    document.getElementById("unitTable");

const searchInput =
    document.getElementById("unitSearch");

const departmentFilter =
    document.getElementById("departmentFilter");

/*====================================================
ADD UNIT
====================================================*/

addButton.addEventListener("click", addUnit);

async function addUnit() {

    const callsign =
        callsignInput.value.trim();

    if (!callsign) {

        alert("Please enter a callsign.");

        return;

    }

    try {

        await addDoc(unitsCollection, {
    callsign,

    department: departmentInput.value,

    status: statusInput.value,

    officer: "",

    division: "Patrol",

    assignedCall: null,

    radioChannel: "Dispatch",

    vehicle: "",

    notes: "",

    createdAt: serverTimestamp(),

    lastStatusChange: serverTimestamp()
});

        callsignInput.value = "";

    }

    catch (error) {

        console.error(error);

        alert("Unable to add unit.");

    }

}

/*====================================================
LIVE FIRESTORE LISTENER
====================================================*/

onSnapshot(unitsCollection, (snapshot) => {

    units = [];

    snapshot.forEach((docSnap) => {

        units.push({

            id: docSnap.id,

            ...docSnap.data()

        });

    });

    renderUnits();

});
/*====================================================
RENDER UNIT TABLE
====================================================*/

function renderUnits(){

    tableBody.innerHTML = "";

    const search =
        searchInput.value.toLowerCase();

    const department =
        departmentFilter.value;

    const filteredUnits = units.filter(unit=>{

        const matchesSearch =

            unit.callsign
                .toLowerCase()
                .includes(search)

            ||

            (unit.officer || "")
                .toLowerCase()
                .includes(search);

        const matchesDepartment =

            department==="all"

            ||

            unit.department===department;

        return matchesSearch && matchesDepartment;

    });

    if(filteredUnits.length===0){

        tableBody.innerHTML=`

        <tr>

            <td colspan="6">

                No matching units found.

            </td>

        </tr>

        `;

        return;

    }

    filteredUnits.forEach(unit=>{

        tableBody.innerHTML+=
            createUnitRow(unit);

    });

}
/*====================================================
CREATE UNIT ROW
====================================================*/

function createUnitRow(unit) {

    return `

<tr>

    <td>

        <strong>${unit.callsign}</strong>

    </td>

    <td>

       ${unit.department}

<br>

<small>

${unit.officer || "No Officer Assigned"}

</small>

    </td>

    <td>

        ${createStatusBadge(unit.status)}

        ${
            unit.assignedCall
            ?

            `<br>
            <small style="color:#9ca3af;">
                🚨 ${unit.assignedCall}
            </small>`

            :

            `<br>
            <small style="color:#64748b;">
                No Active Call
            </small>`
        }

    </td>

    <td>

        <div class="unitButtons">

            <button
                class="statusGreen"
                onclick="setUnitStatus('${unit.id}','available')">

                🟢

            </button>

            <button
                class="statusBlue"
                onclick="setUnitStatus('${unit.id}','enroute')">

                🚓

            </button>

            <button
                class="statusPurple"
                onclick="setUnitStatus('${unit.id}','onscene')">

                📍

            </button>

            <button
                class="statusOrange"
                onclick="setUnitStatus('${unit.id}','busy')">

                🔶

            </button>

            <button
                class="statusRed"
                onclick="setUnitStatus('${unit.id}','outofservice')">

                ⛔

            </button>

        </div>

    </td>

    <td>

        <button

            class="dangerButton"

            onclick="deleteUnit('${unit.id}')">

            Delete

        </button>

    </td>

</tr>

`;

}

/*====================================================
STATUS BADGES
====================================================*/

function createStatusBadge(status) {

    switch(status){

        case "available":

            return `<span class="badge available">
                        🟢 Available
                    </span>`;

        case "enroute":

            return `<span class="badge enroute">
                        🚓 En Route
                    </span>`;

        case "onscene":

            return `<span class="badge onscene">
                        📍 On Scene
                    </span>`;

        case "busy":

            return `<span class="badge busy">
                        🔶 Busy
                    </span>`;

        case "outofservice":

            return `<span class="badge outofservice">
                        ⛔ Out of Service
                    </span>`;

        default:

            return `<span class="badge">
                        Unknown
                    </span>`;

    }

}

/*====================================================
UPDATE UNIT STATUS
====================================================*/

window.setUnitStatus = async function(unitId, status){

    try{

        await updateDoc(
            doc(db,"units",unitId),
            {

                status,

                lastStatusChange:
                    serverTimestamp()

            }
        );

    }
    catch(error){

        console.error(error);

        alert("Unable to update unit status.");

    }

}

/*====================================================
DELETE UNIT
====================================================*/

window.deleteUnit = async function(unitId){

    const confirmed =
        confirm(
            "Delete this unit?\n\nThis action cannot be undone."
        );

    if(!confirmed) return;

    try{

        await deleteDoc(
            doc(db,"units",unitId)
        );

    }
    catch(error){

        console.error(error);

        alert("Unable to delete unit.");

    }

}

/*====================================================
UPDATE UNIT DETAILS
====================================================*/

async function updateUnit(unitId,data){

    try{

        await updateDoc(

            doc(db,"units",unitId),

            data

        );

    }
    catch(error){

        console.error(error);

        alert("Unable to update unit.");

    }

}

/*====================================================
FIND UNIT
====================================================*/

function getUnit(id){

    return units.find(
        unit => unit.id === id
    );

}

/*====================================================
STATUS COLORS
====================================================*/

function getStatusColor(status){

    switch(status){

        case "available":
            return "#22c55e";

        case "enroute":
            return "#2563eb";

        case "onscene":
            return "#7c3aed";

        case "busy":
            return "#f59e0b";

        case "outofservice":
            return "#dc2626";

        default:
            return "#64748b";

    }

}

/*====================================================
FORMAT DATE
====================================================*/

function formatDate(timestamp){

    if(!timestamp) return "-";

    if(timestamp.toDate){

        return timestamp
            .toDate()
            .toLocaleString();

    }

    return "-";

}
