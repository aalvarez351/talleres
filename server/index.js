const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['https://aalvarez351.github.io', 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'AutoGestor API is running' });
});

// MongoDB connection - Direct URI for Render
const mongodbUri = process.env.MONGODB_URI || 'mongodb+srv://aalvarez351:Lentesdesol@ianube.furqsl0.mongodb.net/Talleres?retryWrites=true&w=majority&appName=ianube';

mongoose.connect(mongodbUri)
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));

// Protected routes (require authentication)
const authMiddleware = require('./middleware/auth');
app.use('/api/clientes', authMiddleware, require('./routes/clientes'));
app.use('/api/vehiculos', authMiddleware, require('./routes/vehiculos'));
app.use('/api/ordenes', authMiddleware, require('./routes/ordenes'));
app.use('/api/repuestos', authMiddleware, require('./routes/repuestos'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});