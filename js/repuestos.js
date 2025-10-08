// Repuestos functionality
let repuestos = [];
let editingRepuestoId = null;

document.addEventListener('DOMContentLoaded', function() {
  loadRepuestos();
  
  // Search and filter functionality
  document.getElementById('searchRepuesto').addEventListener('input', filterRepuestos);
  document.getElementById('filterStock').addEventListener('change', filterRepuestos);
});

async function loadRepuestos() {
  try {
    repuestos = await apiRequest(API_CONFIG.ENDPOINTS.REPUESTOS);
    renderRepuestos(repuestos);
  } catch (error) {
    console.error('Error loading repuestos:', error);
    showNotification('Error al cargar los repuestos', 'error');
  }
}

function renderRepuestos(repuestosToRender) {
  const tbody = document.getElementById('repuestosTable');
  tbody.innerHTML = '';
  
  repuestosToRender.forEach(repuesto => {
    const row = document.createElement('tr');
    
    const stockStatus = repuesto.stock <= 5 ? 'text-danger' : 'text-success';
    const stockText = repuesto.stock <= 5 ? 'Stock Bajo' : 'Disponible';
    
    row.innerHTML = `
      <td>${repuesto.nombre}</td>
      <td>${formatCurrency(repuesto.costo)}</td>
      <td>${formatCurrency(repuesto.precio)}</td>
      <td>${repuesto.stock}</td>
      <td><span class="${stockStatus}">${stockText}</span></td>
      <td>
        <button class="btn btn-sm btn-info" onclick="editRepuesto('${repuesto._id}')">
          <i class="nc-icon nc-ruler-pencil"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteRepuesto('${repuesto._id}')">
          <i class="nc-icon nc-simple-remove"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function filterRepuestos() {
  const searchTerm = document.getElementById('searchRepuesto').value.toLowerCase();
  const stockFilter = document.getElementById('filterStock').value;
  
  let filtered = repuestos;
  
  if (searchTerm) {
    filtered = filtered.filter(repuesto => 
      repuesto.nombre.toLowerCase().includes(searchTerm)
    );
  }
  
  if (stockFilter) {
    if (stockFilter === 'bajo') {
      filtered = filtered.filter(repuesto => repuesto.stock <= 5);
    } else if (stockFilter === 'disponible') {
      filtered = filtered.filter(repuesto => repuesto.stock > 5);
    }
  }
  
  renderRepuestos(filtered);
}

function showRepuestoModal(repuesto = null) {
  editingRepuestoId = repuesto ? repuesto._id : null;
  
  document.getElementById('repuestoModalTitle').textContent = 
    repuesto ? 'Editar Repuesto' : 'Nuevo Repuesto';
  
  // Reset form
  document.getElementById('repuestoForm').reset();
  
  if (repuesto) {
    document.getElementById('repuestoId').value = repuesto._id;
    document.getElementById('nombre').value = repuesto.nombre;
    document.getElementById('costo').value = repuesto.costo;
    document.getElementById('precio').value = repuesto.precio;
    document.getElementById('stock').value = repuesto.stock;
  }
  
  $('#repuestoModal').modal('show');
}

function editRepuesto(id) {
  const repuesto = repuestos.find(r => r._id === id);
  if (repuesto) {
    showRepuestoModal(repuesto);
  }
}

async function saveRepuesto() {
  const form = document.getElementById('repuestoForm');
  
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const repuestoData = {
    nombre: document.getElementById('nombre').value,
    costo: parseFloat(document.getElementById('costo').value),
    precio: parseFloat(document.getElementById('precio').value),
    stock: parseInt(document.getElementById('stock').value)
  };
  
  try {
    if (editingRepuestoId) {
      // Update existing repuesto
      await apiRequest(`${API_CONFIG.ENDPOINTS.REPUESTOS}/${editingRepuestoId}`, {
        method: 'PUT',
        body: JSON.stringify(repuestoData)
      });
      showNotification('Repuesto actualizado exitosamente');
    } else {
      // Create new repuesto
      await apiRequest(API_CONFIG.ENDPOINTS.REPUESTOS, {
        method: 'POST',
        body: JSON.stringify(repuestoData)
      });
      showNotification('Repuesto creado exitosamente');
    }
    
    $('#repuestoModal').modal('hide');
    loadRepuestos();
  } catch (error) {
    console.error('Error saving repuesto:', error);
    showNotification('Error al guardar el repuesto', 'error');
  }
}

async function deleteRepuesto(id) {
  if (!confirm('¿Está seguro de que desea eliminar este repuesto?')) {
    return;
  }
  
  try {
    await apiRequest(`${API_CONFIG.ENDPOINTS.REPUESTOS}/${id}`, {
      method: 'DELETE'
    });
    showNotification('Repuesto eliminado exitosamente');
    loadRepuestos();
  } catch (error) {
    console.error('Error deleting repuesto:', error);
    showNotification('Error al eliminar el repuesto', 'error');
  }
}