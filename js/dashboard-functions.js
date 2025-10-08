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
    const pendientes = ordenes.filter(o => o.estado === 'Pendiente' || o.estado === 'En progreso');
    document.getElementById('ordenesPendientes').textContent = pendientes.length;
  } catch (error) {
    document.getElementById('ordenesPendientes').textContent = '0';
  }
}

async function loadOrdenesCompletadas() {
  try {
    const ordenes = await apiRequest(API_CONFIG.ENDPOINTS.ORDENES);
    const hoy = new Date().toDateString();
    const completadas = ordenes.filter(o => 
      o.estado === 'Completado' && 
      new Date(o.fechaCreacion).toDateString() === hoy
    );
    document.getElementById('ordenesCompletadas').textContent = completadas.length;
  } catch (error) {
    document.getElementById('ordenesCompletadas').textContent = '0';
  }
}

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