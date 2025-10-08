// Clientes functionality
let clientes = [];
let editingClienteId = null;

document.addEventListener('DOMContentLoaded', function() {
  loadClientes();
  
  // Search functionality
  document.getElementById('searchCliente').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    filterClientes(searchTerm);
  });
});

async function loadClientes() {
  try {
    console.log('Loading clientes...');
    clientes = await apiRequest(API_CONFIG.ENDPOINTS.CLIENTES);
    console.log('Clientes loaded:', clientes);
    if (clientes && Array.isArray(clientes)) {
      renderClientes(clientes);
    } else {
      clientes = [];
      renderClientes(clientes);
    }
  } catch (error) {
    console.error('Error loading clientes:', error);
    clientes = [];
    renderClientes(clientes);
  }
}

function renderClientes(clientesToRender) {
  const tbody = document.getElementById('clientesTable');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (!clientesToRender || !Array.isArray(clientesToRender)) {
    return;
  }
  
  clientesToRender.forEach(cliente => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${cliente.nombre}</td>
      <td>${cliente.telefono}</td>
      <td>${cliente.email || '-'}</td>
      <td>${cliente.direccion || '-'}</td>
      <td>
        <button class="btn btn-sm btn-info" onclick="editCliente('${cliente._id}')">
          <i class="nc-icon nc-ruler-pencil"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteCliente('${cliente._id}')">
          <i class="nc-icon nc-simple-remove"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function filterClientes(searchTerm) {
  const filtered = clientes.filter(cliente => 
    cliente.nombre.toLowerCase().includes(searchTerm) ||
    cliente.telefono.includes(searchTerm)
  );
  renderClientes(filtered);
}

function showClienteModal(cliente = null) {
  editingClienteId = cliente ? cliente._id : null;
  
  document.getElementById('clienteModalTitle').textContent = 
    cliente ? 'Editar Cliente' : 'Nuevo Cliente';
  
  // Reset form
  document.getElementById('clienteForm').reset();
  
  if (cliente) {
    document.getElementById('clienteId').value = cliente._id;
    document.getElementById('nombre').value = cliente.nombre;
    document.getElementById('telefono').value = cliente.telefono;
    document.getElementById('email').value = cliente.email || '';
    document.getElementById('direccion').value = cliente.direccion || '';
  }
  
  $('#clienteModal').modal('show');
}

function editCliente(id) {
  const cliente = clientes.find(c => c._id === id);
  if (cliente) {
    showClienteModal(cliente);
  }
}

async function saveCliente() {
  const form = document.getElementById('clienteForm');
  
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const clienteData = {
    nombre: document.getElementById('nombre').value,
    telefono: document.getElementById('telefono').value,
    email: document.getElementById('email').value,
    direccion: document.getElementById('direccion').value
  };
  
  try {
    if (editingClienteId) {
      // Update existing cliente
      await apiRequest(`${API_CONFIG.ENDPOINTS.CLIENTES}/${editingClienteId}`, {
        method: 'PUT',
        body: JSON.stringify(clienteData)
      });
      showNotification('Cliente actualizado exitosamente');
    } else {
      // Create new cliente
      await apiRequest(API_CONFIG.ENDPOINTS.CLIENTES, {
        method: 'POST',
        body: JSON.stringify(clienteData)
      });
      showNotification('Cliente creado exitosamente');
    }
    
    $('#clienteModal').modal('hide');
    loadClientes();
  } catch (error) {
    console.error('Error saving cliente:', error);
    showNotification('Error al guardar el cliente', 'error');
  }
}

async function deleteCliente(id) {
  if (!confirm('¿Está seguro de que desea eliminar este cliente?')) {
    return;
  }
  
  try {
    await apiRequest(`${API_CONFIG.ENDPOINTS.CLIENTES}/${id}`, {
      method: 'DELETE'
    });
    showNotification('Cliente eliminado exitosamente');
    loadClientes();
  } catch (error) {
    console.error('Error deleting cliente:', error);
    showNotification('Error al eliminar el cliente', 'error');
  }
}