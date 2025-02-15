const ValidationError = require("../utils/ValidationError");
const { Satellite, SatelliteSummarised } = require('../models/satellite');
const SUMMARISED_FIELDS = Object.keys(SatelliteSummarised.schema.paths).join(' ');
const { 
  ALL_FIELDS,
  SATELLITE_STATUSES,
  SATELLITE_DELETION_ORIGINS 
} = require('../utils/enums');

/**************************************************************
 * CRUD satellite operations endpoints:
 **************************************************************/

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
 *                 $ref: '#/components/schemas/Satellite'
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

    // Extracting required data
    const { name, slug, status = SATELLITE_STATUSES[0], company = null, createdBy, updatedBy, orbit } = req.body;

    // Validate input data
    validateSatelliteInformation(req.body);

    // Check if another element with the same 'name' or 'slug' already exists in the database:
    const filter = { $or: [{ name }, { slug }] };
    const detailed = false;
    const getSatelliteResponse = await getSatelliteByFilter(filter, detailed);
    
    if (getSatelliteResponse.status == 200){
      return res.status(409).json({ error: "The provided satellite 'name' or 'slug' already exists in database." });
    }

    // Create the satellite: 
    const satellite = new Satellite({
      name,
      slug,
      status,
      company,
      createdBy,
      updatedBy,
      orbit
    });

    // Save the new element in database activating the Mongoose validators
    const savedSatellite = await satellite.save({ runValidators: true });

    // Return the required information:
    return res.status(201).json(savedSatellite);

  } catch (error) {
      if (error instanceof ValidationError){
        return res.status(400).json({ error: `The introduced values for the satellite are not correct. Details: ${error.message}` });
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
 *       - If **detailed=true**, all fields are returned (see **Satellite** schema)
 *       - If **detailed is omitted or false**, a summarized version is returned (see **SatelliteSummarised** schema).
 *     parameters: 
 *     - in: query
 *       name: detailed
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
    const satellites = await findSatellites({}, detailed);  
    res.status(200).json(satellites);  
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: `An error has occurred while retrieving satellites from database. Details: ${error.message}` });
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
 *       - If **detailed=true**, all fields are returned (see **Satellite** schema)
 *       - If **detailed is omitted or false**, a summarized version is returned (see **SatelliteSummarised** schema).
 *     parameters: 
 *     - in: query
 *       name: detailed
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
  const filter = { _id: req.params.id };
  const { detailed } = req.query;

  const result = await getSatelliteByFilter(filter, detailed);
  return res.status(result.status).json(result.data);
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
 *       - If **detailed=true**, all fields are returned (see **Satellite** schema)
 *       - If **detailed is omitted or false**, a summarized version is returned (see **SatelliteSummarised** schema).
 *     parameters: 
 *     - in: query
 *       name: detailed
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
  const filter = { name: req.params.name };
  const { detailed } = req.query;

  const result = await getSatelliteByFilter(filter, detailed);
  return res.status(result.status).json(result.data);
};

// Update satellite by ID 
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
    // Getting satellite under analysis with old information:
    const filter = { _id: req.params.id };
    const detailed = "true";
    const updatedSatelliteInputData = req.body;

    const result = await updateSatelliteByFilter(filter, detailed, updatedSatelliteInputData);
    return res.status(result.status).json(result.data);
};

// Update satellite by name
/**
 * @swagger
 * /api/satellites/name/{name}:
 *   put:
 *     summary: Update a satellite by its name
 *     tags: [Satellites]
 *     description: Updates an existing satellite's information, except for its name or slug.
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the satellite to update.
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
exports.updateSatelliteByName = async (req, res) => {
    // Getting satellite under analysis with old information:
    const filter = { name: req.params.name };
    const detailed = "true";
    const updatedSatelliteInputData = req.body;

    const result = await updateSatelliteByFilter(filter, detailed, updatedSatelliteInputData);
    return res.status(result.status).json(result.data);
}

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
 *                   example: "Satellite has been soft deleted"
 *       404:
 *         description: Satellite not found
 *       500:
 *         description: Internal server error
 */
exports.deleteSatellite = async (req, res) => {
  try {

    const { filter } = req.params.id;
    const updatedSatelliteInputData ={ 
      deleted: true,  
      deletionOrigin: SATELLITE_DELETION_ORIGINS[0], // For the moment, a single origin is supported
      deletedAt: new Date()
    };

    const satellite = await findAndUpdateSatellite(filter, updatedSatelliteInputData);

    if (!satellite) {
      return res.status(404).json({ message: 'Satellite not found' });
    }

    res.status(200).json({ message: 'Satellite has been soft deleted', satellite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `An error occurred. Details: ${error.message}` });
  }
};

