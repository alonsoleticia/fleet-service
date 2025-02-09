/* 
Runs the application without listen() function, avoiding running the real server. This is exclusively used by Jest to execute the tests. 
This file does not contain the real connection with Mongo, since for Jest, it is used the Mongo in memory (see /config/jest.config.js)
*/


const express = require('express');
const dotenv = require('dotenv');
const satelliteRoutes = require('./routes/satellite');
const { swaggerUi, swaggerSpec } = require("./config/swagger.config");

// Load environment variables
dotenv.config(); 

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/api/satellites', satelliteRoutes);

// Adding this route to display something in the browser when accessing "/" before reaching /satellites
app.get('/', (req, res) => {
  res.send('Welcome to the Fleet Service API');
});

// Route for Swagger:
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
console.log('Swagger documentation available at /api-docs');