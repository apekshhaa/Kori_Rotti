const path = require("path");

// Mock prediction for hackathon (bypasses Windows DLL security issues)
function generateMockPrediction(readings, currentRiskScore) {
    if (!Array.isArray(readings) || readings.length !== 3) {
        throw new Error("Exactly three readings are required");
    }

    const lastReading = readings[readings.length - 1];
    const firstReading = readings[0];
    
    // Calculate deltas to determine trend
    const ewsDelta = lastReading.ews - firstReading.ews;
    const pulseTrajectory = lastReading.pulse - firstReading.pulse;
    const spo2Trajectory = lastReading.spo2 - firstReading.spo2;
    
    // Simple trend logic
    let trend = "Stable";
    let predictedEWS = lastReading.ews;
    
    if (ewsDelta > 2) {
        trend = "Increasing";
        predictedEWS = lastReading.ews + Math.random() * 2; // Slightly higher
    } else if (ewsDelta < -1) {
        trend = "Improving";
        predictedEWS = Math.max(0, lastReading.ews - Math.random() * 1.5);
    }
    
    // Confidence based on consistency
    const variation = Math.abs(pulseTrajectory) + Math.abs(spo2Trajectory);
    const confidence = Math.max(0.5, Math.min(0.95, 1 - variation / 100));

    const normalizedCurrentRiskScore = typeof currentRiskScore === 'number' && Number.isFinite(currentRiskScore)
        ? Math.max(0, Math.min(20, Math.round(currentRiskScore)))
        : null;

    return {
        currentEWS: normalizedCurrentRiskScore ?? Math.round(lastReading.ews),
        predictedEWS30Min: parseFloat(predictedEWS.toFixed(1)),
        trend: trend,
        confidence: parseFloat(confidence.toFixed(3))
    };
}

async function predictTrend(req, res) {
    try {
        const { readings, currentRiskScore } = req.body || {};

        if (!Array.isArray(readings) || readings.length !== 3) {
            return res.status(400).json({
                success: false,
                message: "Exactly three readings are required"
            });
        }

        // Use mock prediction (avoids Windows DLL security issues)
        const prediction = generateMockPrediction(readings, currentRiskScore);

        return res.status(200).json({
            success: true,
            prediction
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Trend prediction failed",
            error: error.message
        });
    }
}

module.exports = {
    predictTrend
};
