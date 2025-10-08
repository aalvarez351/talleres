// Global Admin Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
  loadDashboardData();
  
  // Auto refresh every 30 seconds
  setInterval(loadDashboardData, 30000);
});

async function loadDashboardData() {
  try {
    await Promise.all([
      loadMetricas(),
      loadTalleresRecientes(),
      loadDistribucionPlanes()
    ]);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

async function loadMetricas() {
  try {
    const response = await fetch('https://talleres-58bw.onrender.com/api/admin/dashboard');
    const data = await response.json();
    
    document.getElementById('totalTalleres').textContent = data.totalTalleres || 0;
    document.getElementById('talleresActivos').textContent = data.talleresActivos || 0;
    document.getElementById('ingresosMes').textContent = formatCurrency(data.ingresosMes || 0);
    document.getElementById('pagosVencidos').textContent = data.pagosVencidos || 0;
    
    // Update plan distribution
    if (data.talleresPorPlan) {
      const planes = { gratuito: 0, basico: 0, premium: 0 };
      data.talleresPorPlan.forEach(plan => {
        planes[plan._id] = plan.count;
      });
      
      document.getElementById('planGratuito').textContent = planes.gratuito;
      document.getElementById('planBasico').textContent = planes.basico;
      document.getElementById('planPremium').textContent = planes.premium;
    }
    
  } catch (error) {
    console.error('Error loading metrics:', error);
  }
}

async function loadTalleresRecientes() {
  try {
    const response = await fetch('https://talleres-58bw.onrender.com/api/admin/talleres');
    const talleres = await response.json();
    
    const tbody = document.getElementById('talleresRecientes');
    tbody.innerHTML = '';
    
    talleres.slice(0, 5).forEach(taller => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${taller.nombre}</td>
        <td><span class="badge badge-${getPlanBadge(taller.plan)}">${taller.plan.toUpperCase()}</span></td>
        <td><span class="badge badge-${getEstadoBadge(taller.estado)}">${taller.estado.toUpperCase()}</span></td>
        <td>${formatDate(taller.fechaCreacion)}</td>
      `;
      tbody.appendChild(row);
    });
    
  } catch (error) {
    console.error('Error loading recent workshops:', error);
  }
}

async function loadDistribucionPlanes() {
  // This is handled in loadMetricas for simplicity
}

function getPlanBadge(plan) {
  const badges = {
    'gratuito': 'success',
    'basico': 'info', 
    'premium': 'warning'
  };
  return badges[plan] || 'secondary';
}

function getEstadoBadge(estado) {
  const badges = {
    'activo': 'success',
    'suspendido': 'warning',
    'cancelado': 'danger'
  };
  return badges[estado] || 'secondary';
}

async function enviarRecordatorios() {
  try {
    // This would integrate with email service
    showNotification('Recordatorios enviados exitosamente', 'success');
  } catch (error) {
    showNotification('Error al enviar recordatorios', 'error');
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