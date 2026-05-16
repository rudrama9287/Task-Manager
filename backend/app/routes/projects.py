from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..database.models import Project, User
from ..schemas.project_schema import ProjectCreate, ProjectUpdate, ProjectResponse
from ..middleware.auth_middleware import get_current_user, get_current_admin
from typing import List

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "admin":
        projects = db.query(Project).all()
    else:
        projects = current_user.projects_joined
    return projects

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(project: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    new_project = Project(
        title=project.title,
        description=project.description,
        created_by=current_user.id
    )
    
    if project.member_ids:
        members = db.query(User).filter(User.id.in_(project.member_ids)).all()
        new_project.members.extend(members)
        
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: int, project: ProjectUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.title is not None:
        db_project.title = project.title
    if project.description is not None:
        db_project.description = project.description
        
    if project.member_ids is not None:
        members = db.query(User).filter(User.id.in_(project.member_ids)).all()
        db_project.members = members

    db.commit()
    db.refresh(db_project)
    return db_project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    db.delete(db_project)
    db.commit()
    return None
