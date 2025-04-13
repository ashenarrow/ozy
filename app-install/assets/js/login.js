document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000/api';
    const authMessage = document.getElementById('authMessage');
  
    // Helper: display messages
    const showMessage = (msg, isError = false) => {
      authMessage.textContent = msg;
      authMessage.style.color = isError ? 'red' : 'green';
    };
  
    // Login form handling
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const username = formData.get('username');
      const password = formData.get('password');
      
      try {
        const res = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) {
          return showMessage(data.error || 'Login failed', true);
        }
        
        // You can store the user information in a global variable (or in cookies for persistence)
        window.currentUser = data;
        showMessage(`Logged in as ${data.username}`);
        // Redirect to main page (or your store/dashboard)
        window.location.href = 'store.html';
        
      } catch (error) {
        console.error(error);
        showMessage('Login error', true);
      }
    });
    
    // Signup form handling
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(signupForm);
      const username = formData.get('username');
      const password = formData.get('password');
      
      try {
        const res = await fetch(`${API_URL}/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) {
          return showMessage(data.error || 'Signup failed', true);
        }
        
        // Set the current user after successful signup
        window.currentUser = data;
        showMessage(`Signed up as ${data.username}`);
        window.location.href = 'store.html';
        
      } catch (error) {
        console.error(error);
        showMessage('Signup error', true);
      }
    });
  });
  