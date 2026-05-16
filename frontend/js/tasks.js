document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupSidebar();
    
    const role = localStorage.getItem('role');
    if(role === 'admin') {
        document.getElementById('btn-create-task').classList.remove('d-none');
        loadUsersAndProjects();
    }
    
    loadTasks();

    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('task-title').value;
            const description = document.getElementById('task-desc').value;
            const due_date = document.getElementById('task-due').value;
            const project_id = parseInt(document.getElementById('task-project').value);
            const assigned_to = parseInt(document.getElementById('task-user').value);
            
            try {
                await fetchAPI('/tasks', {
                    method: 'POST',
                    body: JSON.stringify({ title, description, due_date, project_id, assigned_to })
                });
                
                const modal = bootstrap.Modal.getInstance(document.getElementById('taskModal'));
                modal.hide();
                taskForm.reset();
                loadTasks();
            } catch (err) {
                showAlert(err.message);
            }
        });
    }
});

async function loadUsersAndProjects() {
    try {
        const [users, projects] = await Promise.all([
            fetchAPI('/auth/users'),
            fetchAPI('/projects')
        ]);
        
        const userSelect = document.getElementById('task-user');
        const projectSelect = document.getElementById('task-project');
        
        if (userSelect) {
            userSelect.innerHTML = users.map(u => `<option value="${u.id}">${u.name} (${u.role})</option>`).join('');
        }
        if (projectSelect) {
            projectSelect.innerHTML = projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        }
    } catch (err) {
        console.error("Failed to load assignment data", err);
    }
}

async function loadTasks() {
    try {
        const tasks = await fetchAPI('/tasks');
        const tbody = document.getElementById('tasks-tbody');
        
        if (tasks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No tasks found.</td></tr>';
            return;
        }
        
        const role = localStorage.getItem('role');
        const today = new Date().toISOString().split('T')[0];
        
        tbody.innerHTML = tasks.map(t => {
            let statusBadgeClass = 'bg-secondary';
            if (t.status === 'completed') statusBadgeClass = 'bg-success';
            else if (t.status === 'in-progress') statusBadgeClass = 'bg-primary';
            else if (t.status === 'pending') statusBadgeClass = 'bg-warning text-dark';
            
            let isOverdue = (t.due_date < today && t.status !== 'completed');
            
            return `
                <tr class="${isOverdue ? 'table-danger' : ''}">
                    <td>
                        <div class="fw-bold">${t.title}</div>
                        <div class="small text-muted">${t.description || ''}</div>
                    </td>
                    <td><span class="badge bg-light text-dark">Project ${t.project_id}</span></td>
                    <td>${t.due_date}</td>
                    <td>
                        <select class="form-select form-select-sm badge-premium ${statusBadgeClass}" 
                                style="border:none; color:white;"
                                onchange="updateTaskStatus(${t.id}, this.value)">
                            <option value="pending" ${t.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="in-progress" ${t.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                            <option value="completed" ${t.status === 'completed' ? 'selected' : ''}>Completed</option>
                        </select>
                        ${isOverdue ? '<div class="small text-danger mt-1 fw-bold">Overdue</div>' : ''}
                    </td>
                    <td>
                        ${role === 'admin' ? `
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${t.id})">Delete</button>
                        ` : '-'}
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        showAlert(err.message);
    }
}

async function updateTaskStatus(id, newStatus) {
    try {
        await fetchAPI(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        });
        loadTasks();
    } catch (err) {
        showAlert(err.message);
        loadTasks();
    }
}

async function deleteTask(id) {
    if(!confirm("Are you sure you want to delete this task?")) return;
    try {
        await fetchAPI(`/tasks/${id}`, { method: 'DELETE' });
        loadTasks();
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
