const mongoose = require('mongoose');

const vehiculoSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  ano: { type: Number, required: true },
  placa: { type: String, required: true, unique: true },
  kilometraje: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Vehiculo', vehiculoSchema);