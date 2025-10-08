import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalVehiculos: 0,
    ordenesHoy: 0,
    ingresosHoy: 0,
    pendientes: 0,
    completadas: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [clientesRes, vehiculosRes, ordenesRes, repuestosRes] = await Promise.all([
        api.get('/clientes'),
        api.get('/vehiculos'),
        api.get('/ordenes'),
        api.get('/repuestos'),
      ]);

      const clientes = clientesRes.data;
      const vehiculos = vehiculosRes.data;
      const ordenes = ordenesRes.data;
      const repuestos = repuestosRes.data;

      // Calcular estadísticas
      const today = new Date().toISOString().split('T')[0];
      const ordenesHoy = ordenes.filter(o => o.createdAt.split('T')[0] === today);
      const ingresosHoy = ordenesHoy.reduce((sum, o) => sum + o.total, 0);
      const pendientes = ordenes.filter(o => o.estado === 'Pendiente').length;
      const completadas = ordenes.filter(o => o.estado === 'Completado').length;

      setStats({
        totalClientes: clientes.length,
        totalVehiculos: vehiculos.length,
        ordenesHoy: ordenesHoy.length,
        ingresosHoy,
        pendientes,
        completadas,
      });

      // Órdenes recientes
      setRecentOrders(ordenes.slice(-5).reverse());

      // Repuestos con stock bajo (<10)
      setLowStock(repuestos.filter(r => r.stock < 10));
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  if (!user) return <div>Cargando...</div>;

  const renderAdminDashboard = () => (
    <div>
      <h3>Dashboard Administrador</h3>
      <div className="row">
        <div className="col-lg-3 col-md-6 col-sm-6">
          <div className="card card-stats">
            <div className="card-body">
              <div className="row">
                <div className="col-5 col-md-4">
                  <div className="icon-big text-center icon-warning">
                    <i className="nc-icon nc-paper text-warning"></i>
                  </div>
                </div>
                <div className="col-7 col-md-8">
                  <div className="numbers">
                    <p className="card-category">Órdenes Hoy</p>
                    <p className="card-title">{stats.ordenesHoy}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <hr />
              <div className="stats">
                <i className="fa fa-refresh"></i> Actualizado ahora
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 col-sm-6">
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
                    <p className="card-category">Ingresos Hoy</p>
                    <p className="card-title">${stats.ingresosHoy}</p>
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
        <div className="col-lg-3 col-md-6 col-sm-6">
          <div className="card card-stats">
            <div className="card-body">
              <div className="row">
                <div className="col-5 col-md-4">
                  <div className="icon-big text-center icon-danger">
                    <i className="nc-icon nc-time-alarm text-danger"></i>
                  </div>
                </div>
                <div className="col-7 col-md-8">
                  <div className="numbers">
                    <p className="card-category">Pendientes</p>
                    <p className="card-title">{stats.pendientes}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <hr />
              <div className="stats">
                <i className="fa fa-clock-o"></i> En progreso
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 col-sm-6">
          <div className="card card-stats">
            <div className="card-body">
              <div className="row">
                <div className="col-5 col-md-4">
                  <div className="icon-big text-center icon-primary">
                    <i className="nc-icon nc-single-02 text-primary"></i>
                  </div>
                </div>
                <div className="col-7 col-md-8">
                  <div className="numbers">
                    <p className="card-category">Clientes</p>
                    <p className="card-title">{stats.totalClientes}</p>
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
              <h5 className="card-title">Órdenes Recientes</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead className="text-primary">
                    <tr>
                      <th>Número</th>
                      <th>Cliente</th>
                      <th>Estado</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order._id}>
                        <td>{order.numero}</td>
                        <td>{order.cliente.nombre}</td>
                        <td>{order.estado}</td>
                        <td>${order.total}</td>
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
              <h5 className="card-title">Alertas de Stock Bajo</h5>
            </div>
            <div className="card-body">
              <ul className="list-group">
                {lowStock.map(repuesto => (
                  <li key={repuesto._id} className="list-group-item d-flex justify-content-between align-items-center">
                    {repuesto.nombre}
                    <span className="badge badge-danger badge-pill">Stock: {repuesto.stock}</span>
                  </li>
                ))}
                {lowStock.length === 0 && <li className="list-group-item">No hay alertas de stock bajo.</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMecanicoDashboard = () => (
    <div>
      <h3>Dashboard Mecánico</h3>
      <div className="row">
        <div className="col-lg-4 col-md-6 col-sm-6">
          <div className="card card-stats">
            <div className="card-body">
              <div className="row">
                <div className="col-5 col-md-4">
                  <div className="icon-big text-center icon-warning">
                    <i className="nc-icon nc-settings text-warning"></i>
                  </div>
                </div>
                <div className="col-7 col-md-8">
                  <div className="numbers">
                    <p className="card-category">Órdenes Pendientes</p>
                    <p className="card-title">{stats.pendientes}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <hr />
              <div className="stats">
                <i className="fa fa-clock-o"></i> Para trabajar
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6 col-sm-6">
          <div className="card card-stats">
            <div className="card-body">
              <div className="row">
                <div className="col-5 col-md-4">
                  <div className="icon-big text-center icon-success">
                    <i className="nc-icon nc-check-2 text-success"></i>
                  </div>
                </div>
                <div className="col-7 col-md-8">
                  <div className="numbers">
                    <p className="card-category">Completadas Hoy</p>
                    <p className="card-title">{stats.completadas}</p>
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
                    <i className="nc-icon nc-delivery-fast text-info"></i>
                  </div>
                </div>
                <div className="col-7 col-md-8">
                  <div className="numbers">
                    <p className="card-category">Vehículos</p>
                    <p className="card-title">{stats.totalVehiculos}</p>
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
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Órdenes Recientes</h5>
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
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order._id}>
                        <td>{order.numero}</td>
                        <td>{order.cliente.nombre}</td>
                        <td>{order.vehiculo.marca} {order.vehiculo.modelo}</td>
                        <td>
                          <select value={order.estado} onChange={(e) => updateStatus(order._id, e.target.value)}>
                            <option value="Pendiente">Pendiente</option>
                            <option value="En progreso">En progreso</option>
                            <option value="Completado">Completado</option>
                            <option value="Entregado">Entregado</option>
                          </select>
                        </td>
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
      </div>
    </div>
  );

  const renderRecepcionDashboard = () => (
    <div>
      <h3>Dashboard Recepción</h3>
      <div className="row">
        <div className="col-lg-4 col-md-6 col-sm-6">
          <div className="card card-stats">
            <div className="card-body">
              <div className="row">
                <div className="col-5 col-md-4">
                  <div className="icon-big text-center icon-primary">
                    <i className="nc-icon nc-single-02 text-primary"></i>
                  </div>
                </div>
                <div className="col-7 col-md-8">
                  <div className="numbers">
                    <p className="card-category">Clientes</p>
                    <p className="card-title">{stats.totalClientes}</p>
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
        <div className="col-lg-4 col-md-6 col-sm-6">
          <div className="card card-stats">
            <div className="card-body">
              <div className="row">
                <div className="col-5 col-md-4">
                  <div className="icon-big text-center icon-info">
                    <i className="nc-icon nc-delivery-fast text-info"></i>
                  </div>
                </div>
                <div className="col-7 col-md-8">
                  <div className="numbers">
                    <p className="card-category">Vehículos</p>
                    <p className="card-title">{stats.totalVehiculos}</p>
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
        <div className="col-lg-4 col-md-6 col-sm-6">
          <div className="card card-stats">
            <div className="card-body">
              <div className="row">
                <div className="col-5 col-md-4">
                  <div className="icon-big text-center icon-warning">
                    <i className="nc-icon nc-paper text-warning"></i>
                  </div>
                </div>
                <div className="col-7 col-md-8">
                  <div className="numbers">
                    <p className="card-category">Órdenes Hoy</p>
                    <p className="card-title">{stats.ordenesHoy}</p>
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
      </div>
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Órdenes Recientes</h5>
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
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order._id}>
                        <td>{order.numero}</td>
                        <td>{order.cliente.nombre}</td>
                        <td>{order.vehiculo.marca} {order.vehiculo.modelo}</td>
                        <td>{order.estado}</td>
                        <td>${order.total}</td>
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

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/ordenes/${id}`, { estado: status });
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  if (user.role === 'Administrador') return renderAdminDashboard();
  if (user.role === 'Mecánico') return renderMecanicoDashboard();
  if (user.role === 'Recepción') return renderRecepcionDashboard();
  return <div>Rol no reconocido</div>;
};

export default Dashboard;