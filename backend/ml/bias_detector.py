# NOTE: This file is not currently used by any router
import pandas as pd

def compute_bias_scores(df):

    # Only consider resolved complaints
    resolved = df[df["resolved_date"].notna()]

    # Calculate average resolution days per ward
    ward_avg = (
        resolved.groupby("ward_name")["resolution_days"]
        .mean()
        .reset_index()
    )

    ward_avg.rename(columns={"resolution_days": "avg_resolution_days"}, inplace=True)

    # City average
    city_avg = resolved["resolution_days"].mean()

    # Compute bias score
    ward_avg["bias_score"] = (
        (ward_avg["avg_resolution_days"] - city_avg) / city_avg
    ) * 100

    return ward_avg