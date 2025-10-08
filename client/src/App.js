import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Vehiculos from './pages/Vehiculos';
import Ordenes from './pages/Ordenes';
import Inventario from './pages/Inventario';
import Reportes from './pages/Reportes';
import Login from './pages/Login';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard" element={isAuthenticated ? <Layout onLogout={handleLogout}><Dashboard /></Layout> : <Navigate to="/login" />} />
        <Route path="/clientes" element={isAuthenticated ? <Layout onLogout={handleLogout}><Clientes /></Layout> : <Navigate to="/login" />} />
        <Route path="/vehiculos" element={isAuthenticated ? <Layout onLogout={handleLogout}><Vehiculos /></Layout> : <Navigate to="/login" />} />
        <Route path="/ordenes" element={isAuthenticated ? <Layout onLogout={handleLogout}><Ordenes /></Layout> : <Navigate to="/login" />} />
        <Route path="/inventario" element={isAuthenticated ? <Layout onLogout={handleLogout}><Inventario /></Layout> : <Navigate to="/login" />} />
        <Route path="/reportes" element={isAuthenticated ? <Layout onLogout={handleLogout}><Reportes /></Layout> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;