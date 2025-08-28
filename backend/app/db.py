from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from pathlib import Path
from .config import settings


class Base(DeclarativeBase):
    pass


def _engine_kwargs(url: str):
    if url.startswith("sqlite"):
        return {"connect_args": {"check_same_thread": False}}
    return {}


def _resolve_database_url(url: str) -> str:
    """Ensure SQLite path is absolute (anchored at backend/), avoiding per-CWD DB files."""
    if url.startswith("sqlite:///"):
        path_str = url.replace("sqlite:///", "", 1)
        p = Path(path_str)
        if not p.is_absolute():
            base = Path(__file__).resolve().parent.parent  # backend/
            abs_path = (base / p).resolve()
            return f"sqlite:///{abs_path.as_posix()}"
    return url


_DB_URL = _resolve_database_url(settings.DATABASE_URL)
engine = create_engine(_DB_URL, echo=False, future=True, **_engine_kwargs(_DB_URL))
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    # Import models so metadata is populated, then create tables
    from . import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
