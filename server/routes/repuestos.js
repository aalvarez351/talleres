const express = require('express');
const Repuesto = require('../models/Repuesto');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all repuestos
router.get('/', auth, async (req, res) => {
  try {
    const repuestos = await Repuesto.find();
    res.json(repuestos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one repuesto
router.get('/:id', auth, async (req, res) => {
  try {
    const repuesto = await Repuesto.findById(req.params.id);
    if (!repuesto) return res.status(404).json({ message: 'Repuesto not found' });
    res.json(repuesto);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create repuesto
router.post('/', auth, async (req, res) => {
  const repuesto = new Repuesto(req.body);
  try {
    const newRepuesto = await repuesto.save();
    res.status(201).json(newRepuesto);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update repuesto
router.put('/:id', auth, async (req, res) => {
  try {
    const repuesto = await Repuesto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!repuesto) return res.status(404).json({ message: 'Repuesto not found' });
    res.json(repuesto);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete repuesto
router.delete('/:id', auth, async (req, res) => {
  try {
    const repuesto = await Repuesto.findByIdAndDelete(req.params.id);
    if (!repuesto) return res.status(404).json({ message: 'Repuesto not found' });
    res.json({ message: 'Repuesto deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;