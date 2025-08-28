from datetime import datetime
from typing import Optional, Literal

from pydantic import BaseModel, EmailStr, Field


# Users
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(min_length=6)


class UserRead(UserBase):
    id: int


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: Optional[UserRead] = None


# Todos
class TodoBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    deadline: Optional[datetime] = None


class TodoCreate(TodoBase):
    pass


class TodoRead(TodoBase):
    id: int
    done: bool
    created_at: datetime
    updated_at: datetime


class TodoUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    deadline: Optional[datetime] = None
    done: Optional[bool] = None


# Query helpers
StatusFilter = Literal["all", "done", "not_done"]
OrderBy = Literal["created_at", "deadline"]
SortOrder = Literal["asc", "desc"]

