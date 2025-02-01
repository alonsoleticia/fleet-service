const Satellite = require('../models/satelliteModel');

// Create a new satellite
exports.createSatellite = async (req, res) => {
  try {
    const { name, type, launchDate, status } = req.body;
    const satellite = new Satellite({ name, type, launchDate, status });
    await satellite.save();
    res.status(201).json(satellite);  // Respond with the created satellite
  } catch (err) {
    res.status(500).json({ error: err.message });  // Respond with error if something goes wrong
  }
};

/**
 * @swagger
 * /api/satellites:
 *   get:
 *     summary: Get all satellites
 *     description: Returns a list of all satellites in the system.
 *     responses:
 *       200:
 *         description: List of satellites
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Name of the satellite
 *                   type:
 *                     type: string
 *                     description: Type of the satellite
 *                   launchDate:
 *                     type: string
 *                     format: date
 *                     description: Launch date
 *                   status:
 *                     type: string
 *                     enum: [active, inactive]
 *                     description: Status of the satellite
 *       500:
 *         description: Server error
 */
exports.getAllSatellites = async (req, res) => {
  try {
    const satellites = await Satellite.find();  // Find all satellites in the database
    res.status(200).json(satellites);  // Respond with the list of satellites
  } catch (err) {
    res.status(500).json({ error: err.message });  // Respond with error if something goes wrong
  }
};

// Get a satellite by ID
exports.getSatelliteById = async (req, res) => {
  try {
    const satellite = await Satellite.findById(req.params.id);  // Find a satellite by its ID
    if (!satellite) {
      return res.status(404).json({ message: 'Satellite not found' });  // Respond with 404 if satellite is not found
    }
    res.status(200).json(satellite);  // Respond with the found satellite
  } catch (err) {
    res.status(500).json({ error: err.message });  // Respond with error if something goes wrong
  }
};

// Update a satellite by ID
exports.updateSatellite = async (req, res) => {
  try {
    const satellite = await Satellite.findByIdAndUpdate(req.params.id, req.body, { new: true });  // Update satellite by ID
    if (!satellite) {
      return res.status(404).json({ message: 'Satellite not found' });  // Respond with 404 if satellite is not found
    }
    res.status(200).json(satellite);  // Respond with the updated satellite
  } catch (err) {
    res.status(500).json({ error: err.message });  // Respond with error if something goes wrong
  }
};

// Delete a satellite by ID
// Note: This endpoint completely deletes the satellite from the database, not just marking it as deleted. 
// To mark it as deleted, use findByIdAndUpdate and set a 'deleted' flag.
exports.deleteSatellite = async (req, res) => {
  try {
    const satellite = await Satellite.findByIdAndDelete(req.params.id);  // Delete satellite by ID
    if (!satellite) {
      return res.status(404).json({ message: 'Satellite not found' });  // Respond with 404 if satellite is not found
    }
    res.status(200).json({ message: 'Satellite deleted' });  // Respond with success message
  } catch (err) {
    res.status(500).json({ error: err.message });  // Respond with error if something goes wrong
  }
};
