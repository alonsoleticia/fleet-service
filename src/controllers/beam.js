const ValidationError = require("../utils/ValidationError");
const { getSelectedFieldsInResponse } = require('../utils/utils');
const { Beam } = require('../models/beam');
const { 
  ALL_FIELDS,
  BEAM_SUMMARISED_FIELDS,
  BEAM_DELETION_ORIGINS 
} = require('../utils/constants');

/**************************************************************
 * CRUD beam operations endpoints:
 **************************************************************/

// Create a new beam
/**
 * @swagger
 *   /api/beams:
 *     post:
 *       summary: Create a new beam
 *       tags: [Beams]
 *       description: Creates a new beam and adds it to the system.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Beam'
 *       responses:
 *         201:
 *           description: Beam created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Beam'
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
 *               example: "The fields 'name' and 'linkDirection' are required."
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
 *               example: "An error has occurred while saving the beam in the database."
 */
exports.createBeam = async (req, res) => {
    try {
  
      // Extracting required data
      const { name, linkDirection, pattern = null, createdBy, updatedBy } = req.body;

      // Validate input data
      validateBeamInformation(req.body);
  
      // No need of checking if another element with the same 'name' already exists in the database, since the filed is not unique.
  
      // Create the beam: 
      const beam = new Beam({
        name,
        linkDirection,
        pattern,
        createdBy,
        updatedBy
      });
  
      // Save the new element in database activating the Mongoose validators
      const savedBeam = await beam.save({ runValidators: true });
  
      // Return the required information:
      return res.status(201).json(savedBeam);
  
    } catch (error) {
        if (error instanceof ValidationError){
          return res.status(400).json({ error: `The introduced values for the beam are not correct. Details: ${error.message}` });
        }else{
          return res.status(500).json({ error: `An error has occurred while saving the beam in database. Details: ${error}` });
        }
    }
  };




// Get beam by ID (with/without details)
/**
 * @swagger
 * /api/beams/id/{id}:
 *   get:
 *     summary: Get beam by ID
 *     tags: [Beams]
 *     description: | 
 *       Returns the information corresponding to the requested beam.
 *       - If **detailed=true**, all fields are returned (see **Beams** schema)
 *       - If **detailed is omitted or false**, a summarized version is returned.
 *     parameters: 
 *     - in: query
 *       name: detailed
 *       schema:
 *         type: string
 *         enum: ["true", "false"]
 *       required: false
 *       description: "Use 'true' to get full beam details. Default is summary mode."
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: "Beam ID to retrieve"
 *     responses:
 *       200:
 *         description: Beam information
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 oneOf:
 *                   - $ref: '#/components/schemas/Beam'
 *                   - Main fields of the Beam   
 *       404:
 *         description: Beam not found            
 *       500:
 *         description: Internal server error 
 */ 
exports.getBeamById = async (req, res) => {
    const filter = { _id: req.params.id };
    const { detailed } = req.query;
  
    const result = await getBeamByFilter(filter, detailed);
    return res.status(result.status).json(result.data);
};


// Update beam by ID 
/**
 * @swagger
 * /api/beams/id/{id}:
 *   put:
 *     summary: Update a beam by its ID
 *     tags: [Beams]
 *     description: Updates an existing beam's information.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the beam to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Beam'
 *     responses:
 *       200:
 *         description: Beam updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Beam'
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
 *                 error: "The fields 'name' and 'linkDirection' are required."
 *       404:
 *         description: Beam not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error details
 *               example:
 *                 message: "Beam not found"
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
 *                 error: "An unexpected error occurred while updating the beam."
 */
exports.updateBeamById = async (req, res) => {
    // Getting beam under analysis with old information:
    const filter = { _id: req.params.id };
    const detailed = "true";
    const updatedBeamInputData = req.body;

    const result = await updateBeamByFilter(filter, detailed, updatedBeamInputData);
    return res.status(result.status).json(result.data);
};


/**************************************************************
* Auxiliary reusable methods for different purposes:
**************************************************************/



// Validates the beam information before continuing the processing
/**
 * Validates the beam information before continuing the processing
 *
 * @param {Object} data - The beam data to validate.
 * @param {string} data.name - The name of the beam (required).
 * @param {string} data.linkDirection - The link direction of the beam (required).
 * @param {string} [data.pattern] - The pattern associated with the beam (optional).
 * @param {string} [data.createdBy] - The user who created the beam (optional).
 * @param {string} [data.updatedBy] - The user who last updated the beam (optional).
 * 
 * @throws {ValidationError} If any required field is missing or has an incorrect type.
 * 
 * @returns {boolean} Returns `true` if validation is successful.
 */
const validateBeamInformation = (data) => {
  
    const { name, linkDirection, pattern, createdBy, updatedBy } = data;
    // Required fields validation:
    if (!name || !linkDirection ) {
      throw new ValidationError("The fields 'name', and 'linkDirection' are required.")
    }
  
    // Verify the types of the fields:
    if (typeof name !== "string" || typeof linkDirection !== "string"){
      throw new ValidationError("The fields 'name' or 'linkDirection' do not present the correct type.")
    }

    // Verify the types of the fields:
    if (typeof pattern !== "string" && pattern != null){
        throw new ValidationError("The fields 'pattern' does not present the correct type. It must be a 'string' or null.")
    }
  
    // Mongoose already verifies that the 'linkDirection' in case of provided is within the expected constraints.
    
    return true;
}

