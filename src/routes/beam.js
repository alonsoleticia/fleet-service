const express = require('express');
const router = express.Router();
const beamController = require('../controllers/beam');

// Routes to handle beams
router.post('/', beamController.createBeam);  // Create a new beam
router.get('/id/:id', beamController.getBeamById);  // Get a beam by ID
router.put('/id/:id', beamController.updateBeamById);  // Update a beam by ID
router.delete('/id/:id', beamController.deleteBeam);  // Delete a beam by ID

module.exports = router;  
/**
 * Get all beams may not be necessary -> at least, if associated to a given satellite (incl. possible filter by linkDirection)
 * Get beam ID by name -> makes no sense since the name is not unique -> at least it can return all beams with the given name
 * Get beam by name -> same as above
 * Update beam by name -> it seams not operational for the user. The system would use the ID
 * Delete beam by name -> same as above
 */