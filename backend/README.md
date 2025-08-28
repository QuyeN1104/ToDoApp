# Backend (FastAPI) for TodoApp

This is a minimal FastAPI backend prepared for multi-user support with JWT (access + refresh), users and todos stored in a SQL database (SQLite by default).

## Features
- Auth: register, login, refresh, me, logout (stateless)
- Todos: CRUD scoped to the current user, with filtering and sorting
- SQLite by default; easily switch `DATABASE_URL`
- CORS configured for localhost Vite dev; or use Vite dev proxy (`/api`)

## Endpoints
- `POST /api/auth/register` → create user
- `POST /api/auth/login` → returns `{ access_token, refresh_token, user }`
- `POST /api/auth/refresh` → returns `{ access_token, refresh_token }`
- `GET /api/auth/me` → returns current user
- `POST /api/auth/logout` → placeholder (client should drop tokens)
- `GET /api/todos` → list todos (query: `search`, `status`, `limit`, `offset`, `order_by`, `order`)
- `POST /api/todos` → create todo
- `PATCH /api/todos/{id}` → update todo
- `DELETE /api/todos/{id}` → delete todo

## Quickstart
1. Create a virtualenv and install deps
   - `python -m venv .venv && source .venv/bin/activate` (PowerShell: `.venv\\Scripts\\Activate.ps1`)
   - `pip install -r backend/requirements.txt`
2. Configure environment (optional)
   - Copy `backend/.env.example` to `backend/.env` and edit secrets
3. Run dev server
   - `uvicorn app.main:app --reload --app-dir backend`
   - Server runs on `http://127.0.0.1:8000`

## Frontend integration
- Vite dev proxy is configured to forward `/api` to `http://127.0.0.1:8000`.
- Frontend API base is `/api` in dev; for prod, set `VITE_API_URL`.

## Switching database
- Use Postgres or others by setting `DATABASE_URL` in `.env`, e.g.: `postgresql+psycopg://user:pass@localhost:5432/todos`

## Notes on JWT
- Stateless tokens: logout cannot revoke existing tokens unless you implement a denylist.
- Rotation: `/auth/refresh` issues a new pair (access + refresh).

## Structure
```
backend/
  app/
    main.py           # App factory, CORS, router include, startup
    config.py         # Settings (env-driven)
    db.py             # Engine, SessionLocal, Base, init_db()
    models.py         # SQLAlchemy models (User, Todo)
    schemas.py        # Pydantic schemas for I/O
    core/security.py  # Hashing + JWT + current user dependency
    routers/
      auth.py         # Auth endpoints
      todos.py        # Todo endpoints
  requirements.txt
  .env.example
```

## Roadmap
- Optional: token denylist or session table for logout/revocation
- Pagination metadata in list responses
- Alembic migrations
- Email verification, password reset
- Sharing/collaboration features for multi-user

