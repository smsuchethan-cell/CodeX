from fastapi import APIRouter
from backend.services.hotspot_service import get_hotspots

router = APIRouter()

DATA_PATH = "backend/data/nagaraiq_complaints.csv"


@router.get("/hotspots")
def get_hotspots_data():

    hotspots = get_hotspots(DATA_PATH)

    return hotspots.head(50).to_dict(orient="records")