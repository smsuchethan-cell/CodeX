from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database import SessionLocal
from backend.models.complaint import Complaint as ComplaintModel

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/hotspots")
def get_hotspots_data(db: Session = Depends(get_db)):
    """
    Return wards with highest complaint density as hotspots.
    Wards with complaint count in the top 20% are labelled cluster_id=1 (high),
    the next 30% are cluster_id=2 (moderate).
    """
    rows = (
        db.query(
            ComplaintModel.ward_name,
            func.count(ComplaintModel.id).label("complaint_count"),
        )
        .group_by(ComplaintModel.ward_name)
        .order_by(func.count(ComplaintModel.id).desc())
        .limit(50)
        .all()
    )

    if not rows:
        return []

    total = len(rows)
    result = []
    for idx, r in enumerate(rows):
        pct = (idx + 1) / total
        cluster_id = 1 if pct <= 0.20 else (2 if pct <= 0.50 else 3)
        result.append({
            "ward_name":        r.ward_name or "Unknown",
            "ward_id":          hash(r.ward_name) % 200 + 1,  # stable pseudo-id
            "cluster_id":       cluster_id,
            "complaint_count":  r.complaint_count,
        })

    return result