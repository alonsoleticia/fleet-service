const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const satelliteRoutes = require('./routes/satelliteRoutes');

dotenv.config(); // Load environment variables

const app = express();

// Middleware to parse JSON
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Routes
app.use('/api/satellites', satelliteRoutes);

// Adding this route to display something in the browser when accessing "/" before reaching /satellites
app.get('/', (req, res) => {
  res.send('Welcome to the Fleet Service API');
});

/* 
    SWAGGER
*/
const path = require('path');
const SatelliteModels = require("./models/satelliteModel"); 
const { SatelliteFullSchema, SatelliteSummarisedSchema } = SatelliteModels;


// Define options for Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',  // Use OpenAPI 3.0
    info: {
      title: 'Fleet Service API',
      version: '1.0.0',
      description: 'API to manage satellites and other entities in the Fleet service',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',  // Server URL
      },
    ],

  },
  apis: [
    
    path.resolve(__dirname, './models/*.js'),  
    path.resolve(__dirname, './routes/satelliteRoutes.js'),  
    path.resolve(__dirname, './controllers/satelliteController.js')  
  ],
  
};

// Generate Swagger documentation
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Use Swagger UI to view the documentation
console.log('Swagger documentation available at /api-docs');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/* 
    INITIALIZE SERVER
*/
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
