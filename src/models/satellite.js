const mongoose = require('mongoose');

const { 
  SATELLITE_STATUSES, 
  SATELLITE_CREATION_ORIGINS, 
  SATELLITE_DELETION_ORIGINS 
} = require('../utils/constants');

/**
 * @swagger
 * components:
 *   schemas:
 *     Satellite:
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
 *           type: string
 *           description: Name of the satellite (normally the satellite code or short name). It must be unique.
 *           example: GMVSAT
 *         slug:
 *           type: string
 *           description: Extended name of the satellite (long name). It must be unique.
 *           example: GMV Satellite
 *         orbit:
 *           type: object
 *           description: Information associated with the satellite orbit.
 *           properties:
 *             longitude:
 *               type: number
 *               description: Orbit longitude (positive East, negative West).
 *               example: 45.0
 *             latitude:
 *               type: number
 *               description: Orbit latitude (positive North, negative South).
 *               default: 0
 *             inclination:
 *               type: number
 *               description: Orbit inclination angle.
 *               default: 0
 *             height:
 *               type: number
 *               description: Orbit height in Km.
 *               default: 35786.063
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
 *         creationOrigin:
 *           type: string
 *           enum: ["inventory", "manual"]
 *           description: Origin of the creation of the entity.
 *           default: "inventory"
 *         updatedBy:
 *           type: string
 *           description: User who last modified the satellite in the database.
 *         deleted:
 *           type: boolean
 *           default: false
 *           description: Whether the satellite has been soft deleted or not.
 *         deletedAt:
 *           type: string
 *           format: date
 *           default: null
 *           description: Date in which the satellite was soft deleted if applies.
 *         deletionOrigin:
 *           type: string
 *           enum: ["manual"]
 *           description: Origin of the soft deletion of the entity.
 *           default: null
 */

// Full satellite schema
const SatelliteSchema = new mongoose.Schema({
  name: { type: String, required: true }, // unique: true => set later within an index
  slug: { type: String, required: true }, // unique: true => set later within an index
  orbit: {
    longitude: { type: Number, required: true },
    latitude: { type: Number, default: 0 },
    inclination: { type: Number, default: 0 },
    height: { type: Number, default: 35786.063 } // Kms
  },
  status: { type: String, enum: SATELLITE_STATUSES, default: SATELLITE_STATUSES[0] },
  company: { type: String, default: null }, // FIXME: related to 'companies' model (or null)
  createdBy: { type: String }, // FIXME: related to 'users' model
  creationOrigin: { type: String, enum: SATELLITE_CREATION_ORIGINS, default: SATELLITE_CREATION_ORIGINS[0] },
  updatedBy: { type: String }, // FIXME: related to 'users' model
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletionOrigin: { type: String, enum: SATELLITE_DELETION_ORIGINS, default: null }
}, {
  timestamps: true // Automatically adds 'createdAt' and 'updatedAt' fields
});


// Middlewares to ignore by default the 'marked as deleted' elements:
SatelliteSchema.pre(/^find/, function(next) {
  this.find({ deleted: false });
  next();
});


/**
 * Ensures the uniqueness of the `name` and `slug` fields.
 * 
 * - `unique: true`: Enforces uniqueness.
 * - `partialFilterExpression: { deleted: false }`: Applies uniqueness only if `deleted` is `false`.
 * - If a satellite is marked as deleted (`deleted: true`), MongoDB allows creating another with the same name/slug.
 */
SatelliteSchema.index({ name: 1 }, { unique: true, partialFilterExpression: { deleted: false } });
SatelliteSchema.index({ slug: 1 }, { unique: true, partialFilterExpression: { deleted: false } });

const Satellite = mongoose.models.Satellite || mongoose.model("Satellite", SatelliteSchema);

// Ensure index creation
Satellite.init()
  .then(() => console.log("Indexes ensured for Satellite"))
  .catch(err => console.error("Error ensuring indexes:", err));

// Export models and schemas
module.exports = {
  Satellite,
  SatelliteSchema
};
