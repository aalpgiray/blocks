import React, { FC, useRef, useEffect, useCallback } from "react";
import { select, zoom, event, drag, scaleLinear } from "d3";

export interface BlocksData {
  x: number;
  y: number;
  width: number;
  height: number;
  value: string;
}

export interface BlocksProps {
  data: BlocksData[];
  dataWidth: number;
  dataHeigh: number;
}

export const Blocks: FC<BlocksProps> = ({ data, dataHeigh, dataWidth }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const svg = select(ref.current)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .call(
        zoom<SVGSVGElement, any>().on("zoom", function () {
          svg.attr("transform", event.transform);
        }) as any
      )
      .append("g");

    return () => {
      svg.remove();
    };
  }, []);

  useEffect(() => {
    draw();
  }, [data]);

  const draw = useCallback(() => {
    const svg = select(ref.current).selectAll("g");

    const x = scaler(1000, dataWidth);

    const nodes = svg.selectAll("g").data(data);

    const blocks = nodes
      .enter()
      .append("rect")
      .attr("width", (d) => x(d.width))
      .attr("height", (d) => x(d.height))
      .attr("x", (d) => x(d.x))
      .attr("y", (d) => x(d.y))
      .attr("wrap", "wrap")
      .style("fill", "#B8DEE690")
      .style("stroke", "#FFFFFF");

    const fontSize = 12;
    const padding = 8;

    const texts = nodes
      .enter()
      .append("text")
      .attr("width", (d) => x(d.width))
      .attr("height", (d) => x(d.height))
      .attr("x", (d) => x(d.x) + padding)
      .attr("y", (d) => x(d.y) + padding + fontSize)
      .style("font-size", fontSize)
      .text((d) => d.value.replace(/.+(B.+)_.+/g, "$1"));

    const resolution = 0.001;

    const dragHandler = drag()
      .on("end", function () {
        select(this).style("fill", "#B8DEE690");
      })
      .on("drag", function () {
        const gridX = round(event.x, x(resolution)),
          gridY = round(event.y, x(resolution));

        select(this).attr("x", gridX).attr("y", gridY).style("fill", "#B8DE00");
      });

    function round(p: number, n: number) {
      return p % n < n / 2 ? p - (p % n) : p + n - (p % n);
    }

    dragHandler(svg.selectAll("rect"));

    nodes.exit().remove();
  }, [data, dataHeigh, dataWidth]);

  return <div ref={ref} style={{ height: "100vh", width: "100vw" }}></div>;
};

const scaler = (width: number, dataWidth: number) =>
  scaleLinear().domain([0, dataWidth]).range([0, width]);
