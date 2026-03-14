from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models.complaint import Complaint as ComplaintModel
from backend.schemas.complaint_schema import Complaint
from backend.ml.classifier import classify_complaint
from backend.ml.urgency_scorer import score_urgency

router = APIRouter()


# ── DB dependency ──────────────────────────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── GET /complaints ────────────────────────────────────────────────────────────
@router.get("/complaints")
def get_complaints(db: Session = Depends(get_db)):
    rows = db.query(ComplaintModel).order_by(ComplaintModel.id.desc()).limit(50).all()
    return [
        {
            "id":                 r.id,
            "complaint_id":       f"CMP-{r.id:04d}",
            "raw_text":           r.raw_text,
            "predicted_category": r.category,
            "ai_urgency_score":   r.urgency_score,
            "ward_name":          r.ward_name,
            "latitude":           r.latitude,
            "longitude":          r.longitude,
            "status":             r.status,
            "filed_date":         str(r.created_at) if r.created_at else None,
        }
        for r in rows
    ]


# ── POST /complaints ───────────────────────────────────────────────────────────
@router.post("/complaints")
def create_complaint(complaint: Complaint, db: Session = Depends(get_db)):

    # run ML classifier
    result   = classify_complaint(complaint.raw_text)
    category = result["category"]
    urgency  = score_urgency(category)

    new_complaint = ComplaintModel(
        raw_text      = complaint.raw_text,
        category      = category,
        urgency_score = urgency,
        ward_name     = complaint.ward_name,
        latitude      = complaint.latitude,
        longitude     = complaint.longitude,
        status        = "open",
    )

    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)

    return {
        "message": "Complaint stored successfully",
        "data": {
            "id":                 new_complaint.id,
            "complaint_id":       f"CMP-{new_complaint.id:04d}",
            "raw_text":           new_complaint.raw_text,
            "predicted_category": new_complaint.category,
            "ai_urgency_score":   new_complaint.urgency_score,
            "ward_name":          new_complaint.ward_name,
            "status":             new_complaint.status,
        }
    }