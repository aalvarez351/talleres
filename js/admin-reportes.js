// Admin Reportes functionality
let ingresosChart, planesChart;

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
      loadPlanesChart(),
      loadTopTalleres(),
      loadChurnAnalysis()
    ]);
  } catch (error) {
    console.error('Error loading reports:', error);
  }
}

async function loadMetricasPrincipales() {
  try {
    const [talleresResponse, pagosResponse] = await Promise.all([
      fetch('https://talleres-58bw.onrender.com/api/admin/talleres'),
      fetch('https://talleres-58bw.onrender.com/api/admin/pagos')
    ]);
    
    const talleres = await talleresResponse.json();
    const pagos = await pagosResponse.json();
    
    const fechaInicio = new Date(document.getElementById('fechaInicio').value);
    const fechaFin = new Date(document.getElementById('fechaFin').value);
    
    // Filtrar datos por fecha
    const pagosFiltrados = pagos.filter(pago => {
      const fechaPago = new Date(pago.fecha);
      return fechaPago >= fechaInicio && fechaPago <= fechaFin && pago.estado === 'confirmado';
    });
    
    const talleresFiltrados = talleres.filter(taller => {
      const fechaCreacion = new Date(taller.fechaCreacion);
      return fechaCreacion >= fechaInicio && fechaCreacion <= fechaFin;
    });
    
    // Calcular métricas
    const ingresosTotales = pagosFiltrados.reduce((sum, pago) => sum + pago.monto, 0);
    const talleresActivos = talleres.filter(t => t.estado === 'activo').length;
    const nuevosTalleres = talleresFiltrados.length;
    
    // Calcular tasa de retención (simplificada)
    const totalTalleres = talleres.length;
    const talleresCancelados = talleres.filter(t => t.estado === 'cancelado').length;
    const tasaRetencion = totalTalleres > 0 ? ((totalTalleres - talleresCancelados) / totalTalleres * 100) : 0;
    
    // Actualizar UI
    document.getElementById('ingresosTotales').textContent = formatCurrency(ingresosTotales);
    document.getElementById('talleresActivos').textContent = talleresActivos;
    document.getElementById('tasaRetencion').textContent = tasaRetencion.toFixed(1) + '%';
    document.getElementById('nuevosTalleres').textContent = nuevosTalleres;
    
  } catch (error) {
    console.error('Error loading main metrics:', error);
  }
}

