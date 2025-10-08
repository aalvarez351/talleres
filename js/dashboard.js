// Dashboard functionality
document.addEventListener('DOMContentLoaded', async function() {
  await loadDashboardData();
});

async function loadDashboardData() {
  try {
    // Cargar estadísticas
    await Promise.all([
      loadClientesCount(),
      loadVehiculosCount(),
      loadOrdenesActivas(),
      loadIngresosHoy(),
      loadOrdenesRecientes()
    ]);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showNotification('Error al cargar los datos del dashboard', 'error');
  }
}

async function loadClientesCount() {
  try {
    const clientes = await apiRequest(API_CONFIG.ENDPOINTS.CLIENTES);
    document.getElementById('totalClientes').textContent = clientes.length;
  } catch (error) {
    document.getElementById('totalClientes').textContent = '0';
  }
}

async function loadVehiculosCount() {
  try {
    const vehiculos = await apiRequest(API_CONFIG.ENDPOINTS.VEHICULOS);
    document.getElementById('totalVehiculos').textContent = vehiculos.length;
  } catch (error) {
    document.getElementById('totalVehiculos').textContent = '0';
  }
}

async function loadOrdenesActivas() {
  try {
    const ordenes = await apiRequest(API_CONFIG.ENDPOINTS.ORDENES);
    const activas = ordenes.filter(orden => orden.estado !== 'Entregado');
    document.getElementById('ordenesActivas').textContent = activas.length;
  } catch (error) {
    document.getElementById('ordenesActivas').textContent = '0';
  }
}

async function loadIngresosHoy() {
  try {
    const ordenes = await apiRequest(API_CONFIG.ENDPOINTS.ORDENES);
    const hoy = new Date().toDateString();
    const ordenesHoy = ordenes.filter(orden => 
      new Date(orden.fechaCreacion).toDateString() === hoy && 
      orden.estado === 'Entregado'
    );
    
    const ingresos = ordenesHoy.reduce((total, orden) => total + (orden.total || 0), 0);
    document.getElementById('ingresosHoy').textContent = formatCurrency(ingresos);
  } catch (error) {
    document.getElementById('ingresosHoy').textContent = '$0';
  }
}

async function loadOrdenesRecientes() {
  try {
    const ordenes = await apiRequest(API_CONFIG.ENDPOINTS.ORDENES);
    const recientes = ordenes.slice(-5).reverse();
    
    const tbody = document.getElementById('ordenesRecientes');
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
        <td>${orden.numeroOrden}</td>
        <td>${orden.cliente?.nombre || 'N/A'}</td>
        <td>${orden.vehiculo?.marca} ${orden.vehiculo?.modelo}</td>
        <td><span class="${estadoClass[orden.estado] || ''}">${orden.estado}</span></td>
        <td>${formatCurrency(orden.total || 0)}</td>
      `;
      
      tbody.appendChild(row);
    }
  } catch (error) {
    console.error('Error loading recent orders:', error);
  }
}