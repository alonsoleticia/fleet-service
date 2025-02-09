/* 
Runs the application without listen() function, avoiding running the real server. This is exclusively used by Jest to execute the tests. 
*/

const express = require('express');
const satelliteRoutes = require('../../src/routes/satellite');
const { swaggerUi, swaggerSpec } = require("../../src/config/swagger.config");

const app = express();

// Middleware to parse JSON
app.use(express.json());

console.log('Running with Mongo in-memory for tests');

// Routes
app.use('/api/satellites', satelliteRoutes);

// Adding this route to display something in the browser when accessing "/" before reaching /satellites
app.get('/', (req, res) => {
  res.send('Welcome to the Fleet Service API');
});

// Route for Swagger:
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
console.log('Swagger documentation available at /api-docs');

module.exports = app;