require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const posRoutes = require('./routes/pos');
const formsRoutes = require('./routes/forms');
const queriesRoutes = require('./routes/queries');
const apiRoutes = require('./routes/api');
const donationsRoutes = require('./routes/donations');

app.use('/api/auth', authRoutes);
app.use('/', posRoutes);
app.use('/', formsRoutes);
app.use('/', queriesRoutes);
app.use('/', donationsRoutes);

// Main legacy routes aggregator mounted at root since paths inside have full prefix like /api/admin/...
app.use('/', apiRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

// Trigger nodemon restart

// Trigger nodemon restart 2
