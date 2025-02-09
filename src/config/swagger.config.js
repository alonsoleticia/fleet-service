const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const path = require('path');

// Define options for Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',  // Use OpenAPI 3.0
    info: {
      title: 'Fleet Service API',
      version: '1.0.0',
      description: 'API to fleet entities',
    },
  },
  apis: [
    path.resolve(__dirname, '../models/*.js'),  
    path.resolve(__dirname, '../routes/*.js'),  
    path.resolve(__dirname, '../controllers/*.js')  
  ],
  
};

// Generate Swagger documentation
const swaggerSpec = swaggerJsdoc(swaggerOptions);
module.exports = { swaggerUi, swaggerSpec };


