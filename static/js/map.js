
(function () {
    let svg, g, projection, path, width, height;
    let legendGroup, subtitleEl;
    let tooltip;

    const NAME_MAP = {
        "Russia":           "Russian Federation",
        "Egypt":            "Egypt, Arab Rep.",
        "Iran":             "Iran, Islamic Rep.",
        "Syria":            "Syrian Arab Republic",
        "Czechia":          "Czech Republic",
        "South Korea":      "Korea, Rep.",
        "North Korea":      "Korea, Dem. People's Rep.",
        "Venezuela":        "Venezuela, RB",
        "Democratic Republic of the Congo": "Congo, Dem. Rep.",
        "Republic of Congo": "Congo, Rep.",
        "Ivory Coast":      "Cote d'Ivoire",
        "Laos":             "Lao PDR",
        "Macedonia":        "North Macedonia",
        "Moldova":          "Moldova",
        "Kyrgyzstan":       "Kyrgyz Republic",
    };

    function init({ container = '#map' } = {}) {
        const svgEl = d3.select(container);
        const bbox  = svgEl.node().getBoundingClientRect();

        width  = bbox.width  || 700;
        height = bbox.height || 450;

        svg = svgEl;

     
        subtitleEl = d3.select(svgEl.node().closest('.panel')).select('h2');

        g = svg.append('g').attr('class', 'countries');

        appState.subscribe((state) => {
            g.selectAll('path')
                .classed('is-hovered', d => {
            const datasetName = NAME_MAP[d.properties?.name] || d.properties?.name;
            return datasetName === state.selectedCountry;
        });
});

        projection = d3.geoNaturalEarth1()
            .scale(width / 6)
            .translate([width / 2, height / 2]);

        path = d3.geoPath().projection(projection);

        
        legendGroup = svg.append('g')
            .attr('class', 'map-legend')
            .attr('transform', `translate(10, ${height - 50})`);

        tooltip = d3.select('#tooltip');
    }

   
    function update(topoData, data, state = {}) {
        if (!topoData || !data) return;

        
        let features;
        if (topoData.type === 'Topology') {
            const objectKey = Object.keys(topoData.objects)[0]; // 'countries'
            features = topojson.feature(topoData, topoData.objects[objectKey]).features;
        } else {
            features = topoData.features || [];
        }

        const selectedYear      = state.selectedYear      || 2020;
        const selectedIndicator = state.selectedIndicator;

        // ── 2. Update panel title 
        if (subtitleEl) {
            subtitleEl.text(
                selectedIndicator
                    ? `Choropleth Map — ${selectedIndicator} (${selectedYear})`
                    : 'Choropleth Map'
            );
        }

       
        if (!selectedIndicator) {
            g.selectAll('path')
                .data(features, d => d.properties.name)
                .join('path')
                .attr('d', path)
                .attr('stroke', '#999')
                .attr('stroke-width', 0.5)
                .attr('fill', '#eee');
            legendGroup.selectAll('*').remove();
            return;
        }

        
        const yearData = data.filter(d => d.year === selectedYear);
        const dataMap  = new Map(yearData.map(d => [d['Country Name'], d]));

        const values = yearData
            .map(d => +d[selectedIndicator])
            .filter(v => !isNaN(v));

        const minVal = d3.min(values);
        const maxVal = d3.max(values);

        const colorScale = d3.scaleSequential(d3.interpolateBlues)
            .domain([minVal, maxVal]);

       
        g.selectAll('path')
            .data(features, d => d.properties.name)
            .join('path')
            .attr('d', path)
            .attr('stroke', '#999')
            .attr('stroke-width', 0.5)
            .attr('fill', d => {
                const geoName     = d.properties.name;
                const datasetName = NAME_MAP[geoName] || geoName;
                const row         = dataMap.get(datasetName);
                if (!row) return '#eee';
                const value = +row[selectedIndicator];
                return isNaN(value) ? '#eee' : colorScale(value);
            })
            .on('mouseenter', function (event, d) {
                const geoName     = d.properties.name;
                const datasetName = NAME_MAP[geoName] || geoName;
                const row         = dataMap.get(datasetName);
                const value       = row ? +row[selectedIndicator] : NaN;
                const display     = isNaN(value)
                    ? 'no data'
                    : value.toLocaleString(undefined, { maximumFractionDigits: 2 });

                d3.select(this)
                    .classed('is-hovered', true);

                tooltip
                    .attr('hidden', null)
                    .html(
                        `<strong>${datasetName}</strong><br>` +
                        `${selectedIndicator}: ${display}`
                    );
                // task 5, set appState.selectedCountry on click
                appState.set({ selectedCountry: datasetName });
            })
            .on('mousemove', function (event) {
                tooltip
                    .style('left', `${event.pageX + 12}px`)
                    .style('top',  `${event.pageY + 12}px`);
            })
            .on('mouseleave', function () {
                d3.select(this)
                    .classed('is-hovered', false);
                tooltip.attr('hidden', true);
                //task 5, clear appState.selectedCountry on mouse leave
                appState.set({ selectedCountry: null });
            });

       
        drawLegend(colorScale, minVal, maxVal);
    }

    
    function drawLegend(colorScale, minVal, maxVal) {
        legendGroup.selectAll('*').remove();

        const legendW = 160;
        const legendH = 10;

        
        let defs = svg.select('defs');
        if (defs.empty()) defs = svg.append('defs');
        defs.selectAll('#map-legend-gradient').remove();

        const grad = defs.append('linearGradient')
            .attr('id', 'map-legend-gradient')
            .attr('x1', '0%').attr('x2', '100%');

        d3.range(11).forEach(i => {
            const t = i / 10;
            grad.append('stop')
                .attr('offset', `${t * 100}%`)
                .attr('stop-color', colorScale(minVal + t * (maxVal - minVal)));
        });

        legendGroup.append('rect')
            .attr('width', legendW)
            .attr('height', legendH)
            .style('fill', 'url(#map-legend-gradient)');

        legendGroup.append('g')
            .attr('transform', `translate(0, ${legendH})`)
            .call(
                d3.axisBottom(d3.scaleLinear().domain([minVal, maxVal]).range([0, legendW]))
                    .ticks(4)
                    .tickFormat(d3.format('.2s'))
            )
            .call(axis => axis.select('.domain').remove())
            .selectAll('text')
            .style('font-size', '9px');

       
        legendGroup.append('rect')
            .attr('x', legendW + 10).attr('width', 12).attr('height', legendH)
            .attr('fill', '#eee').attr('stroke', '#aaa').attr('stroke-width', 0.5);

        legendGroup.append('text')
            .attr('x', legendW + 26).attr('y', 9)
            .style('font-size', '9px')
            .text('no data');
    }

    window.MapView = { init, update };
})();
