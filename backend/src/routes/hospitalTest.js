const express = require("express");

const router = express.Router();

const {
    createDemoHospital
} = require("../services/hospitalService");


router.post("/create-demo", async (req, res) => {

    try {

        const hospital = await createDemoHospital();

        res.status(201).json({

            success: true,

            message: "Demo hospital created successfully",

            hospital

        });

    } catch (error) {

        console.error("Hospital creation error:", error);

        res.status(500).json({

            success: false,

            message: "Failed to create demo hospital"

        });

    }

});


module.exports = router;