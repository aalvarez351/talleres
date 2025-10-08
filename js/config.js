// Configuración de la API
const API_CONFIG = {
  // URL base de la API en Render
  BASE_URL: 'https://talleres-58bw.onrender.com/api',
  
  // Endpoints
  ENDPOINTS: {
    CLIENTES: '/clientes',
    VEHICULOS: '/vehiculos',
    ORDENES: '/ordenes',
    REPUESTOS: '/repuestos',
    AUTH: '/auth'
  }
};

// Función para hacer peticiones HTTP
async function apiRequest(endpoint, options = {}) {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const token = localStorage.getItem('authToken');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
  };
  
  const config = { ...defaultOptions, ...options };
  if (config.headers && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, config);
    
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('login.html')) {
        window.location.replace('./login.html');
      }
      return;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// Funciones de utilidad
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP'
  }).format(amount);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('es-CO');
}

function showNotification(message, type = 'success') {
  // Usar las notificaciones de Paper Dashboard
  const color = type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info';
  
  $.notify({
    message: message
  }, {
    type: color,
    timer: 3000,
    placement: {
      from: 'top',
      align: 'right'
    }
  });
}