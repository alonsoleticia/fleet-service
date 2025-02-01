const Satellite = require('../models/satelliteModel');

// Crear un nuevo satélite
exports.createSatellite = async (req, res) => {
  try {
    const { name, type, launchDate, status } = req.body;
    const satellite = new Satellite({ name, type, launchDate, status });
    await satellite.save();
    res.status(201).json(satellite);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener todos los satélites
exports.getAllSatellites = async (req, res) => {
  try {
    const satellites = await Satellite.find();
    res.status(200).json(satellites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener un satélite por ID
exports.getSatelliteById = async (req, res) => {
  try {
    const satellite = await Satellite.findById(req.params.id);
    if (!satellite) {
      return res.status(404).json({ message: 'Satélite no encontrado' });
    }
    res.status(200).json(satellite);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar un satélite por ID
exports.updateSatellite = async (req, res) => {
  try {
    const satellite = await Satellite.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!satellite) {
      return res.status(404).json({ message: 'Satélite no encontrado' });
    }
    res.status(200).json(satellite);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Eliminar un satélite por ID
exports.deleteSatellite = async (req, res) => {
  try {
    const satellite = await Satellite.findByIdAndDelete(req.params.id);
    if (!satellite) {
      return res.status(404).json({ message: 'Satélite no encontrado' });
    }
    res.status(200).json({ message: 'Satélite eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
