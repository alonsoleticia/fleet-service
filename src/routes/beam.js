const express = require('express');
const router = express.Router();
const beamController = require('../controllers/beam');
// console.log(beamController);  // Shows the object with the exported functions.

// Routes to handle beams
router.post('/', beamController.createBeam);  // Create a new beam
router.get('/', beamController.getAllBeams);  // Get all beams                              --> FIXME!! It may not be necessary
router.get('/id/:id', beamController.getBeamById);  // Get a beam by ID
router.get('/name/:name/id', beamController.getBeamIdByName); // Get beam ID by its name    --> FIXME!! Name is not unique. It shall be associated to a Satellite to distinguish
router.get('/name/:name', beamController.getBeamByName);  // Get a beam by name             --> FIXME!! Idem
router.put('/id/:id', beamController.updateBeamById);  // Update a beam by ID
router.put('/name/:name', beamController.updateBeamByName);  // Update a beam by name       --> FIXME!! Idem
router.delete('/id/:id', beamController.deleteBeam);  // Delete a beam by ID

module.exports = router;  // Export the router to be used in other parts of the application
