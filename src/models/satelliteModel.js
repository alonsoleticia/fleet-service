const mongoose = require('mongoose');
const SATELLITE_STATUSES = ['active', 'inactive']

/*
Schema for the Satellite entity:
*/
const satelliteSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },  // Satellite name (required field)
  slug: {type: String, required: true, unique: true }, // Long name of the satellite
  status: { type: String, enum: SATELLITE_STATUSES, default: SATELLITE_STATUSES[0] }, // Status of the satellite, default is 'active'
  company: { type: String, default: null } , // FIXME: related to 'companies' model (or null)
  createdBy: { type: String }, // FIXME: related to 'users' model
  updatedBy: { type: String }, // FIXME: related to 'users' model
  orbit: {
    longitude: { type: Number, required: true },
    latitude: { type: Number, default: 0 },
    inclination: { type: Number, default: 0 },
    height: { type: Number, default: 35786.063 } // Kms
  }
},{
  timestamps: true  // This automatically adds the 'createdAt' and 'updatedAt' fields
}
);

/*
Summarised schema for GET basic responses:
*/
const SatelliteSummarySchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
});

/*
Detailed schema for GET full responses:
*/
const SatelliteDetailedSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  slug: String,
  status: String,
  company: String,
  createdBy: String, 
  updatedBy: String,
  orbit: Object
},{
  timestamps: true
});

// Export the models to be used in other parts of the application
module.exports = {
  Satellite: mongoose.model("Satellite", satelliteSchema),
  SatelliteSummarySchema,
  SatelliteDetailedSchema,
}



/*
  Disclaimer: there may be missing fields for the moment such as 'origin' (TBC if needed), 'beams' (also TBC). It may also be interesting to type the satellites (i.e. TRADITIONAL, FLEXIBLE).
*/
