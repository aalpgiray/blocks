import React, { FC, useEffect, useCallback, useMemo, useState } from "react";
import { select, zoom, event, drag, scaleLinear, zoomIdentity, min } from "d3";

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

function useClientBounds() {
  const [bound, setBound] = useState({ width: 0, height: 0 });
  const [node, setNode] = useState<HTMLElement | null>(null);
  const ref = useCallback((_node: HTMLElement | null) => {
    if (_node !== null) {
      setBound({
        height: _node.clientHeight,
        width: _node.clientWidth,
      });
    }
    setNode(_node);
  }, []);

  useEffect(() => {
    function handleResize() {
      setBound({
        height: node?.clientHeight ?? 0,
        width: node?.clientWidth ?? 0,
      });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [node]);

  return { bound, ref, node };
}

export const Blocks: FC<BlocksProps> = ({
  data,
  dataHeigh,
  dataWidth,
  onDataChange,
}) => {
  const { bound, ref, node } = useClientBounds();

  const scale = useCallback(
    (value: number | { valueOf(): number }) => {
      return scaler(bound.width, dataWidth)(value);
    },
    [bound.width, dataWidth]
  );

  const revertScale = useCallback(
    (value: number | { valueOf(): number }) => {
      return reverter(bound.width, dataWidth)(value);
    },
    [bound.width, dataWidth]
  );

  const boundScale = useMemo(() => {
    return (
      min([bound.width / scale(dataWidth), bound.height / scale(dataHeigh)]) ??
      1
    );
  }, [bound.width, bound.height, scale, dataWidth, dataHeigh]);

  const [firstBlockDeviders, setfirstBlockDeviders] = useState<{
    verticalLines: { x1: number; y1: number; x2: number; y2: number }[];
    horizontalLines: { x1: number; y1: number; x2: number; y2: number }[];
  }>({ verticalLines: [], horizontalLines: [] });

  const cut = useCallback(() => {
    const xPositions: number[] = [],
      yPositions: number[] = [];

    data.slice(0, 1).forEach((d) => {
      xPositions.push(scale(d.x));
      yPositions.push(scale(d.y));
    });

    firstBlockDeviders.horizontalLines.forEach((l) => {
      yPositions.push(l.y1);
    });

    firstBlockDeviders.verticalLines.forEach((l) => {
      xPositions.push(l.x1);
    });

    data.slice(0, 1).forEach((d) => {
      xPositions.push(scale(d.x + d.width));
      yPositions.push(scale(d.y + d.height));
    });

    const cells = [];

    for (let xIndex = 0; xIndex < xPositions.length - 1; xIndex++) {
      for (let yIndex = 0; yIndex < yPositions.length; yIndex++) {
        const xI = xPositions[xIndex];
        const xII = xPositions[xIndex + 1];
        const yI = yPositions[yIndex];
        const yII = yPositions[yIndex + 1];

        cells.push({
          x: xI,
          y: yI,
          width: xII - xI,
          height: yII - yI,
        });
      }
    }

    select(node)
      .selectAll("g")
      .selectAll("g")
      .data(cells)
      .enter()
      .insert("rect", ":first-child")
      .attr("class", "cell")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("width", (d) => d.width)
      .attr("height", (d) => d.height)
      .style("fill", "red")
      .style("stroke", "#FFFFFF");

    select(node).selectAll("line").remove();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data,
    firstBlockDeviders.horizontalLines,
    firstBlockDeviders.verticalLines,
  ]);

  useEffect(() => {
    const horizontalLines = data.slice(0, 1).flatMap((d) => {
      const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
      for (let row = 1; row < 5; row++) {
        lines.push({
          x1: scale(d.x),
          y1: scale(d.y + (d.height / 5) * row),
          x2: scale(d.x + d.width),
          y2: scale(d.y + (d.height / 5) * row),
        });
      }

      return lines;
    });

    const verticalLines = data.slice(0, 1).flatMap((d) => {
      const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];

      for (let col = 1; col < 5; col++) {
        lines.push({
          x1: scale(d.x + (d.width / 5) * col),
          y1: scale(d.y),
          x2: scale(d.x + (d.width / 5) * col),
          y2: scale(d.y + d.height),
        });
      }

      return lines;
    });

    setfirstBlockDeviders({
      verticalLines,
      horizontalLines,
    });
  }, [data, scale]);

  const drawText = useCallback(() => {
    const fontSize = 12;
    const padding = 2;

    const svg = select(node).selectAll("g");

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
  }, [data, node, scale]);

  const corners = useMemo(
    () =>
      data.flatMap((d) => [
        { x: scale(d.x), y: scale(d.y) },
        { x: scale(d.x + d.width), y: scale(d.y) },
        { x: scale(d.x), y: scale(d.y + d.height) },
        { x: scale(d.x + d.width), y: scale(d.y + d.height) },
      ]),
    [data, scale]
  );

  const drawLines = useCallback(() => {
    const svg = select(node).selectAll("g");

    const nodes = svg.selectAll("g");

    nodes
      .data(firstBlockDeviders.horizontalLines)
      .enter()
      .append("line")
      .attr("class", "horizontal")
      .attr("x1", (d) => d.x1)
      .attr("y1", (d) => d.y1)
      .attr("x2", (d) => d.x2)
      .attr("y2", (d) => d.y2)
      .attr("stroke", "gray")
      .attr("stroke-width", scale(0.01));

    nodes
      .data(firstBlockDeviders.verticalLines)
      .enter()
      .append("line")
      .attr("class", "vertical")
      .attr("x1", (d) => d.x1)
      .attr("y1", (d) => d.y1)
      .attr("x2", (d) => d.x2)
      .attr("y2", (d) => d.y2)
      .attr("stroke", "gray")
      .attr("stroke-width", scale(0.01));
  }, [
    node,
    firstBlockDeviders.horizontalLines,
    firstBlockDeviders.verticalLines,
    scale,
  ]);

  const enableLineDragHorizontal = useCallback(() => {
    const resolution = 0.001;

    const dragHandler = drag()
      .subject(function () {
        var t = select(this);
        return { x: t.attr("y1"), y: t.attr("y2") };
      })
      .on("end", function () {
        select(this).style("stroke", "#B8DEE690");

        const svg = select(node).selectAll("g");

        setfirstBlockDeviders({
          verticalLines: firstBlockDeviders.verticalLines,
          horizontalLines: svg
            .selectAll<
              SVGLineElement,
              {
                x1: number;
                y1: number;
                x2: number;
                y2: number;
              }
            >("line.horizontal")
            .data(),
        });
      })
      .on("drag", function () {
        let gridY = round(event.y, scale(resolution));
        const data = select(this).data()[0] as any;

        select(this)
          .data([
            {
              x1: data.x1,
              y1: gridY,
              x2: data.x2,
              y2: gridY,
            },
          ])
          .attr("y1", (d) => d.y1)
          .attr("y2", (d) => d.y2)

          .style("stroke", "#B8DE00");
      });

    function round(p: number, n: number) {
      return p % n < n / 2 ? p - (p % n) : p + n - (p % n);
    }

    dragHandler(select(node).selectAll("line.horizontal"));
  }, [firstBlockDeviders.verticalLines, node, scale]);

  const enableLineDragVertical = useCallback(() => {
    const resolution = 0.001;

    const dragHandler = drag()
      .subject(function () {
        var t = select(this);
        return { x: t.attr("x1"), y: t.attr("x2") };
      })
      .on("end", function () {
        select(this).style("stroke", "#B8DEE690");

        const svg = select(node).selectAll("g");

        setfirstBlockDeviders({
          horizontalLines: firstBlockDeviders.horizontalLines,
          verticalLines: svg
            .selectAll<
              SVGLineElement,
              {
                x1: number;
                y1: number;
                x2: number;
                y2: number;
              }
            >("line.vertical")
            .data(),
        });
      })
      .on("drag", function () {
        let gridX = round(event.x, scale(resolution));
        const data = select(this).data()[0] as any;

        select(this)
          .data([
            {
              x1: gridX,
              y1: data.y1,
              x2: gridX,
              y2: data.y2,
            },
          ])
          .attr("x1", (d) => d.x1)
          .attr("x2", (d) => d.x2)

          .style("stroke", "#B8DE00");
      });

    function round(p: number, n: number) {
      return p % n < n / 2 ? p - (p % n) : p + n - (p % n);
    }

    dragHandler(select(node).selectAll("line.vertical"));
  }, [firstBlockDeviders.horizontalLines, node, scale]);

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

        const svg = select(node).selectAll("g");

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

        const svg = select(node).selectAll("g");

        svg.selectAll("circle").remove();

        const nodes = svg.selectAll("g").data(snapCircles.slice(0, 1));

        nodes
          .enter()
          .append("circle")
          .attr("cx", (d) => d.x)
          .attr("cy", (d) => d.y)
          .attr("r", scale(0.05))
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

    dragHandler(select(node).selectAll("rect"));
  }, [corners, node, onDataChange, revertScale, scale]);

  const drawBlocks = useCallback(() => {
    const svg = select(node).selectAll("g");

    const nodes = svg.selectAll("g").data(data);

    nodes
      .enter()
      .append("rect")
      .attr("class", "block-rect")
      .attr("width", (d) => scale(d.width))
      .attr("height", (d) => scale(d.height))
      .attr("x", (d) => scale(d.x))
      .attr("y", (d) => scale(d.y))
      .attr("wrap", "wrap")
      .style("fill", "#B8DEE690")
      .style("stroke", "#FFFFFF");

    nodes.exit().remove();
  }, [data, node, scale]);

  useEffect(() => {
    const div = node;
    const zooming = zoom<SVGSVGElement, any>().on("zoom", function () {
      select(div).selectAll("g").attr("transform", event.transform);
    }) as any;

    select(div)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .call(zooming)
      .call(
        zooming.transform,
        zoomIdentity
          .translate(
            bound.width / 2 - scale(dataWidth / 2) * boundScale,
            bound.height / 2 - scale(dataHeigh / 2) * boundScale
          )
          .scale(boundScale)
      )
      .append("g")
      .attr(
        "transform",
        `translate(${bound.width / 2 - scale(dataWidth / 2) * boundScale},${
          bound.height / 2 - scale(dataHeigh / 2) * boundScale
        }) scale(${boundScale})`
      );

    return () => {
      select(div).select("svg").remove();
    };
  }, [
    bound.height,
    bound.width,
    boundScale,
    dataHeigh,
    dataWidth,
    node,
    ref,
    scale,
  ]);

  useEffect(() => {
    const div = node;
    drawBlocks();
    enableDrag();
    drawLines();
    enableLineDragHorizontal();
    enableLineDragVertical();
    drawText();
    return () => {
      select(div).selectAll("rect").remove();
      select(div).selectAll("text").remove();
      select(div).selectAll("line").remove();
    };
  }, [
    data,
    drawBlocks,
    drawLines,
    drawText,
    enableDrag,
    enableLineDragHorizontal,
    enableLineDragVertical,
    node,
    ref,
  ]);

  return (
    <div ref={ref} style={{ height: "100vh", width: "100vw" }}>
      <button onClick={cut}>Cut</button>
    </div>
  );
};

const scaler = (width: number, dataWidth: number) =>
  scaleLinear().domain([0, dataWidth]).range([0, width]);

const reverter = (width: number, dataWidth: number) =>
  scaleLinear().domain([0, width]).range([0, dataWidth]);
