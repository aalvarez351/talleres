const express = require('express');
const Orden = require('../models/Orden');
const Repuesto = require('../models/Repuesto');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all ordenes
router.get('/', auth, async (req, res) => {
  try {
    const ordenes = await Orden.find().populate('cliente vehiculo repuestos.repuesto');
    res.json(ordenes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one orden
router.get('/:id', auth, async (req, res) => {
  try {
    const orden = await Orden.findById(req.params.id).populate('cliente vehiculo repuestos.repuesto');
    if (!orden) return res.status(404).json({ message: 'Orden not found' });
    res.json(orden);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create orden
router.post('/', auth, async (req, res) => {
  const { cliente, vehiculo, descripcion, repuestos, manoDeObra } = req.body;
  // Generate numero: OS-2025-001, etc.
  const count = await Orden.countDocuments();
  const numero = `OS-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
  const total = repuestos.reduce((sum, r) => sum + r.cantidad * r.costo, 0) + manoDeObra;
  const orden = new Orden({ numero, cliente, vehiculo, descripcion, repuestos, manoDeObra, total });
  try {
    const newOrden = await orden.save();
    res.status(201).json(newOrden);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update orden (including status)
router.put('/:id', auth, async (req, res) => {
  try {
    const orden = await Orden.findById(req.params.id);
    if (!orden) return res.status(404).json({ message: 'Orden not found' });

    const oldStatus = orden.estado;
    const newStatus = req.body.estado;

    // If completing order, update stock
    if (oldStatus !== 'Completado' && newStatus === 'Completado') {
      for (const r of orden.repuestos) {
        await Repuesto.findByIdAndUpdate(r.repuesto, { $inc: { stock: -r.cantidad } });
      }
    }

    const updatedOrden = await Orden.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('cliente vehiculo repuestos.repuesto');
    res.json(updatedOrden);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete orden
router.delete('/:id', auth, async (req, res) => {
  try {
    const orden = await Orden.findByIdAndDelete(req.params.id);
    if (!orden) return res.status(404).json({ message: 'Orden not found' });
    res.json({ message: 'Orden deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;