const express = require('express');
const router = express.Router();
const CierreDiario = require('../models/CierreDiario');

// GET /api/cierres - Obtener todos los cierres
router.get('/', async (req, res) => {
  try {
    const cierres = await CierreDiario.find().sort({ fecha: -1 });
    res.json(cierres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/cierres/:fecha - Obtener cierre por fecha
router.get('/:fecha', async (req, res) => {
  try {
    const fecha = new Date(req.params.fecha);
    fecha.setHours(0, 0, 0, 0);
    
    const cierre = await CierreDiario.findOne({ fecha });
    if (!cierre) {
      return res.status(404).json({ message: 'Cierre no encontrado' });
    }
    res.json(cierre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/cierres/generar - Generar cierre diario
router.post('/generar', async (req, res) => {
  try {
    const { fecha } = req.body;
    const fechaCierre = fecha ? new Date(fecha) : new Date();
    fechaCierre.setHours(0, 0, 0, 0);
    
    // Verificar si ya existe cierre para esta fecha
    const cierreExistente = await CierreDiario.findOne({ fecha: fechaCierre });
    if (cierreExistente && cierreExistente.estado === 'cerrado') {
      return res.status(400).json({ message: 'Ya existe un cierre cerrado para esta fecha' });
    }
    
    // Generar datos del cierre
    const datosCierre = await CierreDiario.generarCierre(fechaCierre);
    
    // Crear o actualizar cierre
    const cierre = await CierreDiario.findOneAndUpdate(
      { fecha: fechaCierre },
      datosCierre,
      { upsert: true, new: true }
    );
    
    res.json(cierre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/cierres/:id/cerrar - Cerrar cierre diario
router.put('/:id/cerrar', async (req, res) => {
  try {
    const { usuario } = req.body;
    
    const cierre = await CierreDiario.findByIdAndUpdate(
      req.params.id,
      {
        estado: 'cerrado',
        fechaCierre: new Date(),
        usuarioCierre: usuario || 'Sistema'
      },
      { new: true }
    );
    
    if (!cierre) {
      return res.status(404).json({ message: 'Cierre no encontrado' });
    }
    
    res.json(cierre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/cierres/turno/actual - Obtener turno actual
router.get('/turno/actual', (req, res) => {
  const hour = new Date().getHours();
  const turno = (hour >= 8 && hour < 18) ? 'administrativo' : 'operativo';
  
  res.json({
    turno,
    hora: new Date().toLocaleTimeString('es-CO'),
    fecha: new Date().toLocaleDateString('es-CO')
  });
});

module.exports = router;