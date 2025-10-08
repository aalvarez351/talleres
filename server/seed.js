const mongoose = require('mongoose');
const Cliente = require('./models/Cliente');
const Vehiculo = require('./models/Vehiculo');
const Orden = require('./models/Orden');
const Repuesto = require('./models/Repuesto');
const dotenv = require('dotenv');

dotenv.config();

// Direct MongoDB URI
const mongodbUri = process.env.MONGODB_URI || 'mongodb+srv://aalvarez351:Lentesdesol@ianube.furqsl0.mongodb.net/Talleres?retryWrites=true&w=majority&appName=ianube';

mongoose.connect(mongodbUri);

// Auto-run seed on server start if no data exists
const autoSeed = async () => {
  try {
    const clienteCount = await Cliente.countDocuments();
    if (clienteCount === 0) {
      console.log('🌱 No data found. Running auto-seed...');
      await seedData();
    }
  } catch (error) {
    console.log('Auto-seed check failed:', error.message);
  }
};

// Export for use in server
module.exports = { seedData, autoSeed };

const seedData = async () => {
  try {
    // Check if data already exists
    const clienteCount = await Cliente.countDocuments();
    if (clienteCount > 0) {
      console.log('✅ Datos ya existen en la base de datos. Saltando seed.');
      process.exit(0);
    }
    
    console.log('🌱 Iniciando carga de datos de prueba...');

    // Create clientes
    const cliente1 = new Cliente({ 
      nombre: 'Juan Pérez', 
      telefono: '3001234567', 
      email: 'juan.perez@email.com', 
      direccion: 'Calle 123 #45-67, Bogotá' 
    });
    
    const cliente2 = new Cliente({ 
      nombre: 'María García', 
      telefono: '3109876543', 
      email: 'maria.garcia@email.com', 
      direccion: 'Carrera 45 #12-34, Medellín' 
    });
    
    const cliente3 = new Cliente({ 
      nombre: 'Carlos López', 
      telefono: '3205551234', 
      email: 'carlos.lopez@email.com', 
      direccion: 'Avenida 68 #23-45, Cali' 
    });
    
    await cliente1.save();
    await cliente2.save();
    await cliente3.save();
    console.log('Clientes created');

    // Create vehiculos
    const vehiculo1 = new Vehiculo({ 
      cliente: cliente1._id, 
      marca: 'Toyota', 
      modelo: 'Corolla', 
      ano: 2020, 
      placa: 'ABC123', 
      kilometraje: 45000 
    });
    
    const vehiculo2 = new Vehiculo({ 
      cliente: cliente2._id, 
      marca: 'Honda', 
      modelo: 'Civic', 
      ano: 2019, 
      placa: 'DEF456', 
      kilometraje: 62000 
    });
    
    const vehiculo3 = new Vehiculo({ 
      cliente: cliente3._id, 
      marca: 'Chevrolet', 
      modelo: 'Spark', 
      ano: 2021, 
      placa: 'GHI789', 
      kilometraje: 28000 
    });
    
    await vehiculo1.save();
    await vehiculo2.save();
    await vehiculo3.save();
    console.log('Vehiculos created');

    // Create repuestos
    const repuestos = [
      { nombre: 'Filtro de aceite', costo: 15000, precio: 25000, stock: 50 },
      { nombre: 'Batería 12V', costo: 180000, precio: 280000, stock: 15 },
      { nombre: 'Pastillas de freno', costo: 45000, precio: 75000, stock: 30 },
      { nombre: 'Aceite motor 5W30', costo: 35000, precio: 55000, stock: 25 },
      { nombre: 'Filtro de aire', costo: 12000, precio: 20000, stock: 40 },
      { nombre: 'Bujías', costo: 8000, precio: 15000, stock: 60 },
      { nombre: 'Correa de distribución', costo: 65000, precio: 120000, stock: 8 },
      { nombre: 'Amortiguadores', costo: 85000, precio: 150000, stock: 12 }
    ];
    
    for (const repuesto of repuestos) {
      const newRepuesto = new Repuesto(repuesto);
      await newRepuesto.save();
    }
    console.log('Repuestos created');

    // Create ordenes
    const orden1 = new Orden({
      numeroOrden: 'OS-2025-001',
      cliente: cliente1._id,
      vehiculo: vehiculo1._id,
      descripcion: 'Cambio de aceite y filtros',
      manoObra: 50000,
      total: 130000,
      estado: 'Completado',
      fechaCreacion: new Date()
    });
    
    const orden2 = new Orden({
      numeroOrden: 'OS-2025-002',
      cliente: cliente2._id,
      vehiculo: vehiculo2._id,
      descripcion: 'Cambio de pastillas de freno',
      manoObra: 80000,
      total: 155000,
      estado: 'En progreso',
      fechaCreacion: new Date()
    });
    
    const orden3 = new Orden({
      numeroOrden: 'OS-2025-003',
      cliente: cliente3._id,
      vehiculo: vehiculo3._id,
      descripcion: 'Mantenimiento general',
      manoObra: 120000,
      total: 250000,
      estado: 'Pendiente',
      fechaCreacion: new Date()
    });
    
    await orden1.save();
    await orden2.save();
    await orden3.save();
    console.log('Ordenes created');

    console.log('✅ Datos de prueba cargados exitosamente en MongoDB Atlas');
    console.log('📊 Resumen:');
    console.log('- 3 Clientes');
    console.log('- 3 Vehículos');
    console.log('- 8 Repuestos');
    console.log('- 3 Órdenes de servicio');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error cargando datos:', err);
    process.exit(1);
  }
};

// Only run if called directly
if (require.main === module) {
  seedData();
}