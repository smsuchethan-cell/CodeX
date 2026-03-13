import pandas as pd
from backend.ml.classifier import classify_complaint
from backend.ml.urgency_scorer import compute_urgency


def process_complaints(file_path):

    df = pd.read_csv(file_path)

    # ensure text column exists
    if "raw_text" not in df.columns:
        raise ValueError("Dataset missing raw_text column")

    categories = []
    confidences = []
    urgencies = []

    for text in df["raw_text"].fillna(""):

        result = classify_complaint(str(text))

        categories.append(result["category"])
        confidences.append(result["confidence"])

        urgency = compute_urgency(str(text))
        urgencies.append(urgency)

    df["predicted_category"] = categories
    df["confidence"] = confidences
    df["ai_urgency_score"] = urgencies

    return df