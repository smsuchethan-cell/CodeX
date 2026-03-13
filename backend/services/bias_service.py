import pandas as pd
from backend.ml.bias_detector import compute_bias_scores


def get_bias_scores(file_path):

    df = pd.read_csv(file_path)

    bias = compute_bias_scores(df)

    return bias