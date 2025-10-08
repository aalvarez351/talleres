import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="sidebar" data-color="white" data-active-color="danger">
      <div className="logo">
        <a href="/" className="simple-text logo-mini">
          <div className="logo-image-small">
            <img src="/assets/img/logo-small.png" alt="Logo" />
          </div>
        </a>
        <a href="/" className="simple-text logo-normal">
          AutoGestor
        </a>
      </div>
      <div className="sidebar-wrapper">
        <ul className="nav">
          <li className={location.pathname === '/' ? 'active' : ''}>
            <Link to="/">
              <i className="nc-icon nc-bank"></i>
              <p>Dashboard</p>
            </Link>
          </li>
          <li className={location.pathname === '/clientes' ? 'active' : ''}>
            <Link to="/clientes">
              <i className="nc-icon nc-single-02"></i>
              <p>Clientes</p>
            </Link>
          </li>
          <li className={location.pathname === '/vehiculos' ? 'active' : ''}>
            <Link to="/vehiculos">
              <i className="nc-icon nc-delivery-fast"></i>
              <p>Vehículos</p>
            </Link>
          </li>
          <li className={location.pathname === '/ordenes' ? 'active' : ''}>
            <Link to="/ordenes">
              <i className="nc-icon nc-paper"></i>
              <p>Órdenes</p>
            </Link>
          </li>
          <li className={location.pathname === '/inventario' ? 'active' : ''}>
            <Link to="/inventario">
              <i className="nc-icon nc-box-2"></i>
              <p>Inventario</p>
            </Link>
          </li>
          <li className={location.pathname === '/reportes' ? 'active' : ''}>
            <Link to="/reportes">
              <i className="nc-icon nc-chart-bar-32"></i>
              <p>Reportes</p>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;