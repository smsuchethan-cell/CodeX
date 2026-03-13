import pandas as pd
from backend.ml.clustering import detect_hotspots


def get_hotspots(file_path):

    df = pd.read_csv(file_path)

    result = detect_hotspots(df)

    return result