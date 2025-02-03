const { Satellite, SatelliteSummarised } = require('../models/satellite');
const ALL_FIELDS = ''
const SUMMARISED_FIELDS = Object.keys(SatelliteSummarised.schema.paths).join(' ');

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
 *               $ref: '#/components/schemas/Satellite'
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
    const satelliteReqData = await Satellite.findById(savedSatellite._id).select(SUMMARISED_FIELDS);

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
 *       - If **details=true**, all fields are returned (see **Satellite** schema)
 *       - If **details is omitted or false**, a summarized version is returned (see **SatelliteSummarised** schema).
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
 *                   - $ref: '#/components/schemas/Satellite'
 *                   - $ref: '#/components/schemas/SatelliteSummarised'               
 *       500:
 *         description: Internal server error 
 */ 
exports.getAllSatellites = async (req, res) => {
  try {
    const selectedFields = getSelectedFieldsInResponse(req);
    const satellites = await Satellite.find().select(selectedFields);  
    res.status(200).json(satellites);  

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: `An error has occurred while retrieving satellites from database. Details: ${error}` });
  }
};

// Get satellite by ID (with/without details)
/**
 * @swagger
 * /api/satellites/id/{id}:
 *   get:
 *     summary: Get satellite by ID
 *     tags: [Satellites]
 *     description: | 
 *       Returns the information corresponding to the requested satellite.
 *       - If **details=true**, all fields are returned (see **Satellite** schema)
 *       - If **details is omitted or false**, a summarized version is returned (see **SatelliteSummarised** schema).
 *     parameters: 
 *     - in: query
 *       name: details
 *       schema:
 *         type: string
 *         enum: ["true", "false"]
 *       required: false
 *       description: "Use 'true' to get full satellite details. Default is summary mode."
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: "Satellite ID to retrieve"
 *     responses:
 *       200:
 *         description: Satellite information
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 oneOf:
 *                   - $ref: '#/components/schemas/Satellite'
 *                   - $ref: '#/components/schemas/SatelliteSummarised'   
 *       404:
 *         description: Satellite not found            
 *       500:
 *         description: Internal server error 
 */ 
exports.getSatelliteById = async (req, res) => {
  // Uses aux function with corresponding filtering option to retrieve the info from DB:
  return getSatellite(req, res, { _id: req.params.id });
};

// Get satellite by name (with/without details)
/**
 * @swagger
 * /api/satellites/name/{name}:
 *   get:
 *     summary: Get satellite by name
 *     tags: [Satellites]
 *     description: | 
 *       Returns the information corresponding to the requested satellite.
 *       - If **details=true**, all fields are returned (see **Satellite** schema)
 *       - If **details is omitted or false**, a summarized version is returned (see **SatelliteSummarised** schema).
 *     parameters: 
 *     - in: query
 *       name: details
 *       schema:
 *         type: string
 *         enum: ["true", "false"]
 *       required: false
 *       description: "Use 'true' to get full satellite details. Default is summary mode."
 *     - in: path
 *       name: name
 *       required: true
 *       schema:
 *         type: string
 *       description: "Satellite name to retrieve"
 *     responses:
 *       200:
 *         description: Satellite information
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 oneOf:
 *                   - $ref: '#/components/schemas/Satellite'
 *                   - $ref: '#/components/schemas/SatelliteSummarised'   
 *       404:
 *         description: Satellite not found            
 *       500:
 *         description: Internal server error 
 */ 
exports.getSatelliteByName = async (req, res) => {
  // Uses aux function with corresponding filtering option to retrieve the info from DB:
  return getSatellite(req, res, { name: req.params.name });  
}

/**
 * Retrieves a satellite from the database based on the provided filter.
 *
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Object} filter - Query filter to find the satellite in the database.
 * @returns {Promise<void>} Does not return a value directly but sends an HTTP response with the satellite data or an error.
 *
 * @throws {Error} Returns a 500 status code if an unexpected error occurs during the query.
 * @throws {Error} Returns a 404 status code if the satellite is not found.
 */
const getSatellite = async (req, res, filter) => {
  try {
    const selectedFields = getSelectedFieldsInResponse(req);
    const satellite = await Satellite.findOne(filter).select(selectedFields);

    if (!satellite) {
      return res.status(404).json({ message: 'Satellite not found' });
    }

    res.status(200).json(satellite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `An error occurred. Details: ${error}` });
  }
};

/**
 * Determines which fields should be selected in the response based on the query parameter.
 * 
 * @param {Object} req - Express request object containing query parameters.
 * @returns {string} A string representing the selected fields.
 *
 * @note This function manages the level of detail in database queries.
 * @todo Consider moving this function to a utility module.
 */
const getSelectedFieldsInResponse = (req) => {
  const { details } = req.query;
  const showFullDetails = details === "true";
  return showFullDetails ? ALL_FIELDS : SUMMARISED_FIELDS;
}








// Reduce the update scope to minimum

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



// Check out condition of name/slug unique with deleted entities


// Delete satellite by ID (soft delete)
/**
 * @swagger
 * /api/satellites/id/{id}:
 *   delete:
 *     summary: Soft delete a satellite
 *     tags: [Satellites]
 *     description: |
 *       Marks the satellite as deleted without removing it from the database.
 *       This is a soft delete operation.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Satellite ID to mark as deleted
 *     responses:
 *       200:
 *         description: Satellite marked as deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Satellite marked as deleted"
 *       404:
 *         description: Satellite not found
 *       500:
 *         description: Internal server error
 */
exports.deleteSatellite = async (req, res) => {
  try {
    const satellite = await Satellite.findByIdAndUpdate(
      req.params.id,
      { 
        deleted: true,  
        deletedAt: new Date()
      },
      { new: true }  // Returns the updated object
    );

    if (!satellite) {
      return res.status(404).json({ message: 'Satellite not found' });
    }

    res.status(200).json({ message: 'Satellite has been soft deleted', satellite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `An error occurred. Details: ${error.message}` });
  }
};

