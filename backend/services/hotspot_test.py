import pandas as pd
from backend.ml.clustering import detect_hotspots

df = pd.read_csv("backend/data/nagaraiq_complaints.csv")

df = df.head(100)

result = detect_hotspots(df)

print(result[["ward_name","cluster_id"]].head())