/*
====================================================
EmpireCAD v2
Dashboard Controller
Version: 0.2.0
====================================================
*/

import {
    auth,
    db,
    onAuthStateChanged,
    signOut,
    collection,
    query,
    onSnapshot
} from "./firebase-config.js";

// ----------------------------------------------------
// Auth Guard
// ----------------------------------------------------

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("userName").innerText =
        user.email;

});

// ----------------------------------------------------
// Logout
// ----------------------------------------------------

document.getElementById("logoutButton").onclick = async () => {

    await signOut(auth);

    window.location.href = "index.html";

};

// ----------------------------------------------------
// LIVE COUNTERS
// ----------------------------------------------------

// Units
const unitsRef = collection(db, "units");

// Calls
const callsRef = collection(db, "calls");

// Activity log (future system)
const activityRef = collection(db, "activity");

// ----------------------------------------------------
// Live Units Listener
// ----------------------------------------------------

onSnapshot(unitsRef, (snapshot) => {

    let police = 0;
    let fire = 0;
    let ems = 0;

    snapshot.forEach(doc => {

        const data = doc.data();

        if (data.dept === "Police") police++;
        if (data.dept === "Fire") fire++;
        if (data.dept === "EMS") ems++;

    });

    document.getElementById("policeUnits").innerText = police;
    document.getElementById("fireUnits").innerText = fire;
    document.getElementById("emsUnits").innerText = ems;

});

// ----------------------------------------------------
// Live Calls Listener
// ----------------------------------------------------

onSnapshot(callsRef, (snapshot) => {

    document.getElementById("activeCalls").innerText =
        snapshot.size;

});

// ----------------------------------------------------
// Activity Feed (placeholder for now)
// ----------------------------------------------------

onSnapshot(activityRef, (snapshot) => {

    const table =
        document.getElementById("activityTable");

    table.innerHTML = "";

    if (snapshot.empty) {

        table.innerHTML = `
            <tr>
                <td colspan="3">No recent activity</td>
            </tr>
        `;

        return;
    }

    snapshot.forEach(doc => {

        const data = doc.data();

        table.innerHTML += `
            <tr>
                <td>${data.time || "N/A"}</td>
                <td>${data.user || "System"}</td>
                <td>${data.action || "Unknown action"}</td>
            </tr>
        `;

    });

});
