// Esto es solo un ejemplo:

module.exports = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    // Aquí validas el token, por ejemplo, con JWT
    next();
  };
  