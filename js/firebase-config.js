// =====================================================
// EmpireCAD v2.2
// Firebase Configuration
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    Timestamp,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    writeBatch,
    increment,
    arrayUnion,
    arrayRemove,
    runTransaction
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBfYHAUU4yrbYqZGGbps_ahQjbX16EtW5g",
    authDomain: "nycrp911.firebaseapp.com",
    projectId: "nycrp911",
    storageBucket: "nycrp911.firebasestorage.app",
    messagingSenderId: "291055295348",
    appId: "1:291055295348:web:cd0981f30dab930baaaa21"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export {
    collection,
    addDoc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    Timestamp,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    writeBatch,
    increment,
    arrayUnion,
    arrayRemove,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword,
    runTransaction
};
