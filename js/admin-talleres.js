// Admin Talleres functionality
let talleres = [];
let editingTallerId = null;

document.addEventListener('DOMContentLoaded', function() {
  loadTalleres();
  
  // Search and filter functionality
  document.getElementById('searchTaller').addEventListener('input', filterTalleres);
  document.getElementById('filterPlan').addEventListener('change', filterTalleres);
  document.getElementById('filterEstado').addEventListener('change', filterTalleres);
});

async function loadTalleres() {
  try {
    const response = await fetch('https://talleres-58bw.onrender.com/api/admin/talleres');
    talleres = await response.json();
    renderTalleres(talleres);
  } catch (error) {
    console.error('Error loading talleres:', error);
    showNotification('Error al cargar talleres', 'error');
  }
}

function renderTalleres(talleresToRender) {
  const tbody = document.getElementById('talleresTable');
  tbody.innerHTML = '';
  
  talleresToRender.forEach(taller => {
    const row = document.createElement('tr');
    const proximoPago = taller.proximoPago ? formatDate(taller.proximoPago) : 'N/A';
    const isVencido = taller.proximoPago && new Date(taller.proximoPago) < new Date();
    
    row.innerHTML = `
      <td>${taller.nombre}</td>
      <td>${taller.email}</td>
      <td><span class="badge badge-${getPlanBadge(taller.plan)}">${taller.plan.toUpperCase()}</span></td>
      <td><span class="badge badge-${getEstadoBadge(taller.estado)}">${taller.estado.toUpperCase()}</span></td>
      <td class="${isVencido ? 'text-danger' : ''}">${proximoPago}</td>
      <td>
        <button class="btn btn-sm btn-info" onclick="editTaller('${taller._id}')" title="Editar">
          <i class="nc-icon nc-ruler-pencil"></i>
        </button>
        <button class="btn btn-sm btn-success" onclick="viewTaller('${taller._id}')" title="Ver detalles">
          <i class="nc-icon nc-zoom-split"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteTaller('${taller._id}')" title="Eliminar">
          <i class="nc-icon nc-simple-remove"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function filterTalleres() {
  const searchTerm = document.getElementById('searchTaller').value.toLowerCase();
  const planFilter = document.getElementById('filterPlan').value;
  const estadoFilter = document.getElementById('filterEstado').value;
  
  let filtered = talleres;
  
  if (searchTerm) {
    filtered = filtered.filter(taller => 
      taller.nombre.toLowerCase().includes(searchTerm) ||
      taller.email.toLowerCase().includes(searchTerm)
    );
  }
  
  if (planFilter) {
    filtered = filtered.filter(taller => taller.plan === planFilter);
  }
  
  if (estadoFilter) {
    filtered = filtered.filter(taller => taller.estado === estadoFilter);
  }
  
  renderTalleres(filtered);
}

function showTallerModal(taller = null) {
  editingTallerId = taller ? taller._id : null;
  
  document.getElementById('tallerModalTitle').textContent = 
    taller ? 'Editar Taller' : 'Nuevo Taller';
  
  // Reset form
  document.getElementById('tallerForm').reset();
  
  if (taller) {
    document.getElementById('tallerId').value = taller._id;
    document.getElementById('nombre').value = taller.nombre;
    document.getElementById('email').value = taller.email;
    document.getElementById('telefono').value = taller.telefono;
    document.getElementById('ciudad').value = taller.ciudad;
    document.getElementById('direccion').value = taller.direccion;
    document.getElementById('plan').value = taller.plan;
    document.getElementById('estado').value = taller.estado;
    document.getElementById('valorMensualidad').value = taller.valorMensualidad;
    
    if (taller.administrador) {
      document.getElementById('adminNombre').value = taller.administrador.nombre;
      document.getElementById('adminEmail').value = taller.administrador.email;
      document.getElementById('adminTelefono').value = taller.administrador.telefono || '';
    }
  } else {
    updatePlanInfo();
  }
  
  $('#tallerModal').modal('show');
}

function updatePlanInfo() {
  const plan = document.getElementById('plan').value;
  const valores = {
    gratuito: 0,
    basico: 70,
    premium: 180
  };
  
  document.getElementById('valorMensualidad').value = valores[plan];
}

async function saveTaller() {
  const form = document.getElementById('tallerForm');
  
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const tallerData = {
    nombre: document.getElementById('nombre').value,
    email: document.getElementById('email').value,
    telefono: document.getElementById('telefono').value,
    ciudad: document.getElementById('ciudad').value,
    direccion: document.getElementById('direccion').value,
    plan: document.getElementById('plan').value,
    estado: document.getElementById('estado').value,
    valorMensualidad: parseFloat(document.getElementById('valorMensualidad').value),
    administrador: {
      nombre: document.getElementById('adminNombre').value,
      email: document.getElementById('adminEmail').value,
      telefono: document.getElementById('adminTelefono').value
    }
  };
  
  try {
    let response;
    if (editingTallerId) {
      response = await fetch(`https://talleres-58bw.onrender.com/api/admin/talleres/${editingTallerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tallerData)
      });
      showNotification('Taller actualizado exitosamente');
    } else {
      response = await fetch('https://talleres-58bw.onrender.com/api/admin/talleres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tallerData)
      });
      showNotification('Taller creado exitosamente');
    }
    
    if (response.ok) {
      $('#tallerModal').modal('hide');
      await loadTalleres();
    } else {
      const error = await response.json();
      showNotification(error.message || 'Error al guardar taller', 'error');
    }
  } catch (error) {
    console.error('Error saving taller:', error);
    showNotification('Error al guardar taller', 'error');
  }
}

