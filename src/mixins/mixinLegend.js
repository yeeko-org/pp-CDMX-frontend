import * as d3 from 'd3';

var mixinLegend = {
  methods: {
      legend({
        color,
        title,
        tickSize = 6,
        width = 320, 
        height = 44 + tickSize,
        marginTop = 18,
        marginRight = 0,
        marginBottom = 16 + tickSize,
        marginLeft = 0,
        fontSize = 10,
        ticks = width / 64,
        cejume = false,
        tickFormat,
        tickValues
      } = {}) {

        const svg = d3.select('#ResultsMap')
        function buildRect(color, n=64){
          //const interpolate = d3.interpolateCool
          //console.log("color", color)
          var grad = svg
            .append("defs")
              .append("linearGradient")
              .attr("id", "gradient-0")
          for (var i = 0; i < n+1; i++) {
            var frac = (i)/n
            grad.append("stop")
              .attr("offset",  `${frac*100}%`)
              .attr("stop-color", ()=>
                //d3.rgb(interpolate(frac)).hex()
                d3.rgb(color(frac)).hex()
              )
          }
        }


        let tickAdjust = g => g.selectAll(".tick line")
          .attr("y1", marginTop + marginBottom - height)
          .attr("stroke", "white");
        let x;

        // Continuous
        if (color.interpolate) {
          console.log("Continuous")
          const n = Math.min(color.domain().length, color.range().length);

          x = color.copy().rangeRound(d3.quantize(d3.interpolate(
                                        marginLeft, width - marginRight), n));

          buildRect(color.copy().domain(d3.quantize(d3.interpolate(0, 1), n)))
          
          //buildRect(color)
          svg.append('rect')
              .attr("x", marginLeft)
              .attr("y", marginTop)
              .attr("width", width - marginLeft - marginRight)
              .attr("height", height - marginTop - marginBottom)
              .style('fill', 'url(#gradient-0)')

        }

        // Sequential
        else if (color.interpolator) {
          console.log("Secuencial")
          //console.log(color.interpolator())
          x = Object.assign(color.copy()
              .interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
              {range() { return [marginLeft, width - marginRight]; }});

          buildRect(color.interpolator())

          svg.append('rect')
              .attr("x", marginLeft)
              .attr("y", marginTop)
              .attr("width", width - marginLeft - marginRight)
              .attr("height", height - marginTop - marginBottom)
              .style('fill', 'url(#gradient-0)')

          // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
          if (!x.ticks) {
            //console.log("no x.thick")
            if (tickValues === undefined) {
              const n = Math.round(ticks + 1);
              tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)));
            }
            if (typeof tickFormat !== "function") {
              tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
            }
          }
        }


        // Threshold
        else if (color.invertExtent) {
          console.log("Threshold")
          const thresholds
              = color.thresholds ? color.thresholds() // scaleQuantize
              : color.quantiles ? color.quantiles() // scaleQuantile
              : color.domain(); // scaleThreshold

          const thresholdFormat
              = tickFormat === undefined ? d => d
              : typeof tickFormat === "string" ? d3.format(tickFormat)
              : tickFormat;

          x = d3.scaleLinear()
              .domain([-1, color.range().length - 1])
              .rangeRound([marginLeft, width - marginRight]);

          svg.append("g")
            .selectAll("rect")
            .data(color.range())
            .join("rect")
              .attr("x", (d, i) => x(i - 1))
              .attr("y", marginTop)
              .attr("width", (d, i) => x(i) - x(i - 1))
              .attr("height", height - marginTop - marginBottom)
              .attr("fill", d => d);

          tickValues = d3.range(thresholds.length);
          tickFormat = i => thresholdFormat(thresholds[i], i);
        }

        // Ordinal
        else {
          console.log("Ordinal")
          x = d3.scaleBand()
              .domain(color.domain())
              .rangeRound([marginLeft, width - marginRight]);

          svg.append("g")
            .selectAll("rect")
            .data(color.domain())
            .join("rect")
              .attr("x", x)
              .attr("y", marginTop)
              .attr("width", Math.max(0, x.bandwidth() - 1))
              .attr("height", height - marginTop - marginBottom)
              .attr("fill", color);

          tickAdjust = () => {};
        }


        svg.append("g")
          .attr("transform", `translate(0,${height - marginBottom})`)
          .call(d3.axisBottom(x)
            .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
            .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
            .tickSize(tickSize)
            .tickValues(tickValues))
          .attr("font-size", `${fontSize*.8}pt`)
          .call(tickAdjust)
          .call(g => g.select(".domain").remove())
          .call(g => g.append("text")
            .attr("x", marginLeft)
            .attr("y", marginTop + marginBottom - height - 6)
            .attr("fill", "white")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr("font-family", "Montserrat")
            .attr("font-size", `${fontSize}pt`)
            .text(title));

        if (!cejume)
          d3.selectAll('.tick text')
            .attr("opacity", function(d, i){
              return d/color.domain()[1]  > .5 && !(i%2) ? 0 : 1
            })

        d3.selectAll('.tick text')
          .attr("fill", "white")
          .attr("font-family", "Montserrat")
      }
    
  },

}

export default mixinLegend;
