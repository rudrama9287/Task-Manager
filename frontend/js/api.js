const API_URL = '/api';

async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            ...headers,
            ...options.headers
        }
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('name');
        localStorage.removeItem('email');
        window.location.href = 'login.html';
        return;
    }

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Something went wrong');
    }

    if (response.status !== 204) {
        return response.json();
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    window.location.href = 'login.html';
}

function checkAuth() {
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
    }
}

function setupSidebar() {
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name') || 'User';
    const email = localStorage.getItem('email') || '';
    
    const sidebar = document.getElementById('sidebar-menu');
    if (sidebar) {
        let menuHTML = `
            <div class="sidebar-header">
                <h4>TASKFLOW</h4>
            </div>
            <div class="sidebar-menu">
                <a href="dashboard.html" id="nav-dashboard">
                    <span>Dashboard</span>
                </a>
                <a href="tasks.html" id="nav-tasks">
                    <span>Tasks</span>
                </a>
        `;
        if (role === 'admin') {
            menuHTML += `
                <a href="projects.html" id="nav-projects">
                    <span>Projects</span>
                </a>
            `;
        }
        menuHTML += `
                <a href="#" onclick="logout()" style="margin-top: auto; color: #ef4444;">
                    <span>Logout</span>
                </a>
            </div>
        `;
        sidebar.innerHTML = menuHTML;
        
        const path = window.location.pathname;
        if(path.includes('dashboard')) document.getElementById('nav-dashboard')?.classList.add('active');
        if(path.includes('tasks')) document.getElementById('nav-tasks')?.classList.add('active');
        if(path.includes('projects') && role === 'admin') document.getElementById('nav-projects')?.classList.add('active');
    }

    // Inject Top Navbar if not exists
    if (!document.getElementById('top-navbar')) {
        const navbar = document.createElement('div');
        navbar.id = 'top-navbar';
        navbar.className = 'top-navbar';
        navbar.innerHTML = `
            <div class="user-profile" onclick="toggleProfileDropdown()">
                <div class="user-info">
                    <span class="user-name">${name}</span>
                    <span class="user-role">${role}</span>
                </div>
                <div class="user-avatar">
                    ${name.charAt(0).toUpperCase()}
                </div>
            </div>
        `;
        document.body.prepend(navbar);
    }
}
