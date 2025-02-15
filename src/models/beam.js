const mongoose = require('mongoose');

const { 
  BEAM_LINK_DIRECTIONS,
  BEAM_CREATION_ORIGINS, 
  BEAM_DELETION_ORIGINS 
} = require('../utils/constants');

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
 *           description: Name of the beam.
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
 *           description: Whether the beam has been soft deleted or not.
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           default: null
 *           description: Date in which the beam was soft deleted if applicable.
 *         deletionOrigin:
 *           type: string
 *           enum: ["manual"]
 *           description: Origin of the soft deletion of the entity.
 *           default: null
 */

// Full beam schema
const BeamSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  linkDirection: { type: String, enum: BEAM_LINK_DIRECTIONS, required: true },
  pattern: { type: String, default: null }, // FIXME: related to 'pattern' model to be created -> it must manage the thumbnail inside (optionally) -> adap endpoints/validation
  createdBy: { type: String }, // FIXME: related to 'users' model
  creationOrigin: { type: String, enum: BEAM_CREATION_ORIGINS, default: BEAM_CREATION_ORIGINS[0] },
  updatedBy: { type: String }, // FIXME: related to 'users' model
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletionOrigin: { type: String, enum: BEAM_DELETION_ORIGINS, default: null }
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
