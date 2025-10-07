// Main Express server setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/sos', require('./sos'));
app.use('/user', require('./user'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'SafeTour Backend is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
