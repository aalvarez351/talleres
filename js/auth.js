// Authentication functionality
document.addEventListener('DOMContentLoaded', function() {
  // Only handle login form if we're on login page
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});

async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  // Demo authentication
  const users = {
    'admin@example.com': { role: 'admin', name: 'Administrador' },
    'mecanico@example.com': { role: 'mecanico', name: 'Mecánico' },
    'recepcion@example.com': { role: 'recepcion', name: 'Recepcionista' }
  };
  
  if (users[email] && password === 'password') {
    const user = users[email];
    const demoToken = 'demo-token-' + Date.now();
    localStorage.setItem('authToken', demoToken);
    localStorage.setItem('user', JSON.stringify({ email, ...user }));
    window.location.href = './dashboard.html';
  } else {
    alert('Email o contraseña incorrectos');
  }
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = './login.html';
}

// Check authentication on protected pages
function checkAuth() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.replace('./login.html');
    return false;
  }
  return true;
}