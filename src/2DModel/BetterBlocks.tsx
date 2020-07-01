import React, { FC, useRef, useCallback, useMemo, useState } from "react";
import { BlocksData } from "../types/BlocksData";
import { IPosition } from "../types/IPosition";
import { Block } from "./Block";
import { useDataToSnapPointsConverter } from "../hooks/useDataToSnapPointsConverter";
import { useScale } from "../hooks/useScale";
import { useRevertScale } from "../hooks/useRevertScale";
import { useTransform } from "../hooks/useTransform";
import { useZoom } from "../hooks/useZoom";
import { useClientBounds } from "../hooks/useClientBounds";
import { Cutter, CutterPositions } from "./Cutter";
import { buffer } from "d3";
import { PositionTuple } from "../types/PositionTuple";

export interface BetterBlocksProps {
  onDataChange: (data: BlocksData[]) => void;
  data: BlocksData[];
  dataWidth: number;
  dataHeigh: number;
}

export const BetterBlocks: FC<BetterBlocksProps> = ({
  data,
  dataHeigh,
  dataWidth,
  onDataChange,
}) => {
  const svgRef = useRef(null);
  const gRef = useRef(null);

  const { bound, ref: divRef } = useClientBounds();

  const scale = useScale(bound, dataWidth);
  const revertScale = useRevertScale(bound, dataWidth);
  const corners = useDataToSnapPointsConverter(scale, data);

  const { transform, setTransform } = useTransform(
    bound,
    scale,
    dataWidth,
    dataHeigh
  );

  const boundPositions: PositionTuple = useMemo(() => {
    const topLeftCorner = {
      x: (0 - transform.x) / transform.k,
      y: (0 - transform.y) / transform.k,
    };
    const bottomRightCorner = {
      x: (bound.width - transform.x) / transform.k,
      y: (bound.height - transform.y) / transform.k,
    };

    return [topLeftCorner, bottomRightCorner];
  }, [transform, bound]);

  useZoom(setTransform, svgRef, transform);

  const onPositionChange = useCallback(
    (id: string, { x, y }: IPosition) => {
      onDataChange(
        data.map((d) => {
          if (d.value === id) {
            return { ...d, x: revertScale(x), y: revertScale(y) };
          }

          return d;
        })
      );
    },
    [data, onDataChange, revertScale]
  );

  const blockRects = useMemo(() => {
    return data.map<PositionTuple>((d) => [
      { x: scale(d.x), y: scale(d.y) },
      { x: scale(d.x + d.width), y: scale(d.y + d.height) },
    ]);
  }, [data, scale]);

  const [cutLines, setCutLines] = useState<CutterPositions>({
    verticalCutters: [30, 60, 90],
    horizontalCutters: [30, 130, 230],
  });

  return (
    <div ref={divRef} style={{ height: "100vh", width: "100vw" }}>
      <svg ref={svgRef} width="100%" height="100%">
        <g
          transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}
          ref={gRef}
        >
          {data.map((d, i) => (
            <Block
              snapPoints={corners}
              onPositionChange={onPositionChange}
              text={d.value.replace(/.+(B.+)_.+/g, "$1")}
              key={d.value}
              id={d.value}
              x={scale(d.x)}
              y={scale(d.y)}
              width={scale(d.width)}
              height={scale(d.height)}
            />
          ))}
          <Cutter
            rects={blockRects}
            bounds={boundPositions}
            cutters={cutLines}
            onCuttersChange={setCutLines}
          />
        </g>
      </svg>
    </div>
  );
};
