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
    updateReferralChecklist
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


// PATCH /api/referrals/:id/status
router.patch(
    "/:id/status",
    updateReferralLifecycle
);

// PATCH /api/referrals/:id/checklist
router.patch('/:id/checklist', updateReferralChecklist);

// DELETE /api/referrals/:id
router.delete(
    "/:id",
    deleteReferral
);

// GET /api/referrals/:id
router.get(
    "/:id",
    getReferral
);


module.exports = router;