const mongoose = require('mongoose');
const Validator = require('../utils/validation');
const { BEAM } = require('../utils/constants');

/**
 * @swagger
 * components:
 *   schemas:
 *     Beam:
 *       type: object
 *       required:
 *         - name
 *         - linkDirection
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier of the beam (automatically created).
 *         name:
 *           type: string
 *           description: >
 *             Name of the beam.
 *             Validated to ensure it only contains letters, numbers, hyphens, and spaces,
 *             and must have a minimum length defined in the configuration (trimming whitespace).
 *           example: Beam A
 *         linkDirection:
 *           type: string
 *           enum: ["uplink", "downlink"]
 *           description: Direction of the beam link.
 *           example: uplink
 *         pattern:
 *           type: string
 *           description: Pattern associated with the beam. 
 *           default: null
 *         createdBy:
 *           type: string
 *           description: User who created the beam in the database.
 *         creationOrigin:
 *           type: string
 *           enum: ["inventory", "manual"]
 *           description: Origin of the creation of the entity.
 *           default: "inventory"
 *         updatedBy:
 *           type: string
 *           description: User who last modified the beam in the database.
 *         deleted:
 *           type: boolean
 *           default: false
 *           description: >
 *             Whether the beam has been soft deleted or not.
 *             It is set to `false` by default, and when `true`, 
 *             the beam is considered as deleted (soft deletion).
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           default: null
 *           description: >
 *             Date in which the beam was soft deleted if applicable. 
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
 *       # - The `name` field is validated to ensure it follows a specific string format 
 *       #   and has a minimum length after trimming whitespace.
 *       # - The `linkDirection` field is validated to be one of the specified enum values: "uplink" or "downlink".
 */

// Full beam schema
const BeamSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Beam 'name' is mandatory"],  
    validate: [
      {
        validator: Validator.isStringFormatValid,  
        message: "Name can only contain letters, numbers, hyphens, and spaces."
      },
      {
        validator: function(value) {
          return Validator.isMinLengthTrimmed(value, BEAM.NAME_MIN_LENGTH);  
        },
        message: `The name must have at least ${BEAM.NAME_MIN_LENGTH} characters after trimming.`
      }
    ]
  }, 
  linkDirection: { 
    type: String, 
    enum: BEAM.LINK_DIRECTIONS,  
    required: true 
  },
  pattern: { 
    type: String, 
    default: null  
  }, 
  createdBy: { 
    type: String  
  }, 
  creationOrigin: { 
    type: String, 
    enum: BEAM.CREATION_ORIGINS,  
    default: BEAM.CREATION_ORIGINS[0]  
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
    enum: BEAM.DELETION_ORIGINS,  
    default: null  
  }
}, {
  timestamps: true // Automatically adds 'createdAt' and 'updatedAt' fields
});

// Middlewares to ignore by default the 'marked as deleted' elements:
BeamSchema.pre(/^find/, function(next) {
  this.find({ deleted: false });  
  next();
});

const Beam = mongoose.models.Beam || mongoose.model("Beam", BeamSchema);

// Export models and schemas
module.exports = {
  Beam,
  BeamSchema
};
