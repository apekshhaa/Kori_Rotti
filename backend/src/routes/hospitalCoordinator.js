const express = require('express');
const router = express.Router();
const { runCoordinator } = require('../controllers/hospitalCoordinatorController');

router.post('/run', runCoordinator);

module.exports = router;