import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Reportes = () => {
  const [reportes, setReportes] = useState({
    ingresosDiarios: 0,
    ingresosMensuales: 0,
    serviciosCompletados: 0,
    totalesPorCliente: [],
    totalesPorVehiculo: [],
  });

  useEffect(() => {
    fetchReportes();
  }, []);

  const fetchReportes = async () => {
    try {
      const [ordenesRes, clientesRes, vehiculosRes] = await Promise.all([
        api.get('/ordenes'),
        api.get('/clientes'),
        api.get('/vehiculos'),
      ]);

      const ordenes = ordenesRes.data;
      const clientes = clientesRes.data;
      const vehiculos = vehiculosRes.data;

      const today = new Date().toISOString().split('T')[0];
      const thisMonth = today.substring(0, 7);

      const ingresosDiarios = ordenes
        .filter(o => o.createdAt.split('T')[0] === today && o.estado === 'Completado')
        .reduce((sum, o) => sum + o.total, 0);

      const ingresosMensuales = ordenes
        .filter(o => o.createdAt.substring(0, 7) === thisMonth && o.estado === 'Completado')
        .reduce((sum, o) => sum + o.total, 0);

      const serviciosCompletados = ordenes.filter(o => o.estado === 'Completado').length;

      const totalesPorCliente = clientes.map(cliente => {
        const clienteOrdenes = ordenes.filter(o => o.cliente._id === cliente._id && o.estado === 'Completado');
        return {
          cliente: cliente.nombre,
          total: clienteOrdenes.reduce((sum, o) => sum + o.total, 0),
          servicios: clienteOrdenes.length,
        };
      }).filter(c => c.total > 0);

      const totalesPorVehiculo = vehiculos.map(vehiculo => {
        const vehiculoOrdenes = ordenes.filter(o => o.vehiculo._id === vehiculo._id && o.estado === 'Completado');
        return {
          vehiculo: `${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.placa})`,
          cliente: vehiculo.cliente.nombre,
          total: vehiculoOrdenes.reduce((sum, o) => sum + o.total, 0),
          servicios: vehiculoOrdenes.length,
        };
      }).filter(v => v.total > 0);

      setReportes({
        ingresosDiarios,
        ingresosMensuales,
        serviciosCompletados,
        totalesPorCliente,
        totalesPorVehiculo,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-4 col-md-6 col-sm-6">
          <div className="card card-stats">
            <div className="card-body">
              <div className="row">
                <div className="col-5 col-md-4">
                  <div className="icon-big text-center icon-success">
                    <i className="nc-icon nc-money-coins text-success"></i>
                  </div>
                </div>
                <div className="col-7 col-md-8">
                  <div className="numbers">
                    <p className="card-category">Ingresos Diarios</p>
                    <p className="card-title">${reportes.ingresosDiarios}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <hr />
              <div className="stats">
                <i className="fa fa-calendar-o"></i> Hoy
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6 col-sm-6">
          <div className="card card-stats">
            <div className="card-body">
              <div className="row">
                <div className="col-5 col-md-4">
                  <div className="icon-big text-center icon-info">
                    <i className="nc-icon nc-money-coins text-info"></i>
                  </div>
                </div>
                <div className="col-7 col-md-8">
                  <div className="numbers">
                    <p className="card-category">Ingresos Mensuales</p>
                    <p className="card-title">${reportes.ingresosMensuales}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <hr />
              <div className="stats">
                <i className="fa fa-calendar"></i> Este mes
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6 col-sm-6">
          <div className="card card-stats">
            <div className="card-body">
              <div className="row">
                <div className="col-5 col-md-4">
                  <div className="icon-big text-center icon-primary">
                    <i className="nc-icon nc-check-2 text-primary"></i>
                  </div>
                </div>
                <div className="col-7 col-md-8">
                  <div className="numbers">
                    <p className="card-category">Servicios Completados</p>
                    <p className="card-title">{reportes.serviciosCompletados}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <hr />
              <div className="stats">
                <i className="fa fa-refresh"></i> Total
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Totales por Cliente</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead className="text-primary">
                    <tr>
                      <th>Cliente</th>
                      <th>Servicios</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportes.totalesPorCliente.map((item, index) => (
                      <tr key={index}>
                        <td>{item.cliente}</td>
                        <td>{item.servicios}</td>
                        <td>${item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Totales por Vehículo</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead className="text-primary">
                    <tr>
                      <th>Vehículo</th>
                      <th>Cliente</th>
                      <th>Servicios</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportes.totalesPorVehiculo.map((item, index) => (
                      <tr key={index}>
                        <td>{item.vehiculo}</td>
                        <td>{item.cliente}</td>
                        <td>{item.servicios}</td>
                        <td>${item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;