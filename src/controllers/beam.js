const { getSelectedFieldsInResponse } = require('../utils/utils');
const { Beam } = require('../models/beam');
const { ALL_FIELDS, BEAM } = require('../utils/constants');

/**************************************************************
 * CRUD beam operations endpoints:
 **************************************************************/

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
   
      // No need of checking if another element with the same 'name' already exists in the database, since the filed is not unique.
  
      // Create the beam: 
      const beam = new Beam({...req.body});
  
      // Save the new element in database activating the Mongoose validators
      const savedBeam = await beam.save({ runValidators: true });
  
      // Return the required information:
      return res.status(201).json(savedBeam);
  
    } catch (error) {
      return res.status(500).json({ error: `An error has occurred while saving the beam in database. Details: ${error}` });
    }
  };

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

/**
 * @swagger
 * /api/beams/id/{id}:
 *   delete:
 *     summary: Soft delete a beam
 *     tags: [Beams]
 *     description: |
 *       Marks the beam as deleted without removing it from the database.
 *       This is a soft delete operation.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Beam ID to mark as deleted
 *     responses:
 *       200:
 *         description: Beam marked as deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Beam has been soft deleted"
 *       404:
 *         description: Beam not found
 *       500:
 *         description: Internal server error
 */
// FIXME: this endpoint may trigger other actions.
exports.deleteBeam = async (req, res) => {
    try {
  
      const { filter } = req.params.id;
      const updatedBeamInputData ={ 
        deleted: true,  
        deletionOrigin: BEAM.DELETION_ORIGINS[0], // For the moment, a single origin is supported
        deletedAt: new Date()
      };
  
      const beam = await findAndUpdateBeam(filter, updatedBeamInputData);
  
      if (!beam) {
        return res.status(404).json({ message: 'Beam not found' });
      }
  
      res.status(200).json({ message: 'Beam has been soft deleted', beam });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: `An error occurred. Details: ${error.message}` });
    }
  };

/**************************************************************
* Auxiliary reusable methods for different purposes:
**************************************************************/

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
      const selectedFields = getSelectedFieldsInResponse(detailed, ALL_FIELDS, BEAM.SUMMARISED_FIELDS); 
      return await Beam.findOne(filter).select(selectedFields);  
    } catch (error) {
      console.error(error);
      throw new Error(`An error has occurred while requesting the beam from database. Details: ${error.message}`);
    }
};
  
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
       
      if (updatedBeamInputData._id !== undefined && updatedBeamInputData._id !== oldBeamData._id){
        return {status: 409, data:  { message: 'Beam internal ID cannot be modified. It is immutable.' }};
      }

      if (updatedBeamInputData.name !== oldBeamData.name) {
        return {status: 409, data:  { message: 'Beam name cannot be modified. It is immutable.' }};
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