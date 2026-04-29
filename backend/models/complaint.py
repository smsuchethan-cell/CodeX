from sqlalchemy import Column, Integer, String, Float, Text, TIMESTAMP
from backend.database import Base
from sqlalchemy.sql import func


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    raw_text = Column(Text)
    category = Column(String)
    urgency_score = Column(Integer)
    ward_name = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    status = Column(String, default="open")
    officer_id = Column(String, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())