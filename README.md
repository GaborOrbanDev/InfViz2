# InfViz2 — Coordinated Multi-View Dashboard

Exercise 2 scaffold: a Flask backend computes a PCA and serves filtered country data; a D3.js frontend renders three coordinated views (PCA scatterplot, choropleth map, time series). Hover, click, brush, the year slider and the indicator dropdown all share a single interaction state.

## Setup

> Find UV installation guide at this [url](https://docs.astral.sh/uv/getting-started/installation/)

To create env and install packages:

```bash
uv sync
```
## Data source
- `data/exercise1.csv` is from Exercise 1
- `static/data/world.geojson` is from 
[topojson/world-atlas](https://github.com/topojson/world-atlas)

## Run

```bash
uv run python app.py
```

Open <http://localhost:5000>.

## Layout

```
InfViz2/
├── app.py                      # Flask server, PCA, filtering
├── requirements.txt
├── data/
│   └── exercise1.csv           # input from Exercise 1 (you provide)
├── templates/
│   └── index.html              # Jinja2 + D3 entry page
└── static/
    ├── css/style.css
    ├── js/
    │   ├── interaction.js      # shared state (pub/sub)
    │   ├── scatterplot.js      # PCA scatterplot (Task 3)
    │   ├── map.js              # choropleth map (Task 4)
    │   ├── timeseries.js       # line chart (Task 5c)
    │   └── main.js             # bootstrap + data fetch + UI controls
    └── data/
        └── world.geojson       # geographic data (you provide)
```

## API

| Route                          | Returns                                            |
|--------------------------------|----------------------------------------------------|
| `GET /`                        | the dashboard HTML                                 |
| `GET /api/data`                | filtered dataset as JSON records                   |
| `GET /api/pca`                 | `{ countries, coordinates, explained_variance }`   |
| `GET /api/timeseries/<country>`| historical rows for one country                    |

## Task checklist

- [ ] **Task 1** — load the CSV, filter to `COUNTRIES`, return JSON.
- [ ] **Task 2** — scale features, compute PCA on the most recent year.
- [ ] **Task 3** — PCA scatterplot with country labels.
- [ ] **Task 4** — choropleth map + indicator dropdown.
- [ ] **Task 5** — link scatterplot ↔ map (hover); click country → time series.
- [ ] **Task 6a** — `d3.brush` on the scatterplot, propagated to map + time series.
- [ ] **Task 6b** — year slider drives map and time series.
- [ ] **Task 6c** — indicator dropdown drives all three views (enter/update only).
- [ ] **Bonus** — tooltip on map with 8 indicator values.

Each task already has a corresponding `TODO` marker in the source.
