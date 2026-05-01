/**
 * PCA Scatterplot (Task 3).
 *
 * Exposes window.Scatterplot.{init, update}. Real rendering is left as a
 * TODO — the skeleton just sets up the SVG, scales, and a no-op update.
 */

(function () {
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    let svg, g, x, y, width, height;

    function init({ container = '#scatterplot' } = {}) {
        const svgEl = d3.select(container);
        const bbox = svgEl.node().getBoundingClientRect();
        width = (bbox.width || 400) - margin.left - margin.right;
        height = (bbox.height || 300) - margin.top - margin.bottom;

        svg = svgEl;
        g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        x = d3.scaleLinear().range([0, width]);
        y = d3.scaleLinear().range([height, 0]);

        g.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${height})`);
        g.append('g').attr('class', 'y-axis');
        g.append('g').attr('class', 'dots');
        g.append('g').attr('class', 'brush');
    }

    function update(pcaData /*, state */) {
        // TODO Task 3: bind pcaData.coordinates to circles, label countries.
        // TODO Task 6a: wire d3.brush and push selection to appState.
        if (!pcaData || !pcaData.coordinates || !pcaData.coordinates.length) return;

        const points = pcaData.coordinates.map((c, i) => ({
            x: c[0], y: c[1], country: pcaData.countries[i],
        }));

        x.domain(d3.extent(points, d => d.x)).nice();
        y.domain(d3.extent(points, d => d.y)).nice();

        g.select('.x-axis').call(d3.axisBottom(x));
        g.select('.y-axis').call(d3.axisLeft(y));

        const dots = g.select('.dots').selectAll('circle').data(points, d => d.country);
        dots.join(
            enter => enter.append('circle')
                .attr('r', 5)
                .attr('cx', d => x(d.x))
                .attr('cy', d => y(d.y)),
            update => update
                .attr('cx', d => x(d.x))
                .attr('cy', d => y(d.y)),
            exit => exit.remove(),
        );
    }

    window.Scatterplot = { init, update };
})();
