// Cierres diarios functionality
let cierreActual = null;

document.addEventListener('DOMContentLoaded', function() {
  loadTurnoActual();
  loadHistorialCierres();
  
  // Set today's date as default
  document.getElementById('fechaCierre').value = new Date().toISOString().split('T')[0];
  
  // Update time every second
  setInterval(updateTime, 1000);
});

async function loadTurnoActual() {
  try {
    const response = await apiRequest(`${API_CONFIG.BASE_URL}/cierres/turno/actual`);
    
    document.getElementById('turnoActual').textContent = response.turno.toUpperCase();
    document.getElementById('fechaActual').textContent = response.fecha;
    document.getElementById('horaActual').textContent = response.hora;
    
    // Add visual indicator for shift
    const turnoElement = document.getElementById('turnoActual');
    if (response.turno === 'administrativo') {
      turnoElement.className = 'text-primary';
      turnoElement.innerHTML = '🏢 ADMINISTRATIVO';
    } else {
      turnoElement.className = 'text-warning';
      turnoElement.innerHTML = '🌙 OPERATIVO';
    }
    
  } catch (error) {
    console.error('Error loading current shift:', error);
  }
}

function updateTime() {
  const now = new Date();
  document.getElementById('horaActual').textContent = now.toLocaleTimeString('es-CO');
}

async function generarCierreHoy() {
  try {
    showNotification('Generando cierre del día...', 'info');
    
    const response = await apiRequest(`${API_CONFIG.BASE_URL}/cierres/generar`, {
      method: 'POST',
      body: JSON.stringify({
        fecha: new Date().toISOString().split('T')[0]
      })
    });
    
    document.getElementById('fechaCierre').value = new Date().toISOString().split('T')[0];
    await cargarCierre();
    
    showNotification('Cierre generado exitosamente', 'success');
    
  } catch (error) {
    console.error('Error generating daily closing:', error);
    showNotification('Error al generar el cierre', 'error');
  }
}

async function cargarCierre() {
  try {
    const fecha = document.getElementById('fechaCierre').value;
    if (!fecha) {
      showNotification('Selecciona una fecha', 'warning');
      return;
    }
    
    const response = await apiRequest(`${API_CONFIG.BASE_URL}/cierres/${fecha}`);
    cierreActual = response;
    
    mostrarCierre(response);
    
  } catch (error) {
    if (error.message.includes('404')) {
      document.getElementById('cierreDelDia').innerHTML = `
        <div class="alert alert-warning">
          <strong>No hay cierre para esta fecha.</strong><br>
          <button class="btn btn-primary btn-sm mt-2" onclick="generarCierreParaFecha()">
            <i class="nc-icon nc-simple-add"></i> Generar Cierre
          </button>
        </div>
      `;
      document.getElementById('turnosDetalle').style.display = 'none';
      document.getElementById('totalesDelDia').style.display = 'none';
    } else {
      console.error('Error loading closing:', error);
      showNotification('Error al cargar el cierre', 'error');
    }
  }
}

async function generarCierreParaFecha() {
  try {
    const fecha = document.getElementById('fechaCierre').value;
    
    const response = await apiRequest(`${API_CONFIG.BASE_URL}/cierres/generar`, {
      method: 'POST',
      body: JSON.stringify({ fecha })
    });
    
    cierreActual = response;
    mostrarCierre(response);
    showNotification('Cierre generado exitosamente', 'success');
    
  } catch (error) {
    console.error('Error generating closing for date:', error);
    showNotification('Error al generar el cierre', 'error');
  }
}

