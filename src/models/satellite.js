const mongoose = require('mongoose');
const Validator = require('../utils/validation');
const { SATELLITE } = require('../utils/constants');

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
 *           description: >
 *             Name of the satellite (normally the satellite code or short name). 
 *             It must be unique. 
 *             Validated to ensure it only contains letters, numbers, hyphens, and spaces, 
 *             and must have a minimum length defined in the configuration (trimming whitespace).
 *           example: GMVSAT
 *         slug:
 *           type: string
 *           description: >
 *             Extended name of the satellite (long name). 
 *             It must be unique. 
 *             Validated to ensure it only contains letters, numbers, hyphens, and spaces, 
 *             and must have a minimum length defined in the configuration (trimming whitespace).
 *           example: GMV Satellite
 *         orbit:
 *           type: object
 *           description: Information associated with the satellite orbit.
 *           properties:
 *             longitude:
 *               type: number
 *               description: >
 *                 Orbit longitude (positive East, negative West).
 *                 Validated to ensure it falls within a specific range.
 *               example: 45.0
 *             latitude:
 *               type: number
 *               description: >
 *                 Orbit latitude (positive North, negative South).
 *                 Validated to ensure it falls within a specific range.
 *               default: 0
 *             inclination:
 *               type: number
 *               description: Orbit inclination angle.
 *               default: 0
 *             height:
 *               type: number
 *               description: >
 *                 Orbit height in Km.
 *                 Validated to ensure it is greater than a specific minimum value.
 *               default: 35786.063
 *         status:
 *           type: string
 *           enum: ["active", "inactive"]
 *           description: >
 *             Status of the satellite considering its activeness. 
 *             Default is 'active'.
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
 *           description: >
 *             Whether the satellite has been soft deleted or not.
 *             It is set to `false` by default, and when `true`, 
 *             the satellite is considered as deleted (soft deletion).
 *         deletedAt:
 *           type: string
 *           format: date
 *           default: null
 *           description: >
 *             Date in which the satellite was soft deleted if applies. 
 *             Only set when 'deleted' is true.
 *         deletionOrigin:
 *           type: string
 *           enum: ["manual"]
 *           description: >
 *             Origin of the soft deletion of the entity. 
 *             Set to 'manual' for user-initiated deletions.
 *           default: null
 * 
 *       # Note on validation:
 *       # - The `name` and `slug` fields are validated to ensure they follow a specific string format
 *       #   and have a minimum length after trimming whitespace.
 *       # - The `longitude` and `latitude` fields are validated to ensure they are within specified ranges.
 *       # - The `height` field is validated to ensure it is greater than a specified minimum value.
 */

// Full satellite schema
const SatelliteSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Satellite 'name' is mandatory"],  
    validate: [
      {
        validator: function(value) {
          return Validator.isStringFormatValid(value); 
        },
        message: "The name can only contain letters, numbers, hyphens, and spaces."
      },
      {
        validator: function(value) {
          return Validator.isMinLengthTrimmed(value, SATELLITE.NAME_MIN_LENGTH); 
        },
        message: `The name must have at least ${SATELLITE.NAME_MIN_LENGTH} characters after trimming.`
      }
    ]
  }, 
  slug: { 
    type: String, 
    required: [true, "Satellite 'slug' is mandatory"],  
    validate: [
      {
        validator: function(value) {
          return Validator.isStringFormatValid(value); 
        },
        message: "The slug can only contain letters, numbers, hyphens, and spaces."
      },
      {
        validator: function(value) {
          return Validator.isMinLengthTrimmed(value, SATELLITE.SLUG_MIN_LENGTH); 
        },
        message: `The slug must have at least ${SATELLITE.SLUG_MIN_LENGTH} characters after trimming.`
      }
    ]
  },
  orbit: {
    longitude: { 
      type: Number, 
      required: true, 
      validate: {
        validator: function(value) {
          return Validator.isWithinRange(value, SATELLITE.LONGITUDE_RANGE[0], SATELLITE.LONGITUDE_RANGE[1]); 
        },
        message: `Longitude must be between ${SATELLITE.LONGITUDE_RANGE[0]} and ${SATELLITE.LONGITUDE_RANGE[1]}.`
      }
    },
    latitude: { 
      type: Number, 
      default: 0, 
      validate: {
        validator: function(value) {
          return Validator.isWithinRange(value, SATELLITE.LATITUDE_RANGE[0], SATELLITE.LATITUDE_RANGE[1]); 
        },
        message: `Latitude must be between ${SATELLITE.LATITUDE_RANGE[0]} and ${SATELLITE.LATITUDE_RANGE[1]}.`
      }
    },
    inclination: { 
      type: Number, 
      default: SATELLITE.DEFAULT_INCLINATION 
    },
    height: { 
      type: Number, 
      default: SATELLITE.DEFAULT_HEIGHT, 
      validate: {
        validator: function(value) {
          return Validator.isGreaterThan(value, SATELLITE.MIN_HEIGHT); 
        },
        message: `Height must be greater than ${SATELLITE.MIN_HEIGHT}.`
      }
    }
  },
  status: { 
    type: String, 
    enum: SATELLITE.STATUSES, 
    default: SATELLITE.STATUSES[0] 
  },
  company: { 
    type: String, 
    default: null 
  }, 
  createdBy: { 
    type: String 
  }, 
  creationOrigin: { 
    type: String, 
    enum: SATELLITE.CREATION_ORIGINS, 
    default: SATELLITE.CREATION_ORIGINS[0] 
  },
  updatedBy: { 
    type: String 
  }, 
  deleted: { 
    type: Boolean, 
    default: false 
  },
  deletedAt: { 
    type: Date, 
    default: null 
  },
  deletionOrigin: { 
    type: String, 
    enum: SATELLITE.DELETION_ORIGINS, 
    default: null 
  }
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
 * - `partialFilterExpression: { deleted: false }`: Applies uniqueness only if `deleted` is `false` (to allow reusing names/slugs after deletion).
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
