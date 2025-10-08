const express = require('express');
const Orden = require('../models/Orden');

const router = express.Router();

// Get all ordenes
router.get('/', async (req, res) => {
  try {
    const ordenes = await Orden.find().populate('cliente').populate('vehiculo');
    res.json(ordenes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one orden
router.get('/:id', async (req, res) => {
  try {
    const orden = await Orden.findById(req.params.id).populate('cliente').populate('vehiculo');
    if (!orden) return res.status(404).json({ message: 'Orden not found' });
    res.json(orden);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create orden
router.post('/', async (req, res) => {
  const orden = new Orden(req.body);
  try {
    const newOrden = await orden.save();
    res.status(201).json(newOrden);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update orden
router.put('/:id', async (req, res) => {
  try {
    const orden = await Orden.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!orden) return res.status(404).json({ message: 'Orden not found' });
    res.json(orden);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete orden
router.delete('/:id', async (req, res) => {
  try {
    const orden = await Orden.findByIdAndDelete(req.params.id);
    if (!orden) return res.status(404).json({ message: 'Orden not found' });
    res.json({ message: 'Orden deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;