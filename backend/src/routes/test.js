const express = require("express");
const router = express.Router();
const db = require("../config/firebase");

// Test Firestore Connection
router.get("/", async (req, res) => {
    try {
        const docRef = await db.collection("testCollection").add({
            message: "Hello Firestore!",
            createdAt: new Date()
        });

        res.status(200).json({
            success: true,
            documentId: docRef.id,
            message: "Firestore connected successfully!"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;