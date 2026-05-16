from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .user_schema import UserResponse

class ProjectCreate(BaseModel):
    title: str
    description: str
    member_ids: Optional[List[int]] = []

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    member_ids: Optional[List[int]] = None

class ProjectResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    created_by: int
    created_at: datetime
    members: List[UserResponse] = []

    class Config:
        from_attributes = True
