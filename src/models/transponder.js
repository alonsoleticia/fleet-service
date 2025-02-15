const mongoose = require('mongoose');

const { 
  TRANSPONDER_STATUSES,
  TRANSPONDER_CREATION_ORIGINS, 
  TRANSPONDER_DELETION_ORIGINS,
  POLARIZATIONS 
} = require('../utils/constants');

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
 *           enum: ["horizontal", "vertical", "circular"]
 *           description: Uplink polarization type.
 *           example: horizontal
 *         DL_polarization:
 *           type: string
 *           enum: ["horizontal", "vertical", "circular"]
 *           description: Downlink polarization type.
 *           example: vertical
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
  name:  { type: String, required: true },
  status: { type: String, enum: TRANSPONDER_STATUSES, default: TRANSPONDER_STATUSES[0] },
  UL_polarization: { type: String, enum: POLARIZATIONS, required: true },
  DL_polarization: { type: String, enum: POLARIZATIONS, required: true },
  UL_frequency: { 
    type: Number, 
    required: true,
    validate: {
      validator: function (value) {
        return value > 0; 
      },
      message: props => `${props.value} is not a valid frequency. It must be greater than 0.`
    }
  }, // MHz ?
  DL_frequency: { 
    type: Number, 
    required: true,
    validate: {
      validator: function (value) {
        return value > 0; 
      },
      message: props => `${props.value} is not a valid frequency. It must be greater than 0.`
    }
  }, // MHz ?
  bandwidth: { 
    type: Number, 
    required: true,
    validate: {
      validator: function (value) {
        return value > 0; 
      },
      message: props => `${props.value} is not a valid value. It must be greater than 0.`
    }
  }, // MHz ?
  company: { type: String, default: null }, // FIXME: related to 'companies' model (or null)
  createdBy: { type: String }, // FIXME: related to 'users' model
  creationOrigin: { type: String, enum: TRANSPONDER_CREATION_ORIGINS, default: TRANSPONDER_CREATION_ORIGINS[0] },
  updatedBy: { type: String }, // FIXME: related to 'users' model
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletionOrigin: { type: String, enum: TRANSPONDER_DELETION_ORIGINS, default: null }
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
