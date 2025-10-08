import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Ordenes = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [repuestos, setRepuestos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    cliente: '',
    vehiculo: '',
    descripcion: '',
    repuestos: [],
    manoDeObra: 0,
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchOrdenes();
    fetchClientes();
    fetchRepuestos();
  }, []);

  useEffect(() => {
    if (form.cliente) {
      fetchVehiculosByCliente(form.cliente);
    }
  }, [form.cliente]);

  useEffect(() => {
    calculateTotal();
  }, [form.repuestos, form.manoDeObra]);

  const fetchOrdenes = async () => {
    try {
      const res = await api.get('/ordenes');
      setOrdenes(res.data);
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

  const fetchVehiculosByCliente = async (clienteId) => {
    try {
      const res = await api.get(`/vehiculos/cliente/${clienteId}`);
      setVehiculos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRepuestos = async () => {
    try {
      const res = await api.get('/repuestos');
      setRepuestos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateTotal = () => {
    const repuestosTotal = form.repuestos.reduce((sum, r) => sum + (r.cantidad * r.costo), 0);
    setTotal(repuestosTotal + parseFloat(form.manoDeObra || 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/ordenes', { ...form, total });
      fetchOrdenes();
      setShowModal(false);
      setForm({
        cliente: '',
        vehiculo: '',
        descripcion: '',
        repuestos: [],
        manoDeObra: 0,
      });
      setTotal(0);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/ordenes/${id}`, { estado: status });
      fetchOrdenes();
    } catch (err) {
      console.error(err);
    }
  };

  const addRepuesto = () => {
    setForm({
      ...form,
      repuestos: [...form.repuestos, { repuesto: '', cantidad: 1, costo: 0 }]
    });
  };

  const updateRepuesto = (index, field, value) => {
    const newRepuestos = [...form.repuestos];
    newRepuestos[index][field] = value;
    if (field === 'repuesto') {
      const rep = repuestos.find(r => r._id === value);
      newRepuestos[index].costo = rep ? rep.costo : 0;
    }
    setForm({ ...form, repuestos: newRepuestos });
  };

  const removeRepuesto = (index) => {
    setForm({
      ...form,
      repuestos: form.repuestos.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Órdenes de Servicio</h4>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Nueva Orden</button>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead className="text-primary">
                  <tr>
                    <th>Número</th>
                    <th>Cliente</th>
                    <th>Vehículo</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenes.map(orden => (
                    <tr key={orden._id}>
                      <td>{orden.numero}</td>
                      <td>{orden.cliente.nombre}</td>
                      <td>{orden.vehiculo.marca} {orden.vehiculo.modelo} ({orden.vehiculo.placa})</td>
                      <td>
                        <select value={orden.estado} onChange={(e) => updateStatus(orden._id, e.target.value)}>
                          <option value="Pendiente">Pendiente</option>
                          <option value="En progreso">En progreso</option>
                          <option value="Completado">Completado</option>
                          <option value="Entregado">Entregado</option>
                        </select>
                      </td>
                      <td>${orden.total}</td>
                      <td>
                        <button className="btn btn-sm btn-info">Ver Detalles</button>
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
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nueva Orden</h5>
                <button type="button" className="close" onClick={() => setShowModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Cliente</label>
                    <select className="form-control" value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value, vehiculo: '' })} required>
                      <option value="">Seleccionar cliente</option>
                      {clientes.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Vehículo</label>
                    <select className="form-control" value={form.vehiculo} onChange={(e) => setForm({ ...form, vehiculo: e.target.value })} required>
                      <option value="">Seleccionar vehículo</option>
                      {vehiculos.map(v => <option key={v._id} value={v._id}>{v.marca} {v.modelo} ({v.placa})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Descripción del Trabajo</label>
                    <textarea className="form-control" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Repuestos</label>
                    {form.repuestos.map((r, index) => (
                      <div key={index} className="d-flex mb-2">
                        <select className="form-control mr-2" value={r.repuesto} onChange={(e) => updateRepuesto(index, 'repuesto', e.target.value)} required>
                          <option value="">Seleccionar repuesto</option>
                          {repuestos.map(rep => <option key={rep._id} value={rep._id}>{rep.nombre} (${rep.costo})</option>)}
                        </select>
                        <input type="number" className="form-control mr-2" placeholder="Cantidad" value={r.cantidad} onChange={(e) => updateRepuesto(index, 'cantidad', parseInt(e.target.value))} min="1" required />
                        <button type="button" className="btn btn-danger" onClick={() => removeRepuesto(index)}>X</button>
                      </div>
                    ))}
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addRepuesto}>+ Agregar Repuesto</button>
                  </div>
                  <div className="form-group">
                    <label>Mano de Obra ($)</label>
                    <input type="number" className="form-control" value={form.manoDeObra} onChange={(e) => setForm({ ...form, manoDeObra: parseFloat(e.target.value) || 0 })} min="0" step="0.01" required />
                  </div>
                  <div className="form-group">
                    <strong>Total: ${total.toFixed(2)}</strong>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Crear Orden</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ordenes;