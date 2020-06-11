import React, { FC, useRef, useEffect, useCallback, useMemo } from "react";
import {
  select,
  zoom,
  zoomTransform,
  event,
  drag,
  scaleLinear,
  zoomIdentity,
  ZoomTransform,
  ScaleLinear,
  max,
  min,
} from "d3";

export interface BlocksData {
  x: number;
  y: number;
  width: number;
  height: number;
  value: string;
}

export interface BlocksProps {
  onDataChange: (data: BlocksData[]) => void;
  data: BlocksData[];
  dataWidth: number;
  dataHeigh: number;
}

export const Blocks: FC<BlocksProps> = ({
  data,
  dataHeigh,
  dataWidth,
  onDataChange,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const scale = useCallback(
    (value: number | { valueOf(): number }) => {
      return scaler(1920, dataWidth)(value);
    },
    [dataWidth]
  );

  const revertScale = useCallback(
    (value: number | { valueOf(): number }) => {
      return reverter(1920, dataWidth)(value);
    },
    [dataWidth]
  );

  const boundScale = useMemo(() => {
    return min([1920 / scale(dataWidth), 1009 / scale(dataHeigh)]) ?? 1;
  }, [dataWidth, dataHeigh]);

  useEffect(() => {
    const zooming = zoom<SVGSVGElement, any>().on("zoom", function () {
      select(ref.current).selectAll("g").attr("transform", event.transform);
    }) as any;

    const svg = select(ref.current)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .call(zooming)
      .call(
        zooming.transform,
        zoomIdentity
          .translate(
            1920 / 2 - scale(dataWidth / 2) * boundScale,
            1009 / 2 - scale(dataHeigh / 2) * boundScale
          )
          .scale(boundScale)
      )
      .append("g")
      .attr(
        "transform",
        `translate(${1920 / 2 - scale(dataWidth / 2) * boundScale},${
          1009 / 2 - scale(dataHeigh / 2) * boundScale
        }) scale(${boundScale})`
      );

    return () => {
      svg.remove();
    };
  }, []);

  useEffect(() => {
    drawBlocks();
    // drawText();
    enableDrag();
    return () => {
      select(ref.current).selectAll("rect").remove();
    };
  }, [data]);

  const drawText = useCallback(() => {
    const fontSize = 12;
    const padding = 2;

    const svg = select(ref.current).selectAll("g");

    const nodes = svg.selectAll("g").data(data);

    nodes
      .enter()
      .append("text")
      .attr("width", (d) => scale(d.width))
      .attr("height", (d) => scale(d.height))
      .attr("x", (d) => scale(d.x) + padding)
      .attr("y", (d) => scale(d.y) + padding + fontSize)
      .style("font-size", fontSize)
      .text((d) => d.value.replace(/.+(B.+)_.+/g, "$1"));

    nodes.exit().remove();
  }, []);

  const corners = useMemo(
    () =>
      data.flatMap((d) => [
        { x: scale(d.x), y: scale(d.y) },
        { x: scale(d.x + d.width), y: scale(d.y) },
        { x: scale(d.x), y: scale(d.y + d.height) },
        { x: scale(d.x + d.width), y: scale(d.y + d.height) },
      ]),
    [data]
  );

  const enableDrag = useCallback(() => {
    const resolution = 0.001;
    const snapBuffer = 4;

    const dragHandler = drag()
      .subject(function () {
        var t = select(this);
        return { x: t.attr("x"), y: t.attr("y") };
      })
      .on("end", function () {
        select(this).style("fill", "#B8DEE690");

        const svg = select(ref.current).selectAll("g");

        svg.selectAll("circle").remove();

        onDataChange(svg.selectAll<SVGGElement, BlocksData>("rect").data());
      })
      .on("drag", function () {
        let gridX = round(event.x, scale(resolution)),
          gridY = round(event.y, scale(resolution));

        const selectedBlock = select(this);
        const selectedBlockData = selectedBlock.data()[0] as BlocksData;

        const blockCorners = {
          topLeft: {
            x: gridX,
            y: gridY,
          },
          topRight: {
            x: gridX + scale(selectedBlockData.width),
            y: gridY,
          },
          bottomLeft: {
            x: gridX,
            y: gridY + scale(selectedBlockData.height),
          },
          bottomRigth: {
            x: gridX + scale(selectedBlockData.width),
            y: gridY + scale(selectedBlockData.height),
          },
        };

        const topLeftSnap = corners.filter(
          (c) =>
            Math.abs(c.x - blockCorners.topLeft.x) < snapBuffer &&
            Math.abs(c.y - blockCorners.topLeft.y) < snapBuffer
        );

        const topRightSnap = corners.filter(
          (c) =>
            Math.abs(c.x - blockCorners.topRight.x) < snapBuffer &&
            Math.abs(c.y - blockCorners.topRight.y) < snapBuffer
        );

        const bottomLeftSnap = corners.filter(
          (c) =>
            Math.abs(c.x - blockCorners.bottomLeft.x) < snapBuffer &&
            Math.abs(c.y - blockCorners.bottomLeft.y) < snapBuffer
        );

        const bottomRigthSnap = corners.filter(
          (c) =>
            Math.abs(c.x - blockCorners.bottomRigth.x) < snapBuffer &&
            Math.abs(c.y - blockCorners.bottomRigth.y) < snapBuffer
        );

        const snapCircles = [
          ...topLeftSnap,
          ...topRightSnap,
          ...bottomLeftSnap,
          ...bottomRigthSnap,
        ];

        const snaps = [
          ...topLeftSnap,
          ...topRightSnap.map((snap) => ({
            x: snap.x - scale(selectedBlockData.width),
            y: snap.y,
          })),
          ...bottomLeftSnap.map((snap) => ({
            x: snap.x,
            y: snap.y - scale(selectedBlockData.height),
          })),
          ...bottomRigthSnap.map((snap) => ({
            x: snap.x - scale(selectedBlockData.width),
            y: snap.y - scale(selectedBlockData.height),
          })),
        ];

        const svg = select(ref.current).selectAll("g");

        svg.selectAll("circle").remove();

        const nodes = svg.selectAll("g").data(snapCircles.slice(0, 1));

        nodes
          .enter()
          .append("circle")
          .attr("cx", (d) => d.x)
          .attr("cy", (d) => d.y)
          .attr("r", scale(0.035))
          .style("fill", "#01579b");

        if (snaps[0]) {
          gridX = snaps[0].x;
          gridY = snaps[0].y;
        }

        selectedBlock
          .data([
            {
              ...selectedBlockData,
              x: revertScale(gridX),
              y: revertScale(gridY),
            },
          ])
          .attr("x", (d) => scale(d.x))
          .attr("y", (d) => scale(d.y))

          .style("fill", "#B8DE00");
      });

    function round(p: number, n: number) {
      return p % n < n / 2 ? p - (p % n) : p + n - (p % n);
    }

    dragHandler(select(ref.current).selectAll("rect"));
  }, [data]);

  const drawBlocks = useCallback(() => {
    const svg = select(ref.current).selectAll("g");

    const nodes = svg.selectAll("g").data(data);

    const blocks = nodes
      .enter()
      .append("rect")
      .attr("width", (d) => scale(d.width))
      .attr("height", (d) => scale(d.height))
      .attr("x", (d) => scale(d.x))
      .attr("y", (d) => scale(d.y))
      .attr("wrap", "wrap")
      .style("fill", "#B8DEE690")
      .style("stroke", "#FFFFFF");

    nodes.exit().remove();
  }, [data, dataHeigh, dataWidth]);

  return <div ref={ref} style={{ height: "100vh", width: "100vw" }}></div>;
};

const scaler = (width: number, dataWidth: number) =>
  scaleLinear().domain([0, dataWidth]).range([0, width]);

const reverter = (width: number, dataWidth: number) =>
  scaleLinear().domain([0, width]).range([0, dataWidth]);
