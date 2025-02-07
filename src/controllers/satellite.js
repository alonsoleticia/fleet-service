const { Satellite, SatelliteSummarised } = require('../models/satellite');
const ValidationError = require("../utils/ValidationError");
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

    const newSatelliteInputData = req.body;
    // If there is an error thrown from this method, it will be captured in the catch with a ValidationError personalized exception:
    validateSatelliteInformation(newSatelliteInputData);

    const { name, slug, status, company, createdBy, updatedBy, orbit } = req.body;

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
      if (error instanceof ValidationError){
        return res.status(400).json({ error: error.message });
      }else{
        return res.status(500).json({ error: `An error has occurred while saving the satellite in database. Details: ${error}` });
      }
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
    const { detailed } = req.query;
    const selectedFields = getSelectedFieldsInResponse(detailed);
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
// Uses aux function with corresponding filtering option to retrieve the info from DB:
exports.getSatelliteById = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const detailed = req.query;
    const satellite = await findSatellite(filter, detailed);
    
    if (!satellite) {
      return res.status(404).json({ message: "Satellite not found" });
    }
    
    return res.status(200).json(satellite);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: `An error occurred. Details: ${error.message}` });
  }
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
  try {
    const filter = { name: req.params.name };
    const detailed = req.query;
    const satellite = await findSatellite(filter, detailed);
    
    if (!satellite) {
      return res.status(404).json({ message: "Satellite not found" });
    }
    
    return res.status(200).json(satellite);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: `An error occurred. Details: ${error.message}` });
  }
};

/**
 * Retrieves a satellite from the database based on the provided filter.
 *
 * @async
 * @param {Object} filter - Query filter to find the satellite in the database.
 * @param {Object} details - Boolean flag to determine the fields to retrieve.
 * @returns {Promise<Object|null>} Returns the satellite object if found, otherwise null.
 */
const findSatellite = async (filter, detailed) => {
  try {
    const selectedFields = getSelectedFieldsInResponse(detailed); 
    return await Satellite.findOne(filter).select(selectedFields);  
  } catch (error) {
    console.error(error);
    throw new Error(`An error has occurred while requesting the satellite from databas. Details: ${error.message}`);
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
const getSelectedFieldsInResponse = (detailed) => {
  const showFullDetails = detailed === "true";
  return showFullDetails ? ALL_FIELDS : SUMMARISED_FIELDS;
}


/**
 * Validates the satellite information before saving it to the database.
 *
 * @param {Object} data - The satellite data to validate.
 * @param {string} data.name - The unique name of the satellite.
 * @param {string} data.slug - The unique slug (extended name) of the satellite.
 * @param {string} [data.status] - The status of the satellite (e.g., "active", "inactive").
 * @param {string} [data.company] - The company operating the satellite (optional).
 * @param {string} [data.createdBy] - The user who created the satellite (optional).
 * @param {string} [data.updatedBy] - The user who last updated the satellite (optional).
 * @param {Object} data.orbit - The orbit information of the satellite.
 * @param {number} data.orbit.longitude - The orbit longitude (positive East, negative West).
 * @param {number} data.orbit.latitude - The orbit latitude (positive North, negative South).
 * @param {number} data.orbit.inclination - The orbit inclination angle.
 * @param {number} data.orbit.height - The orbit height in kilometers.
 * 
 * @throws {ValidationError} If any required field is missing or has an incorrect type.
 * @throws {ValidationError} If orbital information is out of the valid range.
 * 
 * @returns {boolean} Returns `true` if validation is successful.
 */
const validateSatelliteInformation = (data) => {
  
  const { name, slug, status, company, createdBy, updatedBy, orbit } = data;
  // Required fields validation:
  if (!name || !slug || !orbit) {
    throw new ValidationError("The fields 'name', 'slug' and 'orbit' are required.")
  }

  // Verify the types of the fields:
  if (typeof name !== "string" || typeof slug !== "string" || typeof orbit !== "object" || orbit === null){
    throw new ValidationError("The fields 'name', 'slug' or 'orbit' do not present the correct type.")
  }

  // Mongoose already verifies that the 'status' in case of provided is within the expected constraints.
  
  // Verify the consistency of the orbit information:
  if (orbit.latitude < -90 || orbit.latitude > 90 || orbit.longitude < -180 || orbit.longitude > 180 || orbit.height <= 0){
    throw new ValidationError("Orbital information out of range.")
  }
  // TODO: verify consistency of 'company' field.
  return true;
}


/**
 * @swagger
 * /api/satellites/id/{id}:
 *   put:
 *     summary: Update a satellite by its ID
 *     tags: [Satellites]
 *     description: Updates an existing satellite's information, except for its name or slug.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the satellite to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Satellite'
 *     responses:
 *       200:
 *         description: Satellite updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Satellite'
 *       400:
 *         description: Validation error in the provided data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error details
 *               example:
 *                 error: "The fields 'name', 'slug' and 'orbit' are required."
 *       404:
 *         description: Satellite not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error details
 *               example:
 *                 message: "Satellite not found"
 *       409:
 *         description: Conflict - Name or slug cannot be updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error details
 *               example:
 *                 message: "Satellite name or slug cannot be updated."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error details
 *               example:
 *                 error: "An unexpected error occurred while updating the satellite."
 */
exports.updateSatelliteById = async (req, res) => {
  try {

    //FIXME: extend implementation for updateSatelliteByName
    //REVIEW: que devuelva --verbose el satélite

    const updatedSatelliteInputData = req.body;
    // If there is an error thrown from this method, it will be captured in the catch with a ValidationError personalized exception:
    validateSatelliteInformation(updatedSatelliteInputData);
   
    const filter = { _id: req.params.id };
    const detailed = req.query;
    const oldSatelliteInfo = await findSatellite(filter, detailed)
    // Use toObject() to convert the Mongoose doc to a normal Object
    const oldSatelliteData = oldSatelliteInfo ? oldSatelliteInfo.toObject() : null;

    if (updatedSatelliteInputData._id !== oldSatelliteData._id){
      return res.status(409).json({ message: 'Satellite internal ID cannot be modified. It is immutable.' });
    }

    if (updatedSatelliteInputData.name !== oldSatelliteData.name || updatedSatelliteInputData.slug !== oldSatelliteData.slug) {
      return res.status(409).json({ message: 'Satellite name or slug cannot be modified. They are immutable.' });
    }

    const satellite = await Satellite.findOneAndUpdate(filter, updatedSatelliteInputData, { returnDocument: "after" }  ); // Returns updated document
  
    
    // returns updated satellite
    if (!satellite) {
      return res.status(404).json({ message: 'Satellite not found' });  
    }

    res.status(200).json(satellite);  // Respond with the updated satellite
    
  } catch (error) {
    console.error(error)
    if (error instanceof ValidationError){
      return res.status(400).json({ error: error.message });
    }else{
      return res.status(500).json({ error: error.message });       
    }
  }
};

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

