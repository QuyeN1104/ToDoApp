from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .db import init_db
from .routers import auth, todos


def create_app() -> FastAPI:
    app = FastAPI(title=settings.APP_NAME)

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers with API prefix
    app.include_router(auth.router, prefix=settings.API_PREFIX)
    app.include_router(todos.router, prefix=settings.API_PREFIX)

    @app.on_event("startup")
    def on_startup():
        init_db()

    @app.get("/")
    def root():
        return {"ok": True, "name": settings.APP_NAME}

    return app


app = create_app()