async function loadIngresosChart() {
  try {
    const response = await fetch('https://talleres-58bw.onrender.com/api/admin/pagos');
    const pagos = await response.json();
    
    const pagosConfirmados = pagos.filter(p => p.estado === 'confirmado');
    
    // Agrupar por mes
    const ingresosPorMes = {};
    pagosConfirmados.forEach(pago => {
      const fecha = new Date(pago.fecha);
      const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      ingresosPorMes[mes] = (ingresosPorMes[mes] || 0) + pago.monto;
    });
    
    const meses = Object.keys(ingresosPorMes).sort().slice(-12); // Últimos 12 meses
    const ingresos = meses.map(mes => ingresosPorMes[mes] || 0);
    
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
          label: 'Ingresos Mensuales',
          data: ingresos,
          borderColor: '#51CACF',
          backgroundColor: 'rgba(81, 202, 207, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
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

async function loadPlanesChart() {
  try {
    const response = await fetch('https://talleres-58bw.onrender.com/api/admin/talleres');
    const talleres = await response.json();
    
    const planesCounts = {};
    talleres.forEach(taller => {
      planesCounts[taller.plan] = (planesCounts[taller.plan] || 0) + 1;
    });
    
    const ctx = document.getElementById('planesChart').getContext('2d');
    
    if (planesChart) {
      planesChart.destroy();
    }
    
    planesChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(planesCounts).map(plan => plan.toUpperCase()),
        datasets: [{
          data: Object.values(planesCounts),
          backgroundColor: ['#28A745', '#17A2B8', '#FFC107'],
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
    console.error('Error loading plans chart:', error);
  }
}

async function loadTopTalleres() {
  try {
    const [talleresResponse, pagosResponse] = await Promise.all([
      fetch('https://talleres-58bw.onrender.com/api/admin/talleres'),
      fetch('https://talleres-58bw.onrender.com/api/admin/pagos')
    ]);
    
    const talleres = await talleresResponse.json();
    const pagos = await pagosResponse.json();
    
    // Calcular ingresos por taller
    const ingresosPorTaller = {};
    pagos.filter(p => p.estado === 'confirmado').forEach(pago => {
      const tallerId = pago.taller._id;
      if (!ingresosPorTaller[tallerId]) {
        ingresosPorTaller[tallerId] = {
          taller: pago.taller,
          pagos: 0,
          total: 0
        };
      }
      ingresosPorTaller[tallerId].pagos++;
      ingresosPorTaller[tallerId].total += pago.monto;
    });
    
    const topTalleres = Object.values(ingresosPorTaller)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    
    const tbody = document.getElementById('topTalleres');
    tbody.innerHTML = '';
    
    topTalleres.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.taller.nombre}</td>
        <td><span class="badge badge-${getPlanBadge(item.taller.plan)}">${item.taller.plan.toUpperCase()}</span></td>
        <td>${item.pagos}</td>
        <td>${formatCurrency(item.total)}</td>
      `;
      tbody.appendChild(row);
    });
    
  } catch (error) {
    console.error('Error loading top workshops:', error);
  }
}

async function loadChurnAnalysis() {
  try {
    const response = await fetch('https://talleres-58bw.onrender.com/api/admin/talleres');
    const talleres = await response.json();
    
    // Análisis simplificado de churn por mes (últimos 6 meses)
    const churnData = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const mes = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const siguienteMes = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
      
      const nuevos = talleres.filter(t => {
        const fechaCreacion = new Date(t.fechaCreacion);
        return fechaCreacion >= mes && fechaCreacion < siguienteMes;
      }).length;
      
      const cancelados = talleres.filter(t => {
        const fechaCreacion = new Date(t.fechaCreacion);
        return fechaCreacion < siguienteMes && t.estado === 'cancelado';
      }).length;
      
      const totalMes = talleres.filter(t => {
        const fechaCreacion = new Date(t.fechaCreacion);
        return fechaCreacion < siguienteMes;
      }).length;
      
      const churnRate = totalMes > 0 ? (cancelados / totalMes * 100) : 0;
      
      churnData.push({
        mes: mes.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        nuevos,
        cancelados,
        churnRate: churnRate.toFixed(1)
      });
    }
    
    const tbody = document.getElementById('churnAnalysis');
    tbody.innerHTML = '';
    
    churnData.forEach(data => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${data.mes}</td>
        <td class="text-success">${data.nuevos}</td>
        <td class="text-danger">${data.cancelados}</td>
        <td>${data.churnRate}%</td>
      `;
      tbody.appendChild(row);
    });
    
  } catch (error) {
    console.error('Error loading churn analysis:', error);
  }
}

async function generarReporte() {
  showNotification('Generando reporte...', 'info');
  await loadReportes();
  showNotification('Reporte generado exitosamente', 'success');
}

function exportarExcel() {
  showNotification('Función de exportación a Excel en desarrollo', 'info');
}

function exportarPDF() {
  window.print();
  showNotification('Reporte enviado a impresora/PDF', 'success');
}

function enviarReporte() {
  showNotification('Función de envío por email en desarrollo', 'info');
}

function programarReporte() {
  showNotification('Función de programación de reportes en desarrollo', 'info');
}

function getPlanBadge(plan) {
  const badges = {
    'gratuito': 'success',
    'basico': 'info',
    'premium': 'warning'
  };
  return badges[plan] || 'secondary';
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
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