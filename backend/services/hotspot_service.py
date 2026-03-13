import pandas as pd
from backend.ml.clustering import detect_hotspots


def get_hotspots(file_path):

    df = pd.read_csv(file_path)

    # run clustering
    df = detect_hotspots(df)

    # return important columns only
    return df[["ward_name", "ward_id", "cluster_id"]]