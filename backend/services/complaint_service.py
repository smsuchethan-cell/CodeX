import pandas as pd
from backend.ml.classifier import classify_complaint
from backend.ml.urgency_scorer import compute_urgency


def process_complaints(file_path):

    df = pd.read_csv(file_path)

    categories = []
    confidences = []
    urgencies = []

    for text in df["raw_text"]:

        result = classify_complaint(text)

        categories.append(result["category"])
        confidences.append(result["confidence"])

        urgency = compute_urgency(text)
        urgencies.append(urgency)

    df["predicted_category"] = categories
    df["confidence"] = confidences
    df["ai_urgency_score"] = urgencies

    return df