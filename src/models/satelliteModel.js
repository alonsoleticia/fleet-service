const mongoose = require('mongoose');
const SATELLITE_STATUSES = ['active', 'inactive'];

/**
 * @swagger
 * components:
 *   schemas:
 *     Name:
 *       type: string
 *       description: Name of the satellite (normally the satellite code or short name). It must be unique.
 *       example: GMVSAT
 * 
 *     Slug:
 *       type: string
 *       description: Extended name of the satellite (long name). It must be unique.
 *       example: GMV Satellite
 * 
 *     Orbit:
 *       type: object
 *       description: Information associated with the satellite orbit.
 *       properties:
 *         longitude:
 *           type: number
 *           description: Orbit longitude (positive East, negative West).
 *           example: 45.0
 *         latitude:
 *           type: number
 *           description: Orbit latitude (positive North, negative South).
 *           default: 0
 *         inclination:
 *           type: number
 *           description: Orbit inclination angle.
 *           default: 0
 *         height:
 *           type: number
 *           description: Orbit height in Km.
 *           default: 35786.063
 * 
 *     SatelliteFull:
 *       type: object
 *       required:
 *         - name
 *         - slug
 *         - orbit
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier of the satellite (automatically created).
 *         name:
 *           $ref: '#/components/schemas/Name'
 *         slug:
 *           $ref: '#/components/schemas/Slug'
 *         status:
 *           type: string
 *           enum: ["active", "inactive"]
 *           description: Status of the satellite considering its activeness.
 *           default: "active"
 *         company:
 *           type: string
 *           description: Company operating the satellite.
 *           example: GMV
 *         createdBy:
 *           type: string
 *           description: User who created the satellite in the database.
 *         updatedBy:
 *           type: string
 *           description: User who last modified the satellite in the database.
 *         orbit:
 *           $ref: '#/components/schemas/Orbit'
 * 
 *     SatelliteSummarised:
 *       type: object
 *       properties:
 *         name:
 *           $ref: '#/components/schemas/Name'
 *         slug:
 *           $ref: '#/components/schemas/Slug'
 *         orbit:
 *           $ref: '#/components/schemas/Orbit'
 */

// Independent schemas for reuse
const NameSchema = { type: String, required: true, unique: true };
const SlugSchema = { type: String, required: true, unique: true };

const OrbitSchema = new mongoose.Schema({
  longitude: { type: Number, required: true },
  latitude: { type: Number, default: 0 },
  inclination: { type: Number, default: 0 },
  height: { type: Number, default: 35786.063 } // Kms
});

// Main satellite schema
const SatelliteFullSchema = new mongoose.Schema({
  name: NameSchema,
  slug: SlugSchema,
  status: { type: String, enum: SATELLITE_STATUSES, default: SATELLITE_STATUSES[0] },
  company: { type: String, default: null }, // FIXME: related to 'companies' model (or null)
  createdBy: { type: String }, // FIXME: related to 'users' model
  updatedBy: { type: String }, // FIXME: related to 'users' model
  orbit: OrbitSchema
}, {
  timestamps: true // Automatically adds 'createdAt' and 'updatedAt' fields
});

// Summarized satellite schema
const SatelliteSummarisedSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: NameSchema,
  slug: SlugSchema,
  orbit: OrbitSchema
});

// Export models and schemas
module.exports = {
  Satellite: mongoose.model("Satellite", SatelliteFullSchema),
  SatelliteFullSchema,
  SatelliteSummarisedSchema
};
