from fastapi import APIRouter
from backend.services.forecast_service import get_forecast

router = APIRouter()

DATA_PATH = "backend/data/nagaraiq_complaints.csv"


@router.get("/forecast")
def get_forecast_data():

    forecast = get_forecast(DATA_PATH)

    return forecast.to_dict(orient="records")