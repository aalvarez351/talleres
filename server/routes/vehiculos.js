const express = require('express');
const Vehiculo = require('../models/Vehiculo');

const router = express.Router();

// Get all vehiculos
router.get('/', async (req, res) => {
  try {
    const vehiculos = await Vehiculo.find().populate('cliente');
    res.json(vehiculos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get vehiculos by cliente
router.get('/cliente/:clienteId', async (req, res) => {
  try {
    const vehiculos = await Vehiculo.find({ cliente: req.params.clienteId }).populate('cliente');
    res.json(vehiculos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one vehiculo
router.get('/:id', async (req, res) => {
  try {
    const vehiculo = await Vehiculo.findById(req.params.id).populate('cliente');
    if (!vehiculo) return res.status(404).json({ message: 'Vehiculo not found' });
    res.json(vehiculo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create vehiculo
router.post('/', async (req, res) => {
  const vehiculo = new Vehiculo(req.body);
  try {
    const newVehiculo = await vehiculo.save();
    res.status(201).json(newVehiculo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update vehiculo
router.put('/:id', async (req, res) => {
  try {
    const vehiculo = await Vehiculo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vehiculo) return res.status(404).json({ message: 'Vehiculo not found' });
    res.json(vehiculo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete vehiculo
router.delete('/:id', async (req, res) => {
  try {
    const vehiculo = await Vehiculo.findByIdAndDelete(req.params.id);
    if (!vehiculo) return res.status(404).json({ message: 'Vehiculo not found' });
    res.json({ message: 'Vehiculo deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;