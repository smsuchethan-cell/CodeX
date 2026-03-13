from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import complaints
from backend.routers import bias
from backend.routers import hotspots
from backend.routers import forecast
from backend.routers import image
from backend.routers import users   # ← ADDED

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
def load_models():
    print("NagaraIQ backend starting...")

    # preload CLIP model
    from backend.ml.image_classifier import _load_model
    _load_model()

    print("AI models ready")


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
app.include_router(complaints.router)
app.include_router(bias.router)
app.include_router(hotspots.router)
app.include_router(forecast.router)
app.include_router(image.router)
app.include_router(users.router)   # ← ADDED