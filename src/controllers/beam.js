const ValidationError = require("../utils/ValidationError");
const { Beam } = require('../models/beam');
const { 
  ALL_FIELDS,
  BEAM_DELETION_ORIGINS 
} = require('../utils/enums');

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