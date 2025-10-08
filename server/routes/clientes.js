const express = require('express');
const Cliente = require('../models/Cliente');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all clientes
router.get('/', auth, async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one cliente
router.get('/:id', auth, async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) return res.status(404).json({ message: 'Cliente not found' });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create cliente
router.post('/', auth, async (req, res) => {
  const cliente = new Cliente(req.body);
  try {
    const newCliente = await cliente.save();
    res.status(201).json(newCliente);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update cliente
router.put('/:id', auth, async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cliente) return res.status(404).json({ message: 'Cliente not found' });
    res.json(cliente);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete cliente
router.delete('/:id', auth, async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    if (!cliente) return res.status(404).json({ message: 'Cliente not found' });
    res.json({ message: 'Cliente deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;