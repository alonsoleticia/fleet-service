const express = require('express');
const router = express.Router();
const satelliteController = require('../controllers/satellite');

// Routes to handle satellites
router.post('/', satelliteController.createSatellite);  // Create a new satellite
router.get('/', satelliteController.getAllSatellites);  // Get all satellites
router.get('/id/:id', satelliteController.getSatelliteById);  // Get a satellite by ID
router.get('/name/:name', satelliteController.getSatelliteByName);  // Get a satellite by name
router.put('/id/:id', satelliteController.updateSatelliteById);  // Update a satellite by ID
//router.put('/name/:name', satelliteController.updateSatelliteByName);  // Update a satellite by name
router.delete('/id/:id', satelliteController.deleteSatellite);  // Delete a satellite by ID

module.exports = router;  // Export the router to be used in other parts of the application
