const db = require("../config/firebase");

// Save referral to Firestore
// const saveReferral = async (referralData) => {

//     try {

//         const docRef = await db.collection("referrals").add({

//             ...referralData,

//             //status: "pending",
//             smsStatus: "pending",

//             createdAt: new Date()

//         });

//         return docRef.id;

//     } catch (error) {

//         throw error;

//     }

// };

const buildPatientToken = (referralData = {}) => {
    const existing = typeof referralData.patientToken === "string" ? referralData.patientToken.trim() : "";
    if (existing) {
        return existing;
    }

    const patientId = referralData.patientId || referralData.referralId || referralData.id || "patient";
    const normalizedPatientId = String(patientId)
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/(^-|-$)/g, "") || "patient";

    return `${normalizedPatientId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const saveReferral = async (referralData) => {
    const { id, ...payload } = referralData;
    const referralId = String(payload.referralId || payload.id || id || payload.patientId || `ref-${Date.now()}`);
    const patientId = payload.patientId || referralId || id || "patient";
    const patientToken = buildPatientToken({ ...payload, referralId, patientId });

    await db.collection("referrals").doc(referralId).set({
        ...payload,
        patientId,
        referralId,
        patientToken,
        timestamp: payload.timestamp || new Date(),

        // Existing fields
        createdAt: payload.createdAt || new Date(),

        smsStatus: "pending",

        // New hospital dashboard fields
        hospitalId: "dist-hospital-1",

        referralStatus: "sent",

        eta: 75,

        recommendedActions: [],
        caregiverObservations: payload.caregiverObservations || [],
        lastCaregiverObservationAt: null,
        lastCaregiverObservationText: ""
    }, { merge: true });

    return referralId;
};

const updateReferralStatus = async (
    referralId,
    status,
    messageSid = null
) => {

    try {

        await db
            .collection("referrals")
            .doc(referralId)
            .update({
                referralStatus: status,
                status,
                smsStatus: status,
                messageSid: messageSid
            });

    } catch (error) {

        throw error;

    }

};

// Get referral by Firestore document ID
const getReferralById = async (referralId) => {

    const doc = await db
        .collection("referrals")
        .doc(referralId)
        .get();

    if (!doc.exists) {
        return null;
    }

    const data = doc.data() || {};
    const { id: legacyId, ...rest } = data;

    return {
        id: doc.id,
        patientToken: rest.patientToken || doc.id,
        ...rest,
    };

};

const getIncomingReferrals = async () => {

    const snapshot = await db
        .collection("referrals")
        .where("hospitalId", "==", "dist-hospital-1")
        .get();

    const referrals = snapshot.docs
        .map(doc => {
            const data = doc.data();
            const { id, ...payload } = data;
            return {
                id: doc.id,
                patientToken: payload.patientToken || doc.id,
                ...payload,
            };
        })
        .filter(referral => {
            const status = referral.referralStatus || referral.status;
            const hasObservations = Array.isArray(referral.caregiverObservations) && referral.caregiverObservations.length > 0;
            return ["sent", "acknowledged", "arrived", "checked_in"].includes(status) || hasObservations;
        })
        .sort((a, b) => {
            const aObservationTime = a.lastCaregiverObservationAt ? new Date(a.lastCaregiverObservationAt).getTime() : 0;
            const bObservationTime = b.lastCaregiverObservationAt ? new Date(b.lastCaregiverObservationAt).getTime() : 0;
            if (aObservationTime || bObservationTime) {
                return bObservationTime - aObservationTime;
            }
            return (b.timestamp || 0) - (a.timestamp || 0);
        });

    const seenKeys = new Set();
    return referrals.filter((referral) => {
        const key = referral.patientToken || referral.referralId || referral.patientId || referral.id;
        if (seenKeys.has(key)) {
            return false;
        }
        seenKeys.add(key);
        return true;
    });
};


const updateReferralLifecycleStatus = async (referralId, status) => {

    const updatePayload = {
        referralStatus: status,
        statusUpdatedAt: new Date()
    };

    if (status === "acknowledged") {
        updatePayload.acknowledgedAt = new Date();
    }

    if (status === "arrived") {
        updatePayload.arrivedAt = new Date();
    }

    if (status === "checked_in") {
        updatePayload.checkedInAt = new Date();
    }

    await db
        .collection("referrals")
        .doc(referralId)
        .update(updatePayload);

};

const deleteReferralById = async (referralId) => {
    await db
        .collection("referrals")
        .doc(referralId)
        .delete();
};

const getReferralByToken = async (patientToken) => {
    const snapshot = await db
        .collection("referrals")
        .where("patientToken", "==", patientToken)
        .limit(1)
        .get();

    if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
        };
    }

    const directDoc = await db.collection("referrals").doc(patientToken).get();
    if (!directDoc.exists) {
        return null;
    }

    const data = directDoc.data();
    return {
        id: directDoc.id,
        ...data,
    };
};

const addCaregiverObservation = async (patientToken, observation) => {
    const referral = await getReferralByToken(patientToken);
    if (!referral) {
        throw new Error("Referral not found");
    }

    const resolvedPatientToken = referral.patientToken || patientToken;
    const observationPayload = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        patientToken: resolvedPatientToken,
        patientId: referral.patientId || referral.referralId || referral.id,
        patientName: referral.patientName || "Patient",
        text: observation.text,
        timestamp: new Date(),
        createdAt: new Date(),
        observedBy: observation.observedBy || "Caregiver"
    };

    const observations = Array.isArray(referral.caregiverObservations) ? referral.caregiverObservations : [];
    observations.unshift(observationPayload);

    await db.collection("referrals").doc(referral.id).update({
        patientToken: resolvedPatientToken,
        caregiverObservations: observations.slice(0, 20),
        lastCaregiverObservationAt: observationPayload.timestamp,
        lastCaregiverObservationText: observationPayload.text,
        caregiverFlags: [observationPayload.text, ...(Array.isArray(referral.caregiverFlags) ? referral.caregiverFlags : []).filter(Boolean).slice(0, 4)]
    });

    return observationPayload;
};

const dismissCaregiverObservation = async (referralId, observationId) => {
    const docRef = db.collection("referrals").doc(referralId);
    const doc = await docRef.get();

    if (!doc.exists) {
        return false;
    }

    const referral = doc.data() || {};
    const observations = Array.isArray(referral.caregiverObservations) ? referral.caregiverObservations : [];
    const nextObservations = observations.filter((item) => item?.id !== observationId);

    const updatePayload = {
        caregiverObservations: nextObservations.slice(0, 20),
    };

    if (nextObservations.length > 0) {
        const latest = nextObservations[0];
        updatePayload.lastCaregiverObservationAt = latest.timestamp || null;
        updatePayload.lastCaregiverObservationText = latest.text || "";
    } else {
        updatePayload.lastCaregiverObservationAt = null;
        updatePayload.lastCaregiverObservationText = "";
    }

    await docRef.update(updatePayload);
    return true;
};

module.exports = {
    saveReferral,
    updateReferralStatus,
    getReferralById,
    getIncomingReferrals,
    updateReferralLifecycleStatus,
    deleteReferralById,
    getReferralByToken,
    addCaregiverObservation,
    dismissCaregiverObservation
};