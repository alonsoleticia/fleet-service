const express = require('express');
const router = express.Router();
const satelliteController = require('../controllers/satelliteController');

// Rutas para manejar satélites
router.post('/', satelliteController.createSatellite);

router.get('/', satelliteController.getAllSatellites);
router.get('/:id', satelliteController.getSatelliteById);
router.put('/:id', satelliteController.updateSatellite);
router.delete('/:id', satelliteController.deleteSatellite);

module.exports = router;



