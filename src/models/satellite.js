const mongoose = require('mongoose');
const SATELLITE_STATUSES = ['active', 'inactive'];
const SATELLITE_CREATION_ORIGINS = ['inventory', 'manual'];
const SATELLITE_DELETION_ORIGINS = ['inventory', 'manual'];

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
 *         creationOrigin:
 *           type: String
 *           enum: ["inventory", "manual"]
 *           description: Origin of the creation of the entity
 *           default: "inventory" 
 *         createdBy:
 *           type: string
 *           description: User who created the satellite in the database.
 *         updatedBy:
 *           type: string
 *           description: User who last modified the satellite in the database.
 *         orbit:
 *           $ref: '#/components/schemas/Orbit'
 *         deleted:
 *           type: boolean
 *           default: false
 *           description: Whether the satellite has been soft deleted or not.
  *         deletedAt:
 *           type: Date
 *           default: null
 *           description: Date in which the satellite was soft deleted if applies.
 *         deletionOrigin:
 *           type: String
 *           enum: ["inventory", "manual"]
 *           description: Origin of the soft deletion of the entity
 *           default: "inventory" 
 * 
 *     SatelliteSummarised:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier of the satellite (automatically created).
 *         name:
 *           $ref: '#/components/schemas/Name'
 *         slug:
 *           $ref: '#/components/schemas/Slug'
 *         orbit:
 *           $ref: '#/components/schemas/Orbit'
 */

// Independent schemas for reuse
const NameSchema = { type: String, required: true}; // unique: true => set later within an index
const SlugSchema = { type: String, required: true}; // unique: true => set later within an index

const OrbitSchema = new mongoose.Schema({
  longitude: { type: Number, required: true },
  latitude: { type: Number, default: 0 },
  inclination: { type: Number, default: 0 },
  height: { type: Number, default: 35786.063 } // Kms
});

// Full satellite schema
const SatelliteSchema = new mongoose.Schema({
  name: NameSchema,
  slug: SlugSchema,
  status: { type: String, enum: SATELLITE_STATUSES, default: SATELLITE_STATUSES[0] },
  company: { type: String, default: null }, // FIXME: related to 'companies' model (or null)
  creationOrigin: {type: String, enum: SATELLITE_CREATION_ORIGINS, default: SATELLITE_CREATION_ORIGINS[0] },
  createdBy: { type: String }, // FIXME: related to 'users' model
  updatedBy: { type: String }, // FIXME: related to 'users' model
  orbit: OrbitSchema,
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletionOrigin: {type: String, enum: SATELLITE_DELETION_ORIGINS, default: null },
}, {
  timestamps: true // Automatically adds 'createdAt' and 'updatedAt' fields
});

// Summarized satellite schema
// FIXME: investigate whether not including the 'deleted' could lead to a problem when explicitly requesting deleted elemenets
const SatelliteSummarisedSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: NameSchema,
  slug: SlugSchema,
  orbit: OrbitSchema
});

// Middlewares to ignore by default the 'marked as deleted' elements:
SatelliteSchema.pre(/^find/, function(next) {
  this.find({ deleted: false }); 
  next();
});

SatelliteSummarisedSchema.pre(/^find/, function(next) {
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
SatelliteSummarisedSchema.index({ name: 1 }, { unique: true, partialFilterExpression: { deleted: false } });
SatelliteSummarisedSchema.index({ slug: 1 }, { unique: true, partialFilterExpression: { deleted: false } });


const Satellite = mongoose.models.Satellite || mongoose.model("Satellite", SatelliteSchema);
const SatelliteSummarised = mongoose.models.SatelliteSummarised || mongoose.model("SatelliteSummarised", SatelliteSummarisedSchema);


// Ensure index creation
Satellite.init()
  .then(() => console.log("Indexes ensured for Satellite"))
  .catch(err => console.error("Error ensuring indexes:", err));

// Export models and schemas
module.exports = {
  Satellite,
  SatelliteSummarised,
  SatelliteSchema,
  SatelliteSummarisedSchema
};

