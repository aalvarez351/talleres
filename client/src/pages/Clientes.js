import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', direccion: '' });

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    setFilteredClientes(clientes.filter(c => c.nombre.toLowerCase().includes(search.toLowerCase()) || c.telefono.includes(search)));
  }, [clientes, search]);

  const fetchClientes = async () => {
    try {
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCliente) {
        await api.put(`/clientes/${editingCliente._id}`, form);
      } else {
        await api.post('/clientes', form);
      }
      fetchClientes();
      setShowModal(false);
      setForm({ nombre: '', telefono: '', email: '', direccion: '' });
      setEditingCliente(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setForm(cliente);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar cliente?')) {
      try {
        await api.delete(`/clientes/${id}`);
        fetchClientes();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openModal = () => {
    setEditingCliente(null);
    setForm({ nombre: '', telefono: '', email: '', direccion: '' });
    setShowModal(true);
  };

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Clientes</h4>
            <div className="d-flex justify-content-between">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre o teléfono"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '300px' }}
              />
              <button className="btn btn-primary btn-sm" onClick={openModal}>+ Nuevo Cliente</button>
            </div>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead className="text-primary">
                  <tr>
                    <th>Nombre</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Dirección</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClientes.map(cliente => (
                    <tr key={cliente._id}>
                      <td>{cliente.nombre}</td>
                      <td>{cliente.telefono}</td>
                      <td>{cliente.email}</td>
                      <td>{cliente.direccion}</td>
                      <td>
                        <button className="btn btn-sm btn-info" onClick={() => handleEdit(cliente)}>Editar</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cliente._id)}>Eliminar</button>
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
                <h5 className="modal-title">{editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h5>
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
                    <label>Teléfono</label>
                    <input type="text" className="form-control" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Dirección</label>
                    <input type="text" className="form-control" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
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

export default Clientes;