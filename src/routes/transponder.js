const express = require('express');
const router = express.Router();
const transponderController = require('../controllers/transponder');

// Routes to handle transponders
router.post('/', transponderController.createTransponder);  // Create a new transponder
router.get('/id/:id', transponderController.getTransponderById);  // Get a transponder by ID
router.put('/id/:id', transponderController.updateTransponderById);  // Update a transponder by ID
router.delete('/id/:id', transponderController.deleteTransponder);  // Delete a transponder by ID

module.exports = router;  
/**
 * Get all transponder may not be necessary -> at least, if associated to a given beam (incl. possible filtr by status)
 * Get transponder ID by name -> makes no sense since the name is not unique -> at least it can return all transponder with the given name
 * Get transponder by name -> same as above
 * Update transponder by name -> it seams not operational for the user. The system would use the ID. At least, setTransponderAsInactive could be necessary
 * Delete transponder by name -> same as above
 */