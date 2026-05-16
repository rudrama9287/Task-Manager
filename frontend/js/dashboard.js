document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    setupSidebar();
    
    const role = localStorage.getItem('role');
    const endpoint = role === 'admin' ? '/dashboard/admin' : '/dashboard/member';
    
    try {
        const stats = await fetchAPI(endpoint);
        const container = document.getElementById('stats-container');
        
        let html = '';
        if (role === 'admin') {
            html = `
                ${createCard('Total Projects', stats.total_projects, 'primary')}
                ${createCard('Total Tasks', stats.total_tasks, 'info')}
                ${createCard('Completed', stats.completed_tasks, 'success')}
                ${createCard('In Progress', stats.in_progress_tasks, 'primary')}
                ${createCard('Pending', stats.pending_tasks, 'warning')}
                ${createCard('Overdue', stats.overdue_tasks, 'danger')}
            `;
        } else {
            html = `
                ${createCard('Assigned Tasks', stats.assigned_tasks, 'info')}
                ${createCard('Completed', stats.completed_tasks, 'success')}
                ${createCard('In Progress', stats.in_progress_tasks, 'primary')}
                ${createCard('Pending', stats.pending_tasks, 'warning')}
                ${createCard('Overdue', stats.overdue_tasks, 'danger')}
            `;
        }
        
        container.innerHTML = html;
        
    } catch (err) {
        console.error(err);
    }
});

function createCard(title, value, type) {
    return `
        <div class="col-md-4 mb-4">
            <div class="card card-stats border-${type}">
                <div class="card-body">
                    <h5 class="card-title text-${type}">${title}</h5>
                    <h2 class="card-text">${value}</h2>
                </div>
            </div>
        </div>
    `;
}
