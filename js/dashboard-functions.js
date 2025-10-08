// Additional dashboard functions for different roles

async function loadStockAlertas() {
  try {
    const repuestos = await apiRequest(API_CONFIG.ENDPOINTS.REPUESTOS);
    const stockBajo = repuestos.filter(r => r.stock <= 5);
    
    const container = document.getElementById('stockAlertas');
    if (stockBajo.length === 0) {
      container.innerHTML = '<p class="text-success">Stock en buen estado</p>';
    } else {
      container.innerHTML = stockBajo.map(r => 
        `<div class="alert alert-warning">
          <strong>${r.nombre}</strong><br>
          Stock: ${r.stock} unidades
        </div>`
      ).join('');
    }
  } catch (error) {
    console.error('Error loading stock alerts:', error);
  }
}

async function loadOrdenesPendientes() {
  try {
    const ordenes = await apiRequest(API_CONFIG.ENDPOINTS.ORDENES);
    if (!ordenes || !Array.isArray(ordenes)) {
      document.getElementById('ordenesPendientes').textContent = '0';
      return;
    }
    
    const pendientes = ordenes.filter(o => o.estado === 'Pendiente');
    const enProgreso = ordenes.filter(o => o.estado === 'En progreso');
    const hoy = new Date().toDateString();
    const completadasHoy = ordenes.filter(o => 
      o.estado === 'Completado' && 
      new Date(o.createdAt || o.fechaCreacion).toDateString() === hoy
    );
    
    // Update counters
    document.getElementById('ordenesPendientes').textContent = pendientes.length;
    document.getElementById('ordenesEnProgreso').textContent = enProgreso.length;
    document.getElementById('ordenesCompletadas').textContent = completadasHoy.length;
    document.getElementById('ordenesUrgentes').textContent = pendientes.filter(o => isUrgent(o)).length;
    
    // Render lists
    renderOrdenesByStatus('ordenesPendientesList', pendientes, 'Pendiente');
    renderOrdenesByStatus('ordenesEnProgresoList', enProgreso, 'En progreso');
    renderOrdenesByStatus('ordenesCompletadasList', completadasHoy, 'Completado');
    
  } catch (error) {
    console.error('Error loading mechanic orders:', error);
    document.getElementById('ordenesPendientes').textContent = '0';
    document.getElementById('ordenesEnProgreso').textContent = '0';
    document.getElementById('ordenesCompletadas').textContent = '0';
    document.getElementById('ordenesUrgentes').textContent = '0';
  }
}

function isUrgent(orden) {
  // Consider urgent if created more than 2 days ago and still pending
  const created = new Date(orden.createdAt || orden.fechaCreacion);
  const now = new Date();
  const daysDiff = (now - created) / (1000 * 60 * 60 * 24);
  return daysDiff > 2 && orden.estado === 'Pendiente';
}

