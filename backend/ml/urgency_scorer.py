import re

# severity keywords
SEVERITY_KEYWORDS = [
    "accident",
    "injury",
    "flood",
    "fire",
    "danger",
    "collapse",
    "blocked",
    "overflow",
    "huge pothole"
]


def compute_urgency(text):

    score = 0

    # severity keyword check
    for word in SEVERITY_KEYWORDS:
        if re.search(word, text.lower()):
            score += 35
            break

    # simple baseline score
    score += 30

    # limit score to 100
    return min(score, 100)