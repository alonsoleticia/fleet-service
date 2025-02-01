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

/**
 * @swagger
 * /api/satellites:
 *   get:
 *     summary: Obtener todos los satélites
 *     description: Devuelve una lista de todos los satélites en el sistema.
 *     responses:
 *       200:
 *         description: Lista de satélites
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Nombre del satélite
 *                   type:
 *                     type: string
 *                     description: Tipo del satélite (por ejemplo, "espacial", "comunicaciones", etc.)
 *                   launchDate:
 *                     type: string
 *                     format: date
 *                     description: Fecha de lanzamiento del satélite (en formato ISO 8601)
 *                   status:
 *                     type: string
 *                     enum: [active, inactive]
 *                     description: Estado del satélite (puede ser 'active' o 'inactive')
 *       500:
 *         description: Error del servidor
 */
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
// Nota: este endpoint elimina completamente de BD el elemento, no lo marca a borrado. Para eso hay que utilizar el findByIdAndUpdate y que la actualización marque a deleted.
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

