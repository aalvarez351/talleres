const mongoose = require('mongoose');

const repuestoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  costo: { type: Number, required: true },
  precio: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Repuesto', repuestoSchema);