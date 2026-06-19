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

            department:
                departmentInput.value,

            status:
                statusInput.value,

            assignedCall: null,

            officer: "",

            radioChannel: "Dispatch",

            createdAt:
                serverTimestamp(),

            lastStatusChange:
                serverTimestamp()

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

function renderUnits() {

    tableBody.innerHTML = "";

    if (units.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;color:#9ca3af;">
                    No units available.
                </td>
            </tr>
        `;

        return;

    }

    units.forEach(unit => {

        tableBody.innerHTML += createUnitRow(unit);

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