// Retrieves beam data based on a given filter
/**
 * Retrieves satellite data based on a given filter.
 * 
 * @async
 * @function getBeamByFilter
 * @param {Object} filter - The filter criteria for retrieving the beam.
 * @param {Object} detailed - Additional query parameters to modify the response.
 * @returns {Promise<{status: number, data: Object}>} 
 *   A promise resolving to an object with:
 *   - `status` (number): HTTP-like status code (200, 404, or 500).
 *   - `data` (Object): Beam data or an error message.
 * 
 * @example
 * const filter = { name: "Beam A" };
 * const detailed = { details: true };
 * const result = await getBeamByFilter(filter, detailed);
 * console.log(result.status, result.data);
 */
const getBeamByFilter = async (filter, detailed) => {
    try {
      const beam = await findBeam(filter, detailed);
      if (!beam) {
        // Returns an structure translatable then as the 'res'.  
        return {status: 404, data: {message: "Beam not found" }};
      }
  
      return {status: 200, data: beam};
    } catch(error){
      console.error(error);
      return {status: 500, data: {message: `An error occurred. Details: ${error.message}` }};
    }   
  }





/**************************************************************
* Auxiliary reusable methods to manage database operations:
**************************************************************/

// Finds a beam in database based on the provided filter and returns the document
/**
 * Finds a beam in database based on the provided filter and returns the document.
 *
 * @async
 * @param {Object} filter - Query filter to find the beam in the database.
 * @param {Object} detailed - Boolean flag to determine the fields to retrieve.
 * @returns {Promise<Object|null>} Returns the beam object if found, otherwise null.
 */
const findBeam = async (filter, detailed) => {
    try {
      const selectedFields = getSelectedFieldsInResponse(detailed, ALL_FIELDS, BEAM_SUMMARISED_FIELDS); 
      return await Beam.findOne(filter).select(selectedFields);  
    } catch (error) {
      console.error(error);
      throw new Error(`An error has occurred while requesting the beam from database. Details: ${error.message}`);
    }
};
  
// Updates and retrieves a beam's data based on a given filter
/**
 * Updates and retrieves a beam's data based on a given filter.
 *
 * @async
 * @param {Object} filter - The filter criteria to find the beam (e.g., `{ _id: "123" }`).
 * @param {Object} detailed - Query parameters to determine the level of detail in the response.
 * @param {Object} updatedBeamInputData - The new beam data to be updated.
 * @returns {Promise<{status: number, data: Object}>} - An object containing the HTTP status and the updated beam data.
 *
 * @throws {Error} If an unexpected error occurs during the update process.
 *
 * @example
 * const filter = { _id: "65a123456789abcd12345678" };
 * const detailed = { details: "true" };
 * const updatedData = { name: "Beam3" };
 * const result = await updateBeamByFilter(filter, detailed, updatedData);
 * console.log(result);
 * // { status: 200, data: { _id: "65a123456789abcd12345678", name: "Beam3", linkDirection: "uplink" } }
 */
const updateBeamByFilter = async (filter, detailed, updatedBeamInputData) => {
    try {
  
      // Get beam to be updated:
      const getBeamResponse = await getBeamByFilter(filter, detailed)
      if (getBeamResponse.status != 200){
        return {status: getBeamResponse.status, data: {message: getBeamResponse.data }};
      }
  
      const oldBeamInfo = getBeamResponse.data;
      const oldBeamData = oldBeamInfo ? oldBeamInfo.toObject() : null;     // Use toObject() to convert the Mongoose doc to a normal Object
  
      // Validate feasibility of the updated information for the beam:
      // Any error will be captured in the catch with a ValidationError personalized exception:
      validateBeamInformation(updatedBeamInputData);
     
      if (updatedBeamInputData._id !== undefined && updatedBeamInputData._id !== oldBeamData._id){
        return {status: 409, data:  { message: 'Beam internal ID cannot be modified. It is immutable.' }};
      }
  
      if (updatedBeamInputData.linkDirection !== oldBeamData.linkDirection) {
        return {status: 409, data:  { message: 'Beam link direction cannot be modified. It is immutable.' }};
      }
  
      const beam = await findAndUpdateBeam(filter, updatedBeamInputData);
  
      return {status: 200, data: beam};
      
    }catch(error){
      console.error(error);
      return {status: 500, data: {message: `An error occurred. Details: ${error.message}` }};
    }
}

// Updates a beam in the database based on the provided filter and returns the updated document
/**
 * Updates a beam in the database based on the provided filter and returns the updated document.
 *
 * @async
 * @param {Object} filter - The criteria to find the beam (e.g., `{ _id: "123" }`).
 * @param {Object} updatedBeamInputData - The new beam data to apply in the update.
 * @returns {Promise<Object|null>} - The updated beam document, or `null` if no matching beam was found.
 *
 * @throws {Error} If an unexpected error occurs while updating the beam in the database.
 *
 * @example
 * const filter = { _id: "65a123456789abcd12345678" };
 * const updatedData = { name: "Beam 5" };
 * const updatedBeam = await findAndUpdateBeam(filter, updatedData);
 * console.log(updatedSatellite);
 * // { _id: "65a123456789abcd12345678", name: "Beam 5", linkDirection: "uplink" }
 */
const findAndUpdateBeam = async (filter, updatedBeamInputData) => {
    try {
      return await Beam.findOneAndUpdate(filter, updatedBeamInputData, { returnDocument: "after", runValidators: true } );  // Returns updated document and activates the schema validation
    } catch (error) {
      console.error(error);
      throw new Error(`An error has occurred while updating the beam in database. Details: ${error.message}`);
    }
  };