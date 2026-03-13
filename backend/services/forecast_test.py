import pandas as pd
from backend.ml.forecaster import forecast_complaints

df = pd.read_csv("backend/data/nagaraiq_complaints.csv")

forecast = forecast_complaints(df)

print(forecast)