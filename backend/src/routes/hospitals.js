const express = require('express');
const router = express.Router();
const { getHospital, getAllHospitals } = require('../controllers/hospitalsController');

router.get('/', getAllHospitals);
router.get('/:id', getHospital);

module.exports = router;
