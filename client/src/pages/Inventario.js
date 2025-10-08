import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Inventario = () => {
  const [repuestos, setRepuestos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRepuesto, setEditingRepuesto] = useState(null);
  const [form, setForm] = useState({ nombre: '', costo: 0, precio: 0, stock: 0 });

  useEffect(() => {
    fetchRepuestos();
  }, []);

  const fetchRepuestos = async () => {
    try {
      const res = await api.get('/repuestos');
      setRepuestos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRepuesto) {
        await api.put(`/repuestos/${editingRepuesto._id}`, form);
      } else {
        await api.post('/repuestos', form);
      }
      fetchRepuestos();
      setShowModal(false);
      setForm({ nombre: '', costo: 0, precio: 0, stock: 0 });
      setEditingRepuesto(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (repuesto) => {
    setEditingRepuesto(repuesto);
    setForm(repuesto);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar repuesto?')) {
      try {
        await api.delete(`/repuestos/${id}`);
        fetchRepuestos();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openModal = () => {
    setEditingRepuesto(null);
    setForm({ nombre: '', costo: 0, precio: 0, stock: 0 });
    setShowModal(true);
  };

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Inventario de Repuestos</h4>
            <button className="btn btn-primary btn-sm" onClick={openModal}>+ Nuevo Repuesto</button>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead className="text-primary">
                  <tr>
                    <th>Nombre</th>
                    <th>Costo</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {repuestos.map(repuesto => (
                    <tr key={repuesto._id}>
                      <td>{repuesto.nombre}</td>
                      <td>${repuesto.costo}</td>
                      <td>${repuesto.precio}</td>
                      <td className={repuesto.stock < 10 ? 'text-danger' : ''}>{repuesto.stock}</td>
                      <td>
                        <button className="btn btn-sm btn-info" onClick={() => handleEdit(repuesto)}>Editar</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(repuesto._id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingRepuesto ? 'Editar Repuesto' : 'Nuevo Repuesto'}</h5>
                <button type="button" className="close" onClick={() => setShowModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Nombre</label>
                    <input type="text" className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Costo</label>
                    <input type="number" className="form-control" value={form.costo} onChange={(e) => setForm({ ...form, costo: parseFloat(e.target.value) || 0 })} min="0" step="0.01" required />
                  </div>
                  <div className="form-group">
                    <label>Precio</label>
                    <input type="number" className="form-control" value={form.precio} onChange={(e) => setForm({ ...form, precio: parseFloat(e.target.value) || 0 })} min="0" step="0.01" required />
                  </div>
                  <div className="form-group">
                    <label>Stock</label>
                    <input type="number" className="form-control" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} min="0" required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventario;