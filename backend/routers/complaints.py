from fastapi import APIRouter
from backend.services.complaint_service import process_complaints

router = APIRouter()

DATA_PATH = "backend/data/nagaraiq_complaints.csv"


@router.get("/complaints")
def get_complaints():

    df = process_complaints(DATA_PATH)

    # Replace NaN / Inf values so JSON serialization works
    df = df.replace([float("inf"), float("-inf")], None)
    df = df.fillna("")

    return df.head(50).to_dict(orient="records")