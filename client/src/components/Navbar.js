import React from 'react';

const Navbar = ({ onLogout }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-absolute fixed-top navbar-transparent">
      <div className="container-fluid">
        <div className="navbar-wrapper">
          <div className="navbar-toggle">
            <button type="button" className="navbar-toggler">
              <span className="navbar-toggler-bar bar1"></span>
              <span className="navbar-toggler-bar bar2"></span>
              <span className="navbar-toggler-bar bar3"></span>
            </button>
          </div>
          <a className="navbar-brand" href="#">AutoGestor</a>
        </div>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navigation" aria-controls="navigation-index" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-bar navbar-kebab"></span>
          <span className="navbar-toggler-bar navbar-kebab"></span>
          <span className="navbar-toggler-bar navbar-kebab"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navigation">
          <form>
            <div className="input-group no-border">
              <input type="text" className="form-control" placeholder="Buscar..." />
              <div className="input-group-append">
                <div className="input-group-text">
                  <i className="nc-icon nc-zoom-split"></i>
                </div>
              </div>
            </div>
          </form>
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link btn-magnify" href="#">
                <i className="nc-icon nc-layout-11"></i>
                <p>
                  <span className="d-lg-none d-md-block">Estadísticas</span>
                </p>
              </a>
            </li>
            <li className="nav-item btn-rotate dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <i className="nc-icon nc-bell-55"></i>
                <p>
                  <span className="d-lg-none d-md-block">Notificaciones</span>
                </p>
              </a>
              <div className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdownMenuLink">
                <a className="dropdown-item" href="#">Notificación 1</a>
                <a className="dropdown-item" href="#">Notificación 2</a>
                <a className="dropdown-item" href="#">Otra</a>
              </div>
            </li>
            <li className="nav-item">
              <a className="nav-link btn-rotate" href="#" onClick={onLogout}>
                <i className="nc-icon nc-button-power"></i>
                <p>
                  <span className="d-lg-none d-md-block">Salir</span>
                </p>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;