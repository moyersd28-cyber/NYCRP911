/*
====================================================
EmpireCAD v2.3.0
Calls Module

Professional Dispatch System

Features
✔ Live Call Management
✔ Multi-Unit Dispatch
✔ Incident Numbers (Coming)
✔ Timeline (Coming)
✔ Call Archive (Coming)
✔ Call History (Coming)
====================================================
*/

import {

    auth,
    db,

    onAuthStateChanged,
    signOut,

    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,

    onSnapshot,

    serverTimestamp

} from "./firebase-config.js";

/*====================================================
GLOBAL VARIABLES
====================================================*/

const callsCollection =
    collection(db, "calls");

let currentUser = null;

/*====================================================
GLOBAL STATE
====================================================*/

const state = {

    currentUser: null,

    calls: [],

    selectedCall: null,

    selectedUnit: null,

    filters: {

        priority: "all",

        status: "active",

        search: ""

    }

};

/*====================================================
AUTHENTICATION
====================================================*/

onAuthStateChanged(auth, (user)=>{

    if(!user){

        window.location.href="../index.html";

        return;

    }

    state.currentUser=user;

    document.getElementById("userName").textContent=
        user.email;

});

/*====================================================
LOGOUT
====================================================*/

document
.getElementById("logoutButton")
.addEventListener("click",async()=>{

    await signOut(auth);

    window.location.href="../index.html";

});

/*====================================================
PAGE ELEMENTS
====================================================*/

const typeInput =
    document.getElementById("callType");

const priorityInput =
    document.getElementById("priority");

const locationInput =
    document.getElementById("location");

const notesInput =
    document.getElementById("notes");

const createButton =
    document.getElementById("createCallBtn");

const tableBody =
    document.getElementById("callTable");

/*====================================================
LIVE CALL LISTENER
====================================================*/

onSnapshot(callsCollection,(snapshot)=>{

    state.calls = [];

    snapshot.forEach((docSnap)=>{

        state.calls.push({

            id:docSnap.id,

            ...docSnap.data()

        });

    });

    renderCalls();

});

/*====================================================
RENDER CALLS
====================================================*/

function renderCalls() {

    tableBody.innerHTML = "";

    if (state.calls.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="emptyTable">
                    No Active Calls
                </td>
            </tr>
        `;

        return;

    }

    state.calls.forEach(call => {

        tableBody.innerHTML += createCallRow(call);

    });

}

/*====================================================
CREATE CALL ROW
====================================================*/

function createCallRow(call){

    return `

<tr>

    <td>

        <strong>${call.incidentNumber || "Pending"}</strong>

    </td>

    <td>

        ${call.type}

    </td>

    <td>

        ${priorityBadge(call.priority)}

    </td>

    <td>

        ${call.location}

    </td>

    <td>

        ${statusBadge(call.status || "active")}

    </td>

    <td>

        <button
            class="primaryButton"
            onclick="dispatchUnits('${call.id}')">

            Dispatch

        </button>

        <button
            class="secondaryButton"
            onclick="editCall('${call.id}')">

            Edit

        </button>

        <button
            class="dangerButton"
            onclick="closeCall('${call.id}')">

            Close

        </button>

    </td>

</tr>

`;

}

/*====================================================
PRIORITY BADGES
====================================================*/

function priorityBadge(priority){

    switch(priority){

        case "low":

            return `<span class="badge available">
                        Low
                    </span>`;

        case "medium":

            return `<span class="badge busy">
                        Medium
                    </span>`;

        case "high":

            return `<span class="badge outofservice">
                        High
                    </span>`;

        case "emergency":

            return `<span class="badge emergency">
                        Emergency
                    </span>`;

        default:

            return priority;

    }

}

/*====================================================
STATUS BADGE
====================================================*/

function statusBadge(status){

    switch(status){

        case "active":

            return `<span class="badge available">
                        Active
                    </span>`;

        case "closed":

            return `<span class="badge outofservice">
                        Closed
                    </span>`;

        default:

            return status;

    }

}

/*====================================================
CREATE CALL
====================================================*/

createButton.addEventListener("click", createCall);

async function createCall(){

    try{

        await addDoc(callsCollection,{

            incidentNumber: null,

            type: typeInput.value,

            priority: priorityInput.value,

            location: locationInput.value.trim(),

            notes: notesInput.value.trim(),

            status: "active",

            assignedUnits: [],

            timeline: [],

            createdBy: state.currentUser.email,

            createdAt: serverTimestamp(),

            updatedAt: serverTimestamp()

        });

        locationInput.value = "";

        notesInput.value = "";

    }

    catch(error){

        console.error(error);

        alert("Unable to create call.");

    }

}

