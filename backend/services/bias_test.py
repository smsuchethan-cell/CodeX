import pandas as pd
from backend.ml.bias_detector import compute_bias_scores

df = pd.read_csv("backend/data/nagaraiq_complaints.csv")

bias_scores = compute_bias_scores(df)

print(bias_scores.head())