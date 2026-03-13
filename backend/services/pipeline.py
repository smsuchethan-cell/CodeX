import pandas as pd
from backend.ml.classifier import classify_complaint
from backend.ml.urgency_scorer import compute_urgency

# Load dataset
df = pd.read_csv("backend/data/nagaraiq_complaints.csv")

# For testing (remove later if needed)
df = df.head(10)

categories = []
confidences = []
urgencies = []

print("Classifying complaints...")

for text in df["raw_text"]:

    # Run NLP classifier
    result = classify_complaint(text)

    categories.append(result["category"])
    confidences.append(result["confidence"])

    # Compute urgency score
    urgency = compute_urgency(text)
    urgencies.append(urgency)

# Add AI results to dataframe
df["predicted_category"] = categories
df["confidence"] = confidences
df["ai_urgency_score"] = urgencies

# Save processed dataset
df.to_csv("backend/data/classified_complaints.csv", index=False)

print("\nClassification complete!\n")

print(
    df[
        [
            "raw_text",
            "predicted_category",
            "confidence",
            "ai_urgency_score",
        ]
    ].head()
)