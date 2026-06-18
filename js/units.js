/*
====================================================
EmpireCAD v2
Units Module
Version: 0.2.0
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
    onSnapshot,
    serverTimestamp
} from "./firebase-config.js";

// ===============================
// AUTH CHECK + HEADER INFO
// ===============================

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "../index.html";
        return;
    }

    document.getElementById("userName").innerText =
        user.email;

});

// ===============================
// LOGOUT
// ===============================

document.getElementById("logoutButton").onclick = async () => {

    await signOut(auth);

    window.location.href = "../index.html";

};

// ===============================
// ELEMENTS
// ===============================

const callsignInput =
    document.getElementById("callsign");

const deptInput =
    document.getElementById("dept");

const statusInput =
    document.getElementById("status");

const addBtn =
    document.getElementById("addUnitBtn");

const table =
    document.getElementById("unitTable");

// ===============================
// ADD UNIT
// ===============================

addBtn.onclick = async () => {

    const callsign = callsignInput.value.trim();
    const dept = deptInput.value;
    const status = statusInput.value;

    if (!callsign) {
        alert("Callsign is required");
        return;
    }

    await addDoc(collection(db, "units"), {

        callsign,
        dept,
        status,
        createdAt: serverTimestamp()

    });

    callsignInput.value = "";

};

// ===============================
// LIVE UNIT LISTENER
// ===============================

const unitsRef = collection(db, "units");

onSnapshot(unitsRef, (snapshot) => {

    table.innerHTML = "";

    if (snapshot.empty) {

        table.innerHTML = `
            <tr>
                <td colspan="4">No units available</td>
            </tr>
        `;

        return;
    }

    snapshot.forEach((docSnap) => {

        const data = docSnap.data();

        let badgeClass = "";

        switch (data.status) {

            case "available":
                badgeClass = "available";
                break;

            case "busy":
                badgeClass = "busy";
                break;

            case "scene":
                badgeClass = "scene";
                break;

            case "out":
                badgeClass = "out";
                break;

        }

        table.innerHTML += `
            <tr>

                <td>${data.callsign}</td>

                <td>${data.dept}</td>

<td>
    <span class="badge ${badgeClass}">
        ${data.status}
    </span>

    ${data.assignedCall ? `
        <br>
        <small style="color:#9ca3af;">
            Call: ${data.assignedCall}
        </small>
    ` : ""}
</td>
                    <button class="dangerButton"
                        onclick="deleteUnit('${docSnap.id}')">
                        Delete
                    </button>
                </td>

            </tr>
        `;

    });

});

// ===============================
// DELETE UNIT
// ===============================

window.deleteUnit = async (id) => {

    if (!confirm("Delete this unit?")) return;

    await deleteDoc(doc(db, "units", id));

};
