// const {
//     saveReferral,
//     updateReferralStatus,
//     getReferralById
// } = require("../services/firebaseService");

// const {

//     sendReferralSMS

// } = require("../services/smsService");

// const createReferral = async (req, res) => {

//     try {

//         // Step 1: Save referral
//         const referralId = await saveReferral(req.body);

//         let smsResult = null;

//         // Step 2: Send SMS only if urgent
//         if (req.body.risk.level === "URGENT") {

//             smsResult = await sendReferralSMS(req.body);

//             if (smsResult.success) {

//                 await updateReferralStatus(
//                     referralId,
//                     smsResult.status,
//                     smsResult.sid
//                 );

//             } else {

//                 await updateReferralStatus(
//                     referralId,
//                     "failed"
//                 );

//             }

//         }

//         return res.status(201).json({

//             success: true,

//             referralId,

//             sms: smsResult

//         });

//     } catch (error) {

//         console.error(error);

//         return res.status(500).json({

//             success: false,

//             message: "Internal Server Error"

//         });

//     }

// };

// const getReferral = async (req, res) => {

//     try {

//         const referralId = req.params.id;

//         const referral = await getReferralById(referralId);

//         if (!referral) {

//             return res.status(404).json({

//                 success: false,

//                 message: "Referral not found"

//             });

//         }

//         return res.status(200).json({

//             success: true,

//             referral

//         });

//     } catch (error) {

//         console.error(error);

//         return res.status(500).json({

//             success: false,

//             message: "Internal Server Error"

//         });

//     }

// };

// module.exports = {
//     createReferral,
//     getReferral
// };

const {
    saveReferral,
    updateReferralStatus,
    getReferralById,
    getIncomingReferrals,
    updateReferralLifecycleStatus,
    deleteReferralById,
    getReferralByToken,
    addCaregiverObservation,
    dismissCaregiverObservation
} = require("../services/firebaseService");

const {
    sendReferralSMS
} = require("../services/smsService");
const { monitorReferral } = require("../services/hospitalCoordinator");
const { generateCaregiverUrl } = require("../utils/publicUrl");

function generateDynamicChecklist(raw) {
    const diagnosis = (raw.diagnosis || '').toLowerCase();
    const caregiverFlags = Array.isArray(raw.caregiverFlags) ? raw.caregiverFlags.join(' ').toLowerCase() : '';
    const needs = Array.isArray(raw.patientNeeds) ? raw.patientNeeds.join(' ').toLowerCase() : '';
    const searchStr = `${diagnosis} ${caregiverFlags} ${needs}`;
    const riskScore = raw.riskScore ?? raw.risk?.score ?? raw.newsScore ?? 0;
    const temp = raw.vitals?.temperature ?? raw.vitals?.temp ?? 37;
    const spo2 = raw.vitals?.spo2 ?? raw.vitals?.spO2 ?? 98;

    if (searchStr.includes('chest') || searchStr.includes('cardiac') || searchStr.includes('heart') || searchStr.includes('ecg') || searchStr.includes('cardiolog')) {
        return ['Cardiac Monitor Ready', 'ECG Machine Ready', 'Defibrillator Ready', 'Cardiologist Alerted', 'IV Access Secured'];
    }
    if (searchStr.includes('breath') || searchStr.includes('respiratory') || searchStr.includes('wheezing') || searchStr.includes('oxygen') || spo2 < 92) {
        return ['Oxygen Ready', 'Ventilator on Standby', 'Respiratory Therapist Alerted', 'Nebulizer Prepared'];
    }
    if (searchStr.includes('stroke') || searchStr.includes('neuro') || searchStr.includes('seizure') || searchStr.includes('paralysis')) {
        return ['CT Scan Ready', 'Neurologist Alerted', 'Stroke Team Activated', 'IV Access Secured'];
    }
    if (searchStr.includes('trauma') || searchStr.includes('accident') || searchStr.includes('fracture') || searchStr.includes('bleed')) {
        return ['Blood Units Ready', 'Emergency Surgeon Alerted', 'Trauma Bed Prepared', 'Cross-match Ordered'];
    }
    if (temp > 38.5 || searchStr.includes('fever') || searchStr.includes('infection') || searchStr.includes('sepsis')) {
        return ['Isolation Bed Prepared', 'IV Fluids Ready', 'Blood Cultures Ordered', 'Lab Samples Ready'];
    }
    if (riskScore >= 12) {
        return ['ICU Bed Reserved', 'Continuous Monitoring Ready', 'Senior Clinician Alerted', 'Emergency Team On Standby'];
    }
    return ['Appropriate Bed Prepared', 'Clinical Team Notified', 'Patient Records Reviewed', 'Oxygen/Support Equipment Checked'];
}

