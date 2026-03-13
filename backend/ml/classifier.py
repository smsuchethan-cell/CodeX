from transformers import pipeline

# Load zero-shot classifier
classifier = pipeline(
    "zero-shot-classification",
    model="cross-encoder/nli-distilroberta-base"
)

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

def classify_complaint(text):
    result = classifier(text, labels)

    return {
        "category": result["labels"][0],
        "confidence": result["scores"][0]
    }


if __name__ == "__main__":
    test = "There is a huge pothole near my house causing accidents"

    output = classify_complaint(test)

    print(output)