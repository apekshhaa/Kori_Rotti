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

    const docRef = await db.collection("referrals").add({

        ...referralData,

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

    return {

        id: doc.id,

        ...doc.data()

    };

};

const getIncomingReferrals = async () => {

    const snapshot = await db
        .collection("referrals")
        .where("hospitalId", "==", "dist-hospital-1")
        .where("referralStatus", "==", "sent")
        .orderBy("timestamp", "desc")
        .get();

    const referrals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

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

module.exports = {
    saveReferral,
    updateReferralStatus,
    getReferralById,
    getIncomingReferrals,
    updateReferralLifecycleStatus
};