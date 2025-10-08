const mongoose = require('mongoose');

const ordenSchema = new mongoose.Schema({
  numero: { type: String, required: true, unique: true },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  vehiculo: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehiculo', required: true },
  descripcion: { type: String, required: true },
  repuestos: [{
    repuesto: { type: mongoose.Schema.Types.ObjectId, ref: 'Repuesto' },
    cantidad: { type: Number, required: true },
    costo: { type: Number, required: true },
  }],
  manoDeObra: { type: Number, required: true }, // costo de mano de obra
  total: { type: Number, required: true },
  estado: { type: String, enum: ['Pendiente', 'En progreso', 'Completado', 'Entregado'], default: 'Pendiente' },
}, { timestamps: true });

module.exports = mongoose.model('Orden', ordenSchema);