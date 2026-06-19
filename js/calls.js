import {
    auth,
    db,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    onSnapshot,
    getDocs,
    query,
    orderBy,
    serverTimestamp,
    arrayUnion,
    arrayRemove
} from "./firebase-config.js";

let selectedCallId = null;

// ======================================================
// INIT
// ======================================================

window.addEventListener("load", () => {

    loadUser();
    loadCalls();
    loadUnits();

    document.getElementById("createCallBtn")
        .addEventListener("click", createCall);

    document.getElementById("confirmAssign")
        .addEventListener("click", assignUnit);

    document.getElementById("closeModal")
        .addEventListener("click", closeModal);

    document.getElementById("closeDetails")
        .addEventListener("click", closeDetailsModal);

});

// ======================================================
// USER DISPLAY
// ======================================================

function loadUser() {

    const user = auth.currentUser;

    if (user) {

        document.getElementById("userName")
            .innerText = user.email;

    } else {

        setTimeout(loadUser, 500);

    }

}

// ======================================================
// CREATE CALL
// ======================================================

async function createCall() {

    const type =
        document.getElementById("callType").value;

    const priority =
        document.getElementById("priority").value;

    const location =
        document.getElementById("location").value;

    const notes =
        document.getElementById("notes").value;

    if (!location) {

        alert("Location required");
        return;

    }

    await addDoc(collection(db, "calls"), {

        type,
        priority,
        location,
        notes,

        status: "active",

        assignedUnits: [],

        createdAt: serverTimestamp()

    });

    document.getElementById("location").value = "";
    document.getElementById("notes").value = "";

}

// ======================================================
// LOAD CALLS (REALTIME)
// ======================================================

function loadCalls() {

const q = query(
    collection(db, "calls"),
    where("status", "!=", "closed"),
    orderBy("status"),
    orderBy("createdAt", "desc")
);

    onSnapshot(q, (snapshot) => {

        const table =
            document.getElementById("callTable");

        table.innerHTML = "";

        if (snapshot.empty) {

            table.innerHTML = `
                <tr>
                    <td colspan="7">No active calls</td>
                </tr>
            `;

            return;

        }

        snapshot.forEach((docSnap) => {

            const data = docSnap.data();

            table.innerHTML += `
                <tr>

                    <td>${docSnap.id}</td>

                    <td>${data.type}</td>

                    <td>${data.priority}</td>

                    <td>${data.location}</td>

                    <td>${data.status}</td>

                    <td>
                        ${(data.assignedUnits || []).length}
                    </td>

                    <td>

                        <button onclick="openDetails('${docSnap.id}')">
                            View
                        </button>

                        <button onclick="openAssign('${docSnap.id}')">
                            Dispatch
                        </button>

                        <button onclick="closeCall('${docSnap.id}')">
                            Close
                        </button>

                    </td>

                </tr>
            `;

        });

    });

}

// ======================================================
// LOAD UNITS (FOR DISPATCH)
// ======================================================

function loadUnits() {

    const q =
        query(collection(db, "units"));

    onSnapshot(q, (snapshot) => {

        const select =
            document.getElementById("unitSelect");

        select.innerHTML = "";

        snapshot.forEach((docSnap) => {

            const data = docSnap.data();

            if (data.status === "available") {

                const opt =
                    document.createElement("option");

                opt.value = docSnap.id;

                opt.textContent =
                    `${data.callsign} (${data.dept})`;

                select.appendChild(opt);

            }

        });

    });

}

// ======================================================
// OPEN ASSIGN MODAL
// ======================================================

window.openAssign = function(callId) {

    selectedCallId = callId;

    document.getElementById("dispatchModal")
        .style.display = "flex";

};

// ======================================================
// CLOSE MODAL
// ======================================================

function closeModal() {

    document.getElementById("dispatchModal")
        .style.display = "none";

    selectedCallId = null;

}

// ======================================================
// ASSIGN UNIT TO CALL
// ======================================================

async function assignUnit() {

    const unitId =
        document.getElementById("unitSelect").value;

    if (!unitId || !selectedCallId) return;

    const callRef =
        doc(db, "calls", selectedCallId);

    const unitRef =
        doc(db, "units", unitId);

    // Add unit to call
    await updateDoc(callRef, {
        assignedUnits: arrayUnion(unitId),
        status: "dispatched"
    });

    // Mark unit as busy
    await updateDoc(unitRef, {
        status: "busy",
        assignedCall: selectedCallId
    });

    closeModal();

}

// ======================================================
// OPEN CALL DETAILS
// ======================================================

window.openDetails = async function(callId) {

    const ref =
        doc(db, "calls", callId);

    const snap =
        await getDoc(ref);

    if (!snap.exists()) return;

    const data = snap.data();

    document.getElementById("detailsModal")
        .style.display = "flex";

    document.getElementById("incidentDetails")
        .innerHTML = `
            <p><b>Type:</b> ${data.type}</p>
            <p><b>Priority:</b> ${data.priority}</p>
            <p><b>Location:</b> ${data.location}</p>
            <p><b>Status:</b> ${data.status}</p>
            <p><b>Notes:</b> ${data.notes || "None"}</p>
        `;

    loadRespondingUnits(data.assignedUnits || []);

};

// ======================================================
// LOAD RESPONDING UNITS
// ======================================================

async function loadRespondingUnits(unitIds) {

    const tbody =
        document.getElementById("respondingUnits");

    tbody.innerHTML = "";

    if (unitIds.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4">No units assigned</td>
            </tr>
        `;

        return;

    }

    for (const id of unitIds) {

        const ref = doc(db, "units", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) continue;

        const data = snap.data();

        tbody.innerHTML += `
            <tr>

                <td>${data.callsign}</td>

                <td>${data.dept}</td>

                <td>${data.status}</td>

                <td>
                    <button onclick="removeUnit('${id}')">
                        Remove
                    </button>
                </td>

            </tr>
        `;

    }

}

// ======================================================
// CLOSE CALL
// ======================================================

window.closeCall = async function(callId) {

    const ref = doc(db, "calls", callId);

    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const data = snap.data();

    // Return all units to available
    const units = data.assignedUnits || [];

    for (const unitId of units) {

        const unitRef = doc(db, "units", unitId);

        await updateDoc(unitRef, {
            status: "available",
            assignedCall: null
        });

    }

    await updateDoc(ref, {
        status: "closed",
        assignedUnits: []
    });

};

// ======================================================
// REMOVE UNIT FROM CALL
// ======================================================

window.removeUnit = async function(unitId) {

    if (!selectedCallId) return;

    const callRef = doc(db, "calls", selectedCallId);
    const unitRef = doc(db, "units", unitId);

    await updateDoc(callRef, {
        assignedUnits: arrayRemove(unitId)
    });

    await updateDoc(unitRef, {
        status: "available",
        assignedCall: null
    });

    // refresh modal view
    openDetails(selectedCallId);

};

// ======================================================
// CLOSE DETAILS MODAL
// ======================================================

function closeDetailsModal() {

    document.getElementById("detailsModal")
        .style.display = "none";

}

// ======================================================
// GLOBAL EXPORTS (SAFETY)
// ======================================================

window.closeModal = closeModal;
window.assignUnit = assignUnit;
window.closeDetailsModal = closeDetailsModal;

// ======================================================
// DONE
// ======================================================

console.log("EmpireCAD Calls System Loaded");
