from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from .connection import Base

# Association table for Many-to-Many relationship (Project <-> Users)
project_members = Table(
    'project_members',
    Base.metadata,
    Column('project_id', Integer, ForeignKey('projects.id', ondelete="CASCADE"), primary_key=True),
    Column('user_id', Integer, ForeignKey('users.id', ondelete="CASCADE"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="member") # admin or member
    created_at = Column(DateTime, default=datetime.utcnow)

    projects_created = relationship("Project", back_populates="creator")
    tasks_assigned = relationship("Task", back_populates="assignee", foreign_keys="Task.assigned_to")
    projects_joined = relationship("Project", secondary=project_members, back_populates="members")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey('users.id', ondelete="CASCADE"))
    created_at = Column(DateTime, default=datetime.utcnow)

    creator = relationship("User", back_populates="projects_created")
    tasks = relationship("Task", back_populates="project", cascade="all, delete")
    members = relationship("User", secondary=project_members, back_populates="projects_joined")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="pending") # pending/in-progress/completed
    due_date = Column(Date, nullable=False)
    assigned_to = Column(Integer, ForeignKey('users.id', ondelete="SET NULL"), nullable=True)
    project_id = Column(Integer, ForeignKey('projects.id', ondelete="CASCADE"), nullable=False)
    created_by = Column(Integer, ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", back_populates="tasks_assigned", foreign_keys=[assigned_to])
    creator = relationship("User", foreign_keys=[created_by])
