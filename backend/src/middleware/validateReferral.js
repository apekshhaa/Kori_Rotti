const validateReferral = (req, res, next) => {

    const {
        patientId,
        patientName,
        age,
        phc,
        timestamp,
        vitals,
        risk,
        riskScore,
        riskLevel
    } = req.body;

    // Check required fields
    if (!patientId) {
        return res.status(400).json({
            success: false,
            message: "Patient ID is required"
        });
    }

    if (!patientName) {
        return res.status(400).json({
            success: false,
            message: "Patient Name is required"
        });
    }

    if (age === undefined) {
        return res.status(400).json({
            success: false,
            message: "Age is required"
        });
    }

    if (!phc) {
        return res.status(400).json({
            success: false,
            message: "PHC is required"
        });
    }

    if (!timestamp) {
        return res.status(400).json({
            success: false,
            message: "Timestamp is required"
        });
    }

    if (!vitals) {
        return res.status(400).json({
            success: false,
            message: "Vitals are required"
        });
    }

    if (!risk && (riskScore === undefined || !riskLevel)) {
        return res.status(400).json({
            success: false,
            message: "Risk information is required"
        });
    }

    // Everything is valid
    next();
};

module.exports = validateReferral;