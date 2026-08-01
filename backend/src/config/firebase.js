// const admin = require("firebase-admin");
// const serviceAccount = require("./serviceAccountKey.json");

// // Initialize Firebase Admin SDK
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

// // Initialize Firestore
// const db = admin.firestore();

// // Export Firestore instance
// module.exports = db;

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase
initializeApp({
    credential: cert(serviceAccount),
});

// Initialize Firestore
const db = getFirestore();

module.exports = db;