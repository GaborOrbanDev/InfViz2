import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler


# Columns that identify a row but are not features used by PCA.
NON_FEATURE_COLS = {"Country Name", "Country Code", "year"}


def empty_pca_payload() -> dict:
    return {
        "year": None,
        "countries": [],
        "country_codes": [],
        "coordinates": [],
        "features": [],
        "explained_variance": [],
        "components": [],
        "feature_means": [],
        "feature_stds": [],
    }


def compute_pca(df: pd.DataFrame) -> dict:
    """Compute a 2D PCA on the most recent year only

    Pipeline:
      1. Slice the rows for the most recent year.
      2. Pick the numeric feature columns (everything except identifiers).
      3. Drop columns that are entirely NaN; fill remaining NaNs with the
         column mean — PCA cannot ingest missing values.
      4. Standardise each feature to zero mean / unit variance
         (StandardScaler) so no single high-magnitude indicator dominates
         the principal components.
      5. Fit ``PCA(n_components=2)`` and project the data onto PC1/PC2.

    The response intentionally also carries the loadings, feature names,
    means and standard deviations so the client can render auxiliary
    artefacts later (axis labels with explained variance, biplot arrows,
    tooltips, ...).
    """

    most_recent_year = int(df["year"].max())
    recent = df[df["year"] == most_recent_year].copy()
    recent = recent.sort_values("Country Name").reset_index(drop=True)

    feature_cols = [
        c for c in recent.columns
        if c not in NON_FEATURE_COLS and pd.api.types.is_numeric_dtype(recent[c])
    ]
    features = recent[feature_cols]
    features = features.dropna(axis=1, how="all")
    features = features.fillna(features.mean(numeric_only=True))

    if features.empty or features.shape[1] < 2:
        return empty_pca_payload()

    scaler = StandardScaler()
    scaled = scaler.fit_transform(features.values)

    pca = PCA(n_components=2)
    coords = pca.fit_transform(scaled)

    return {
        "year": most_recent_year,
        "countries": recent["Country Name"].tolist(),
        "country_codes": recent["Country Code"].tolist(),
        "coordinates": coords.tolist(),                       
        "features": list(features.columns),                  
        "explained_variance": pca.explained_variance_ratio_.tolist(),
        "components": pca.components_.tolist(),           
        "feature_means": scaler.mean_.tolist(),
        "feature_stds": scaler.scale_.tolist(),
    }