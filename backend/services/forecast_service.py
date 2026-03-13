import pandas as pd
from backend.ml.forecaster import forecast_complaints


def get_forecast(file_path):

    df = pd.read_csv(file_path)

    forecast = forecast_complaints(df)

    return forecast