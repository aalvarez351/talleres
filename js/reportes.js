// Reportes functionality
let ingresosChart, estadosChart;

document.addEventListener('DOMContentLoaded', function() {
  initializeDateFilters();
  loadReportes();
});

function initializeDateFilters() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  
  document.getElementById('fechaInicio').value = firstDay.toISOString().split('T')[0];
  document.getElementById('fechaFin').value = today.toISOString().split('T')[0];
}

async function loadReportes() {
  try {
    await Promise.all([
      loadMetricasPrincipales(),
      loadIngresosChart(),
      loadEstadosChart(),
      loadTopClientes(),
      loadTopRepuestos(),
      loadReporteDetallado()
    ]);
  } catch (error) {
    console.error('Error loading reports:', error);
  }
}

async function loadMetricasPrincipales() {
  try {
    const ordenes = await apiRequest(API_CONFIG.ENDPOINTS.ORDENES);
    const fechaInicio = new Date(document.getElementById('fechaInicio').value);
    const fechaFin = new Date(document.getElementById('fechaFin').value);
    
    const ordenesFiltradas = ordenes.filter(orden => {
      const fechaOrden = new Date(orden.fechaCreacion);
      return fechaOrden >= fechaInicio && fechaOrden <= fechaFin;
    });
    
    const ordenesCompletadas = ordenesFiltradas.filter(o => o.estado === 'Completado' || o.estado === 'Entregado');
    const ingresosTotales = ordenesCompletadas.reduce((sum, orden) => sum + (orden.total || 0), 0);
    const clientesUnicos = new Set(ordenesFiltradas.map(o => o.cliente?._id)).size;
    const promedioOrden = ordenesCompletadas.length > 0 ? ingresosTotales / ordenesCompletadas.length : 0;
    
    document.getElementById('ingresosTotales').textContent = formatCurrency(ingresosTotales);
    document.getElementById('ordenesCompletadas').textContent = ordenesCompletadas.length;
    document.getElementById('clientesAtendidos').textContent = clientesUnicos;
    document.getElementById('promedioOrden').textContent = formatCurrency(promedioOrden);
    
  } catch (error) {
    console.error('Error loading main metrics:', error);
  }
}

async function loadIngresosChart() {
  try {
    const ordenes = await apiRequest(API_CONFIG.ENDPOINTS.ORDENES);
    const ordenesCompletadas = ordenes.filter(o => o.estado === 'Completado' || o.estado === 'Entregado');
    
    // Agrupar por mes
    const ingresosPorMes = {};
    ordenesCompletadas.forEach(orden => {
      const fecha = new Date(orden.fechaCreacion);
      const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      ingresosPorMes[mes] = (ingresosPorMes[mes] || 0) + (orden.total || 0);
    });
    
    const meses = Object.keys(ingresosPorMes).sort();
    const ingresos = meses.map(mes => ingresosPorMes[mes]);
    
    const ctx = document.getElementById('ingresosChart').getContext('2d');
    
    if (ingresosChart) {
      ingresosChart.destroy();
    }
    
    ingresosChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: meses.map(mes => {
          const [year, month] = mes.split('-');
          return new Date(year, month - 1).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
        }),
        datasets: [{
          label: 'Ingresos',
          data: ingresos,
          borderColor: '#51CACF',
          backgroundColor: 'rgba(81, 202, 207, 0.1)',
          borderWidth: 2,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatCurrency(value);
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return 'Ingresos: ' + formatCurrency(context.parsed.y);
              }
            }
          }
        }
      }
    });
    
  } catch (error) {
    console.error('Error loading income chart:', error);
  }
}

