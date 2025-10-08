const express = require('express');
const Cliente = require('../models/Cliente');

const router = express.Router();

// Get all clientes
router.get('/', async (req, res) => {
  try {
    const clientes = await Cliente.find().populate('cliente');
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one cliente
router.get('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) return res.status(404).json({ message: 'Cliente not found' });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create cliente
router.post('/', async (req, res) => {
  const cliente = new Cliente(req.body);
  try {
    const newCliente = await cliente.save();
    res.status(201).json(newCliente);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update cliente
router.put('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cliente) return res.status(404).json({ message: 'Cliente not found' });
    res.json(cliente);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete cliente
router.delete('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    if (!cliente) return res.status(404).json({ message: 'Cliente not found' });
    res.json({ message: 'Cliente deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;