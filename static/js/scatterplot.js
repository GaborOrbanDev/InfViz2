/**
 * PCA Scatterplot (Task 3).
 *
 * Renders the PCA result as a 2D scatterplot of countries.
 * Dot ↔ country association is made clear three ways:
 *   - a small always-visible 3-letter ISO code next to each dot,
 *   - a hover tooltip with the full country name and PC1/PC2 values,
 *   - axis titles that include the explained-variance ratios.
 *
 * Exposes window.Scatterplot.{init, update}.
 *
 * Task 6a (brushing) and Task 5 (linked highlighting) hooks are marked TODO
 * and will read/write window.appState.
 */

(function () {
    const margin = { top: 24, right: 24, bottom: 50, left: 60 };
    let svg, g, x, y, width, height;
    let xAxisTitle, yAxisTitle;
    let tooltip;

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

        // Axes + (placeholder) titles. Titles are filled in on update().
        g.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${height})`);
        g.append('g').attr('class', 'y-axis');

        xAxisTitle = g.append('text')
            .attr('class', 'axis-title x')
            .attr('text-anchor', 'middle')
            .attr('x', width / 2)
            .attr('y', height + 38)
            .text('PC1');

        yAxisTitle = g.append('text')
            .attr('class', 'axis-title y')
            .attr('text-anchor', 'middle')
            .attr('transform', `translate(${-44},${height / 2}) rotate(-90)`)
            .text('PC2');

        g.append('g').attr('class', 'dots');
        g.append('g').attr('class', 'labels');
        g.append('g').attr('class', 'brush');     // Task 6a will mount d3.brush here.

        tooltip = d3.select('#tooltip');
    }

    function update(pcaData /*, state */) {
        if (!pcaData || !pcaData.coordinates || !pcaData.coordinates.length) return;

        const codes = pcaData.country_codes || [];
        const points = pcaData.coordinates.map((c, i) => ({
            x: c[0],
            y: c[1],
            country: pcaData.countries[i],
            code: codes[i] || pcaData.countries[i].slice(0, 3).toUpperCase(),
        }));

        // Symmetric padding so labels at the edges don't get clipped.
        const padX = (d3.max(points, d => Math.abs(d.x)) || 1) * 0.08;
        const padY = (d3.max(points, d => Math.abs(d.y)) || 1) * 0.08;
        x.domain([d3.min(points, d => d.x) - padX, d3.max(points, d => d.x) + padX]).nice();
        y.domain([d3.min(points, d => d.y) - padY, d3.max(points, d => d.y) + padY]).nice();

        g.select('.x-axis').call(d3.axisBottom(x));
        g.select('.y-axis').call(d3.axisLeft(y));

        // Axis titles with explained variance, e.g. "PC1 (33.9% var. explained)".
        const ev = pcaData.explained_variance || [];
        const fmt = pct => `${(pct * 100).toFixed(1)}% var. explained`;
        if (ev[0] != null) xAxisTitle.text(`PC1 (${fmt(ev[0])})`);
        if (ev[1] != null) yAxisTitle.text(`PC2 (${fmt(ev[1])})`);

        // ----- dots -----
        const dots = g.select('.dots').selectAll('circle.dot')
            .data(points, d => d.country);

        dots.join(
            enter => enter.append('circle')
                .attr('class', 'dot')
                .attr('r', 5)
                .attr('cx', d => x(d.x))
                .attr('cy', d => y(d.y))
                .on('mouseenter', onDotEnter)
                .on('mousemove', onDotMove)
                .on('mouseleave', onDotLeave),
            update => update
                .attr('cx', d => x(d.x))
                .attr('cy', d => y(d.y)),
            exit => exit.remove(),
        );

        // ----- labels (3-letter country codes, offset slightly to the upper-right) -----
        const labels = g.select('.labels').selectAll('text.country-label')
            .data(points, d => d.country);

        labels.join(
            enter => enter.append('text')
                .attr('class', 'country-label')
                .attr('x', d => x(d.x) + 7)
                .attr('y', d => y(d.y) - 5)
                .text(d => d.code),
            update => update
                .attr('x', d => x(d.x) + 7)
                .attr('y', d => y(d.y) - 5)
                .text(d => d.code),
            exit => exit.remove(),
        );
    }

    // -----------------------------------------------------------------------
    // Tooltip handlers (Task 3 + foundation for Task 5 linking).
    // -----------------------------------------------------------------------
    function onDotEnter(event, d) {
        d3.select(this).classed('is-hover', true);
        tooltip.attr('hidden', null).html(
            `<strong>${d.country}</strong><br>` +
            `PC1: ${d.x.toFixed(3)}<br>` +
            `PC2: ${d.y.toFixed(3)}`,
        );
        // TODO Task 5: appState.set({ selectedCountry: d.country });
    }

    function onDotMove(event) {
        tooltip
            .style('left', `${event.pageX + 12}px`)
            .style('top', `${event.pageY + 12}px`);
    }

    function onDotLeave() {
        d3.select(this).classed('is-hover', false);
        tooltip.attr('hidden', true);
        // TODO Task 5: appState.set({ selectedCountry: null });
    }

    window.Scatterplot = { init, update };
})();
