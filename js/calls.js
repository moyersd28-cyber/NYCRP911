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

    currentUser=user;

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