/**************************************************************
 * Auxiliary endpoints:
 **************************************************************/

// Get satellite ID by its name
/** 
 * @swagger
 * /api/satellites/name/{name}/id:
 *   get:
 *     summary: Get satellite ID by its name
 *     tags:
 *       - Satellites
 *     description: |
 *       Retrieves the unique identifier (`_id`) of a satellite based on its `name`.
 *       This can be useful for clients to get the satellite's ID for further operations.
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: "The name of the satellite to retrieve the ID for."
 *     responses:
 *       200:
 *         description: Satellite ID found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: "The unique MongoDB `_id` of the satellite."
 *                   example: "603c9f76f1a2b8b56a547b42"
 *       404:
 *         description: Satellite not found with the provided name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: "Error message describing that no satellite was found."
 *                   example: "Satellite not found with the provided name."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: "Error message detailing the internal server error."
 *                   example: "An error occurred while retrieving the satellite ID. Details: error message here."
 */
exports.getSatelliteIdByName = async (req, res) => {
  try {
    const { name } = req.params;  // Get the name from the URL parameters

    // FIXME -> usar el await getSatelliteByFilter(filter, detailed);


    // Search for the satellite by name
    const satellite = await Satellite.findOne({ name });

    if (!satellite) {
      return res.status(404).json({ error: "Satellite not found with the provided name." });
    }

    // Return the satellite's ID
    return res.status(200).json({ id: satellite._id });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: `An error occurred while retrieving the satellite ID. Details: ${error.message}` });
  }
};


/**************************************************************
 * Auxiliary reusable methods for different purposes:
 **************************************************************/

// Determines which fields should be selected in the response based on the query parameter
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
  const showFullDetails = String(detailed) === "true";
  return showFullDetails ? ALL_FIELDS : SUMMARISED_FIELDS;
}

// Validates the satellite information before continuing the processing
/**
 * Validates the satellite information before continuing the processing
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

// Retrieves satellite data based on a given filter
/**
 * Retrieves satellite data based on a given filter.
 * 
 * @async
 * @function getSatelliteByFilter
 * @param {Object} filter - The filter criteria for retrieving the satellite.
 * @param {Object} detailed - Additional query parameters to modify the response.
 * @returns {Promise<{status: number, data: Object}>} 
 *   A promise resolving to an object with:
 *   - `status` (number): HTTP-like status code (200, 404, or 500).
 *   - `data` (Object): Satellite data or an error message.
 * 
 * @example
 * const filter = { name: "Hubble" };
 * const detailed = { details: true };
 * const result = await getSatelliteByFilter(filter, detailed);
 * console.log(result.status, result.data);
 */
const getSatelliteByFilter = async (filter, detailed) => {
  try {
    const satellite = await findSatellite(filter, detailed);
    if (!satellite) {
      // Returns an structure translatable then as the 'res'.  
      return {status: 404, data: {message: "Satellite not found" }};
    }

    return {status: 200, data: satellite};
  } catch(error){
    console.error(error);
    return {status: 500, data: {message: `An error occurred. Details: ${error.message}` }};
  }   
}

/**************************************************************
 * Auxiliary reusable methods to manage database operations:
 **************************************************************/

// Finds a satellite in database based on the provided filter and returns the document
/**
 * Finds a satellite in database based on the provided filter and returns the document.
 *
 * @async
 * @param {Object} filter - Query filter to find the satellite in the database.
 * @param {Object} detailed - Boolean flag to determine the fields to retrieve.
 * @returns {Promise<Object|null>} Returns the satellite object if found, otherwise null.
 */
const findSatellite = async (filter, detailed) => {
  try {
    const selectedFields = getSelectedFieldsInResponse(detailed); 
    return await Satellite.findOne(filter).select(selectedFields);  
  } catch (error) {
    console.error(error);
    throw new Error(`An error has occurred while requesting the satellite from database. Details: ${error.message}`);
  }
};

