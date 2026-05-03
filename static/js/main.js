/**
 * Bootstrap: fetch data from Flask, initialise views, wire UI controls.
 */

(async function () {
    // Initialise empty views immediately so the layout is visible.
    Scatterplot.init();
    MapView.init();
    TimeSeries.init();

    // -------------------------------------------------------------------
    // UI controls
    // -------------------------------------------------------------------
    const yearSlider = document.getElementById('year-slider');
    const yearLabel = document.getElementById('year-label');
    const indicatorSelect = document.getElementById('indicator-select');

    yearSlider.addEventListener('input', () => {
        yearLabel.textContent = yearSlider.value;
        appState.set({ selectedYear: +yearSlider.value });
    });

    indicatorSelect.addEventListener('change', () => {
        appState.set({ selectedIndicator: indicatorSelect.value });
    });

    // -------------------------------------------------------------------
    // Data fetches
    // -------------------------------------------------------------------
    const [data, pca, world] = await Promise.all([
        fetch('/api/data').then(r => r.json()).catch(() => []),
        fetch('/api/pca').then(r => r.json()).catch(() => null),
        // TODO: drop a TopoJSON/GeoJSON into static/data/world.geojson.
        fetch('/static/data/world.geojson').then(r => r.ok ? r.json() : null).catch(() => null),
    ]);

    // Populate indicator dropdown from the dataset's columns once available.
    if (Array.isArray(data) && data.length) {
        const sample = data[0];
        const numericKeys = Object.keys(sample).filter(k => typeof sample[k] === 'number');
        indicatorSelect.innerHTML = numericKeys
            .map(k => `<option value="${k}">${k}</option>`).join('');
        if (numericKeys.length) appState.set({ selectedIndicator: numericKeys[0] });
    }

    Scatterplot.update(pca);
    MapView.update(world, data);
    TimeSeries.update({});

    // -------------------------------------------------------------------
    // React to state changes
    // -------------------------------------------------------------------
    appState.subscribe((state) => {
    MapView.update(world, data, state);
});
})();
