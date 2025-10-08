// Admin Pagos functionality
let pagos = [];
let talleres = [];

document.addEventListener('DOMContentLoaded', function() {
  loadData();
  
  // Search and filter functionality
  document.getElementById('searchPago').addEventListener('input', filterPagos);
  document.getElementById('filterEstadoPago').addEventListener('change', filterPagos);
  document.getElementById('filterMes').addEventListener('change', filterPagos);
});

async function loadData() {
  try {
    await Promise.all([
      loadPagos(),
      loadTalleres(),
      loadTalleresVencidos()
    ]);
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

async function loadPagos() {
  try {
    const response = await fetch('https://talleres-58bw.onrender.com/api/admin/pagos');
    pagos = await response.json();
    renderPagos(pagos);
  } catch (error) {
    console.error('Error loading pagos:', error);
    showNotification('Error al cargar pagos', 'error');
  }
}

async function loadTalleres() {
  try {
    const response = await fetch('https://talleres-58bw.onrender.com/api/admin/talleres');
    talleres = await response.json();
    populateTalleresSelect();
  } catch (error) {
    console.error('Error loading talleres:', error);
  }
}

async function loadTalleresVencidos() {
  try {
    const response = await fetch('https://talleres-58bw.onrender.com/api/admin/talleres');
    const allTalleres = await response.json();
    
    const vencidos = allTalleres.filter(taller => {
      if (taller.plan === 'gratuito') return false;
      if (!taller.proximoPago) return false;
      return new Date(taller.proximoPago) < new Date();
    });
    
    renderTalleresVencidos(vencidos);
  } catch (error) {
    console.error('Error loading overdue workshops:', error);
  }
}

function renderTalleresVencidos(talleresVencidos) {
  const tbody = document.getElementById('talleresVencidos');
  tbody.innerHTML = '';
  
  if (talleresVencidos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-success">No hay talleres con pagos vencidos</td></tr>';
    return;
  }
  
  talleresVencidos.forEach(taller => {
    const diasVencido = Math.floor((new Date() - new Date(taller.proximoPago)) / (1000 * 60 * 60 * 24));
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${taller.nombre}</td>
      <td><span class="badge badge-${getPlanBadge(taller.plan)}">${taller.plan.toUpperCase()}</span></td>
      <td class="text-danger">${diasVencido} días</td>
      <td>${formatCurrency(taller.valorMensualidad)}</td>
      <td>
        <button class="btn btn-sm btn-success" onclick="registrarPagoRapido('${taller._id}')" title="Registrar pago">
          <i class="nc-icon nc-money-coins"></i> Pagar
        </button>
        <button class="btn btn-sm btn-warning" onclick="suspenderTaller('${taller._id}')" title="Suspender">
          <i class="nc-icon nc-simple-remove"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function renderPagos(pagosToRender) {
  const tbody = document.getElementById('pagosTable');
  tbody.innerHTML = '';
  
  pagosToRender.forEach(pago => {
    const row = document.createElement('tr');
    const periodoTexto = `${formatDate(pago.periodo.inicio)} - ${formatDate(pago.periodo.fin)}`;
    
    row.innerHTML = `
      <td>${formatDate(pago.fecha)}</td>
      <td>${pago.taller?.nombre || 'N/A'}</td>
      <td>${formatCurrency(pago.monto)}</td>
      <td><span class="badge badge-info">${pago.metodoPago.toUpperCase()}</span></td>
      <td><span class="badge badge-${getEstadoPagoBadge(pago.estado)}">${pago.estado.toUpperCase()}</span></td>
      <td>${periodoTexto}</td>
      <td>
        <button class="btn btn-sm btn-info" onclick="viewPago('${pago._id}')" title="Ver detalles">
          <i class="nc-icon nc-zoom-split"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function filterPagos() {
  const searchTerm = document.getElementById('searchPago').value.toLowerCase();
  const estadoFilter = document.getElementById('filterEstadoPago').value;
  const mesFilter = document.getElementById('filterMes').value;
  
  let filtered = pagos;
  
  if (searchTerm) {
    filtered = filtered.filter(pago => 
      pago.taller?.nombre.toLowerCase().includes(searchTerm)
    );
  }
  
  if (estadoFilter) {
    filtered = filtered.filter(pago => pago.estado === estadoFilter);
  }
  
  if (mesFilter) {
    const [year, month] = mesFilter.split('-');
    filtered = filtered.filter(pago => {
      const pagoDate = new Date(pago.fecha);
      return pagoDate.getFullYear() == year && (pagoDate.getMonth() + 1) == month;
    });
  }
  
  renderPagos(filtered);
}

function populateTalleresSelect() {
  const select = document.getElementById('tallerId');
  select.innerHTML = '<option value="">Seleccionar taller</option>';
  
  talleres.filter(t => t.plan !== 'gratuito').forEach(taller => {
    const option = document.createElement('option');
    option.value = taller._id;
    option.textContent = `${taller.nombre} - ${taller.plan.toUpperCase()}`;
    option.dataset.valor = taller.valorMensualidad;
    select.appendChild(option);
  });
}

function updateMontoSugerido() {
  const select = document.getElementById('tallerId');
  const selectedOption = select.options[select.selectedIndex];
  const valor = selectedOption.dataset.valor || 0;
  
  document.getElementById('montoSugerido').textContent = formatCurrency(valor);
  document.getElementById('monto').value = valor;
}

function showPagoModal() {
  document.getElementById('pagoForm').reset();
  document.getElementById('montoSugerido').textContent = '$0';
  $('#pagoModal').modal('show');
}

async function savePago() {
  const form = document.getElementById('pagoForm');
  
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const pagoData = {
    tallerId: document.getElementById('tallerId').value,
    monto: parseFloat(document.getElementById('monto').value),
    metodoPago: document.getElementById('metodoPago').value,
    referencia: document.getElementById('referencia').value,
    notas: document.getElementById('notas').value
  };
  
  try {
    const response = await fetch('https://talleres-58bw.onrender.com/api/admin/pagos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pagoData)
    });
    
    if (response.ok) {
      showNotification('Pago registrado exitosamente');
      $('#pagoModal').modal('hide');
      await loadData();
    } else {
      const error = await response.json();
      showNotification(error.message || 'Error al registrar pago', 'error');
    }
  } catch (error) {
    console.error('Error saving pago:', error);
    showNotification('Error al registrar pago', 'error');
  }
}

async function registrarPagoRapido(tallerId) {
  const taller = talleres.find(t => t._id === tallerId);
  if (!taller) return;
  
  const pagoData = {
    tallerId: tallerId,
    monto: taller.valorMensualidad,
    metodoPago: 'transferencia',
    referencia: `Pago rápido - ${new Date().toISOString().split('T')[0]}`,
    notas: 'Pago registrado desde talleres vencidos'
  };
  
  try {
    const response = await fetch('https://talleres-58bw.onrender.com/api/admin/pagos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pagoData)
    });
    
    if (response.ok) {
      showNotification(`Pago registrado para ${taller.nombre}`);
      await loadData();
    } else {
      showNotification('Error al registrar pago', 'error');
    }
  } catch (error) {
    console.error('Error registering quick payment:', error);
    showNotification('Error al registrar pago', 'error');
  }
}

async function suspenderTaller(tallerId) {
  if (!confirm('¿Está seguro de suspender este taller?')) return;
  
  try {
    const response = await fetch(`https://talleres-58bw.onrender.com/api/admin/talleres/${tallerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'suspendido' })
    });
    
    if (response.ok) {
      showNotification('Taller suspendido');
      await loadData();
    } else {
      showNotification('Error al suspender taller', 'error');
    }
  } catch (error) {
    console.error('Error suspending workshop:', error);
    showNotification('Error al suspender taller', 'error');
  }
}

function viewPago(pagoId) {
  const pago = pagos.find(p => p._id === pagoId);
  if (!pago) return;
  
  const detalles = `
    <strong>Taller:</strong> ${pago.taller?.nombre || 'N/A'}<br>
    <strong>Monto:</strong> ${formatCurrency(pago.monto)}<br>
    <strong>Fecha:</strong> ${formatDate(pago.fecha)}<br>
    <strong>Método:</strong> ${pago.metodoPago.toUpperCase()}<br>
    <strong>Estado:</strong> ${pago.estado.toUpperCase()}<br>
    <strong>Referencia:</strong> ${pago.referencia || 'N/A'}<br>
    <strong>Período:</strong> ${formatDate(pago.periodo.inicio)} - ${formatDate(pago.periodo.fin)}<br>
    <strong>Procesado por:</strong> ${pago.procesadoPor}<br>
    <strong>Notas:</strong> ${pago.notas || 'N/A'}
  `;
  
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div class="modal fade" id="viewPagoModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Detalles del Pago</h5>
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
  $('#viewPagoModal').modal('show');
  
  $('#viewPagoModal').on('hidden.bs.modal', function() {
    modal.remove();
  });
}

function getPlanBadge(plan) {
  const badges = {
    'gratuito': 'success',
    'basico': 'info',
    'premium': 'warning'
  };
  return badges[plan] || 'secondary';
}

function getEstadoPagoBadge(estado) {
  const badges = {
    'confirmado': 'success',
    'pendiente': 'warning',
    'rechazado': 'danger'
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