// Update checklist items (completed) from hospital UI
const updateReferralChecklist = async (req, res) => {
    try {
        const referralId = req.params.id;
        const { completedChecklist } = req.body;

        if (!Array.isArray(completedChecklist)) {
            return res.status(400).json({ success: false, message: 'completedChecklist array required' });
        }

        // Persist completed checklist
        await require('../config/firebase').collection('referrals').doc(referralId).set({ completedChecklist }, { merge: true });

        // Re-run coordinator to check for acknowledgement
        try {
            const referral = await getReferralById(referralId);
            await monitorReferral({ ...referral, firestoreId: referralId });
        } catch (err) {
            console.warn('Coordinator re-run after checklist update failed', err.message);
        }

        return res.json({ success: true });
    } catch (error) {
        console.error('Update checklist error:', error);
        return res.status(500).json({ success: false, message: 'Failed to update checklist' });
    }
};



const createReferral = async (req, res) => {

    try {

        const patientToken = req.body.patientToken || null;

        // Prepare referral data
        const referral = {
            ...req.body,
            patientToken,
            publicCaregiverUrl: generateCaregiverUrl(patientToken || "patient"),

            // Hospital information
            hospitalId: "dist-hospital-1",

            // Demo ETA
            eta: 75,

            // Referral status
            referralStatus: "sent",

            // What the patient needs
            patientNeeds: req.body.patientNeeds || [],

            // AI monitor inputs
            acknowledgementDeadline: req.body.acknowledgementDeadline || Date.now() + 10 * 60 * 1000,
            checklistItems: req.body.checklistItems || generateDynamicChecklist(req.body),
            completedChecklist: req.body.completedChecklist || [],
            requiredResources: req.body.requiredResources || ["icu", "oxygen", "blood", "doctor"],

            // Will be generated by AI later
            recommendedActions: req.body.recommendedActions || []
        };


        // Step 1: Save referral
        const referralId = await saveReferral(referral);

        let smsResult = null;


        // Step 2: Send SMS only if urgent
        if (referral.risk.level === "URGENT") {

            smsResult = await sendReferralSMS(referral);


            // SMS successfully accepted by Twilio
            if (smsResult.success) {

                await updateReferralStatus(
                    referralId,
                    smsResult.status,
                    smsResult.sid
                );

            }

            // SMS failed
            else {

                await updateReferralStatus(
                    referralId,
                    "failed"
                );

            }

        }


        // Step 3: Let the coordinator evaluate the new referral
        try {
            await monitorReferral({
                ...referral,
                firestoreId: referralId,
                id: referralId,
            });
        } catch (error) {
            console.warn("Coordinator initial run skipped", error.message);
        }

        // Step 4: Return response
        return res.status(201).json({

            success: true,

            referralId,

            sms: smsResult

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error"

        });

    }

};


const getReferral = async (req, res) => {

    try {

        const referralId = req.params.id;

        const referral = await getReferralById(referralId);


        if (!referral) {

            return res.status(404).json({

                success: false,

                message: "Referral not found"

            });

        }


        return res.status(200).json({

            success: true,

            referral

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error"

        });

    }

};

const getIncoming = async (req, res) => {

    try {

        const referrals = await getIncomingReferrals();

        return res.status(200).json({

            success: true,

            count: referrals.length,

            referrals

        });

    } catch (error) {

        console.error("Error fetching incoming referrals:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch incoming referrals"

        });

    }

};


