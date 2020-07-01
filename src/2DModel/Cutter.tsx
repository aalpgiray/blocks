import React, { FC, useMemo, useState, useEffect, useCallback } from "react";
import { intersectLineWithLine } from "../helpers/intersection";
import { CutterBlade } from "./CutterBlade";
import { extractEdges } from "../helpers/extractEdges";
import { cutRectWithLines } from "../helpers/cutRectWithLines";
import { PositionTuple } from "../types/PositionTuple";

export interface CutterPositions {
  verticalCutters: number[];
  horizontalCutters: number[];
}

export interface CutterProps {
  bounds: PositionTuple;
  rects: PositionTuple[];
  cutters: CutterPositions;
  onCuttersChange: (cutters: CutterPositions) => void;
}

export const Cutter: FC<CutterProps> = ({
  bounds,
  rects,
  cutters: { horizontalCutters, verticalCutters },
  onCuttersChange,
}) => {
  const verticalLines = useMemo(() => {
    return verticalCutters.map<PositionTuple>((position, index) => [
      {
        y: bounds[0].y,
        x: position,
      },
      {
        y: bounds[1].y,
        x: position,
      },
    ]);
  }, [bounds, verticalCutters]);

  const horizontalLines = useMemo(() => {
    return horizontalCutters.map<PositionTuple>((position, index) => [
      {
        y: position,
        x: bounds[0].x,
      },
      {
        y: position,
        x: bounds[1].x,
      },
    ]);
  }, [bounds, horizontalCutters]);

  const cutLines = useMemo(() => [...horizontalLines, ...verticalLines], [
    horizontalLines,
    verticalLines,
  ]);

  const rectLines = useMemo(() => rects.flatMap<PositionTuple>(extractEdges), [
    rects,
  ]);

  const intersections = useMemo(() => {
    return cutLines.flatMap((cutLine) => {
      const intersector = intersectLineWithLine(cutLine);

      return cutLines
        .concat(rectLines)
        .map((lineToIntersectWith) => intersector(lineToIntersectWith))
        .filter((f) => f);
    });
  }, [cutLines, rectLines]);

  const [boxes, setBoxes] = useState<PositionTuple[]>([]);

  useEffect(() => {
    const cutHandler = () => {
      const _boxes = rects.flatMap((r) => cutRectWithLines(r)(cutLines));

      onCuttersChange({
        horizontalCutters: [],
        verticalCutters: [],
      });
      setBoxes(_boxes);
    };
    document.addEventListener("cut", cutHandler);
    return () => {
      document.removeEventListener("cut", cutHandler);
    };
  }, [cutLines, onCuttersChange, rects]);

  const handleCutterBladeMove = useCallback(
    (id: number, pos: PositionTuple) => {
      const _cutLines = cutLines.map((cutLine, index) => {
        if (id === index) {
          return pos;
        }

        return cutLine;
      });

      onCuttersChange({
        horizontalCutters: _cutLines
          .filter((f) => f[0].y === f[1].y)
          .map((f) => f[0].y),
        verticalCutters: _cutLines
          .filter((f) => f[0].x === f[1].x)
          .map((f) => f[0].x),
      });
    },
    [cutLines, onCuttersChange]
  );

  return (
    <>
      <g>
        {cutLines.map((position, index) => (
          <CutterBlade
            id={index}
            onPositionChange={handleCutterBladeMove}
            position={position}
          />
        ))}
      </g>
      <g>
        {intersections.map((intersection) => (
          <>
            <circle
              cx={intersection?.x}
              cy={intersection?.y}
              r={2}
              stroke="none"
              fill="white"
            />
            <circle
              cx={intersection?.x}
              cy={intersection?.y}
              r={4}
              stroke="white"
              fill="none"
            />
          </>
        ))}
      </g>
      <g>
        {boxes.map((b) => (
          <rect
            fill="#B8DEE690"
            stroke="white"
            width={b[1].x - b[0].x}
            height={b[1].y - b[0].y}
            x={b[0].x}
            y={b[0].y}
          />
        ))}
      </g>
    </>
  );
};
