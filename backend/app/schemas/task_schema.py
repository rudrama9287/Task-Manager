from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from .user_schema import UserResponse
from .project_schema import ProjectResponse

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: date
    assigned_to: int
    project_id: int

class TaskUpdateStatus(BaseModel):
    status: str # pending/in-progress/completed

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str
    due_date: date
    assigned_to: Optional[int]
    project_id: int
    created_by: int
    created_at: datetime
    
    class Config:
        from_attributes = True
