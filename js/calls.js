/*
====================================================
EmpireCAD v2
Calls + Dispatch Module
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
    updateDoc,
    arrayUnion,
    arrayRemove,
    serverTimestamp
} from "./firebase-config.js";

// ===============================
// AUTH CHECK
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

const typeInput =
    document.getElementById("callType");

const priorityInput =
    document.getElementById("priority");

const locationInput =
    document.getElementById("location");

const notesInput =
    document.getElementById("notes");

const createBtn =
    document.getElementById("createCallBtn");

const table =
    document.getElementById("callTable");

// ===============================
// CREATE CALL
// ===============================

createBtn.onclick = async () => {

    const type = typeInput.value;
    const priority = priorityInput.value;
    const location = locationInput.value.trim();
    const notes = notesInput.value.trim();

    if (!location) {
        alert("Location is required");
        return;
    }

    await addDoc(collection(db, "calls"), {

        type,
        priority,
        location,
        notes,
        status: "active",
        assignedUnits: [],   // 🚨 NEW
        createdAt: serverTimestamp()

    });

    locationInput.value = "";
    notesInput.value = "";

};

// ===============================
// LIVE CALLS
// ===============================

const callsRef = collection(db, "calls");

onSnapshot(callsRef, (snapshot) => {

    table.innerHTML = "";

    if (snapshot.empty) {

        table.innerHTML = `
            <tr>
                <td colspan="6">No active calls</td>
            </tr>
        `;

        return;
    }

    snapshot.forEach((docSnap) => {

        const data = docSnap.data();

        const assigned = data.assignedUnits || [];

        table.innerHTML += `
            <tr>

                <td>${data.type}</td>

                <td>${data.priority}</td>

                <td>${data.location}</td>

                <td>
                    ${data.status}<br>

                    <small style="color:#9ca3af;">
                        Units: ${assigned.length}
                    </small>

                </td>

                <td>

                    <button class="primaryButton"
                        onclick="assignUnit('${docSnap.id}')">
                        Assign Unit
                    </button>

                    <button class="dangerButton"
                        onclick="deleteCall('${docSnap.id}')">
                        Clear
                    </button>

                </td>

            </tr>
        `;

    });

});

// ===============================
// ASSIGN UNIT (simple prompt version)
// ===============================

window.assignUnit = async (callId) => {

    const unit = prompt("Enter unit callsign (example: 1Adam12)");

    if (!unit) return;

    const ref = doc(db, "calls", callId);

confirmAssign.onclick = async () => {

    const unit = unitSelect.value;

    if (!unit || !selectedCallId) return;

    const callRef = doc(db, "calls", selectedCallId);

    // 1. Add unit to call
    await updateDoc(callRef, {
        assignedUnits: arrayUnion(unit)
    });

    // 2. Find unit document
    const unitsSnapshot = await getDocs(collection(db, "units"));

    let unitDocId = null;

    unitsSnapshot.forEach((docSnap) => {

        if (docSnap.data().callsign === unit) {
            unitDocId = docSnap.id;
        }

    });

    // 3. Update unit status
    if (unitDocId) {

        const unitRef = doc(db, "units", unitDocId);

        await updateDoc(unitRef, {

            status: "busy",
            assignedCall: selectedCallId

        });

    }

    modal.style.display = "none";

};

    });

    alert(`Unit ${unit} assigned to call`);
};

// ===============================
// DELETE CALL
// ===============================

window.deleteCall = async (id) => {

    if (!confirm("Clear this call?")) return;

    await deleteDoc(doc(db, "calls", id));

};
