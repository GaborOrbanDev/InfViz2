/**
 * Choropleth Map (Task 4).
 *
 * Exposes window.MapView.{init, update}. Skeleton sets up the SVG and a
 * geo projection; rendering of the world TopoJSON / GeoJSON is a TODO.
 */

(function () {
    let svg, g, projection, path, width, height;

    function init({ container = '#map' } = {}) {
        const svgEl = d3.select(container);
        const bbox = svgEl.node().getBoundingClientRect();
        width = bbox.width || 600;
        height = bbox.height || 400;

        svg = svgEl;
        g = svg.append('g').attr('class', 'countries');

        projection = d3.geoNaturalEarth1()
            .scale(width / 6)
            .translate([width / 2, height / 2]);
        path = d3.geoPath(projection);
    }

    function update(geoData, values /*, state */) {
        // TODO Task 4: draw country polygons and color by selected indicator.
        // TODO Task 5: hover/click handlers → appState.set(...).
        // TODO Bonus: tooltip with 8 indicator values.
        if (!geoData) return;

        const features = geoData.features || (geoData.objects
            ? topojson.feature(geoData, geoData.objects.countries).features
            : []);

        g.selectAll('path').data(features, d => d.id || d.properties.name)
            .join('path')
            .attr('d', path)
            .attr('fill', '#eee')
            .attr('stroke', '#999');
    }

    window.MapView = { init, update };
})();
