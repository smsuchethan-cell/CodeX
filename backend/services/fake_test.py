import pandas as pd
from backend.ml.fake_resolution import detect_fake_resolutions

df = pd.read_csv("backend/data/nagaraiq_complaints.csv")

df = df.head(20)

result = detect_fake_resolutions(df)

print(result[["raw_text","ai_fake_resolution_flag"]].head())