// Finds multiple satellites in the database based on the provided filter and returns the documents
/**
 * Finds multiple satellites in the database based on the provided filter and returns the documents.
 *
 * @async
 * @param {Object} filter - Query filter to find the satellites in the database.
 * @param {Object} detailed - Boolean flag to determine the fields to retrieve.
 * @returns {Promise<Array>} Returns an array of satellite objects.
 */
const findSatellites = async (filter, detailed) => {
  try {
    const selectedFields = getSelectedFieldsInResponse(detailed);
    return await Satellite.find(filter).select(selectedFields);
  } catch (error) {
    console.error(error);
    throw new Error(`An error has occurred while requesting satellites from database. Details: ${error.message}`);
  }
};

// Updates and retrieves a satellite's data based on a given filter
/**
 * Updates and retrieves a satellite's data based on a given filter.
 *
 * @async
 * @param {Object} filter - The filter criteria to find the satellite (e.g., `{ _id: "123" }` or `{ name: "Hubble" }`).
 * @param {Object} detailed - Query parameters to determine the level of detail in the response.
 * @param {Object} updatedSatelliteInputData - The new satellite data to be updated.
 * @returns {Promise<{status: number, data: Object}>} - An object containing the HTTP status and the updated satellite data.
 *
 * @throws {Error} If an unexpected error occurs during the update process.
 *
 * @example
 * const filter = { _id: "65a123456789abcd12345678" };
 * const detailed = { details: "true" };
 * const updatedData = { company: "GMV" };
 * const result = await updateSatelliteByFilter(filter, detailed, updatedData);
 * console.log(result);
 * // { status: 200, data: { _id: "65a123456789abcd12345678", name: "Hubble", company: "GMV" } }
 */
const updateSatelliteByFilter = async (filter, detailed, updatedSatelliteInputData) => {
  try {

    // Get satellite to be updated:
    const getSatelliteResponse = await getSatelliteByFilter(filter, detailed)
    if (getSatelliteResponse.status != 200){
      return {status: getSatelliteResponse.status, data: {message: getSatelliteResponse.data }};
    }

    const oldSatelliteInfo = getSatelliteResponse.data;
    const oldSatelliteData = oldSatelliteInfo ? oldSatelliteInfo.toObject() : null;     // Use toObject() to convert the Mongoose doc to a normal Object

    // Validate feasibility of the updated information for the satellite:
    // Any error will be captured in the catch with a ValidationError personalized exception:
    validateSatelliteInformation(updatedSatelliteInputData);
   
    if (updatedSatelliteInputData._id !== undefined && updatedSatelliteInputData._id !== oldSatelliteData._id){
      return {status: 409, data:  { message: 'Satellite internal ID cannot be modified. It is immutable.' }};
    }

    if (updatedSatelliteInputData.name !== oldSatelliteData.name || updatedSatelliteInputData.slug !== oldSatelliteData.slug) {
      return {status: 409, data:  { message: 'Satellite name or slug cannot be modified. They are immutable.' }};
    }

    const satellite = await findAndUpdateSatellite(filter, updatedSatelliteInputData);

    return {status: 200, data: satellite};
    
  }catch(error){
    console.error(error);
    return {status: 500, data: {message: `An error occurred. Details: ${error.message}` }};
  }
}

// Updates a satellite in the database based on the provided filter and returns the updated document
/**
 * Updates a satellite in the database based on the provided filter and returns the updated document.
 *
 * @async
 * @param {Object} filter - The criteria to find the satellite (e.g., `{ _id: "123" }` or `{ name: "Hubble" }`).
 * @param {Object} updatedSatelliteInputData - The new satellite data to apply in the update.
 * @returns {Promise<Object|null>} - The updated satellite document, or `null` if no matching satellite was found.
 *
 * @throws {Error} If an unexpected error occurs while updating the satellite in the database.
 *
 * @example
 * const filter = { _id: "65a123456789abcd12345678" };
 * const updatedData = { company: "GMV" };
 * const updatedSatellite = await findAndUpdateSatellite(filter, updatedData);
 * console.log(updatedSatellite);
 * // { _id: "65a123456789abcd12345678", name: "Hubble", company: "GMV" }
 */
const findAndUpdateSatellite = async (filter, updatedSatelliteInputData) => {
  try {
    return await Satellite.findOneAndUpdate(filter, updatedSatelliteInputData, { returnDocument: "after", runValidators: true } );  // Returns updated document and activates the schema validation
  } catch (error) {
    console.error(error);
    throw new Error(`An error has occurred while updating the satellite in database. Details: ${error.message}`);
  }
};