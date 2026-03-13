from sklearn.cluster import DBSCAN
import pandas as pd
import numpy as np


def detect_hotspots(df):

    # Convert ward_id into numeric clustering feature
    ward_values = df[["ward_id"]].values

    # DBSCAN clustering
    clustering = DBSCAN(eps=1.5, min_samples=3).fit(ward_values)

    df["cluster_id"] = clustering.labels_

    return df