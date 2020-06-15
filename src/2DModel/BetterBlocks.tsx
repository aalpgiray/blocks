import React, { FC, useRef, useCallback } from "react";
import { BlocksData } from "../types/BlocksData";
import { IPosition } from "../types/IPosition";
import { Block } from "./Block";
import { useDataToSnapPointsConverter } from "../hooks/useDataToSnapPointsConverter";
import { useScale } from "../hooks/useScale";
import { useRevertScale } from "../hooks/useRevertScale";
import { useTransform } from "../hooks/useTransform";
import { useZoom } from "../hooks/useZoom";
import { useClientBounds } from "../hooks/useClientBounds";

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

  return (
    <div ref={divRef} style={{ height: "100vh", width: "100vw" }}>
      <svg ref={svgRef} width="100%" height="100%">
        <g
          transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}
          ref={gRef}
        >
          {data.map((d) => (
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
        </g>
      </svg>
    </div>
  );
};
