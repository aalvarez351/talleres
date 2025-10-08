const mongoose = require('mongoose');

const tallerSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefono: { type: String, required: true },
  direccion: { type: String, required: true },
  ciudad: { type: String, required: true },
  pais: { type: String, default: 'Colombia' },
  plan: { 
    type: String, 
    enum: ['gratuito', 'basico', 'premium'], 
    default: 'gratuito' 
  },
  estado: { 
    type: String, 
    enum: ['activo', 'suspendido', 'cancelado'], 
    default: 'activo' 
  },
  limiteOrdenes: { type: Number, default: 5 },
  fechaCreacion: { type: Date, default: Date.now },
  fechaVencimiento: { type: Date },
  ultimoPago: { type: Date },
  proximoPago: { type: Date },
  valorMensualidad: { type: Number, default: 0 },
  administrador: {
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    telefono: { type: String }
  },
  configuracion: {
    moneda: { type: String, default: 'COP' },
    timezone: { type: String, default: 'America/Bogota' },
    idioma: { type: String, default: 'es' }
  }
}, { timestamps: true });

// Método para calcular próximo pago
tallerSchema.methods.calcularProximoPago = function() {
  if (this.plan === 'gratuito') return null;
  
  const fechaBase = this.ultimoPago || this.fechaCreacion;
  const proximoPago = new Date(fechaBase);
  proximoPago.setMonth(proximoPago.getMonth() + 1);
  
  return proximoPago;
};

// Método para verificar si está vencido
tallerSchema.methods.estaVencido = function() {
  if (this.plan === 'gratuito') return false;
  
  const ahora = new Date();
  const proximoPago = this.calcularProximoPago();
  
  return proximoPago && ahora > proximoPago;
};

module.exports = mongoose.model('Taller', tallerSchema);