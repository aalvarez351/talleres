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
  manoDeObra: { type: Number, required: true },
  subtotal: { type: Number, default: 0 },
  impuesto: { type: Number, default: 0 },
  total: { type: Number, required: true },
  estado: { type: String, enum: ['Pendiente', 'En progreso', 'Completado', 'Entregado'], default: 'Pendiente' },
  fechaCreacion: { type: Date, default: Date.now },
  fechaInicio: { type: Date },
  fechaCompletado: { type: Date },
  fechaEntregado: { type: Date },
  horaCreacion: { type: String },
  horaInicio: { type: String },
  horaCompletado: { type: String },
  horaEntregado: { type: String },
  turno: { type: String, enum: ['administrativo', 'operativo'], default: 'administrativo' },
  usuario: { type: String }
}, { timestamps: true });

// Middleware para fechas automáticas
ordenSchema.pre('save', function(next) {
  const now = new Date();
  const hour = now.getHours();
  
  if (!this.fechaCreacion) {
    this.fechaCreacion = now;
    this.horaCreacion = now.toLocaleTimeString('es-CO');
    this.turno = (hour >= 8 && hour < 18) ? 'administrativo' : 'operativo';
  }
  next();
});

ordenSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  const now = new Date();
  const timeString = now.toLocaleTimeString('es-CO');
  
  if (update.estado) {
    switch(update.estado) {
      case 'En progreso':
        update.fechaInicio = now;
        update.horaInicio = timeString;
        break;
      case 'Completado':
        update.fechaCompletado = now;
        update.horaCompletado = timeString;
        break;
      case 'Entregado':
        update.fechaEntregado = now;
        update.horaEntregado = timeString;
        break;
    }
  }
  next();
});

module.exports = mongoose.model('Orden', ordenSchema);