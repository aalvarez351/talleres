const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
  taller: { type: mongoose.Schema.Types.ObjectId, ref: 'Taller', required: true },
  monto: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
  metodoPago: { 
    type: String, 
    enum: ['efectivo', 'transferencia', 'tarjeta', 'paypal', 'otro'],
    default: 'transferencia'
  },
  referencia: { type: String },
  estado: { 
    type: String, 
    enum: ['pendiente', 'confirmado', 'rechazado'],
    default: 'pendiente'
  },
  periodo: {
    inicio: { type: Date, required: true },
    fin: { type: Date, required: true }
  },
  notas: { type: String },
  procesadoPor: { type: String, default: 'Sistema' }
}, { timestamps: true });

module.exports = mongoose.model('Pago', pagoSchema);