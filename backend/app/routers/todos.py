from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Todo
from ..schemas import TodoCreate, TodoRead, TodoUpdate, StatusFilter, OrderBy, SortOrder
from ..core.security import get_current_user
from ..models import User


router = APIRouter(prefix="/todos", tags=["todos"])


@router.get("", response_model=List[TodoRead])
def list_todos(
    search: Optional[str] = Query(None),
    status: StatusFilter = Query("all"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    order_by: OrderBy = Query("deadline"),
    order: SortOrder = Query("asc"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(Todo).filter(Todo.user_id == user.id)
    if search:
        like = f"%{search}%"
        q = q.filter(Todo.title.ilike(like))
    if status == "done":
        q = q.filter(Todo.done.is_(True))
    elif status == "not_done":
        q = q.filter(Todo.done.is_(False))

    if order_by == "deadline":
        order_column = Todo.deadline
    else:
        order_column = Todo.created_at
    q = q.order_by(asc(order_column) if order == "asc" else desc(order_column))
    rows = q.offset(offset).limit(limit).all()
    return [
        TodoRead(
            id=t.id,
            title=t.title,
            deadline=t.deadline,
            done=t.done,
            created_at=t.created_at,
            updated_at=t.updated_at,
        )
        for t in rows
    ]


@router.post("", response_model=TodoRead, status_code=status.HTTP_201_CREATED)
def create_todo(payload: TodoCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    t = Todo(user_id=user.id, title=payload.title, deadline=payload.deadline, done=False)
    db.add(t)
    db.commit()
    db.refresh(t)
    return TodoRead(
        id=t.id,
        title=t.title,
        deadline=t.deadline,
        done=t.done,
        created_at=t.created_at,
        updated_at=t.updated_at,
    )


@router.patch("/{todo_id}", response_model=TodoRead)
def update_todo(todo_id: int, patch: TodoUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    t = db.query(Todo).filter(Todo.id == todo_id, Todo.user_id == user.id).first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    if patch.title is not None:
        t.title = patch.title
    if patch.deadline is not None:
        t.deadline = patch.deadline
    if patch.done is not None:
        t.done = patch.done
    db.add(t)
    db.commit()
    db.refresh(t)
    return TodoRead(
        id=t.id,
        title=t.title,
        deadline=t.deadline,
        done=t.done,
        created_at=t.created_at,
        updated_at=t.updated_at,
    )


@router.delete("/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    t = db.query(Todo).filter(Todo.id == todo_id, Todo.user_id == user.id).first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    db.delete(t)
    db.commit()
    return {"ok": True}

