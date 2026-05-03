(function () {
    let svg, g, projection, path, width, height;

    function init({ container = '#map' } = {}) {
        const svgEl = d3.select(container);
        const bbox = svgEl.node().getBoundingClientRect();

        width = bbox.width || 700;
        height = bbox.height || 450;

        svg = svgEl;

        g = svg.append('g')
            .attr('class', 'countries');

        projection = d3.geoNaturalEarth1()
            .scale(width / 6)
            .translate([width / 2, height / 2]);

        path = d3.geoPath().projection(projection);
    }

    function update(geoData, data, state = {}) {
        if (!geoData || !data) return;

        const features = geoData.features;

        const selectedYear = state.selectedYear || 2020;
        const selectedIndicator = state.selectedIndicator;

        if (!selectedIndicator) return;

        
        // Filter dataset for selected year
        
        const yearData = data.filter(d => d.year === selectedYear);

        // Build lookup: country -> row
        const dataMap = new Map(
            yearData.map(d => [d["Country Name"], d])
        );

     
        // Extract numeric values for color scale
        
        const values = yearData
            .map(d => +d[selectedIndicator])
            .filter(v => !isNaN(v));

        const minVal = d3.min(values);
        const maxVal = d3.max(values);

        const colorScale = d3.scaleSequential()
            .domain([minVal, maxVal])
            .interpolator(d3.interpolateBlues);

  
        // Draw countries
       
        g.selectAll('path')
            .data(features, d => d.properties.name)
            .join('path')
            .attr('d', path)
            .attr('stroke', '#999')
            .attr('stroke-width', 0.5)
            .attr('fill', d => {
                const countryName = d.properties.name;
                const row = dataMap.get(countryName);

                if (!row) return '#eee';

                const value = +row[selectedIndicator];

                if (isNaN(value)) return '#eee';

                return colorScale(value);
            });
    }

    window.MapView = { init, update };
})();
