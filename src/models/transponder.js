const mongoose = require('mongoose');
const Validator = require('../utils/validation');
const { TRANSPONDER, POLARIZATIONS } = require('../utils/constants');

/**
 * @swagger
 * components:
 *   schemas:
 *     Transponder:
 *       type: object
 *       required:
 *         - name
 *         - status
 *         - UL_polarization
 *         - DL_polarization
 *         - UL_frequency
 *         - DL_frequency
 *         - bandwidth
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier of the transponder (automatically created).
 *         name:
 *           type: string
 *           description: Name of the transponder.
 *           example: Transponder X
 *         status:
 *           type: string
 *           enum: ["active", "inactive"]
 *           description: Current status of the transponder.
 *           example: active
 *         UL_polarization:
 *           type: string
 *           enum: ["V", "H", "LHCP", "RHCP"]
 *           description: Uplink polarization type.
 *           example: V
 *         DL_polarization:
 *           type: string
 *           enum: ["V", "H", "LHCP", "RHCP"]
 *           description: Downlink polarization type.
 *           example: H
 *         UL_frequency:
 *           type: number
 *           description: Uplink frequency in MHz. Must be greater than 0.
 *           example: 14000
 *         DL_frequency:
 *           type: number
 *           description: Downlink frequency in MHz. Must be greater than 0.
 *           example: 11700
 *         bandwidth:
 *           type: number
 *           description: Bandwidth in MHz. Must be greater than 0.
 *           example: 36
 *         company:
 *           type: string
 *           description: Company operating the transponder.
 *           example: GMV
 *         createdBy:
 *           type: string
 *           description: User who created the transponder in the database.
 *         creationOrigin:
 *           type: string
 *           enum: ["inventory", "manual"]
 *           description: Origin of the creation of the entity.
 *           default: "inventory"
 *         updatedBy:
 *           type: string
 *           description: User who last modified the transponder in the database.
 *         deleted:
 *           type: boolean
 *           default: false
 *           description: Whether the transponder has been soft deleted or not.
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           default: null
 *           description: Date in which the transponder was soft deleted, if applicable.
 *         deletionOrigin:
 *           type: string
 *           enum: ["manual"]
 *           description: Origin of the soft deletion of the entity.
 *           default: null
 */

// Full transponder schema
const TransponderSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Transponder 'name' is mandatory"],  
    validate: [
      {
        validator: Validator.isStringFormatValid,  
        message: "Name can only contain letters, numbers, hyphens, and spaces."
      },
      {
        validator: function(value) {
          return Validator.isMinLengthTrimmed(value, TRANSPONDER.NAME_MIN_LENGTH);  
        },
        message: `The name must have at least ${TRANSPONDER.NAME_MIN_LENGTH} characters after trimming.`
      }
    ]
  },
  status: { 
    type: String, 
    enum: TRANSPONDER.STATUSES, 
    default: TRANSPONDER.STATUSES[0]  
  },
  UL_polarization: { 
    type: String, 
    enum: POLARIZATIONS, 
    required: true 
  },
  DL_polarization: { 
    type: String, 
    enum: POLARIZATIONS, 
    required: true 
  },
  UL_frequency: { 
    type: Number, 
    required: true,
    validate: {
      validator: function(value) {
        return Validator.isGreaterThan(value, TRANSPONDER.MIN_FREQUENCY);                         
      },
      message: `Uplink frequency must be greater than ${TRANSPONDER.MIN_FREQUENCY}.`
    }
  },
  DL_frequency: { 
    type: Number, 
    required: true,
    validate: {
      validator: function(value) {
        return Validator.isGreaterThan(value, TRANSPONDER.MIN_FREQUENCY);                         
      },
      message: `Downlink frequency must be greater than ${TRANSPONDER.MIN_FREQUENCY}.`
    }
  },
  bandwidth: { 
    type: Number, 
    required: true,
    validate: {
      validator: function(value) {
        return Validator.isGreaterThan(value, TRANSPONDER.MIN_BANDWIDTH);                         
      },
      message: `Bandwidth must be greater than ${TRANSPONDER.MIN_BANDWIDTH}.`
    }
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
    enum: TRANSPONDER.CREATION_ORIGINS, 
    default: TRANSPONDER.CREATION_ORIGINS[0]  
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
    enum: TRANSPONDER.DELETION_ORIGINS, 
    default: null  
  }
}, {
  timestamps: true // Automatically adds 'createdAt' and 'updatedAt' fields
});

// Middlewares to ignore by default the 'marked as deleted' elements:
TransponderSchema.pre(/^find/, function(next) {
  this.find({ deleted: false });  
  next();
});

const Transponder = mongoose.models.Transponder || mongoose.model("Transponder", TransponderSchema);

// Export models and schemas
module.exports = {
  Transponder,
  TransponderSchema
};
