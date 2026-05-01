"""
InfViz2 — Coordinated Multi-View Dashboard (Flask backend).

This is the scaffold for Exercise 2. The real data loading, filtering and
PCA computation will be wired up as the tasks below are implemented.

Routes
------
GET /                          Render the dashboard (index.html).
GET /api/data                  Filtered dataset for the COUNTRIES list.
GET /api/pca                   2D PCA coordinates for the most recent year.
GET /api/timeseries/<country>  Historical values (1960–2020) for one country.

Run
---
    pip install -r requirements.txt
    python app.py
    # open http://localhost:5000
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd
from flask import Flask, jsonify, render_template
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
CSV_PATH = DATA_DIR / "exercise1.csv"  # output of Exercise 1

# Countries we keep (Task 1).
COUNTRIES = [
    "Afghanistan", "Albania", "Algeria", "Angola", "Argentina", "Armenia",
    "Australia", "Austria", "Azerbaijan", "Brazil", "Bulgaria", "Cameroon",
    "Chile", "China", "Colombia", "Croatia", "Cuba", "Cyprus",
    "Czech Republic", "Ecuador", "Egypt, Arab Rep.", "Eritrea", "Ethiopia",
    "France", "Germany", "Ghana", "Greece", "India", "Indonesia",
    "Iran, Islamic Rep.", "Iraq", "Ireland", "Italy", "Japan", "Jordan",
    "Kazakhstan", "Kenya", "Lebanon", "Malta", "Mexico", "Morocco",
    "Pakistan", "Peru", "Philippines", "Russian Federation",
    "Syrian Arab Republic", "Tunisia", "Turkey", "Ukraine",
]

# ---------------------------------------------------------------------------
# Flask app
# ---------------------------------------------------------------------------

app = Flask(__name__)


# ---------------------------------------------------------------------------
# Data loading (Task 1)
# ---------------------------------------------------------------------------

def load_dataframe() -> pd.DataFrame:
    """Load the CSV from Exercise 1 and filter to COUNTRIES.

    Returned shape is intentionally not pinned — we'll fix the schema once the
    actual CSV from Exercise 1 is dropped into ``data/``.
    """
    if not CSV_PATH.exists():
        # Return an empty frame so the server still boots before the CSV is in place.
        return pd.DataFrame()

    df = pd.read_csv(CSV_PATH)
    if "Country" in df.columns:
        df = df[df["Country"].isin(COUNTRIES)]
    return df


# Load once at import time so requests are cheap.
DF: pd.DataFrame = load_dataframe()


# ---------------------------------------------------------------------------
# PCA (Task 2)
# ---------------------------------------------------------------------------

def compute_pca(df: pd.DataFrame) -> dict:
    """Compute a 2D PCA on the most recent year.

    TODO: adapt the column selection to match the Exercise 1 CSV layout
    (long vs wide). For now this is a placeholder that returns an empty
    payload when the CSV is missing.
    """
    if df.empty:
        return {"countries": [], "coordinates": [], "explained_variance": []}

    # Placeholder: assumes wide format with year columns. Adjust later.
    numeric = df.select_dtypes(include="number")
    if numeric.empty:
        return {"countries": [], "coordinates": [], "explained_variance": []}

    scaler = StandardScaler()
    scaled = scaler.fit_transform(numeric.fillna(numeric.mean(numeric_only=True)))

    pca = PCA(n_components=2)
    coords = pca.fit_transform(scaled)

    return {
        "countries": df["Country"].tolist() if "Country" in df.columns else [],
        "coordinates": coords.tolist(),
        "explained_variance": pca.explained_variance_ratio_.tolist(),
    }


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    return render_template("index.html", countries=COUNTRIES)


@app.route("/api/data")
def api_data():
    """Filtered dataset as JSON records."""
    return jsonify(DF.to_dict(orient="records"))


@app.route("/api/pca")
def api_pca():
    """2D PCA coordinates for the most recent year."""
    return jsonify(compute_pca(DF))


@app.route("/api/timeseries/<country>")
def api_timeseries(country: str):
    """Historical values for a single country."""
    if DF.empty or "Country" not in DF.columns:
        return jsonify([])
    sub = DF[DF["Country"] == country]
    return jsonify(sub.to_dict(orient="records"))


# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(debug=True)
