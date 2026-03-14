try:
    from transformers import pipeline as _pipeline

    # Load zero-shot classifier (optional — requires 'transformers' package)
    classifier = _pipeline(
        "zero-shot-classification",
        model="cross-encoder/nli-distilroberta-base"
    )
    _ML_AVAILABLE = True
except Exception:
    classifier = None
    _ML_AVAILABLE = False

# Complaint categories
labels = [
    "Road & Potholes",
    "Water Supply",
    "Sanitation",
    "Electricity",
    "Drainage",
    "Encroachment",
    "Noise",
    "Other"
]


def classify_complaint(text: str) -> dict:
    if not _ML_AVAILABLE or classifier is None:
        return {"category": "Other", "confidence": 0.0, "ml_available": False}

    result = classifier(text, labels)
    return {
        "category": result["labels"][0],
        "confidence": result["scores"][0],
        "ml_available": True,
    }


if __name__ == "__main__":
    test = "There is a huge pothole near my house causing accidents"
    print(classify_complaint(test))