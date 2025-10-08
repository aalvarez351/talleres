const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  telefono: { type: String, required: true },
  email: { type: String },
  direccion: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Cliente', clienteSchema);