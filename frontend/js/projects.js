document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupSidebar();
    
    const role = localStorage.getItem('role');
    if(role === 'admin') {
        document.getElementById('btn-create-project').classList.remove('d-none');
        loadUsersForAssignment();
    }
    
    loadProjects();

    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('proj-title').value;
            const description = document.getElementById('project-desc').value;
            
            try {
                // If users selected, map their IDs as integers
                const selectedUsers = Array.from(document.getElementById('project-users').selectedOptions).map(opt => parseInt(opt.value, 10));
                
                await fetchAPI('/projects', {
                    method: 'POST',
                    body: JSON.stringify({ title, description, member_ids: selectedUsers })
                });

                const modal = bootstrap.Modal.getInstance(document.getElementById('projectModal'));
                modal.hide();
                projectForm.reset();
                loadProjects();
            } catch (err) {
                showAlert(err.message);
            }
        });
    }
});

async function loadUsersForAssignment() {
    try {
        const users = await fetchAPI('/auth/users');
        const select = document.getElementById('project-users');
        if (select) {
            select.innerHTML = users.map(u => `<option value="${u.id}">${u.name} (${u.role})</option>`).join('');
        }
    } catch (err) {
        console.error("Failed to load users", err);
    }
}

async function loadProjects() {
    try {
        const projects = await fetchAPI('/projects');
        const tbody = document.getElementById('projects-tbody');
        
        if (projects.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">No projects found.</td></tr>';
            return;
        }
        
        const role = localStorage.getItem('role');
        
        tbody.innerHTML = projects.map(p => `
            <tr>
                <td><strong>${p.title}</strong></td>
                <td class="text-muted">${p.description || '-'}</td>
                <td>
                    <div class="d-flex gap-2">
                        ${role === 'admin' ? `
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteProject(${p.id})">Delete</button>
                        ` : '<span class="badge bg-light text-dark">View Only</span>'}
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        showAlert(err.message);
    }
}

async function deleteProject(id) {
    if(!confirm("Delete this project and all associated tasks?")) return;
    try {
        await fetchAPI(`/projects/${id}`, { method: 'DELETE' });
        loadProjects();
    } catch(err) {
        showAlert(err.message);
    }
}

function showAlert(msg, type = 'danger') {
    const alertBox = document.getElementById('alert');
    alertBox.textContent = msg;
    alertBox.className = `alert alert-${type}`;
    alertBox.classList.remove('d-none');
}