function editTaller(id) {
  const taller = talleres.find(t => t._id === id);
  if (taller) {
    showTallerModal(taller);
  }
}

function viewTaller(id) {
  const taller = talleres.find(t => t._id === id);
  if (taller) {
    const detalles = `
      <strong>Nombre:</strong> ${taller.nombre}<br>
      <strong>Email:</strong> ${taller.email}<br>
      <strong>Teléfono:</strong> ${taller.telefono}<br>
      <strong>Dirección:</strong> ${taller.direccion}<br>
      <strong>Ciudad:</strong> ${taller.ciudad}<br>
      <strong>Plan:</strong> ${taller.plan.toUpperCase()}<br>
      <strong>Estado:</strong> ${taller.estado.toUpperCase()}<br>
      <strong>Valor Mensualidad:</strong> ${formatCurrency(taller.valorMensualidad)}<br>
      <strong>Fecha Creación:</strong> ${formatDate(taller.fechaCreacion)}<br>
      <strong>Próximo Pago:</strong> ${taller.proximoPago ? formatDate(taller.proximoPago) : 'N/A'}<br><br>
      <strong>Administrador:</strong><br>
      - Nombre: ${taller.administrador?.nombre || 'N/A'}<br>
      - Email: ${taller.administrador?.email || 'N/A'}<br>
      - Teléfono: ${taller.administrador?.telefono || 'N/A'}
    `;
    
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div class="modal fade" id="viewTallerModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Detalles del Taller</h5>
              <button type="button" class="close" data-dismiss="modal">
                <span>&times;</span>
              </button>
            </div>
            <div class="modal-body">
              ${detalles}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    $('#viewTallerModal').modal('show');
    
    $('#viewTallerModal').on('hidden.bs.modal', function() {
      modal.remove();
    });
  }
}

async function deleteTaller(id) {
  if (!confirm('¿Está seguro de que desea eliminar este taller?')) {
    return;
  }
  
  try {
    const response = await fetch(`https://talleres-58bw.onrender.com/api/admin/talleres/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      showNotification('Taller eliminado exitosamente');
      await loadTalleres();
    } else {
      showNotification('Error al eliminar taller', 'error');
    }
  } catch (error) {
    console.error('Error deleting taller:', error);
    showNotification('Error al eliminar taller', 'error');
  }
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

function showNotification(message, type = 'success') {
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