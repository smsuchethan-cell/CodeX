from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import complaints
from backend.routers import bias
from backend.routers import hotspots
from backend.routers import forecast

app = FastAPI(title="NagaraIQ Civic Intelligence API")

# -----------------------------
# Enable CORS for frontend
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow React frontend
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