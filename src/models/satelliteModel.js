const mongoose = require('mongoose');

// Definir el esquema de un satélite
const satelliteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  launchDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
});

// Crear el modelo
const Satellite = mongoose.model('Satellite', satelliteSchema);

module.exports = Satellite;
