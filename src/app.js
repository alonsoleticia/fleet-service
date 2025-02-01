const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const satelliteRoutes = require('./routes/satelliteRoutes');

dotenv.config(); // Cargar las variables de entorno

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Rutas
app.use('/api/satellites', satelliteRoutes);
// Agrego esta ruta adicional para ver algo en el navegador cuando entro en "/" pero no estoy aún en /satellites
app.get('/', (req, res) => {
  res.send('Bienvenido al Fleet Service API');
});


// Iniciar el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
