from pydantic import BaseModel

class Complaint(BaseModel):
    raw_text: str
    predicted_category: str
    confidence: float
    ai_urgency_score: float