const updateReferralLifecycle = async (req, res) => {

    try {

        const referralId = req.params.id;

        const { status } = req.body;


        // Allowed statuses
        const allowedStatuses = [
            "sent",
            "acknowledged",
            "arrived",
            "checked_in"
        ];


        // Check status exists
        if (!status) {

            return res.status(400).json({

                success: false,

                message: "Status is required"

            });

        }


        // Check status is valid
        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({

                success: false,

                message: "Invalid referral status"

            });

        }


        // Get current referral
        const referral = await getReferralById(referralId);


        if (!referral) {

            return res.status(404).json({

                success: false,

                message: "Referral not found"

            });

        }


        const currentStatus =
            referral.referralStatus || referral.status || "sent";

        const acknowledgementDeadline = referral.acknowledgementDeadline || referral.deadline || Date.now() + 10 * 60 * 1000;
        const completedChecklist = referral.completedChecklist || [];
        const checklistItems = referral.checklistItems || [];


        // Allowed transitions
        const validTransitions = {

            sent: ["acknowledged"],

            acknowledged: ["arrived"],

            arrived: ["checked_in"],

            checked_in: []

        };


        // Check transition
        if (
            currentStatus !== status &&
            !validTransitions[currentStatus]?.includes(status)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Cannot change referral status from ${currentStatus} to ${status}`

            });

        }


        // Update Firestore
        await updateReferralLifecycleStatus(
            referralId,
            status
        );

        if (status === "acknowledged") {
            await updateReferralLifecycleStatus(referralId, "acknowledged");
        }

        if (status === "acknowledged" && checklistItems.length > 0 && checklistItems.every((item) => completedChecklist.includes(item))) {
            await updateReferralLifecycleStatus(referralId, "acknowledged");
        }


        return res.status(200).json({

            success: true,

            referralId,

            referralStatus: status

        });

    } catch (error) {

        console.error(
            "Error updating referral status:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to update referral status"

        });

    }

};

const deleteReferral = async (req, res) => {
    try {
        const referralId = req.params.id;
        const referral = await getReferralById(referralId);

        if (!referral) {
            return res.status(404).json({
                success: false,
                message: "Referral not found"
            });
        }

        await deleteReferralById(referralId);

        return res.status(200).json({
            success: true,
            referralId
        });
    } catch (error) {
        console.error("Error deleting referral:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete referral"
        });
    }
};

const getCaregiverPage = async (req, res) => {
    try {
        const referral = await getReferralByToken(req.params.patientToken);

        if (!referral) {
            return res.status(404).json({
                success: false,
                message: "Patient link not found"
            });
        }

        return res.status(200).json({
            success: true,
            referral: {
                id: referral.id,
                referralId: referral.referralId || referral.id,
                patientId: referral.patientId,
                patientName: referral.patientName,
                patientToken: referral.patientToken || req.params.patientToken || referral.id,
            }
        });
    } catch (error) {
        console.error("Error loading caregiver page:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load caregiver page"
        });
    }
};

const submitCaregiverObservation = async (req, res) => {
    try {
        const { patientToken } = req.params;
        const { text, patientName, patientToken: bodyPatientToken } = req.body;
        const resolvedPatientToken = bodyPatientToken || patientToken;

        if (!text || typeof text !== "string" || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Observation text is required"
            });
        }

        const observation = await addCaregiverObservation(resolvedPatientToken, {
            text: text.trim(),
            patientName,
            observedBy: "Caregiver"
        });

        return res.status(201).json({
            success: true,
            observation
        });
    } catch (error) {
        console.error("Error submitting caregiver observation:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit observation"
        });
    }
};

const dismissObservation = async (req, res) => {
    try {
        const { id } = req.params;
        const { observationId } = req.body;

        if (!observationId) {
            return res.status(400).json({
                success: false,
                message: "Observation ID is required"
            });
        }

        const removed = await dismissCaregiverObservation(id, observationId);

        if (!removed) {
            return res.status(404).json({
                success: false,
                message: "Referral not found"
            });
        }

        return res.status(200).json({
            success: true
        });
    } catch (error) {
        console.error("Error dismissing caregiver observation:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to dismiss observation"
        });
    }
};

module.exports = {
    createReferral,
    getReferral,
    getIncoming,
    updateReferralLifecycle,
    deleteReferral,
    updateReferralChecklist,
    getCaregiverPage,
    submitCaregiverObservation,
    dismissObservation
};