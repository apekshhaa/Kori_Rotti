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

const saveReferral = async (referralData) => {
    const { id, ...payload } = referralData;

    const docRef = await db.collection("referrals").add({

        ...payload,

        // Existing fields
        createdAt: new Date(),

        smsStatus: "pending",

        // New hospital dashboard fields
        hospitalId: "dist-hospital-1",

        referralStatus: "sent",

        eta: 75,

        recommendedActions: []

    });

    return docRef.id;

};


// Update SMS status
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

    const data = doc.data();
    const { id: legacyId, ...rest } = data || {};

    return {
        id: doc.id,
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
                ...payload,
            };
        })
        .filter(referral => {
            const status = referral.referralStatus || referral.status;
            return ["sent", "acknowledged", "arrived", "checked_in"].includes(status);
        })
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    return referrals;
};


const updateReferralLifecycleStatus = async (referralId, status) => {

    await db
        .collection("referrals")
        .doc(referralId)
        .update({
            referralStatus: status,
            statusUpdatedAt: new Date()
        });

};

const deleteReferralById = async (referralId) => {
    await db
        .collection("referrals")
        .doc(referralId)
        .delete();
};

module.exports = {
    saveReferral,
    updateReferralStatus,
    getReferralById,
    getIncomingReferrals,
    updateReferralLifecycleStatus,
    deleteReferralById
};