const { Satellite } = require('../models/satellite');

// Create a new satellite
/**
 * @swagger
 *   /api/satellites:
 *     post:
 *       summary: Create a new satellite
 *       tags: [Satellites]
 *       description: Creates a new satellite and adds it to the system.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SatelliteFull'
 *       responses:
 *         201:
 *           description: Satellite created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/SatelliteSummarised'
 *         400:
 *           description: Bad request
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     description: Error details
 *               example: "The fields 'name', 'slug' and 'orbit' are required."
 *         409:
 *           description: Conflict
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     description: Error details
 *               example: "The provided satellite 'name' already exists in database."
 *         500:
 *           description: Internal server error
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     description: Error details
 *               example: "An error has occurred while saving the satellite in database."
 */
exports.createSatellite = async (req, res) => {
  try {
    const { name, slug, status, company, createdBy, updatedBy, orbit } = req.body;

    // Required fields validation:
    if (!name || !slug || !orbit) {
      return res.status(400).json({ error: "The fields 'name', 'slug' and 'orbit' are required." });
    }

    // Verify the types of the fields:
    if (typeof name !== "string" || typeof slug !== "string" || typeof orbit !== "object" || orbit === null){
      return res.status(400).json({ error: "The fields 'name', 'slug' or 'orbit' do not present the correct type." });
    }
 
    // Mongoose already verifies that the 'status' in case of provided is within the expected constraints.
    
    // Verify the consistency of the orbit information:
    if (orbit.latitude < -90 || orbit.latitude > 90 || orbit.longitude < -180 || orbit.longitude > 180 || orbit.height <= 0){
      return res.status(400).json({ error: "Orbital information out of range." });
    }

    // Check if another element with the same 'name' or 'slug' already exists in the database:
    const existingSatellite = await Satellite.findOne({ $or: [{ name }, { slug }] });
    if (existingSatellite) {
      return res.status(409).json({ error: "The provided satellite 'name' or 'slug' already exists in database." });
    }

    // Create the satellite: 
    const satellite = new Satellite({
      name,
      slug,
      status: status || 'active',
      company: company || null,
      createdBy,
      updatedBy,
      orbit
    });

    // Save the new element in database:
    const savedSatellite = await satellite.save();

    // Select the required information to return:
    const satelliteReqData = await Satellite.findById(savedSatellite._id).select('_id name slug orbit');

    // Return the required information:
    return res.status(201).json(satelliteReqData);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: `An error has occurred while saving the satellite in database. Details: ${error}` });
  }
};


// Get all satellites (with/without details)
/**
 * @swagger
 * /api/satellites:
 *   get:
 *     summary: Get all satellites
 *     tags: [Satellites]
 *     description: | 
 *       Returns a list of all satellites in the system.
 *       - If **details=true**, all fields are returned.
 *       - If **details is omitted or false**, only `_id` and `name` are returned.
 *     parameters: 
 *     - in: query
 *       name: details
 *       schema:
 *         type: string
 *         enum: ["true", "false"]
 *       required: false
 *       description: "Use 'true' to get full satellite details. Default is summary mode."
 *     responses:
 *       200:
 *         description: List of satellites
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 oneOf:
 *                   - $ref: '#/components/schemas/SatelliteFull'
 *                   - $ref: '#/components/schemas/SatelliteSummarised'               
 *       500:
 *         description: Server error 
 */ 
exports.getAllSatellites = async (req, res) => {
  try {
    /* 
    A query param has been included to reuse a flexible GET endpoint including or not all the information of the entity:
      - if details === "true" => all fields are considered
      - otherwise => a subset of fields is considered 
    */
      const { details } = req.query;
      const showFullDetails = details === "true";      
      let consideredFields = showFullDetails ? '' : '_id name';

    const satellites = await Satellite.find().select(consideredFields);  
    res.status(200).json(satellites);  

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: `An error has occurred while retrieving satellites from database. Details: ${error}` });
  }
};


// Get satellite by ID (with/without details)
/**
 * @swagger
 * /api/satellites:
 *   get:
 *     summary: Get satellite by ID
 *     tags: [Satellites]
 *     description: | 
 *       Returns the information corresponding to the requested satellite.
 *       - If **details=true**, all fields are returned.
 *       - If **details is omitted or false**, only `_id` and `name` are returned.
 *     parameters: 
 *     - in: query
 *       name: details
 *       schema:
 *         type: string
 *         enum: ["true", "false"]
 *       required: false
 *       description: "Use 'true' to get full satellite details. Default is summary mode."
 *     responses:
 *       200:
 *         description: Satellite information
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 oneOf:
 *                   - $ref: '#/components/schemas/SatelliteFull'
 *                   - $ref: '#/components/schemas/SatelliteSummarised'   
 *       404:
 *         description: Satellite not found            
 *       500:
 *         description: Internal server error 
 */ 
exports.getSatelliteById = async (req, res) => {
  try {
    
    /* 
    A query param has been included to reuse a flexible GET endpoint including or not all the information of the entity:
      - if details === "true" => all fields are considered
      - otherwise => a subset of fields is considered 
    */
    const { details } = req.query;
    const showFullDetails = details === "true";      
    let consideredFields = showFullDetails ? '' : '_id name';

    const satellite = await Satellite.findById(req.params.id).select(consideredFields);  

    if (!satellite) {
      return res.status(404).json({ message: 'Satellite not found' }); 
    }
    res.status(200).json(satellite); 

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: `An error has occurred while retrieving satellite from database. Details: ${error}` });
  }
};









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
