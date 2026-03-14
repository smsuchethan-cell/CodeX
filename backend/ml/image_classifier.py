# backend/ml/image_classifier.py

try:
    import torch
    from transformers import CLIPProcessor, CLIPModel
    from PIL import Image
    _ML_AVAILABLE = True
except ImportError:
    _ML_AVAILABLE = False
    torch = None  # type: ignore
    CLIPProcessor = None  # type: ignore
    CLIPModel = None  # type: ignore

import io


# ─────────────────────────────────────────────────────────────
# GLOBAL MODEL LOAD (only once)
# ─────────────────────────────────────────────────────────────

_model = None
_processor = None


def _load_model():
    global _model, _processor

    if not _ML_AVAILABLE:
        return None, None

    if _model is None:
        print("[NagaraIQ] Loading CLIP model — this happens once...")
        _model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        _processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        _model.eval()
        print("[NagaraIQ] CLIP model loaded successfully.")

    return _model, _processor


# ─────────────────────────────────────────────────────────────
# STAGE 1 — CIVIC VS NON-CIVIC DETECTOR
# ─────────────────────────────────────────────────────────────

CIVIC_CHECK_PROMPTS = [
    "a photo of a public road infrastructure problem",
    "a photo of a civic infrastructure issue on a city street",
    "a photo taken outdoors on a road or public street",
    "a random personal photograph unrelated to roads or infrastructure",
    "a selfie or indoor personal photo"
]


# ─────────────────────────────────────────────────────────────
# STAGE 2 — ISSUE CLASSIFICATION PROMPTS
# ─────────────────────────────────────────────────────────────

PROMPT_TO_CATEGORY = {

    "a photo of a pothole on an urban road": "Road & Potholes",
    "a photo of garbage overflowing on a city street": "Sanitation & Garbage",
    "a photo of a broken streetlight pole": "Streetlight",
    "a photo of water leaking from a pipe on a road": "Water Supply",
    "a photo of sewage or drainage overflowing onto the road": "Drainage",
    "a photo of a damaged road divider or traffic median": "Road & Potholes",
    "a photo of a clogged drainage channel": "Drainage",
    "a photo of a fallen tree blocking a road": "Road & Potholes",
    "a photo of illegal construction blocking public space": "Encroachment",
    "a photo of stagnant dirty water on a street": "Sanitation & Garbage",
    "a photo of an open manhole without a cover": "Drainage",
    "a photo of an overflowing garbage bin on a street": "Sanitation & Garbage",

    # negative prompts
    "a selfie of a person": "Irrelevant",
    "a photo of a cat or dog": "Irrelevant",
    "a random indoor photograph": "Irrelevant",
    "a picture of food": "Irrelevant",
    "a random personal photograph unrelated to infrastructure": "Irrelevant"
}

PROMPTS = list(PROMPT_TO_CATEGORY.keys())


# ─────────────────────────────────────────────────────────────
# SAFETY PARAMETERS
# ─────────────────────────────────────────────────────────────

CIVIC_THRESHOLD = 0.60
CONFIDENCE_THRESHOLD = 0.55
SIMILARITY_GAP_THRESHOLD = 0.10


# ─────────────────────────────────────────────────────────────
# MAIN CLASSIFIER FUNCTION
# ─────────────────────────────────────────────────────────────

def classify_image(image_bytes: bytes) -> dict:

    if not _ML_AVAILABLE:
        return {
            "predicted_category": "Unknown",
            "confidence": 0.0,
            "needs_manual_confirmation": True,
            "matched_prompt": None,
            "ml_available": False,
        }

    model, processor = _load_model()

    try:
        from PIL import Image as PILImage
        image = PILImage.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        return {
            "predicted_category": "Unknown",
            "confidence": 0.0,
            "needs_manual_confirmation": True,
            "matched_prompt": None,
            "error": f"Could not read image: {str(e)}"
        }

    try:

        # ─────────────────────────────────────────
        # STAGE 1 — CIVIC DETECTOR
        # ─────────────────────────────────────────

        civic_inputs = processor(
            text=CIVIC_CHECK_PROMPTS,
            images=image,
            return_tensors="pt",
            padding=True
        )

        with torch.no_grad():
            civic_outputs = model(**civic_inputs)

        civic_logits = civic_outputs.logits_per_image * 10
        civic_probs = civic_logits.softmax(dim=-1)

        civic_scores = civic_probs[0].tolist()
        civic_best = max(civic_scores)

        if civic_best < CIVIC_THRESHOLD:
            return {
                "predicted_category": "Unknown",
                "confidence": round(civic_best, 4),
                "needs_manual_confirmation": True,
                "matched_prompt": None
            }

        # ─────────────────────────────────────────
        # STAGE 2 — ISSUE CLASSIFIER
        # ─────────────────────────────────────────

        inputs = processor(
            text=PROMPTS,
            images=image,
            return_tensors="pt",
            padding=True
        )

        with torch.no_grad():
            outputs = model(**inputs)

        logits = outputs.logits_per_image * 10
        probs = logits.softmax(dim=-1)

        scores = probs[0].tolist()

        sorted_scores = sorted(
            [(i, s) for i, s in enumerate(scores)],
            key=lambda x: x[1],
            reverse=True
        )

        best_idx, best_score = sorted_scores[0]
        second_score = sorted_scores[1][1]

        best_prompt = PROMPTS[best_idx]
        predicted_category = PROMPT_TO_CATEGORY[best_prompt]

        # ─────────────────────────────────────────
        # SAFETY FILTERS
        # ─────────────────────────────────────────

        if best_score < CONFIDENCE_THRESHOLD:
            return {
                "predicted_category": "Unknown",
                "confidence": round(best_score, 4),
                "needs_manual_confirmation": True,
                "matched_prompt": None
            }

        if (best_score - second_score) < SIMILARITY_GAP_THRESHOLD:
            return {
                "predicted_category": "Unknown",
                "confidence": round(best_score, 4),
                "needs_manual_confirmation": True,
                "matched_prompt": None
            }

        if predicted_category == "Irrelevant":
            return {
                "predicted_category": "Unknown",
                "confidence": round(best_score, 4),
                "needs_manual_confirmation": True,
                "matched_prompt": None
            }

        return {
            "predicted_category": predicted_category,
            "confidence": round(best_score, 4),
            "needs_manual_confirmation": False,
            "matched_prompt": best_prompt
        }

    except Exception as e:
        return {
            "predicted_category": "Unknown",
            "confidence": 0.0,
            "needs_manual_confirmation": True,
            "matched_prompt": None,
            "error": f"Classification failed: {str(e)}"
        }