from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import complaints
from backend.routers import bias
from backend.routers import hotspots
from backend.routers import forecast
from backend.routers import image
from backend.routers import users
from backend.routers import compare


app = FastAPI(title="NagaraIQ Civic Intelligence API")


# -----------------------------
# Enable CORS for frontend
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Startup event
# -----------------------------
@app.on_event("startup")
def startup():
    print("NagaraIQ backend starting...")

    # ── Auto-create all DB tables from SQLAlchemy models ──────────────────────
    from backend.database import engine, Base
    from backend.models import complaint, user   # noqa: F401 – ensure models are imported
    Base.metadata.create_all(bind=engine)
    print("Database tables ready")

    # ── Preload CLIP image classification model ───────────────────────────────
    try:
        from backend.ml.image_classifier import _load_model
        _load_model()
        print("AI models ready")
    except Exception as e:
        print(f"Warning: Could not load AI models: {e}")


# -----------------------------
# Root endpoint
# -----------------------------
@app.get("/")
def root():
    return {"message": "NagaraIQ Backend Running"}


# -----------------------------
# Health check endpoint
# -----------------------------
@app.get("/health")
def health():
    return {"status": "ok"}


# -----------------------------
# Include routers
# -----------------------------
app.include_router(complaints.router, prefix="/api", tags=["Complaints"])
app.include_router(bias.router, prefix="/api", tags=["Bias Detection"])
app.include_router(hotspots.router, prefix="/api", tags=["Hotspots"])
app.include_router(forecast.router, prefix="/api", tags=["Forecast"])
app.include_router(image.router, prefix="/api", tags=["Image Classification"])
app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(compare.router, prefix="/api", tags=["Compare"])