async function loadEstadosChart() {
  try {
    const ordenes = await apiRequest(API_CONFIG.ENDPOINTS.ORDENES);
    const fechaInicio = new Date(document.getElementById('fechaInicio').value);
    const fechaFin = new Date(document.getElementById('fechaFin').value);
    
    const ordenesFiltradas = ordenes.filter(orden => {
      const fechaOrden = new Date(orden.fechaCreacion);
      return fechaOrden >= fechaInicio && fechaOrden <= fechaFin;
    });
    
    const estadosCount = {};
    ordenesFiltradas.forEach(orden => {
      estadosCount[orden.estado] = (estadosCount[orden.estado] || 0) + 1;
    });
    
    const ctx = document.getElementById('estadosChart').getContext('2d');
    
    if (estadosChart) {
      estadosChart.destroy();
    }
    
    estadosChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(estadosCount),
        datasets: [{
          data: Object.values(estadosCount),
          backgroundColor: ['#FFC107', '#17A2B8', '#28A745', '#6F42C1'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
    
  } catch (error) {
    console.error('Error loading status chart:', error);
  }
}

async function loadTopClientes() {
  try {
    const ordenes = await apiRequest(API_CONFIG.ENDPOINTS.ORDENES);
    const fechaInicio = new Date(document.getElementById('fechaInicio').value);
    const fechaFin = new Date(document.getElementById('fechaFin').value);
    
    const ordenesFiltradas = ordenes.filter(orden => {
      const fechaOrden = new Date(orden.fechaCreacion);
      return fechaOrden >= fechaInicio && fechaOrden <= fechaFin;
    });
    
    const clientesStats = {};
    ordenesFiltradas.forEach(orden => {
      const clienteId = orden.cliente?._id;
      const clienteNombre = orden.cliente?.nombre || 'Cliente N/A';
      
      if (!clientesStats[clienteId]) {
        clientesStats[clienteId] = {
          nombre: clienteNombre,
          ordenes: 0,
          total: 0
        };
      }
      
      clientesStats[clienteId].ordenes++;
      clientesStats[clienteId].total += orden.total || 0;
    });
    
    const topClientes = Object.values(clientesStats)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    
    const tbody = document.getElementById('topClientes');
    tbody.innerHTML = '';
    
    topClientes.forEach(cliente => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${cliente.nombre}</td>
        <td>${cliente.ordenes}</td>
        <td>${formatCurrency(cliente.total)}</td>
      `;
      tbody.appendChild(row);
    });
    
  } catch (error) {
    console.error('Error loading top clients:', error);
  }
}

async function loadTopRepuestos() {
  try {
    const ordenes = await apiRequest(API_CONFIG.ENDPOINTS.ORDENES);
    const fechaInicio = new Date(document.getElementById('fechaInicio').value);
    const fechaFin = new Date(document.getElementById('fechaFin').value);
    
    const ordenesFiltradas = ordenes.filter(orden => {
      const fechaOrden = new Date(orden.fechaCreacion);
      return fechaOrden >= fechaInicio && fechaOrden <= fechaFin;
    });
    
    const repuestosStats = {};
    ordenesFiltradas.forEach(orden => {
      if (orden.repuestos && Array.isArray(orden.repuestos)) {
        orden.repuestos.forEach(repuesto => {
          const nombre = repuesto.nombre || 'Repuesto N/A';
          const cantidad = repuesto.cantidad || 1;
          const precio = repuesto.precio || 0;
          
          if (!repuestosStats[nombre]) {
            repuestosStats[nombre] = {
              cantidad: 0,
              ingresos: 0
            };
          }
          
          repuestosStats[nombre].cantidad += cantidad;
          repuestosStats[nombre].ingresos += cantidad * precio;
        });
      }
    });
    
    const topRepuestos = Object.entries(repuestosStats)
      .map(([nombre, stats]) => ({ nombre, ...stats }))
      .sort((a, b) => b.ingresos - a.ingresos)
      .slice(0, 5);
    
    const tbody = document.getElementById('topRepuestos');
    tbody.innerHTML = '';
    
    topRepuestos.forEach(repuesto => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${repuesto.nombre}</td>
        <td>${repuesto.cantidad}</td>
        <td>${formatCurrency(repuesto.ingresos)}</td>
      `;
      tbody.appendChild(row);
    });
    
  } catch (error) {
    console.error('Error loading top parts:', error);
  }
}

async function loadReporteDetallado() {
  try {
    const ordenes = await apiRequest(API_CONFIG.ENDPOINTS.ORDENES);
    const fechaInicio = new Date(document.getElementById('fechaInicio').value);
    const fechaFin = new Date(document.getElementById('fechaFin').value);
    
    const ordenesFiltradas = ordenes.filter(orden => {
      const fechaOrden = new Date(orden.fechaCreacion);
      return fechaOrden >= fechaInicio && fechaOrden <= fechaFin;
    }).sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
    
    const tbody = document.getElementById('reporteDetalladoBody');
    tbody.innerHTML = '';
    
    ordenesFiltradas.forEach(orden => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${formatDate(orden.fechaCreacion)}</td>
        <td>${orden.numeroOrden || 'N/A'}</td>
        <td>${orden.cliente?.nombre || 'N/A'}</td>
        <td>${orden.vehiculo?.marca || ''} ${orden.vehiculo?.modelo || ''}</td>
        <td><span class="badge badge-${getEstadoBadge(orden.estado)}">${orden.estado}</span></td>
        <td>${formatCurrency(orden.total || 0)}</td>
      `;
      tbody.appendChild(row);
    });
    
  } catch (error) {
    console.error('Error loading detailed report:', error);
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

async function generarReporte() {
  showNotification('Generando reporte...', 'info');
  await loadReportes();
  showNotification('Reporte generado exitosamente', 'success');
}

function exportarExcel() {
  try {
    const table = document.getElementById('reporteDetallado');
    const wb = XLSX.utils.table_to_book(table);
    const filename = `reporte_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
    showNotification('Reporte exportado a Excel', 'success');
  } catch (error) {
    showNotification('Error al exportar a Excel. Función no disponible.', 'warning');
  }
}

function exportarPDF() {
  try {
    window.print();
    showNotification('Reporte enviado a impresora/PDF', 'success');
  } catch (error) {
    showNotification('Error al exportar a PDF', 'error');
  }
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
  return new Date(dateString).toLocaleDateString('es-ES');
}

function showNotification(message, type = 'info') {
  // Simple notification system
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