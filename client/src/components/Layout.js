import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children, onLogout }) => {
  return (
    <div className="wrapper">
      <Sidebar />
      <div className="main-panel">
        <Navbar onLogout={onLogout} />
        <div className="content">
          {children}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;