// const express = require("express");

// const router = express.Router();

// const validateReferral = require("../middleware/validateReferral");

// const {
//     createReferral,
//     getReferral
// } = require("../controllers/referralController");

// router.post(
//     "/",
//     validateReferral,
//     createReferral
// );

// router.get("/:id", getReferral);

// module.exports = router;

const express = require("express");

const router = express.Router();

const {
    createReferral,
    getReferral,
    getIncoming,
    updateReferralLifecycle,
    deleteReferral,
    getCaregiverPage,
    submitCaregiverObservation,
    dismissObservation
} = require("../controllers/referralController");

const validateReferral = require("../middleware/validateReferral");


// POST /api/referrals
router.post(
    "/",
    validateReferral,
    createReferral
);


// GET /api/referrals/incoming
router.get(
    "/incoming",
    getIncoming
);


// PATCH /api/referrals/:id/observations
router.patch(
    "/:id/observations",
    dismissObservation
);

// PATCH /api/referrals/:id/status
router.patch(
    "/:id/status",
    updateReferralLifecycle
);

// DELETE /api/referrals/:id
router.delete(
    "/:id",
    deleteReferral
);

// GET /api/referrals/caregiver/:patientToken
router.get(
    "/caregiver/:patientToken",
    getCaregiverPage
);

// POST /api/referrals/caregiver/:patientToken/observations
router.post(
    "/caregiver/:patientToken/observations",
    submitCaregiverObservation
);

// GET /api/referrals/:id
router.get(
    "/:id",
    getReferral
);


module.exports = router;