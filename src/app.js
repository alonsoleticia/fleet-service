const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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

/* 
    SWAGGER
*/
// Definir opciones para Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',  // Usa OpenAPI 3.0
    info: {
      title: 'Fleet Service API',
      version: '1.0.0',
      description: 'API para gestionar satélites y otras entidades en el servicio Fleet',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',  // URL del servidor
      },
    ],
  },
  apis: ['./satellites/routes/satelliteRoutes.js', './satellites/controllers/satelliteController.js'],  
};


// Generar la documentación Swagger
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Usar Swagger UI para visualizar la documentación
console.log('Documentación Swagger disponible en /api-docs');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));



/* 
    INITIALIZE SERVER
*/
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
