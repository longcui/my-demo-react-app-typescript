// @ts-nocheck
import React, { useEffect } from "react";
import { useRef } from "react";
import * as d3 from "d3";

const LineChart = () => {
  const chartSvgRef = useRef();
  useEffect(() => {
    const a = () =>
      Object.assign(
        d3
          .csvParse(
            `date,close
          2007-04-23,93.24
          2007-04-24,95.35
          2007-04-25,98.84
          2007-04-26,99.92
          2007-04-29,99.8
          2007-05-01,99.47
          2007-05-02,100.39
          2007-05-03,100.4
          2007-05-04,100.81
          2007-05-07,103.92`,
            d3.autoType
          )
          .map(({ date, close }) => ({ date, value: close })),
        { y: "$ Close" }
      );
    if (chartSvgRef.current) {
      const svg = d3.select(chartSvgRef.current);

      //here date is a string, wrong! need to be a Date()
      //   const data = [{ date: "2007-05-22T00:00:00.000Z", value: "33" }],
      const data = a(),
        width = 400,
        height = 500,
        margin = { top: 20, right: 30, bottom: 30, left: 40 };

      const x = d3
        .scaleUtc()
        .domain(d3.extent(data, d => d.date))
        .range([margin.left, width - margin.right]);
      const xAxis = svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(
          d3
            .axisBottom(x)
            .ticks(width / 80)
            .tickSizeOuter(0)
        );

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .nice()
        .range([height - margin.bottom, margin.top]);

        
      const yAxis = g =>
        g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g =>
          g
          .select(".tick:last-of-type text")
          .clone()
          .attr("x", 3)
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .text(data.y)
        );
      
      const line = d3
        .line()
        .defined(d => !isNaN(d.value))
        .x(d => x(d.date))
        .y(d => y(d.value));
          
      svg.append("g").call(yAxis);

      const svgLine = svg
        .append("path")
        .attr("class", "bars")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);

      const brush = d3
        .brushX() // Add the brush feature using the d3.brush function
        .extent([
          [0, 0],
          [width, height]
        ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on("end", updateChart);

      // Add the brushing
      svg
        .append("g")
        .attr("class", "brush")
        .call(brush);

      // A function that set idleTimeOut to null
      let idleTimeout;
      function idled() {
        idleTimeout = null;
      }

      // A function that update the chart for given boundaries
      function updateChart(event) {
        // What are the selected boundaries?
        const extent = event.selection;

        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if (!extent) {
          if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
          x.domain([4, 8]);
        } else {
          x.domain([x.invert(extent[0]), x.invert(extent[1])]);
          svg.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
        }

        // Update axis and line position
        xAxis
          .transition()
          .duration(1000)
          .call(d3.axisBottom(x));
        svgLine
          .transition()
          .duration(1000)
          .attr(
            "d",
            d3
              .line()
              .x(function(d) {
                return x(d.date);
              })
              .y(function(d) {
                return y(d.value);
              })
          );
      }

        const extent = [
          [margin.left, margin.top],
          [width - margin.right, height - margin.top]
        ];

        svg.call(
          d3
            .zoom()
            .scaleExtent([1, 8])
            .translateExtent(extent)
            .extent(extent)
            .on("zoom", zoomed)
        );

        function zoomed(event) {
          x.range(
            [margin.left, width - margin.right].map(d =>
              event.transform.applyX(d)
            )
          );
          svgLine
            .attr("x", d => x(d.name));
            // .attr("width", x.bandwidth());
          // svg.selectAll(".x-axis").call(xAxis);
        }
    }
  }, []);

  return <svg width={500} height={1400} ref={chartSvgRef}></svg>;
};

export { LineChart };
