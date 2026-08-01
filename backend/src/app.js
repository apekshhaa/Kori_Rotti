const express = require("express");
const cors = require("cors");

const aiRoutes = require("./routes/ai");
const healthRoutes = require("./routes/health");
const referralRoutes = require("./routes/referrals");
//both for testing and hospital creation
const testRoutes = require("./routes/test");
const hospitalTestRoutes = require("./routes/hospitalTest");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root Route
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to SETU Backend API"
    });
});

// API Routes
app.use("/api/ai", aiRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/referrals", referralRoutes);
//testing and hospital creation routes
app.use("/api/test", testRoutes);
app.use("/api/hospital-test", hospitalTestRoutes);

module.exports = app;