from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
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
            "officer_id":         getattr(r, "officer_id", None),
            "filed_date":         str(r.created_at) if r.created_at else None,
        }
        for r in rows
    ]

@router.get("/complaints/stats")
def get_complaint_stats(db: Session = Depends(get_db)):
    from sqlalchemy import func
    total = db.query(ComplaintModel).count()
    open_c = db.query(ComplaintModel).filter(ComplaintModel.status == "open").count()
    high_urgency = db.query(ComplaintModel).filter(ComplaintModel.urgency_score >= 80).count()
    wards = db.query(func.count(func.distinct(ComplaintModel.ward_name))).scalar()
    
    return {
        "total": total,
        "open": open_c,
        "high_urgency": high_urgency,
        "unique_wards": wards
    }


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
            "officer_id":         None,
        }
    }

class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    officer_id: Optional[str] = None

@router.patch("/complaints/{complaint_id}")
def update_complaint(complaint_id: int, update_data: ComplaintUpdate, db: Session = Depends(get_db)):
    complaint = db.query(ComplaintModel).filter(ComplaintModel.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    if update_data.status is not None:
        complaint.status = update_data.status
    if update_data.officer_id is not None:
        complaint.officer_id = update_data.officer_id
        
    db.commit()
    db.refresh(complaint)
    
    return {
        "message": "Status updated successfully", 
        "status": complaint.status,
        "officer_id": getattr(complaint, "officer_id", None)
    }