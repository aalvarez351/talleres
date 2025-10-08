// Authentication functionality
document.addEventListener('DOMContentLoaded', function() {
  const currentPage = window.location.pathname;
  const isLoginPage = currentPage.includes('login.html') || currentPage === '/login.html';
  const token = localStorage.getItem('authToken');
  
  // Prevent redirect loops
  if (isLoginPage && token) {
    window.location.href = './dashboard.html';
    return;
  }
  
  if (!isLoginPage && !token) {
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
    
    // Small delay to ensure storage is complete
    setTimeout(() => {
      window.location.replace('./dashboard.html');
    }, 100);
  } else {
    alert('Email o contraseña incorrectos');
  }
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.replace('./login.html');
}

// Check authentication on protected pages
function checkAuth() {
  const token = localStorage.getItem('authToken');
  const currentPage = window.location.pathname;
  const isLoginPage = currentPage.includes('login.html');
  
  if (!token && !isLoginPage) {
    window.location.replace('./login.html');
    return false;
  }
  return true;
}