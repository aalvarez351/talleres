import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Vehiculos = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [filteredVehiculos, setFilteredVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filter, setFilter] = useState({ cliente: '', placa: '', marca: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState(null);
  const [form, setForm] = useState({ cliente: '', marca: '', modelo: '', ano: '', placa: '', kilometraje: '' });

  useEffect(() => {
    fetchVehiculos();
    fetchClientes();
  }, []);

  useEffect(() => {
    setFilteredVehiculos(vehiculos.filter(v =>
      (filter.cliente === '' || v.cliente._id === filter.cliente) &&
      v.placa.toLowerCase().includes(filter.placa.toLowerCase()) &&
      v.marca.toLowerCase().includes(filter.marca.toLowerCase())
    ));
  }, [vehiculos, filter]);

  const fetchVehiculos = async () => {
    try {
      const res = await api.get('/vehiculos');
      setVehiculos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

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
      if (editingVehiculo) {
        await api.put(`/vehiculos/${editingVehiculo._id}`, form);
      } else {
        await api.post('/vehiculos', form);
      }
      fetchVehiculos();
      setShowModal(false);
      setForm({ cliente: '', marca: '', modelo: '', ano: '', placa: '', kilometraje: '' });
      setEditingVehiculo(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (vehiculo) => {
    setEditingVehiculo(vehiculo);
    setForm({ ...vehiculo, cliente: vehiculo.cliente._id });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar vehículo?')) {
      try {
        await api.delete(`/vehiculos/${id}`);
        fetchVehiculos();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openModal = () => {
    setEditingVehiculo(null);
    setForm({ cliente: '', marca: '', modelo: '', ano: '', placa: '', kilometraje: '' });
    setShowModal(true);
  };

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Vehículos</h4>
            <div className="d-flex justify-content-between">
              <div className="d-flex">
                <select className="form-control mr-2" value={filter.cliente} onChange={(e) => setFilter({ ...filter, cliente: e.target.value })}>
                  <option value="">Todos los clientes</option>
                  {clientes.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
                </select>
                <input type="text" className="form-control mr-2" placeholder="Placa" value={filter.placa} onChange={(e) => setFilter({ ...filter, placa: e.target.value })} />
                <input type="text" className="form-control mr-2" placeholder="Marca" value={filter.marca} onChange={(e) => setFilter({ ...filter, marca: e.target.value })} />
              </div>
              <button className="btn btn-primary btn-sm" onClick={openModal}>+ Nuevo Vehículo</button>
            </div>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead className="text-primary">
                  <tr>
                    <th>Cliente</th>
                    <th>Marca</th>
                    <th>Modelo</th>
                    <th>Año</th>
                    <th>Placa</th>
                    <th>Kilometraje</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehiculos.map(vehiculo => (
                    <tr key={vehiculo._id}>
                      <td>{vehiculo.cliente.nombre}</td>
                      <td>{vehiculo.marca}</td>
                      <td>{vehiculo.modelo}</td>
                      <td>{vehiculo.ano}</td>
                      <td>{vehiculo.placa}</td>
                      <td>{vehiculo.kilometraje}</td>
                      <td>
                        <button className="btn btn-sm btn-info" onClick={() => handleEdit(vehiculo)}>Editar</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(vehiculo._id)}>Eliminar</button>
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
                <h5 className="modal-title">{editingVehiculo ? 'Editar Vehículo' : 'Nuevo Vehículo'}</h5>
                <button type="button" className="close" onClick={() => setShowModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Cliente</label>
                    <select className="form-control" value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} required>
                      <option value="">Seleccionar cliente</option>
                      {clientes.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Marca</label>
                    <input type="text" className="form-control" value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Modelo</label>
                    <input type="text" className="form-control" value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Año</label>
                    <input type="number" className="form-control" value={form.ano} onChange={(e) => setForm({ ...form, ano: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Placa</label>
                    <input type="text" className="form-control" value={form.placa} onChange={(e) => setForm({ ...form, placa: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Kilometraje</label>
                    <input type="number" className="form-control" value={form.kilometraje} onChange={(e) => setForm({ ...form, kilometraje: e.target.value })} required />
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

export default Vehiculos;