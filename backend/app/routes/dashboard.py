from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from ..database.connection import get_db
from ..database.models import Task, Project, User
from ..middleware.auth_middleware import get_current_user, get_current_admin

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/admin")
def get_admin_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    today = date.today()
    total_projects = db.query(Project).count()
    total_tasks = db.query(Task).count()
    completed_tasks = db.query(Task).filter(Task.status == "completed").count()
    pending_tasks = db.query(Task).filter(Task.status == "pending").count()
    in_progress_tasks = db.query(Task).filter(Task.status == "in-progress").count()
    
    # Overdue Tasks: Status is not completed, and due_date < today
    overdue_tasks = db.query(Task).filter(Task.status != "completed", Task.due_date < today).count()

    return {
        "total_projects": total_projects,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "in_progress_tasks": in_progress_tasks,
        "overdue_tasks": overdue_tasks
    }

@router.get("/member")
def get_member_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today = date.today()
    assigned_tasks = db.query(Task).filter(Task.assigned_to == current_user.id).count()
    completed_tasks = db.query(Task).filter(Task.assigned_to == current_user.id, Task.status == "completed").count()
    pending_tasks = db.query(Task).filter(Task.assigned_to == current_user.id, Task.status == "pending").count()
    in_progress_tasks = db.query(Task).filter(Task.assigned_to == current_user.id, Task.status == "in-progress").count()
    
    overdue_tasks = db.query(Task).filter(Task.assigned_to == current_user.id, Task.status != "completed", Task.due_date < today).count()

    return {
        "assigned_tasks": assigned_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "in_progress_tasks": in_progress_tasks,
        "overdue_tasks": overdue_tasks
    }
