const mongoose = require('mongoose');

const cierreDiarioSchema = new mongoose.Schema({
  fecha: { type: Date, required: true, unique: true },
  turnoAdministrativo: {
    horaInicio: { type: String, default: '08:00' },
    horaFin: { type: String, default: '18:00' },
    ordenesCreadas: { type: Number, default: 0 },
    ordenesCompletadas: { type: Number, default: 0 },
    ingresos: { type: Number, default: 0 },
    clientesAtendidos: { type: Number, default: 0 },
    repuestosVendidos: { type: Number, default: 0 }
  },
  turnoOperativo: {
    horaInicio: { type: String, default: '18:00' },
    horaFin: { type: String, default: '08:00' },
    ordenesCreadas: { type: Number, default: 0 },
    ordenesCompletadas: { type: Number, default: 0 },
    ingresos: { type: Number, default: 0 },
    clientesAtendidos: { type: Number, default: 0 },
    repuestosVendidos: { type: Number, default: 0 }
  },
  totales: {
    ordenesCreadas: { type: Number, default: 0 },
    ordenesCompletadas: { type: Number, default: 0 },
    ingresos: { type: Number, default: 0 },
    clientesAtendidos: { type: Number, default: 0 },
    repuestosVendidos: { type: Number, default: 0 }
  },
  estado: { type: String, enum: ['abierto', 'cerrado'], default: 'abierto' },
  fechaCierre: { type: Date },
  usuarioCierre: { type: String }
}, { timestamps: true });

// Método estático para generar cierre diario
cierreDiarioSchema.statics.generarCierre = async function(fecha) {
  const Orden = require('./Orden');
  const Cliente = require('./Cliente');
  
  const startDate = new Date(fecha);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(fecha);
  endDate.setHours(23, 59, 59, 999);
  
  // Obtener órdenes del día
  const ordenes = await Orden.find({
    fechaCreacion: { $gte: startDate, $lte: endDate }
  }).populate('cliente');
  
  // Separar por turnos
  const ordenesAdmin = ordenes.filter(o => o.turno === 'administrativo');
  const ordenesOper = ordenes.filter(o => o.turno === 'operativo');
  
  // Calcular métricas administrativo
  const adminCompletadas = ordenesAdmin.filter(o => o.estado === 'Completado' || o.estado === 'Entregado');
  const adminIngresos = adminCompletadas.reduce((sum, o) => sum + (o.total || 0), 0);
  const adminClientes = new Set(ordenesAdmin.map(o => o.cliente?._id)).size;
  const adminRepuestos = ordenesAdmin.reduce((sum, o) => sum + (o.repuestos?.length || 0), 0);
  
  // Calcular métricas operativo
  const operCompletadas = ordenesOper.filter(o => o.estado === 'Completado' || o.estado === 'Entregado');
  const operIngresos = operCompletadas.reduce((sum, o) => sum + (o.total || 0), 0);
  const operClientes = new Set(ordenesOper.map(o => o.cliente?._id)).size;
  const operRepuestos = ordenesOper.reduce((sum, o) => sum + (o.repuestos?.length || 0), 0);
  
  return {
    fecha: startDate,
    turnoAdministrativo: {
      ordenesCreadas: ordenesAdmin.length,
      ordenesCompletadas: adminCompletadas.length,
      ingresos: adminIngresos,
      clientesAtendidos: adminClientes,
      repuestosVendidos: adminRepuestos
    },
    turnoOperativo: {
      ordenesCreadas: ordenesOper.length,
      ordenesCompletadas: operCompletadas.length,
      ingresos: operIngresos,
      clientesAtendidos: operClientes,
      repuestosVendidos: operRepuestos
    },
    totales: {
      ordenesCreadas: ordenes.length,
      ordenesCompletadas: adminCompletadas.length + operCompletadas.length,
      ingresos: adminIngresos + operIngresos,
      clientesAtendidos: adminClientes + operClientes,
      repuestosVendidos: adminRepuestos + operRepuestos
    }
  };
};

module.exports = mongoose.model('CierreDiario', cierreDiarioSchema);