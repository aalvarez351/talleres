// Órdenes functionality
let ordenes = [];
let clientes = [];
let vehiculos = [];
let repuestos = [];
let editingOrdenId = null;
let ordenCounter = 1;

document.addEventListener('DOMContentLoaded', function() {
  loadOrdenes();
  loadClientes();
  loadVehiculos();
  loadRepuestos();
  
  // Search and filter functionality
  document.getElementById('searchOrden').addEventListener('input', filterOrdenes);
  document.getElementById('filterEstado').addEventListener('change', filterOrdenes);
});

async function loadOrdenes() {
  try {
    ordenes = await apiRequest(API_CONFIG.ENDPOINTS.ORDENES);
    if (!ordenes || !Array.isArray(ordenes)) {
      ordenes = [];
    }
    
    // Update orden counter based on existing orders
    if (ordenes.length > 0) {
      const maxNumber = Math.max(...ordenes.map(o => {
        const numero = o.numero || o.numeroOrden || '';
        const match = numero.match(/-(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      }));
      ordenCounter = maxNumber + 1;
    }
    
    renderOrdenes(ordenes);
  } catch (error) {
    console.error('Error loading ordenes:', error);
    ordenes = [];
    renderOrdenes(ordenes);
  }
}

async function loadClientes() {
  try {
    clientes = await apiRequest(API_CONFIG.ENDPOINTS.CLIENTES);
    populateClientesSelect();
  } catch (error) {
    console.error('Error loading clientes:', error);
  }
}

async function loadVehiculos() {
  try {
    vehiculos = await apiRequest(API_CONFIG.ENDPOINTS.VEHICULOS);
    if (!vehiculos || !Array.isArray(vehiculos)) {
      vehiculos = [];
    }
  } catch (error) {
    console.error('Error loading vehiculos:', error);
    vehiculos = [];
  }
}

async function loadRepuestos() {
  try {
    repuestos = await apiRequest(API_CONFIG.ENDPOINTS.REPUESTOS);
    if (!repuestos || !Array.isArray(repuestos)) {
      repuestos = [];
    }
  } catch (error) {
    console.error('Error loading repuestos:', error);
    repuestos = [];
  }
}

function renderOrdenes(ordenesToRender) {
  const tbody = document.getElementById('ordenesTable');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (!ordenesToRender || !Array.isArray(ordenesToRender)) {
    return;
  }
  
  ordenesToRender.forEach(orden => {
    const row = document.createElement('tr');
    
    const estadoClass = {
      'Pendiente': 'text-warning',
      'En progreso': 'text-info',
      'Completado': 'text-success',
      'Entregado': 'text-primary'
    };
    
    const clienteNombre = orden.cliente?.nombre || (typeof orden.cliente === 'string' ? 'Cliente ID: ' + orden.cliente : 'N/A');
    const vehiculoInfo = orden.vehiculo ? `${orden.vehiculo.marca || ''} ${orden.vehiculo.modelo || ''}` : 'N/A';
    const fechaCreacion = orden.createdAt || orden.fechaCreacion || new Date();
    
    row.innerHTML = `
      <td>${orden.numero || orden.numeroOrden || 'N/A'}</td>
      <td>${clienteNombre}</td>
      <td>${vehiculoInfo}</td>
      <td><span class="badge badge-${getEstadoBadge(orden.estado)}">${orden.estado || 'Pendiente'}</span></td>
      <td>${formatCurrency(orden.total || 0)}</td>
      <td>${formatDate(fechaCreacion)}</td>
      <td>
        <button class="btn btn-sm btn-info" onclick="editOrden('${orden._id}')" title="Editar">
          <i class="nc-icon nc-ruler-pencil"></i>
        </button>
        <button class="btn btn-sm btn-success" onclick="viewOrden('${orden._id}')" title="Ver detalles">
          <i class="nc-icon nc-zoom-split"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteOrden('${orden._id}')" title="Eliminar">
          <i class="nc-icon nc-simple-remove"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
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

function filterOrdenes() {
  const searchTerm = document.getElementById('searchOrden').value.toLowerCase();
  const estadoFilter = document.getElementById('filterEstado').value;
  
  let filtered = ordenes;
  
  if (searchTerm) {
    filtered = filtered.filter(orden => 
      orden.numeroOrden.toLowerCase().includes(searchTerm) ||
      (orden.cliente?.nombre || '').toLowerCase().includes(searchTerm)
    );
  }
  
  if (estadoFilter) {
    filtered = filtered.filter(orden => orden.estado === estadoFilter);
  }
  
  renderOrdenes(filtered);
}

function populateClientesSelect() {
  const select = document.getElementById('clienteId');
  select.innerHTML = '<option value="">Seleccionar cliente</option>';
  
  clientes.forEach(cliente => {
    const option = document.createElement('option');
    option.value = cliente._id;
    option.textContent = cliente.nombre;
    select.appendChild(option);
  });
}

function loadVehiculosByCliente() {
  const clienteId = document.getElementById('clienteId').value;
  const vehiculoSelect = document.getElementById('vehiculoId');
  
  if (!vehiculoSelect) return;
  
  vehiculoSelect.innerHTML = '<option value="">Seleccionar vehículo</option>';
  
  if (clienteId && vehiculos && Array.isArray(vehiculos)) {
    const vehiculosCliente = vehiculos.filter(v => v.cliente === clienteId || (v.cliente && v.cliente._id === clienteId));
    vehiculosCliente.forEach(vehiculo => {
      const option = document.createElement('option');
      option.value = vehiculo._id;
      option.textContent = `${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.placa}`;
      vehiculoSelect.appendChild(option);
    });
  }
}

function calcularTotal() {
  const manoObra = parseFloat(document.getElementById('manoDeObra').value) || 0;
  // In future versions, add repuestos cost here
  const repuestosCost = 0; // TODO: Calculate from selected repuestos
  const total = manoObra + repuestosCost;
  
  const totalField = document.getElementById('total');
  if (totalField) {
    totalField.value = total.toFixed(2);
  }
}

function viewOrden(id) {
  const orden = ordenes.find(o => o._id === id);
  if (orden) {
    const cliente = clientes.find(c => c._id === (orden.cliente?._id || orden.cliente));
    const vehiculo = vehiculos.find(v => v._id === (orden.vehiculo?._id || orden.vehiculo));
    
    let detalles = `
      <strong>Orden:</strong> ${orden.numero || orden.numeroOrden || 'N/A'}<br>
      <strong>Cliente:</strong> ${cliente?.nombre || 'N/A'}<br>
      <strong>Vehículo:</strong> ${vehiculo ? `${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.placa}` : 'N/A'}<br>
      <strong>Descripción:</strong> ${orden.descripcion || 'N/A'}<br>
      <strong>Estado:</strong> ${orden.estado || 'Pendiente'}<br>
      <strong>Mano de Obra:</strong> ${formatCurrency(orden.manoDeObra || orden.manoObra || 0)}<br>
      <strong>Total:</strong> ${formatCurrency(orden.total || 0)}<br>
      <strong>Fecha:</strong> ${formatDate(orden.createdAt || orden.fechaCreacion || new Date())}
    `;
    
    // Create a simple modal or alert with details
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div class="modal fade" id="viewOrdenModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Detalles de la Orden</h5>
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
    $('#viewOrdenModal').modal('show');
    
    // Remove modal after hiding
    $('#viewOrdenModal').on('hidden.bs.modal', function() {
      modal.remove();
    });
  }
}

function showOrdenModal(orden = null) {
  editingOrdenId = orden ? orden._id : null;
  
  document.getElementById('ordenModalTitle').textContent = 
    orden ? 'Editar Orden' : 'Nueva Orden';
  
  // Reset form
  document.getElementById('ordenForm').reset();
  
  if (orden) {
    document.getElementById('ordenId').value = orden._id;
    const clienteId = orden.cliente?._id || orden.cliente;
    const vehiculoId = orden.vehiculo?._id || orden.vehiculo;
    
    document.getElementById('clienteId').value = clienteId || '';
    document.getElementById('descripcion').value = orden.descripcion || '';
    document.getElementById('manoDeObra').value = orden.manoDeObra || orden.manoObra || 0;
    document.getElementById('estado').value = orden.estado || 'Pendiente';
    document.getElementById('total').value = orden.total || 0;
    
    // Load vehiculos for selected cliente
    if (clienteId) {
      loadVehiculosByCliente();
      setTimeout(() => {
        document.getElementById('vehiculoId').value = vehiculoId || '';
      }, 200);
    }
  } else {
    // Generate new orden number
    generateOrdenNumber();
  }
  
  $('#ordenModal').modal('show');
}

function generateOrdenNumber() {
  const year = new Date().getFullYear();
  const nextNumber = String(ordenCounter).padStart(3, '0');
  const numeroOrden = `OS-${year}-${nextNumber}`;
  
  // Update counter for next orden
  ordenCounter++;
  
  // Display the number (you can add a field to show it)
  console.log('Nueva orden:', numeroOrden);
}

function editOrden(id) {
  const orden = ordenes.find(o => o._id === id);
  if (orden) {
    showOrdenModal(orden);
  }
}

async function saveOrden() {
  const form = document.getElementById('ordenForm');
  
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const clienteId = document.getElementById('clienteId').value;
  const vehiculoId = document.getElementById('vehiculoId').value;
  const descripcion = document.getElementById('descripcion').value;
  const manoDeObra = parseFloat(document.getElementById('manoDeObra').value) || 0;
  const estado = document.getElementById('estado').value;
  const total = parseFloat(document.getElementById('total').value) || manoDeObra;
  
  if (!clienteId || !vehiculoId || !descripcion) {
    showNotification('Por favor complete todos los campos requeridos', 'error');
    return;
  }
  
  const ordenData = {
    cliente: clienteId,
    vehiculo: vehiculoId,
    descripcion: descripcion,
    manoDeObra: manoDeObra,
    estado: estado,
    total: total
  };
  
  // Add orden number for new orders
  if (!editingOrdenId) {
    const year = new Date().getFullYear();
    const nextNumber = String(ordenCounter).padStart(3, '0');
    ordenData.numero = `OS-${year}-${nextNumber}`;
    ordenCounter++;
  }
  
  try {
    let response;
    if (editingOrdenId) {
      // Update existing orden
      response = await apiRequest(`${API_CONFIG.ENDPOINTS.ORDENES}/${editingOrdenId}`, {
        method: 'PUT',
        body: JSON.stringify(ordenData)
      });
      showNotification('Orden actualizada exitosamente');
    } else {
      // Create new orden
      response = await apiRequest(API_CONFIG.ENDPOINTS.ORDENES, {
        method: 'POST',
        body: JSON.stringify(ordenData)
      });
      showNotification('Orden creada exitosamente');
    }
    
    $('#ordenModal').modal('hide');
    await loadOrdenes();
  } catch (error) {
    console.error('Error saving orden:', error);
    showNotification('Error al guardar la orden: ' + (error.message || 'Error desconocido'), 'error');
  }
}

async function deleteOrden(id) {
  if (!confirm('¿Está seguro de que desea eliminar esta orden?')) {
    return;
  }
  
  try {
    await apiRequest(`${API_CONFIG.ENDPOINTS.ORDENES}/${id}`, {
      method: 'DELETE'
    });
    showNotification('Orden eliminada exitosamente');
    loadOrdenes();
  } catch (error) {
    console.error('Error deleting orden:', error);
    showNotification('Error al eliminar la orden', 'error');
  }
}