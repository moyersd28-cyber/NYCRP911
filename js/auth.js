// ======================================================
// EmpireCAD v2
// Authentication Manager
// ======================================================

import {
    auth,
    db,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "./firebase-config.js";

let currentUser = null;
let currentProfile = null;

// ------------------------------------------------------
// Login
// ------------------------------------------------------

export async function login(email, password) {

    try {

        const credential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        return credential.user;

    } catch (error) {

        console.error(error);

        alert(error.message);

        return null;
    }

}

// ------------------------------------------------------
// Logout
// ------------------------------------------------------

export async function logout() {

    await signOut(auth);

    window.location.href = "index.html";

}

// ------------------------------------------------------
// Session Listener
// ------------------------------------------------------

export function startAuthListener(callback) {

    onAuthStateChanged(auth, async (user) => {

        if (!user) {

            currentUser = null;
            currentProfile = null;

            callback(null, null);

            return;

        }

        currentUser = user;

        await loadUserProfile();

        callback(currentUser, currentProfile);

    });

}

// ------------------------------------------------------
// User Profile
// ------------------------------------------------------

async function loadUserProfile() {

    const ref = doc(db, "users", currentUser.uid);

    const snap = await getDoc(ref);

    if (!snap.exists()) {

        const defaultProfile = {

            uid: currentUser.uid,

            email: currentUser.email,

            displayName:
                currentUser.email.split("@")[0],

            role: "dispatcher",

            department: "Police",

            active: true,

            created: serverTimestamp(),

            lastLogin: serverTimestamp()

        };

        await setDoc(ref, defaultProfile);

        currentProfile = defaultProfile;

        return;

    }

    currentProfile = snap.data();

    await setDoc(
        ref,
        {
            lastLogin: serverTimestamp()
        },
        {
            merge: true
        }
    );

}

// ------------------------------------------------------
// Getters
// ------------------------------------------------------

export function getCurrentUser() {

    return currentUser;

}

export function getCurrentProfile() {

    return currentProfile;

}

// ------------------------------------------------------
// Roles
// ------------------------------------------------------

export function isDispatcher() {

    return currentProfile?.role === "dispatcher";

}

export function isSupervisor() {

    return currentProfile?.role === "supervisor";

}

export function isAdmin() {

    return currentProfile?.role === "admin";

}

// ------------------------------------------------------
// Route Protection
// ------------------------------------------------------

export function requireLogin() {

    startAuthListener((user) => {

        if (!user) {

            window.location.href = "../index.html";

        }

    });

}

export function requireAdmin() {

    startAuthListener((user, profile) => {

        if (!user) {

            window.location.href = "../index.html";

            return;

        }

        if (profile.role !== "admin") {

            alert("Administrator access required.");

            window.location.href = "../dashboard.html";

        }

    });

}
