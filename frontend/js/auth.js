document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const alertBox = document.getElementById('alert');

    function showAlert(msg, type = 'danger') {
        alertBox.textContent = msg;
        alertBox.className = `alert alert-${type}`;
        alertBox.classList.remove('d-none');
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.detail || 'Login failed');
                }
                
                const data = await response.json();
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('name', data.name);
                localStorage.setItem('email', data.email);
                window.location.href = 'dashboard.html';
            } catch (err) {
                showAlert(err.message);
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            
            try {
                const response = await fetch(`${API_URL}/auth/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, role })
                });
                
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.detail || 'Signup failed');
                }
                
                showAlert('Signup successful! Please login.', 'success');
                setTimeout(() => window.location.href = 'login.html', 1500);
            } catch (err) {
                showAlert(err.message);
            }
        });
    }
});
