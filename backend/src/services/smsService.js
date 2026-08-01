const twilio = require("twilio");

// Create Twilio Client
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Function to send referral SMS
const sendReferralSMS = async (referral) => {

    const message =
`SETU ALERT
${referral.patientId}
Pulse:${referral.vitals.pulse}
BP:${referral.vitals.systolicBP}
SpO2:${referral.vitals.spo2}
Temp:${referral.vitals.temperature}
Resp:${referral.vitals.respiration}
Flag:${referral.caregiverFlags?.join(", ") || "None"}
EWS:${referral.risk.score} ${referral.risk.level}`;

    try {

        const response = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: process.env.HOSPITAL_PHONE_NUMBER
        });

        return {
            success: true,
            sid: response.sid,
            status: response.status
        };

    } catch (error) {

        return {
            success: false,
            sid: null,
            status: "failed",
            error: error.message
        };

    }
};

module.exports = {
    sendReferralSMS
};