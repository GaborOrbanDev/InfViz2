/**
 * Time Series line chart (Task 5c).
 *
 * Exposes window.TimeSeries.{init, update}. Real rendering is a TODO; this
 * just lays out the axes and an empty path group.
 */

(function () {
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    let svg, g, x, y, width, height;

    function init({ container = '#timeseries' } = {}) {
        const svgEl = d3.select(container);
        const bbox = svgEl.node().getBoundingClientRect();
        width = (bbox.width || 600) - margin.left - margin.right;
        height = (bbox.height || 250) - margin.top - margin.bottom;

        svg = svgEl;
        g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        x = d3.scaleLinear().domain([1960, 2020]).range([0, width]);
        y = d3.scaleLinear().range([height, 0]);

        g.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.format('d')));
        g.append('g').attr('class', 'y-axis');
        g.append('g').attr('class', 'lines');
    }

    function update(seriesByCountry /*, state */) {
        // TODO Task 5c: draw one line per selected/brushed country.
        if (!seriesByCountry || !Object.keys(seriesByCountry).length) {
            g.select('.lines').selectAll('*').remove();
            return;
        }

        const all = Object.values(seriesByCountry).flat();
        y.domain(d3.extent(all, d => d.value)).nice();
        g.select('.y-axis').call(d3.axisLeft(y));

        const line = d3.line().x(d => x(d.year)).y(d => y(d.value));
        const lines = g.select('.lines').selectAll('path').data(
            Object.entries(seriesByCountry),
            ([country]) => country,
        );
        lines.join('path')
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('d', ([, series]) => line(series));
    }

    window.TimeSeries = { init, update };
})();
