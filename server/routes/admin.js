const express = require('express');
const router = express.Router();
const Taller = require('../models/Taller');
const Pago = require('../models/Pago');

// Middleware para verificar admin global
const isGlobalAdmin = (req, res, next) => {
  const { email } = req.body;
  if (email === 'aalvarez351@gmail.com') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado' });
  }
};

// GET /api/admin/talleres - Obtener todos los talleres
router.get('/talleres', async (req, res) => {
  try {
    const talleres = await Taller.find().sort({ fechaCreacion: -1 });
    res.json(talleres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/talleres - Crear nuevo taller
router.post('/talleres', async (req, res) => {
  try {
    const {
      nombre, email, telefono, direccion, ciudad,
      plan, administrador, valorMensualidad
    } = req.body;

    // Configurar límites según plan
    const limites = {
      gratuito: { ordenes: 5, valor: 0 },
      basico: { ordenes: 50, valor: 70 },
      premium: { ordenes: -1, valor: 180 }
    };

    const limite = limites[plan] || limites.gratuito;

    const taller = new Taller({
      nombre,
      email,
      telefono,
      direccion,
      ciudad,
      plan,
      limiteOrdenes: limite.ordenes,
      valorMensualidad: valorMensualidad || limite.valor,
      administrador,
      proximoPago: plan !== 'gratuito' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null
    });

    const nuevoTaller = await taller.save();
    res.status(201).json(nuevoTaller);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/admin/talleres/:id - Actualizar taller
router.put('/talleres/:id', async (req, res) => {
  try {
    const taller = await Taller.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!taller) {
      return res.status(404).json({ message: 'Taller no encontrado' });
    }
    res.json(taller);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/admin/talleres/:id - Eliminar taller
router.delete('/talleres/:id', async (req, res) => {
  try {
    const taller = await Taller.findByIdAndDelete(req.params.id);
    if (!taller) {
      return res.status(404).json({ message: 'Taller no encontrado' });
    }
    res.json({ message: 'Taller eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/pagos - Obtener todos los pagos
router.get('/pagos', async (req, res) => {
  try {
    const pagos = await Pago.find()
      .populate('taller', 'nombre email plan')
      .sort({ fecha: -1 });
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/pagos - Registrar pago
router.post('/pagos', async (req, res) => {
  try {
    const { tallerId, monto, metodoPago, referencia, notas } = req.body;
    
    const taller = await Taller.findById(tallerId);
    if (!taller) {
      return res.status(404).json({ message: 'Taller no encontrado' });
    }

    // Calcular período del pago
    const inicio = taller.ultimoPago || taller.fechaCreacion;
    const fin = new Date(inicio);
    fin.setMonth(fin.getMonth() + 1);

    const pago = new Pago({
      taller: tallerId,
      monto,
      metodoPago,
      referencia,
      notas,
      estado: 'confirmado',
      periodo: { inicio, fin }
    });

    await pago.save();

    // Actualizar fechas del taller
    taller.ultimoPago = new Date();
    taller.proximoPago = taller.calcularProximoPago();
    await taller.save();

    res.status(201).json(pago);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/admin/dashboard - Dashboard del admin global
router.get('/dashboard', async (req, res) => {
  try {
    const totalTalleres = await Taller.countDocuments();
    const talleresActivos = await Taller.countDocuments({ estado: 'activo' });
    const talleresSuspendidos = await Taller.countDocuments({ estado: 'suspendido' });
    
    const ingresosMes = await Pago.aggregate([
      {
        $match: {
          fecha: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          },
          estado: 'confirmado'
        }
      },
      { $group: { _id: null, total: { $sum: '$monto' } } }
    ]);

    const talleresPorPlan = await Taller.aggregate([
      { $group: { _id: '$plan', count: { $sum: 1 } } }
    ]);

    const pagosVencidos = await Taller.countDocuments({
      plan: { $ne: 'gratuito' },
      proximoPago: { $lt: new Date() }
    });

    res.json({
      totalTalleres,
      talleresActivos,
      talleresSuspendidos,
      ingresosMes: ingresosMes[0]?.total || 0,
      talleresPorPlan,
      pagosVencidos
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;