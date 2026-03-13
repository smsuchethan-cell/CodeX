from fastapi import APIRouter
from backend.services.bias_service import get_bias_scores
from backend.schemas.bias_schema import BiasResult
from typing import List

router = APIRouter()

DATA_PATH = "backend/data/nagaraiq_complaints.csv"


@router.get("/bias", response_model=List[BiasResult])
def get_bias():
    bias = get_bias_scores(DATA_PATH)
    return bias.to_dict(orient="records")