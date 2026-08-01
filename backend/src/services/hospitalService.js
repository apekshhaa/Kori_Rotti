const  db  = require("../config/firebase");


// Create demo hospital
const createDemoHospital = async () => {

    const hospitalId = "dist-hospital-1";

    const hospitalData = {

        hospitalId: hospitalId,

        hospitalName: "Demo District Hospital",

        resources: {

            icuBeds: 3,

            generalBeds: 12,

            oxygenCylinders: 8,

            respiratoryTherapists: 2,

            isolationRooms: 2,

            cardiacMonitors: 4,

            ventilators: 2,

            bloodTypeOUnits: 6,

            bloodCultureKits: 10,

            sputumKits: 8,

            antibioticsAvailable: true,

            chestXrayAvailable: true,

            abgAnalyzerAvailable: true

        },

        updatedAt: new Date()

    };


    await db
        .collection("hospitals")
        .doc(hospitalId)
        .set(hospitalData);


    return hospitalData;

};


module.exports = {

    createDemoHospital

};