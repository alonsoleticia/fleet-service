const { getSelectedFieldsInResponse } = require('../utils/utils');
const { Transponder } = require('../models/transponder');
const { ALL_FIELDS, TRANSPONDER } = require('../utils/constants');

/**************************************************************
 * CRUD transponder operations endpoints:
 **************************************************************/

/**
 * @swagger
 *   /api/transponders:
 *     post:
 *       summary: Create a new transponder
 *       tags: [Transponders]
 *       description: Creates a new transponder and adds it to the system.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transponder'
 *       responses:
 *         201:
 *           description: Transponder created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Transponder'
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
 *               example: "An error has occurred while saving the transponder in the database."
 */
exports.createTransponder = async (req, res) => {
    try {

        // No need of checking if another element with the same 'name' already exists in the database, since the filed is not unique.

        // Create the transponder:
        const transponder = new Transponder({...req.body});

        // Save the new element in database activating the Mongoose validators
        const savedTransponder = await transponder.save({ runValidators: true });

        // Return the required information:
        return res.status(201).json(savedTransponder);

    } catch (error) {
        return res.status(500).json({ error: `An error has occurred while saving the transponder in the database. Details: ${error}` });
    }
};

/**
 * @swagger
 * /api/transponders/id/{id}:
 *   get:
 *     summary: Get transponder by ID
 *     tags: [Transponders]
 *     description: | 
 *       Returns the information corresponding to the requested transponder.
 *       - If **detailed=true**, all fields are returned (see **Transponders** schema)
 *       - If **detailed is omitted or false**, a summarized version is returned.
 *     parameters: 
 *     - in: query
 *       name: detailed
 *       schema:
 *         type: string
 *         enum: ["true", "false"]
 *       required: false
 *       description: "Use 'true' to get full transponder details. Default is summary mode."
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: "Transponder ID to retrieve"
 *     responses:
 *       200:
 *         description: Transponder information
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 oneOf:
 *                   - $ref: '#/components/schemas/Transponder'
 *                   - Main fields of the Transponder   
 *       404:
 *         description: Transponder not found            
 *       500:
 *         description: Internal server error 
 */ 
exports.getTransponderById = async (req, res) => {
    const filter = { _id: req.params.id };
    const { detailed } = req.query;

    const result = await getTransponderByFilter(filter, detailed);
    return res.status(result.status).json(result.data);
};

/**
 * @swagger
 * /api/transponders/id/{id}:
 *   put:
 *     summary: Update a transponder by its ID
 *     tags: [Transponders]
 *     description: Updates an existing transponder's information.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the transponder to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transponder'
 *     responses:
 *       200:
 *         description: Transponder updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transponder'
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
 *                 error: "The fields 'name' and 'frequency' are required."
 *       404:
 *         description: Transponder not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error details
 *               example:
 *                 message: "Transponder not found"
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
 *                 error: "An unexpected error occurred while updating the transponder."
 */
exports.updateTransponderById = async (req, res) => {
    // Getting transponder under analysis with old information:
    const filter = { _id: req.params.id };
    const detailed = "true";
    const updatedTransponderInputData = req.body;

    const result = await updateTransponderByFilter(filter, detailed, updatedTransponderInputData);
    return res.status(result.status).json(result.data);
};

/**
 * @swagger
 * /api/transponders/id/{id}:
 *   delete:
 *     summary: Soft delete a transponder
 *     tags: [Transponders]
 *     description: |
 *       Marks the transponder as deleted without removing it from the database.
 *       This is a soft delete operation.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transponder ID to mark as deleted
 *     responses:
 *       200:
 *         description: Transponder marked as deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Transponder has been soft deleted"
 *       404:
 *         description: Transponder not found
 *       500:
 *         description: Internal server error
 */
exports.deleteTransponder = async (req, res) => {
    try {

        const { filter } = req.params.id;
        const updatedTransponderInputData = { 
            deleted: true,  
            deletionOrigin: TRANSPONDER.DELETION_ORIGINS[0], // For the moment, a single origin is supported
            deletedAt: new Date()
        };

        const transponder = await findAndUpdateTransponder(filter, updatedTransponderInputData);

        if (!transponder) {
            return res.status(404).json({ message: 'Transponder not found' });
        }

        res.status(200).json({ message: 'Transponder has been soft deleted', transponder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `An error occurred. Details: ${error.message}` });
    }
};

/**************************************************************
* Auxiliary reusable methods for different purposes:
**************************************************************/

/**
 * Retrieves transponder data based on a given filter.
 * 
 * @async
 * @function getTransponderByFilter
 * @param {Object} filter - The filter criteria for retrieving the transponder.
 * @param {Object} detailed - Additional query parameters to modify the response.
 * @returns {Promise<{status: number, data: Object}>} 
 *   A promise resolving to an object with:
 *   - `status` (number): HTTP-like status code (200, 404, or 500).
 *   - `data` (Object): Transponder data or an error message.
 * 
 * @example
 * const filter = { name: "Transponder A" };
 * const detailed = { details: true };
 * const result = await getTransponderByFilter(filter, detailed);
 * console.log(result.status, result.data);
 */
