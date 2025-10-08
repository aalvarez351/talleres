const mongoose = require('mongoose');
const User = require('./models/User');
const Cliente = require('./models/Cliente');
const Vehiculo = require('./models/Vehiculo');
const Orden = require('./models/Orden');
const Repuesto = require('./models/Repuesto');
const dotenv = require('dotenv');

dotenv.config();

// Decode MongoDB URI from base64
const mongodbUri = Buffer.from(process.env.MONGODB_URI_BASE64, 'base64').toString('utf-8');

mongoose.connect(mongodbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Talleres'
});

const seedData = async () => {
  try {
    // Create users for different roles
    const admin = new User({ username: 'admin', email: 'admin@example.com', password: 'password', role: 'Administrador' });
    const mecanico = new User({ username: 'mecanico', email: 'mecanico@example.com', password: 'password', role: 'Mecánico' });
    const recepcion = new User({ username: 'recepcion', email: 'recepcion@example.com', password: 'password', role: 'Recepción' });
    await admin.save();
    await mecanico.save();
    await recepcion.save();

    // Create clientes
    const cliente1 = new Cliente({ nombre: 'Juan Pérez', telefono: '123-456-7890', email: 'juan@example.com', direccion: 'Calle 123' });
    const cliente2 = new Cliente({ nombre: 'María García', telefono: '098-765-4321', email: 'maria@example.com', direccion: 'Avenida 456' });
    await cliente1.save();
    await cliente2.save();

    // Create vehiculos
    const vehiculo1 = new Vehiculo({ cliente: cliente1._id, marca: 'Toyota', modelo: 'Corolla', ano: 2020, placa: 'ABC-123', kilometraje: 50000 });
    const vehiculo2 = new Vehiculo({ cliente: cliente2._id, marca: 'Honda', modelo: 'Civic', ano: 2019, placa: 'DEF-456', kilometraje: 60000 });
    await vehiculo1.save();
    await vehiculo2.save();

    // Create repuestos
    const repuesto1 = new Repuesto({ nombre: 'Filtro de aceite', costo: 10, precio: 15, stock: 50 });
    const repuesto2 = new Repuesto({ nombre: 'Batería', costo: 50, precio: 80, stock: 20 });
    await repuesto1.save();
    await repuesto2.save();

    // Create ordenes
    const orden1 = new Orden({
      numero: 'OS-2025-001',
      cliente: cliente1._id,
      vehiculo: vehiculo1._id,
      descripcion: 'Cambio de aceite',
      repuestos: [{ repuesto: repuesto1._id, cantidad: 1, costo: 10 }],
      manoDeObra: 20,
      total: 30,
      estado: 'Completado'
    });
    await orden1.save();

    console.log('Sample data added');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();