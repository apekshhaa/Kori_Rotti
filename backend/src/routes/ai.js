const express = require("express");

const router = express.Router();

const { predictTrend } = require("../controllers/aiController");

router.post("/trend", predictTrend);

module.exports = router;