const getTransponderByFilter = async (filter, detailed) => {
    try {
        const transponder = await findTransponder(filter, detailed);
        if (!transponder) {
            return { status: 404, data: { message: "Transponder not found" } };
        }

        return { status: 200, data: transponder };
    } catch (error) {
        console.error(error);
        return { status: 500, data: { message: `An error occurred. Details: ${error.message}` } };
    }
}

/**************************************************************
* Auxiliary reusable methods to manage database operations:
**************************************************************/

/**
 * Finds a transponder in the database based on the provided filter and returns the document.
 *
 * @async
 * @param {Object} filter - Query filter to find the transponder in the database.
 * @param {Object} detailed - Boolean flag to determine the fields to retrieve.
 * @returns {Promise<Object|null>} Returns the transponder object if found, otherwise null.
 */
const findTransponder = async (filter, detailed) => {
    try {
        const selectedFields = getSelectedFieldsInResponse(detailed, ALL_FIELDS, TRANSPONDER.SUMMARISED_FIELDS);
        return await Transponder.findOne(filter).select(selectedFields);
    } catch (error) {
        console.error(error);
        throw new Error(`An error has occurred while requesting the transponder from the database. Details: ${error.message}`);
    }
};

/**
 * Updates and retrieves a transponder's data based on a given filter.
 *
 * @async
 * @param {Object} filter - The filter criteria to find the transponder (e.g., `{ _id: "123" }`).
 * @param {Object} detailed - Query parameters to determine the level of detail in the response.
 * @param {Object} updatedTransponderInputData - The new transponder data to be updated.
 * @returns {Promise<{status: number, data: Object}>} - An object containing the HTTP status and the updated transponder data.
 *
 * @throws {Error} If an unexpected error occurs during the update process.
 *
 * @example
 * const filter = { _id: "65a123456789abcd12345678" };
 * const detailed = { details: "true" };
 * const updatedData = { name: "Transponder3" };
 * const result = await updateTransponderByFilter(filter, detailed, updatedData);
 * console.log(result);
 * // { status: 200, data: { _id: "65a123456789abcd12345678", name: "Transponder3" } }
 */
const updateTransponderByFilter = async (filter, detailed, updatedTransponderInputData) => {
    try {
        const getTransponderResponse = await getTransponderByFilter(filter, detailed)
        if (getTransponderResponse.status != 200) {
            return { status: getTransponderResponse.status, data: { message: getTransponderResponse.data } };
        }

        const oldTransponderInfo = getTransponderResponse.data;
        const oldTransponderData = oldTransponderInfo ? oldTransponderInfo.toObject() : null; // Use toObject() to convert Mongoose doc to a normal Object
        
        if (updatedTransponderInputData._id !== undefined && updatedTransponderInputData._id !== oldTransponderData._id) {
            return { status: 409, data: { message: 'Transponder internal ID cannot be modified. It is immutable.' } };
        }

        if (updatedTransponderInputData.name !== oldTransponderData.name) {
            return {status: 409, data:  { message: 'Transponder name cannot be modified. It is immutable.' }};
        }

        if (updatedTransponderInputData.DL_polarization !== oldTransponderData.DL_polarization || 
            updatedTransponderInputData.UL_polarization !== oldTransponderData.UL_polarization) {
            return {status: 409, data:  { message: 'Transponder polarizations cannot be modified. They are immutable.' }};
        }

        const transponder = await findAndUpdateTransponder(filter, updatedTransponderInputData);

        return { status: 200, data: transponder };
        
    } catch (error) {
        console.error(error);
        return { status: 500, data: { message: `An error occurred. Details: ${error.message}` } };
    }
}

/**
 * Updates a transponder in the database based on the provided filter and returns the updated document.
 *
 * @async
 * @param {Object} filter - The criteria to find the transponder (e.g., `{ _id: "123" }`).
 * @param {Object} updatedTransponderInputData - The new transponder data to apply in the update.
 * @returns {Promise<Object|null>} - The updated transponder document, or `null` if no matching transponder was found.
 *
 * @throws {Error} If an unexpected error occurs while updating the transponder in the database.
 *
 * @example
 * const filter = { _id: "65a123456789abcd12345678" };
 * const updatedData = { bandwidth: 50 };
 * const updatedTransponder = await findAndUpdateTransponder(filter, updatedData);
 * console.log(updatedTransponder);
 * // { _id: "65a123456789abcd12345678", name: "Transponder 5", bandwidth: 50 }
 */
const findAndUpdateTransponder = async (filter, updatedTransponderInputData) => {
    try {
        return await Transponder.findOneAndUpdate(filter, updatedTransponderInputData, { returnDocument: "after", runValidators: true });
    } catch (error) {
        console.error(error);
        throw new Error(`An error has occurred while updating the transponder in database. Details: ${error.message}`);
    }
};
