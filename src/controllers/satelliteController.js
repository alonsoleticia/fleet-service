const Satellite = require('../models/satelliteModel');


// Create a new satellite
/*
@swagger
/api/satellites:
  post:
    summary: Create a new satellite
    description: Creates a new satellite and adds it to the system.
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              name:
                type: string
                description: Name of the satellite (normally the satellite code or short name). It must be a unique value.
              slug:
                type: string
                description: Extended name of the satellite (long name). It must be a unique value.
              status:
                type: string
                enum: [active, inactive]
                description: Status of the satellite considering its activeness.
                default: active
              company:
                type: string
                description: Company which operates the satellite.
                default: null
              createdBy:
                type: string
                description: User who created the satellite in database.
              updatedBy:
                type: string
                description: User who last modified the satellite in database.
              orbit:
                type: object
                description: Information associated to the satellite orbit.
                properties:
                  longitude:
                    type: number
                    description: Orbit longitude (positive East, negative West).
                    example: 45.0
                  latitude:
                    type: number
                    description: Orbit latitude (positive North, negative South).
                    default: 0
                  inclination:
                    type: number
                    description: Orbit inclination angle.
                    default: 0
                  height:
                    type: number
                    description: Orbit height in Km.
                    default: 35786.063
            required:
              - name
              - slug
              - orbit
    responses:
      201:
        description: Satellite created successfully
        content:
          application/json:
            schema:
              type: object
              properties:
                _id:
                  type: string
                  description: Internal object identifier (automatically generated)
                name:
                  type: string
                  description: Name of the satellite (normally the satellite code or short name). It must be a unique value.
                slug:
                  type: string
                  description: Extended name of the satellite (long name). It must be a unique value.
                orbit:
                  type: object
                  description: Information associated to the satellite orbit
                  properties:
                    longitude:
                      type: number
                      description: Orbit longitude (positive East, negative West). Range: [-180, 180]
                      example: 45.0
                    latitude:
                      type: number
                      description: Orbit latitude (positive North, negative South). Range: [-90, 90]
                      example: 0
                    inclination:
                      type: number
                      description: Orbit inclination angle
                      example: 0
                    height:
                      type: number
                      description: Orbit height in Km. Mandatorily positive.
                      example: 35786.063
      400:
        description: Bad request
        content:
          application/json:
            schema:
              type: object
              properties:
                error:
                  type: string
                  description: Error details
              example: "The fields 'name', 'slug' and 'orbit' are required."
      409:
        description: Conflict
        content:
          application/json:
            schema:
              type: object
              properties:
                error:
                  type: string
                  description: Error details
              example: "The provided satellite 'name' already exists in database."
      500:
        description: Internal server error
        content:
          application/json:
            schema:
              type: object
              properties:
                error:
                  type: string
                  description: Error details
              example: "An error has occurred while saving the satellite in database."
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
/**
 * @swagger
 * /api/satellites/{id}:
 *   get:
 *     summary: Get a satellite by ID
 *     description: Retrieves a satellite from the system by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the satellite to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Satellite found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: Name of the satellite
 *                 type:
 *                   type: string
 *                   description: Type of the satellite
 *                 launchDate:
 *                   type: string
 *                   format: date
 *                   description: Launch date of the satellite
 *                 status:
 *                   type: string
 *                   enum: [active, inactive]
 *                   description: Status of the satellite
 *       404:
 *         description: Satellite not found
 *       500:
 *         description: Server error
 */

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
/**
 * @swagger
 * /api/satellites/{id}:
 *   put:
 *     summary: Update a satellite by ID
 *     description: Updates the details of a satellite in the system using its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the satellite to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the satellite
 *               type:
 *                 type: string
 *                 description: Type of the satellite
 *               launchDate:
 *                 type: string
 *                 format: date
 *                 description: Launch date of the satellite
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: Status of the satellite
 *     responses:
 *       200:
 *         description: Satellite updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: Name of the satellite
 *                 type:
 *                   type: string
 *                   description: Type of the satellite
 *                 launchDate:
 *                   type: string
 *                   format: date
 *                   description: Launch date of the satellite
 *                 status:
 *                   type: string
 *                   enum: [active, inactive]
 *                   description: Status of the satellite
 *       404:
 *         description: Satellite not found
 *       500:
 *         description: Server error
 */

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
/**
 * @swagger
 * /api/satellites/{id}:
 *   delete:
 *     summary: Delete a satellite by ID
 *     description: Deletes a satellite from the system using its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the satellite to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Satellite deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       404:
 *         description: Satellite not found
 *       500:
 *         description: Server error
 */

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
