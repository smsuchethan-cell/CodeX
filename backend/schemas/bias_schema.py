from pydantic import BaseModel

class BiasResult(BaseModel):
    ward_name: str
    avg_resolution_days: float
    bias_score: float