// Órdenes functionality
let ordenes = [];
let clientes = [];
let vehiculos = [];
let editingOrdenId = null;

document.addEventListener('DOMContentLoaded', function() {
  loadOrdenes();
  loadClientes();
  loadVehiculos();
  
  // Search and filter functionality
  document.getElementById('searchOrden').addEventListener('input', filterOrdenes);
  document.getElementById('filterEstado').addEventListener('change', filterOrdenes);
});

async function loadOrdenes() {
  try {
    ordenes = await apiRequest(API_CONFIG.ENDPOINTS.ORDENES);
    renderOrdenes(ordenes);
  } catch (error) {
    console.error('Error loading ordenes:', error);
    showNotification('Error al cargar las órdenes', 'error');
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
  } catch (error) {
    console.error('Error loading vehiculos:', error);
  }
}

function renderOrdenes(ordenesToRender) {
  const tbody = document.getElementById('ordenesTable');
  tbody.innerHTML = '';
  
  ordenesToRender.forEach(orden => {
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
      <td>${formatDate(orden.fechaCreacion)}</td>
      <td>
        <button class="btn btn-sm btn-info" onclick="editOrden('${orden._id}')">
          <i class="nc-icon nc-ruler-pencil"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteOrden('${orden._id}')">
          <i class="nc-icon nc-simple-remove"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
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
  const manoObra = parseFloat(document.getElementById('manoObra').value) || 0;
  document.getElementById('total').value = manoObra;
}

function showOrdenModal(orden = null) {
  editingOrdenId = orden ? orden._id : null;
  
  document.getElementById('ordenModalTitle').textContent = 
    orden ? 'Editar Orden' : 'Nueva Orden';
  
  // Reset form
  document.getElementById('ordenForm').reset();
  
  if (orden) {
    document.getElementById('ordenId').value = orden._id;
    document.getElementById('clienteId').value = orden.cliente?._id || '';
    document.getElementById('vehiculoId').value = orden.vehiculo?._id || '';
    document.getElementById('descripcion').value = orden.descripcion;
    document.getElementById('manoObra').value = orden.manoObra || 0;
    document.getElementById('estado').value = orden.estado;
    document.getElementById('total').value = orden.total || 0;
    
    // Load vehiculos for selected cliente
    if (orden.cliente?._id) {
      loadVehiculosByCliente();
      setTimeout(() => {
        document.getElementById('vehiculoId').value = orden.vehiculo?._id || '';
      }, 100);
    }
  }
  
  $('#ordenModal').modal('show');
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
  
  const ordenData = {
    cliente: document.getElementById('clienteId').value,
    vehiculo: document.getElementById('vehiculoId').value,
    descripcion: document.getElementById('descripcion').value,
    manoObra: parseFloat(document.getElementById('manoObra').value) || 0,
    estado: document.getElementById('estado').value,
    total: parseFloat(document.getElementById('total').value) || 0
  };
  
  try {
    if (editingOrdenId) {
      // Update existing orden
      await apiRequest(`${API_CONFIG.ENDPOINTS.ORDENES}/${editingOrdenId}`, {
        method: 'PUT',
        body: JSON.stringify(ordenData)
      });
      showNotification('Orden actualizada exitosamente');
    } else {
      // Create new orden
      await apiRequest(API_CONFIG.ENDPOINTS.ORDENES, {
        method: 'POST',
        body: JSON.stringify(ordenData)
      });
      showNotification('Orden creada exitosamente');
    }
    
    $('#ordenModal').modal('hide');
    loadOrdenes();
  } catch (error) {
    console.error('Error saving orden:', error);
    showNotification('Error al guardar la orden', 'error');
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