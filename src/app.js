const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const satelliteRoutes = require('./routes/satellite');
const { swaggerUi, swaggerSpec } = require("./config/swaggerConfig");

// Load environment variables
dotenv.config(); 

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

// Route for Swagger:
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
console.log('Swagger documentation available at /api-docs');

// Server initialization:
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
