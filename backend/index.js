// Dependencies
const cors = require('cors');
const express = require('express');
const logger = require('./logger');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Database modules
const auth_routes = require('./routes/auth.route');
const vehicle_routes = require('./routes/vehicle.route');

// Configurations
const app = express();
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
require("dotenv").config();

// MongoDB connection
mongoose.connect(process.env.DB_URL);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Routes handlers
auth_routes(app);
vehicle_routes(app);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});