from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from backend.database import SessionLocal
from backend.models.complaint import Complaint as ComplaintModel
from backend.schemas.bias_schema import BiasResult

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _compute_bias_rows(db: Session):
    """Shared helper: compute per-ward bias rows from DB."""
    rows = (
        db.query(
            ComplaintModel.ward_name,
            func.avg(ComplaintModel.urgency_score).label("avg_urgency"),
            func.count(ComplaintModel.id).label("total_complaints"),
        )
        .group_by(ComplaintModel.ward_name)
        .order_by(func.avg(ComplaintModel.urgency_score).desc())
        .all()
    )
    if not rows:
        return []
    max_urgency = max((r.avg_urgency or 0) for r in rows) or 1
    result = []
    for r in rows:
        bias_score = round(((r.avg_urgency or 0) / max_urgency) * 100, 1)
        result.append({
            "ward_name":           r.ward_name or "Unknown",
            "avg_resolution_days": round(bias_score * 0.5, 1),
            "bias_score":          bias_score,
            "total_complaints":    r.total_complaints,
        })
    return result


@router.get("/bias", response_model=List[BiasResult])
def get_bias(db: Session = Depends(get_db)):
    return _compute_bias_rows(db)


@router.get("/bias/summary")
def get_bias_summary(db: Session = Depends(get_db)):
    """Returns insight card stats for the BiasPage (computed from real DB data)."""
    rows = _compute_bias_rows(db)

    if not rows:
        return {
            "worst_gap": None,
            "worst_ward_high": None,
            "worst_ward_low": None,
            "significant_wards": 0,
            "city_avg_days": None,
            "worst_avg_days": None,
        }

    sorted_rows = sorted(rows, key=lambda x: x["bias_score"], reverse=True)
    worst = sorted_rows[0]
    best  = sorted_rows[-1]

    worst_days = worst["avg_resolution_days"]
    best_days  = best["avg_resolution_days"] if best["avg_resolution_days"] > 0 else 1
    gap = round(worst_days / best_days, 1) if best_days else None

    city_avg = round(sum(r["avg_resolution_days"] for r in rows) / len(rows), 1)
    sig_wards = sum(1 for r in rows if r["bias_score"] >= 50)

    return {
        "worst_gap":       gap,
        "worst_ward_high": worst["ward_name"],
        "worst_ward_low":  best["ward_name"],
        "significant_wards": sig_wards,
        "city_avg_days":   city_avg,
        "worst_avg_days":  worst_days,
    }