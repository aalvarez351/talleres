// Authentication functionality
document.addEventListener('DOMContentLoaded', function() {
  // Check if already logged in
  const token = localStorage.getItem('authToken');
  if (token && window.location.pathname !== '/login.html') {
    // User is logged in, continue
    return;
  } else if (!token && window.location.pathname !== '/login.html') {
    // User not logged in, redirect to login
    window.location.href = './login.html';
    return;
  }

  // Login form handler
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
    window.location.href = './login.html';
    return false;
  }
  return true;
}