function mostrarCierre(cierre) {
  // Show shift details
  document.getElementById('turnosDetalle').style.display = 'block';
  document.getElementById('totalesDelDia').style.display = 'block';
  
  // Administrative shift
  document.getElementById('adminOrdenesCreadas').textContent = cierre.turnoAdministrativo.ordenesCreadas;
  document.getElementById('adminOrdenesCompletadas').textContent = cierre.turnoAdministrativo.ordenesCompletadas;
  document.getElementById('adminIngresos').textContent = formatCurrency(cierre.turnoAdministrativo.ingresos);
  document.getElementById('adminClientes').textContent = cierre.turnoAdministrativo.clientesAtendidos;
  
  // Operational shift
  document.getElementById('operOrdenesCreadas').textContent = cierre.turnoOperativo.ordenesCreadas;
  document.getElementById('operOrdenesCompletadas').textContent = cierre.turnoOperativo.ordenesCompletadas;
  document.getElementById('operIngresos').textContent = formatCurrency(cierre.turnoOperativo.ingresos);
  document.getElementById('operClientes').textContent = cierre.turnoOperativo.clientesAtendidos;
  
  // Totals
  document.getElementById('totalOrdenes').textContent = cierre.totales.ordenesCreadas;
  document.getElementById('totalCompletadas').textContent = cierre.totales.ordenesCompletadas;
  document.getElementById('totalIngresos').textContent = formatCurrency(cierre.totales.ingresos);
  document.getElementById('totalClientesAtendidos').textContent = cierre.totales.clientesAtendidos;
  
  // Status
  const estadoElement = document.getElementById('estadoCierre');
  const btnCerrar = document.getElementById('btnCerrarDia');
  
  if (cierre.estado === 'cerrado') {
    estadoElement.textContent = 'CERRADO';
    estadoElement.className = 'text-success';
    btnCerrar.style.display = 'none';
  } else {
    estadoElement.textContent = 'ABIERTO';
    estadoElement.className = 'text-warning';
    btnCerrar.style.display = 'inline-block';
  }
  
  // Update main display
  document.getElementById('cierreDelDia').innerHTML = `
    <div class="alert alert-info">
      <strong>Cierre del ${formatDate(cierre.fecha)}</strong><br>
      Estado: <span class="badge badge-${cierre.estado === 'cerrado' ? 'success' : 'warning'}">${cierre.estado.toUpperCase()}</span>
      ${cierre.fechaCierre ? `<br>Cerrado el: ${formatDateTime(cierre.fechaCierre)} por ${cierre.usuarioCierre}` : ''}
    </div>
  `;
}

async function cerrarDia() {
  if (!cierreActual) {
    showNotification('No hay cierre cargado', 'warning');
    return;
  }
  
  if (confirm('¿Estás seguro de cerrar el día? Esta acción no se puede deshacer.')) {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      const response = await apiRequest(`${API_CONFIG.BASE_URL}/cierres/${cierreActual._id}/cerrar`, {
        method: 'PUT',
        body: JSON.stringify({
          usuario: user?.email || 'Usuario'
        })
      });
      
      cierreActual = response;
      mostrarCierre(response);
      loadHistorialCierres();
      
      showNotification('Día cerrado exitosamente', 'success');
      
    } catch (error) {
      console.error('Error closing day:', error);
      showNotification('Error al cerrar el día', 'error');
    }
  }
}

async function loadHistorialCierres() {
  try {
    const cierres = await apiRequest(`${API_CONFIG.BASE_URL}/cierres`);
    
    const tbody = document.getElementById('historialCierres');
    tbody.innerHTML = '';
    
    cierres.slice(0, 10).forEach(cierre => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${formatDate(cierre.fecha)}</td>
        <td>
          <span class="badge badge-${cierre.estado === 'cerrado' ? 'success' : 'warning'}">
            ${cierre.estado.toUpperCase()}
          </span>
        </td>
        <td>${cierre.totales.ordenesCreadas}</td>
        <td>${formatCurrency(cierre.totales.ingresos)}</td>
        <td>${cierre.totales.clientesAtendidos}</td>
        <td>
          <button class="btn btn-info btn-sm" onclick="verCierre('${cierre.fecha}')">
            <i class="nc-icon nc-zoom-split"></i> Ver
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
    
  } catch (error) {
    console.error('Error loading closing history:', error);
  }
}

function verCierre(fecha) {
  document.getElementById('fechaCierre').value = fecha.split('T')[0];
  cargarCierre();
}

// Utility functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('es-CO');
}

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString('es-CO');
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.zIndex = '9999';
  notification.innerHTML = `
    ${message}
    <button type="button" class="close" data-dismiss="alert">
      <span>&times;</span>
    </button>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
}