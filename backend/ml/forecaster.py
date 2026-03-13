from prophet import Prophet
import pandas as pd


def forecast_complaints(df):

    # Convert filed_date to datetime
    df["filed_date"] = pd.to_datetime(df["filed_date"])

    # Count complaints per day
    daily_counts = df.groupby("filed_date").size().reset_index(name="y")

    # Prophet requires columns ds and y
    daily_counts.rename(columns={"filed_date": "ds"}, inplace=True)

    model = Prophet()

    model.fit(daily_counts)

    # Predict next 7 days
    future = model.make_future_dataframe(periods=7)

    forecast = model.predict(future)

    return forecast[["ds", "yhat"]].tail(7)