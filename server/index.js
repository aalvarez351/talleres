const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Decode MongoDB URI from base64
const mongodbUri = Buffer.from(process.env.MONGODB_URI_BASE64, 'base64').toString('utf-8');
const jwtSecret = Buffer.from(process.env.JWT_SECRET_BASE64, 'base64').toString('utf-8');

// MongoDB connection
mongoose.connect(mongodbUri, { dbName: 'Talleres' })
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/vehiculos', require('./routes/vehiculos'));
app.use('/api/ordenes', require('./routes/ordenes'));
app.use('/api/repuestos', require('./routes/repuestos'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});