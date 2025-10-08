// Dashboard functionality
let dashboardInterval;

document.addEventListener('DOMContentLoaded', async function() {
  const user = JSON.parse(localStorage.getItem('user'));
  setupDashboardByRole(user.role);
  await loadDashboardData();
  
  // Setup real-time updates every 30 seconds
  startRealTimeUpdates();
});

function startRealTimeUpdates() {
  // Clear any existing interval
  if (dashboardInterval) {
    clearInterval(dashboardInterval);
  }
  
  // Update every 30 seconds
  dashboardInterval = setInterval(async () => {
    try {
      await loadDashboardData();
      console.log('Dashboard updated at:', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error updating dashboard:', error);
    }
  }, 30000);
}

// Stop updates when page is hidden/unloaded
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    if (dashboardInterval) {
      clearInterval(dashboardInterval);
    }
  } else {
    startRealTimeUpdates();
  }
});

window.addEventListener('beforeunload', function() {
  if (dashboardInterval) {
    clearInterval(dashboardInterval);
  }
});

function setupDashboardByRole(role) {
  const adminContent = document.getElementById('adminDashboard');
  const mecanicoContent = document.getElementById('mecanicoDashboard');
  const recepcionContent = document.getElementById('recepcionDashboard');
  
  // Hide all dashboards
  if (adminContent) adminContent.style.display = 'none';
  if (mecanicoContent) mecanicoContent.style.display = 'none';
  if (recepcionContent) recepcionContent.style.display = 'none';
  
  // Show appropriate dashboard
  switch(role) {
    case 'admin':
      if (adminContent) adminContent.style.display = 'block';
      break;
    case 'mecanico':
      if (mecanicoContent) mecanicoContent.style.display = 'block';
      break;
    case 'recepcion':
      if (recepcionContent) recepcionContent.style.display = 'block';
      break;
  }
}

async function loadDashboardData() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  try {
    switch(user.role) {
      case 'admin':
        await loadAdminDashboard();
        break;
      case 'mecanico':
        await loadMecanicoDashboard();
        break;
      case 'recepcion':
        await loadRecepcionDashboard();
        break;
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

async function loadAdminDashboard() {
  await Promise.all([
    loadClientesCount(),
    loadVehiculosCount(),
    loadOrdenesActivas(),
    loadIngresosHoy(),
    loadOrdenesRecientes(),
    loadStockAlertas()
  ]);
}

async function loadMecanicoDashboard() {
  await loadOrdenesPendientes();
  console.log('Mechanic dashboard updated at:', new Date().toLocaleTimeString());
}

async function loadRecepcionDashboard() {
  await Promise.all([
    loadClientesHoy(),
    loadVehiculosCount('recep'),
    loadNuevasOrdenes(),
    loadClientesRecientes(),
    loadOrdenesEntrada()
  ]);
}

async function loadClientesCount() {
  try {
    const clientes = await apiRequest(API_CONFIG.ENDPOINTS.CLIENTES);
    const element = document.getElementById('totalClientes');
    if (element) {
      element.textContent = (clientes && Array.isArray(clientes)) ? clientes.length : '0';
    }
  } catch (error) {
    const element = document.getElementById('totalClientes');
    if (element) element.textContent = '0';
  }
}

async function loadVehiculosCount(type = 'admin') {
  try {
    const vehiculos = await apiRequest(API_CONFIG.ENDPOINTS.VEHICULOS);
    const elementId = type === 'recep' ? 'totalVehiculosRecep' : 'totalVehiculos';
    const element = document.getElementById(elementId);
    if (element) element.textContent = vehiculos.length;
  } catch (error) {
    const elementId = type === 'recep' ? 'totalVehiculosRecep' : 'totalVehiculos';
    const element = document.getElementById(elementId);
    if (element) element.textContent = '0';
  }
}

async function loadOrdenesActivas() {
  try {
    const ordenes = await apiRequest(API_CONFIG.ENDPOINTS.ORDENES);
    const element = document.getElementById('ordenesActivas');
    if (element) {
      if (ordenes && Array.isArray(ordenes)) {
        const activas = ordenes.filter(orden => orden.estado !== 'Entregado');
        element.textContent = activas.length;
      } else {
        element.textContent = '0';
      }
    }
  } catch (error) {
    const element = document.getElementById('ordenesActivas');
    if (element) element.textContent = '0';
  }
}

async function loadIngresosHoy() {
  try {
    const ordenes = await apiRequest(API_CONFIG.ENDPOINTS.ORDENES);
    const element = document.getElementById('ingresosHoy');
    if (element) {
      if (ordenes && Array.isArray(ordenes)) {
        const hoy = new Date().toDateString();
        const ordenesHoy = ordenes.filter(orden => 
          new Date(orden.fechaCreacion).toDateString() === hoy && 
          orden.estado === 'Entregado'
        );
        const ingresos = ordenesHoy.reduce((total, orden) => total + (orden.total || 0), 0);
        element.textContent = formatCurrency(ingresos);
      } else {
        element.textContent = '$0';
      }
    }
  } catch (error) {
    const element = document.getElementById('ingresosHoy');
    if (element) element.textContent = '$0';
  }
}

async function loadOrdenesRecientes() {
  try {
    const ordenes = await apiRequest(API_CONFIG.ENDPOINTS.ORDENES);
    if (!ordenes || !Array.isArray(ordenes)) {
      return;
    }
    
    const recientes = ordenes.slice(-5).reverse();
    
    const tbody = document.getElementById('ordenesRecientes');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    for (const orden of recientes) {
      const row = document.createElement('tr');
      
      const estadoClass = {
        'Pendiente': 'text-warning',
        'En progreso': 'text-info',
        'Completado': 'text-success',
        'Entregado': 'text-primary'
      };
      
      row.innerHTML = `
        <td>${orden.numeroOrden || 'N/A'}</td>
        <td>${orden.cliente?.nombre || 'N/A'}</td>
        <td>${orden.vehiculo?.marca || ''} ${orden.vehiculo?.modelo || ''}</td>
        <td><span class="${estadoClass[orden.estado] || ''}">${orden.estado || 'N/A'}</span></td>
        <td>${formatCurrency(orden.total || 0)}</td>
      `;
      
      tbody.appendChild(row);
    }
  } catch (error) {
    console.error('Error loading recent orders:', error);
  }
}