function renderOrdenesByStatus(containerId, ordenes, currentStatus) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (!ordenes || ordenes.length === 0) {
    container.innerHTML = '<p class="text-muted">No hay órdenes en este estado</p>';
    return;
  }
  
  container.innerHTML = ordenes.map(orden => {
    const cliente = orden.cliente?.nombre || 'Cliente N/A';
    const vehiculo = orden.vehiculo ? `${orden.vehiculo.marca} ${orden.vehiculo.modelo}` : 'Vehículo N/A';
    const numero = orden.numero || orden.numeroOrden || 'N/A';
    const descripcion = orden.descripcion || 'Sin descripción';
    const isUrgentOrder = isUrgent(orden);
    
    return `
      <div class="orden-card ${isUrgentOrder ? 'urgent' : ''}" style="
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        background: ${isUrgentOrder ? '#fff5f5' : 'white'};
        border-left: 4px solid ${getStatusColor(currentStatus)};
      ">
        <div class="row">
          <div class="col-md-8">
            <h6 style="margin: 0 0 5px 0; color: #2d3748;">
              <strong>${numero}</strong>
              ${isUrgentOrder ? '<span class="badge badge-danger ml-2">URGENTE</span>' : ''}
            </h6>
            <p style="margin: 0 0 5px 0; color: #4a5568;"><strong>Cliente:</strong> ${cliente}</p>
            <p style="margin: 0 0 5px 0; color: #4a5568;"><strong>Vehículo:</strong> ${vehiculo}</p>
            <p style="margin: 0 0 10px 0; color: #718096; font-size: 0.9em;">${descripcion}</p>
            <small class="text-muted">${formatDate(orden.createdAt || orden.fechaCreacion)}</small>
          </div>
          <div class="col-md-4 text-right">
            ${renderStatusButtons(orden, currentStatus)}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function getStatusColor(status) {
  const colors = {
    'Pendiente': '#f6ad55',
    'En progreso': '#4299e1',
    'Completado': '#48bb78',
    'Entregado': '#9f7aea'
  };
  return colors[status] || '#e2e8f0';
}

function renderStatusButtons(orden, currentStatus) {
  const buttons = [];
  
  if (currentStatus === 'Pendiente') {
    buttons.push(`
      <button class="btn btn-info btn-sm mb-1" onclick="cambiarEstadoOrden('${orden._id}', 'En progreso')" style="width: 100%;">
        <i class="nc-icon nc-settings"></i> Iniciar Trabajo
      </button>
    `);
  }
  
  if (currentStatus === 'En progreso') {
    buttons.push(`
      <button class="btn btn-success btn-sm mb-1" onclick="cambiarEstadoOrden('${orden._id}', 'Completado')" style="width: 100%;">
        <i class="nc-icon nc-check-2"></i> Completar
      </button>
      <button class="btn btn-warning btn-sm mb-1" onclick="cambiarEstadoOrden('${orden._id}', 'Pendiente')" style="width: 100%;">
        <i class="nc-icon nc-time-alarm"></i> Pausar
      </button>
    `);
  }
  
  if (currentStatus === 'Completado') {
    buttons.push(`
      <button class="btn btn-primary btn-sm mb-1" onclick="cambiarEstadoOrden('${orden._id}', 'Entregado')" style="width: 100%;">
        <i class="nc-icon nc-delivery-fast"></i> Entregar
      </button>
      <button class="btn btn-secondary btn-sm mb-1" onclick="cambiarEstadoOrden('${orden._id}', 'En progreso')" style="width: 100%;">
        <i class="nc-icon nc-settings"></i> Reabrir
      </button>
    `);
  }
  
  // Always show view details button
  buttons.push(`
    <button class="btn btn-outline-info btn-sm" onclick="verDetallesOrden('${orden._id}')" style="width: 100%;">
      <i class="nc-icon nc-zoom-split"></i> Ver Detalles
    </button>
  `);
  
  return buttons.join('');
}

async function cambiarEstadoOrden(ordenId, nuevoEstado) {
  try {
    await apiRequest(`${API_CONFIG.ENDPOINTS.ORDENES}/${ordenId}`, {
      method: 'PUT',
      body: JSON.stringify({ estado: nuevoEstado })
    });
    
    showNotification(`Orden cambiada a: ${nuevoEstado}`, 'success');
    
    // Reload mechanic dashboard
    await loadMecanicoDashboard();
    
  } catch (error) {
    console.error('Error updating order status:', error);
    showNotification('Error al actualizar el estado de la orden', 'error');
  }
}

function verDetallesOrden(ordenId) {
  // Redirect to orders page with the specific order
  window.location.href = `./ordenes.html?orden=${ordenId}`;
}

// This function is now handled by loadOrdenesPendientes for mechanic dashboard

async function loadOrdenesMecanico() {
  try {
    const ordenes = await apiRequest(API_CONFIG.ENDPOINTS.ORDENES);
    const trabajos = ordenes.filter(o => o.estado !== 'Entregado').slice(0, 10);
    
    const tbody = document.getElementById('ordenesMecanico');
    tbody.innerHTML = '';
    
    trabajos.forEach(orden => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${orden.numeroOrden}</td>
        <td>${orden.cliente?.nombre || 'N/A'}</td>
        <td>${orden.vehiculo?.marca} ${orden.vehiculo?.modelo}</td>
        <td><span class="badge badge-${getEstadoBadge(orden.estado)}">${orden.estado}</span></td>
        <td>
          <select class="form-control form-control-sm" onchange="updateOrdenEstado('${orden._id}', this.value)">
            <option value="Pendiente" ${orden.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="En progreso" ${orden.estado === 'En progreso' ? 'selected' : ''}>En progreso</option>
            <option value="Completado" ${orden.estado === 'Completado' ? 'selected' : ''}>Completado</option>
          </select>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading mechanic orders:', error);
  }
}

async function loadClientesHoy() {
  try {
    const ordenes = await apiRequest(API_CONFIG.ENDPOINTS.ORDENES);
    const hoy = new Date().toDateString();
    const clientesHoy = new Set(
      ordenes
        .filter(o => new Date(o.fechaCreacion).toDateString() === hoy)
        .map(o => o.cliente?._id)
    ).size;
    document.getElementById('clientesHoy').textContent = clientesHoy;
  } catch (error) {
    document.getElementById('clientesHoy').textContent = '0';
  }
}

async function loadNuevasOrdenes() {
  try {
    const ordenes = await apiRequest(API_CONFIG.ENDPOINTS.ORDENES);
    const hoy = new Date().toDateString();
    const nuevas = ordenes.filter(o => 
      new Date(o.fechaCreacion).toDateString() === hoy
    );
    document.getElementById('nuevasOrdenes').textContent = nuevas.length;
  } catch (error) {
    document.getElementById('nuevasOrdenes').textContent = '0';
  }
}

async function loadClientesRecientes() {
  try {
    const clientes = await apiRequest(API_CONFIG.ENDPOINTS.CLIENTES);
    const recientes = clientes.slice(-5);
    
    const tbody = document.getElementById('clientesRecientes');
    tbody.innerHTML = '';
    
    recientes.forEach(cliente => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${cliente.nombre}</td>
        <td>${cliente.telefono}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading recent clients:', error);
  }
}

async function loadOrdenesEntrada() {
  try {
    const ordenes = await apiRequest(API_CONFIG.ENDPOINTS.ORDENES);
    const entrada = ordenes.filter(o => o.estado === 'Pendiente').slice(0, 5);
    
    const tbody = document.getElementById('ordenesEntrada');
    tbody.innerHTML = '';
    
    entrada.forEach(orden => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${orden.numeroOrden}</td>
        <td>${orden.cliente?.nombre || 'N/A'}</td>
        <td><span class="badge badge-warning">${orden.estado}</span></td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading entry orders:', error);
  }
}

async function updateOrdenEstado(ordenId, nuevoEstado) {
  try {
    await apiRequest(`${API_CONFIG.ENDPOINTS.ORDENES}/${ordenId}`, {
      method: 'PUT',
      body: JSON.stringify({ estado: nuevoEstado })
    });
    
    showNotification('Estado actualizado exitosamente');
    loadOrdenesMecanico();
  } catch (error) {
    console.error('Error updating order status:', error);
    showNotification('Error al actualizar el estado', 'error');
  }
}

function getEstadoBadge(estado) {
  const badges = {
    'Pendiente': 'warning',
    'En progreso': 'info',
    'Completado': 'success',
    'Entregado': 'primary'
  };
  return badges[estado] || 'secondary';
}