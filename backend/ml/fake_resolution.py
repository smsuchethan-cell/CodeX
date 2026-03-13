from rapidfuzz import fuzz

def detect_fake_resolutions(df):

    fake_flags = []

    texts = df["raw_text"].tolist()

    for i in range(len(texts)):

        fake = False

        for j in range(len(texts)):

            if i != j:

                similarity = fuzz.ratio(texts[i], texts[j])

                if similarity > 85:
                    fake = True
                    break

        fake_flags.append(fake)

    df["ai_fake_resolution_flag"] = fake_flags

    return df