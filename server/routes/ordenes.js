const express = require('express');
const Orden = require('../models/Orden');
const Repuesto = require('../models/Repuesto');

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
  try {
    const { repuestos, manoDeObra, ...ordenData } = req.body;
    
    // Verificar stock de repuestos
    let totalRepuestos = 0;
    const repuestosValidados = [];
    
    if (repuestos && repuestos.length > 0) {
      for (const item of repuestos) {
        const repuesto = await Repuesto.findById(item.repuesto);
        if (!repuesto) {
          return res.status(400).json({ message: `Repuesto ${item.repuesto} no encontrado` });
        }
        if (repuesto.stock < item.cantidad) {
          return res.status(400).json({ message: `Stock insuficiente para ${repuesto.nombre}. Disponible: ${repuesto.stock}` });
        }
        
        const costoItem = item.cantidad * repuesto.precio;
        totalRepuestos += costoItem;
        
        repuestosValidados.push({
          repuesto: item.repuesto,
          nombre: repuesto.nombre,
          cantidad: item.cantidad,
          precio: repuesto.precio,
          costo: costoItem
        });
      }
    }
    
    // Calcular subtotal y total con impuesto
    const subtotal = totalRepuestos + (manoDeObra || 0);
    const impuesto = subtotal * 0.07; // 7% por ley
    const total = subtotal + impuesto;
    
    // Crear orden con totales calculados
    const orden = new Orden({
      ...ordenData,
      repuestos: repuestosValidados,
      manoDeObra: manoDeObra || 0,
      subtotal: subtotal,
      impuesto: impuesto,
      total: total
    });
    
    const newOrden = await orden.save();
    
    // Descontar repuestos del inventario
    for (const item of repuestosValidados) {
      await Repuesto.findByIdAndUpdate(
        item.repuesto,
        { $inc: { stock: -item.cantidad } }
      );
    }
    
    res.status(201).json(newOrden);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update orden
router.put('/:id', async (req, res) => {
  try {
    const ordenExistente = await Orden.findById(req.params.id);
    if (!ordenExistente) return res.status(404).json({ message: 'Orden not found' });
    
    const { repuestos, manoDeObra, ...updateData } = req.body;
    
    // Si se actualizan repuestos, manejar inventario
    if (repuestos !== undefined) {
      // Restaurar stock de repuestos anteriores
      if (ordenExistente.repuestos && ordenExistente.repuestos.length > 0) {
        for (const item of ordenExistente.repuestos) {
          await Repuesto.findByIdAndUpdate(
            item.repuesto,
            { $inc: { stock: item.cantidad } }
          );
        }
      }
      
      // Validar y descontar nuevos repuestos
      let totalRepuestos = 0;
      const repuestosValidados = [];
      
      if (repuestos.length > 0) {
        for (const item of repuestos) {
          const repuesto = await Repuesto.findById(item.repuesto);
          if (!repuesto) {
            return res.status(400).json({ message: `Repuesto ${item.repuesto} no encontrado` });
          }
          if (repuesto.stock < item.cantidad) {
            return res.status(400).json({ message: `Stock insuficiente para ${repuesto.nombre}. Disponible: ${repuesto.stock}` });
          }
          
          const costoItem = item.cantidad * repuesto.precio;
          totalRepuestos += costoItem;
          
          repuestosValidados.push({
            repuesto: item.repuesto,
            nombre: repuesto.nombre,
            cantidad: item.cantidad,
            precio: repuesto.precio,
            costo: costoItem
          });
          
          // Descontar del inventario
          await Repuesto.findByIdAndUpdate(
            item.repuesto,
            { $inc: { stock: -item.cantidad } }
          );
        }
      }
      
      const subtotal = totalRepuestos + (manoDeObra !== undefined ? manoDeObra : ordenExistente.manoDeObra);
      const impuesto = subtotal * 0.07;
      const total = subtotal + impuesto;
      
      updateData.repuestos = repuestosValidados;
      updateData.subtotal = subtotal;
      updateData.impuesto = impuesto;
      updateData.total = total;
    }
    
    if (manoDeObra !== undefined) {
      updateData.manoDeObra = manoDeObra;
      if (repuestos === undefined) {
        const totalRepuestos = ordenExistente.repuestos?.reduce((sum, item) => sum + item.costo, 0) || 0;
        const subtotal = totalRepuestos + manoDeObra;
        const impuesto = subtotal * 0.07;
        updateData.subtotal = subtotal;
        updateData.impuesto = impuesto;
        updateData.total = subtotal + impuesto;
      }
    }
    
    const orden = await Orden.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(orden);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete orden
router.delete('/:id', async (req, res) => {
  try {
    const orden = await Orden.findById(req.params.id);
    if (!orden) return res.status(404).json({ message: 'Orden not found' });
    
    // Restaurar stock de repuestos al inventario
    if (orden.repuestos && orden.repuestos.length > 0) {
      for (const item of orden.repuestos) {
        await Repuesto.findByIdAndUpdate(
          item.repuesto,
          { $inc: { stock: item.cantidad } }
        );
      }
    }
    
    await Orden.findByIdAndDelete(req.params.id);
    res.json({ message: 'Orden deleted and inventory restored' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add parts to existing order
router.post('/:id/repuestos', async (req, res) => {
  try {
    const { repuestos } = req.body;
    const orden = await Orden.findById(req.params.id);
    
    if (!orden) return res.status(404).json({ message: 'Orden not found' });
    
    // Validar stock
    let totalNuevosRepuestos = 0;
    const repuestosValidados = [];
    
    for (const item of repuestos) {
      const repuesto = await Repuesto.findById(item.repuesto);
      if (!repuesto) {
        return res.status(400).json({ message: `Repuesto ${item.repuesto} no encontrado` });
      }
      if (repuesto.stock < item.cantidad) {
        return res.status(400).json({ message: `Stock insuficiente para ${repuesto.nombre}. Disponible: ${repuesto.stock}` });
      }
      
      const costoItem = item.cantidad * repuesto.precio;
      totalNuevosRepuestos += costoItem;
      
      repuestosValidados.push({
        repuesto: item.repuesto,
        nombre: repuesto.nombre,
        cantidad: item.cantidad,
        precio: repuesto.precio,
        costo: costoItem
      });
    }
    
    // Calcular nuevo subtotal y total
    const repuestosActualizados = [...(orden.repuestos || []), ...repuestosValidados];
    const nuevoSubtotal = (orden.subtotal || orden.total / 1.07) + totalNuevosRepuestos;
    const nuevoImpuesto = nuevoSubtotal * 0.07;
    const nuevoTotal = nuevoSubtotal + nuevoImpuesto;
    
    const ordenActualizada = await Orden.findByIdAndUpdate(
      req.params.id,
      {
        repuestos: repuestosActualizados,
        subtotal: nuevoSubtotal,
        impuesto: nuevoImpuesto,
        total: nuevoTotal
      },
      { new: true }
    );
    
    // Descontar del inventario
    for (const item of repuestosValidados) {
      await Repuesto.findByIdAndUpdate(
        item.repuesto,
        { $inc: { stock: -item.cantidad } }
      );
    }
    
    res.json(ordenActualizada);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;