const mongoose = require('mongoose');

// Define the schema for a satellite
const satelliteSchema = new mongoose.Schema({
  name: { type: String, required: true },  // Satellite name (required field)
  type: { type: String, required: true },  // Type of satellite (required field)
  launchDate: { type: Date, required: true },  // Launch date of the satellite (required field)
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }  // Status of the satellite, default is 'active'
});

// Create the model
const Satellite = mongoose.model('Satellite', satelliteSchema);

module.exports = Satellite;  // Export the model to be used in other parts of the application
