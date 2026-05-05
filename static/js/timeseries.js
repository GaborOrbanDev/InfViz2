/**
 * Time Series line chart (Task 5c).
 *
 * Exposes window.TimeSeries.{init, update}. Real rendering is a TODO; this
 * just lays out the axes and an empty path group.
 */

(function () {
    const margin = { top: 20, right: 100, bottom: 40, left: 50 };
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

        g.append('g').attr('class', 'legend')
            .attr('transform', `translate(${width + 10}, 0)`);
    }

function update(seriesByCountry, state) {
    if (!seriesByCountry || !Object.keys(seriesByCountry).length) {
        g.select('.lines').selectAll('*').remove();
        g.select('.legend').selectAll('*').remove();
        g.select('.y-axis').selectAll('*').remove();
        return;
    }

    const countries = Object.keys(seriesByCountry);

    const colorScale = d3.scaleOrdinal()
        .domain(countries)
        .range(d3.schemeTableau10);

    const all = Object.values(seriesByCountry).flat();
    y.domain(d3.extent(all, d => d.value)).nice();
    g.select('.y-axis').call(d3.axisLeft(y));

    const line = d3.line().x(d => x(d.year)).y(d => y(d.value));

    g.select('.lines').selectAll('path')
        .data(Object.entries(seriesByCountry), ([country]) => country)
        .join('path')
        .attr('fill', 'none')
        .attr('stroke', ([country]) => colorScale(country))
        .attr('stroke-width', 1.5)
        .attr('d', ([, series]) => line(series));

    // legend
    const legend = g.select('.legend');
    legend.selectAll('*').remove();

    countries.forEach((country, i) => {
        const row = legend.append('g')
            .attr('transform', `translate(0, ${i * 20})`);

        row.append('rect')
            .attr('width', 12)
            .attr('height', 12)
            .attr('fill', colorScale(country));

        row.append('text')
            .attr('x', 16)
            .attr('y', 10)
            .style('font-size', '11px')
            .text(country);
    });
}

    window.TimeSeries = { init, update };
})();
