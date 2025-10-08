import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#007bff', color: 'white', padding: '20px', textAlign: 'center' }}>
        <h1>AutoGestor</h1>
        <p>Sistema de Gestión para Talleres Mecánicos</p>
        <button
          onClick={() => navigate('/login')}
          style={{
            backgroundColor: 'white',
            color: '#007bff',
            border: 'none',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            borderRadius: '5px'
          }}
        >
          Iniciar Sesión
        </button>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '50px 20px', textAlign: 'center', backgroundColor: '#f8f9fa' }}>
        <h2>Gestión Eficiente para tu Taller Mecánico</h2>
        <p>AutoGestor es la solución completa para optimizar las operaciones diarias de tu taller, desde la gestión de clientes hasta reportes detallados.</p>
      </section>

      {/* Features */}
      <section style={{ padding: '50px 20px' }}>
        <h2 style={{ textAlign: 'center' }}>Características Principales</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', marginTop: '30px' }}>
          <div style={{ width: '300px', margin: '20px', textAlign: 'center' }}>
            <h3>Gestión de Clientes</h3>
            <p>Registra y administra la información de tus clientes de manera eficiente.</p>
          </div>
          <div style={{ width: '300px', margin: '20px', textAlign: 'center' }}>
            <h3>Control de Vehículos</h3>
            <p>Vincula vehículos a clientes y mantén un historial completo de servicios.</p>
          </div>
          <div style={{ width: '300px', margin: '20px', textAlign: 'center' }}>
            <h3>Órdenes de Servicio</h3>
            <p>Crea y sigue órdenes de trabajo con detalles de repuestos y mano de obra.</p>
          </div>
          <div style={{ width: '300px', margin: '20px', textAlign: 'center' }}>
            <h3>Inventario de Repuestos</h3>
            <p>Controla stock y actualiza automáticamente al completar servicios.</p>
          </div>
          <div style={{ width: '300px', margin: '20px', textAlign: 'center' }}>
            <h3>Reportes Avanzados</h3>
            <p>Genera reportes de ingresos, servicios y totales por cliente o vehículo.</p>
          </div>
          <div style={{ width: '300px', margin: '20px', textAlign: 'center' }}>
            <h3>Autenticación Segura</h3>
            <p>Acceso controlado por roles: Administrador, Mecánico y Recepción.</p>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section style={{ padding: '50px 20px', backgroundColor: '#f8f9fa' }}>
        <h2 style={{ textAlign: 'center' }}>Ventajas de Usar AutoGestor</h2>
        <ul style={{ maxWidth: '800px', margin: '0 auto', fontSize: '18px' }}>
          <li>Interfaz intuitiva y fácil de usar, compatible con móviles.</li>
          <li>Automatización de procesos para reducir errores y tiempo.</li>
          <li>Mejora la eficiencia operativa y aumenta la satisfacción del cliente.</li>
          <li>Reportes en tiempo real para toma de decisiones informadas.</li>
          <li>Escalable y seguro, con respaldo en la nube.</li>
          <li>Soporte técnico continuo y actualizaciones regulares.</li>
        </ul>
      </section>

      {/* Call to Action */}
      <section style={{ padding: '50px 20px', textAlign: 'center' }}>
        <h2>¡Comienza a Optimizar tu Taller Hoy!</h2>
        <p>Únete a talleres que ya confían en AutoGestor para su gestión diaria.</p>
        <button
          onClick={() => navigate('/login')}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            fontSize: '18px',
            cursor: 'pointer',
            borderRadius: '5px'
          }}
        >
          Acceder al Sistema
        </button>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#343a40', color: 'white', padding: '20px', textAlign: 'center' }}>
        <p>&copy; 2025 AutoGestor. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Landing;