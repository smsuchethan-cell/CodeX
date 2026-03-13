from pydantic import BaseModel
from datetime import datetime

class Forecast(BaseModel):
    ds: datetime
    yhat: float