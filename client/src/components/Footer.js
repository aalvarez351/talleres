import React from 'react';

const Footer = () => {
  return (
    <footer className="footer footer-black footer-white">
      <div className="container-fluid">
        <div className="row">
          <nav className="footer-nav">
            <ul>
              <li><a href="#" target="_blank">AutoGestor</a></li>
              <li><a href="#" target="_blank">Soporte</a></li>
              <li><a href="#" target="_blank">Licencias</a></li>
            </ul>
          </nav>
          <div className="credits ml-auto">
            <span className="copyright">
              © {new Date().getFullYear()}, creado con <i className="fa fa-heart heart"></i> por AutoGestor
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;