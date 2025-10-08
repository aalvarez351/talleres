// Vehículos functionality
let vehiculos = [];
let clientes = [];
let editingVehiculoId = null;

document.addEventListener('DOMContentLoaded', function() {
  loadVehiculos();
  loadClientes();
  
  // Search functionality
  document.getElementById('searchVehiculo').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    filterVehiculos(searchTerm);
  });
});

async function loadVehiculos() {
  try {
    vehiculos = await apiRequest(API_CONFIG.ENDPOINTS.VEHICULOS);
    if (vehiculos) {
      renderVehiculos(vehiculos);
    }
  } catch (error) {
    console.error('Error loading vehiculos:', error);
    vehiculos = [];
    renderVehiculos(vehiculos);
  }
}

async function loadClientes() {
  try {
    clientes = await apiRequest(API_CONFIG.ENDPOINTS.CLIENTES);
    if (clientes) {
      populateClientesSelect();
    }
  } catch (error) {
    console.error('Error loading clientes:', error);
    clientes = [];
    populateClientesSelect();
  }
}

function renderVehiculos(vehiculosToRender) {
  const tbody = document.getElementById('vehiculosTable');
  tbody.innerHTML = '';
  
  if (!vehiculosToRender || !Array.isArray(vehiculosToRender)) {
    return;
  }
  
  vehiculosToRender.forEach(vehiculo => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${vehiculo.placa}</td>
      <td>${vehiculo.marca}</td>
      <td>${vehiculo.modelo}</td>
      <td>${vehiculo.ano || '-'}</td>
      <td>${vehiculo.cliente?.nombre || 'N/A'}</td>
      <td>${vehiculo.kilometraje || '-'}</td>
      <td>
        <button class="btn btn-sm btn-info" onclick="editVehiculo('${vehiculo._id}')">
          <i class="nc-icon nc-ruler-pencil"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteVehiculo('${vehiculo._id}')">
          <i class="nc-icon nc-simple-remove"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function filterVehiculos(searchTerm) {
  const filtered = vehiculos.filter(vehiculo => 
    vehiculo.placa.toLowerCase().includes(searchTerm) ||
    vehiculo.marca.toLowerCase().includes(searchTerm) ||
    vehiculo.modelo.toLowerCase().includes(searchTerm)
  );
  renderVehiculos(filtered);
}

function populateClientesSelect() {
  const select = document.getElementById('clienteId');
  select.innerHTML = '<option value="">Seleccionar cliente</option>';
  
  if (!clientes || !Array.isArray(clientes)) {
    return;
  }
  
  clientes.forEach(cliente => {
    const option = document.createElement('option');
    option.value = cliente._id;
    option.textContent = cliente.nombre;
    select.appendChild(option);
  });
}

function showVehiculoModal(vehiculo = null) {
  editingVehiculoId = vehiculo ? vehiculo._id : null;
  
  document.getElementById('vehiculoModalTitle').textContent = 
    vehiculo ? 'Editar Vehículo' : 'Nuevo Vehículo';
  
  // Reset form
  document.getElementById('vehiculoForm').reset();
  
  if (vehiculo) {
    document.getElementById('vehiculoId').value = vehiculo._id;
    document.getElementById('clienteId').value = vehiculo.cliente?._id || '';
    document.getElementById('placa').value = vehiculo.placa;
    document.getElementById('marca').value = vehiculo.marca;
    document.getElementById('modelo').value = vehiculo.modelo;
    document.getElementById('ano').value = vehiculo.ano || '';
    document.getElementById('kilometraje').value = vehiculo.kilometraje || '';
  }
  
  $('#vehiculoModal').modal('show');
}

function editVehiculo(id) {
  const vehiculo = vehiculos.find(v => v._id === id);
  if (vehiculo) {
    showVehiculoModal(vehiculo);
  }
}

async function saveVehiculo() {
  const form = document.getElementById('vehiculoForm');
  
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const vehiculoData = {
    cliente: document.getElementById('clienteId').value,
    placa: document.getElementById('placa').value,
    marca: document.getElementById('marca').value,
    modelo: document.getElementById('modelo').value,
    ano: document.getElementById('ano').value ? parseInt(document.getElementById('ano').value) : null,
    kilometraje: document.getElementById('kilometraje').value ? parseInt(document.getElementById('kilometraje').value) : null
  };
  
  try {
    if (editingVehiculoId) {
      // Update existing vehiculo
      await apiRequest(`${API_CONFIG.ENDPOINTS.VEHICULOS}/${editingVehiculoId}`, {
        method: 'PUT',
        body: JSON.stringify(vehiculoData)
      });
      showNotification('Vehículo actualizado exitosamente');
    } else {
      // Create new vehiculo
      await apiRequest(API_CONFIG.ENDPOINTS.VEHICULOS, {
        method: 'POST',
        body: JSON.stringify(vehiculoData)
      });
      showNotification('Vehículo creado exitosamente');
    }
    
    $('#vehiculoModal').modal('hide');
    loadVehiculos();
  } catch (error) {
    console.error('Error saving vehiculo:', error);
    showNotification('Error al guardar el vehículo', 'error');
  }
}

async function deleteVehiculo(id) {
  if (!confirm('¿Está seguro de que desea eliminar este vehículo?')) {
    return;
  }
  
  try {
    await apiRequest(`${API_CONFIG.ENDPOINTS.VEHICULOS}/${id}`, {
      method: 'DELETE'
    });
    showNotification('Vehículo eliminado exitosamente');
    loadVehiculos();
  } catch (error) {
    console.error('Error deleting vehiculo:', error);
    showNotification('Error al eliminar el vehículo', 'error');
  }
}