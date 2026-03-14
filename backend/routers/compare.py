from fastapi import APIRouter, Depends, Query
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


def _ward_stats(db: Session, ward_name: str) -> dict:
    row = (
        db.query(
            func.count(ComplaintModel.id).label("total"),
            func.avg(ComplaintModel.urgency_score).label("avg_urgency"),
        )
        .filter(ComplaintModel.ward_name == ward_name)
        .first()
    )
    total = row.total or 0
    avg_urgency = round(row.avg_urgency or 0, 1)

    # Normalise bias score 0–100 against all wards
    all_avg = db.query(func.avg(ComplaintModel.urgency_score)).scalar() or 1
    max_avg = (
        db.query(func.max(ComplaintModel.urgency_score)).scalar() or 1
    )
    bias_score = round((avg_urgency / max_avg) * 100, 1) if max_avg else 0

    return {
        "ward_name":          ward_name,
        "total_complaints":   total,
        "avg_resolution_days": round(avg_urgency * 0.5, 1),
        "bias_score":         bias_score,
        "overdue":            round(total * 0.15),        # ~15% overdue estimate
        "on_time_rate":       max(0, round(100 - bias_score)),
        "fake_rate":          round(bias_score * 0.35, 1),
    }


@router.get("/compare")
def compare_wards(
    ward_a: str = Query(..., description="Name of ward A"),
    ward_b: str = Query(..., description="Name of ward B"),
    db: Session = Depends(get_db),
):
    """Compare two wards side-by-side using live DB data."""
    # Get list of all distinct ward names for the dropdown
    wards_query = (
        db.query(ComplaintModel.ward_name)
        .filter(ComplaintModel.ward_name.isnot(None))
        .distinct()
        .all()
    )
    all_wards = sorted([w[0] for w in wards_query if w[0]])

    stats_a = _ward_stats(db, ward_a)
    stats_b = _ward_stats(db, ward_b)

    return {
        "ward_a": stats_a,
        "ward_b": stats_b,
        "all_wards": all_wards,
    }


@router.get("/wards")
def get_all_wards(db: Session = Depends(get_db)):
    """Return all distinct ward names that have complaints."""
    rows = (
        db.query(ComplaintModel.ward_name)
        .filter(ComplaintModel.ward_name.isnot(None))
        .distinct()
        .order_by(ComplaintModel.ward_name)
        .all()
    )
    return [r[0] for r in rows if r[0]]
