"""
InfViz2 — Coordinated Multi-View Dashboard (Flask backend).

Routes
------
GET /                          Render the dashboard (index.html).
GET /api/data                  Filtered dataset for the COUNTRIES list.
GET /api/pca                   2D PCA coordinates for the most recent year.
GET /api/timeseries/<country>  Historical values (1960–2020) for one country.

Run
---
    uv sync
    uv run python app.py
    # open http://localhost:5000
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd
from flask import Flask, jsonify, render_template
from utils.loaders import load_dataframe, COUNTRIES
from utils.pca import compute_pca

app = Flask(__name__)

DF: pd.DataFrame = load_dataframe(Path("data/exercise1.csv"))


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
    """Historical values (1960–2020) for a single country."""
    if DF.empty or "Country Name" not in DF.columns:
        return jsonify([])
    sub = DF[DF["Country Name"] == country].sort_values("year")
    return jsonify(sub.to_dict(orient="records"))


# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(debug=True)
