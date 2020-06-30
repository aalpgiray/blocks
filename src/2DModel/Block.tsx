import React, {
  FC,
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { select, event, drag } from "d3";
import { IPosition } from "../types/IPosition";
import { useSnaping } from "../hooks/useSnaping";
import { round } from "../helpers/round";

export interface BlockProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  onPositionChange: (id: string, position: IPosition) => void;
  snapPoints?: (IPosition & { id: string })[];
}

export const Block: FC<BlockProps> = ({
  x,
  y,
  height,
  text,
  width,
  id,
  snapPoints,
  onPositionChange,
}) => {
  const blockRef = useRef(null);

  const position = useRef<IPosition>({ x, y });

  const [isDragging, setIsDragging] = useState(false);

  const [snapedAt, setSnapedAt] = useState<IPosition[]>([]);

  const filteredSnapPoints = useMemo(
    () => snapPoints?.filter((f) => f.id !== id),
    [id, snapPoints]
  );

  const checkSnap = useSnaping(filteredSnapPoints ?? []);

  useEffect(() => {
    position.current = { x, y };
  }, [x, y]);

  const onDragging = useCallback(() => {
    const resolution = 1;

    let gridX = round(event.x, resolution),
      gridY = round(event.y, resolution);

    const { snapPositions, snapPoints } = checkSnap({
      height,
      width,
      x: gridX,
      y: gridY,
    });

    setSnapedAt(snapPoints);

    position.current = {
      x: snapPositions.length > 0 ? snapPositions[0].x : gridX,
      y: snapPositions.length > 0 ? snapPositions[0].y : gridY,
    };
  }, [checkSnap, height, width]);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    setSnapedAt([]);
    onPositionChange(id, {
      x: position.current.x,
      y: position.current.y,
    });
  }, [id, onPositionChange]);

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const block = select(blockRef.current);
    const dragHandler = drag()
      .subject(function () {
        return { x: position.current.x, y: position.current.y };
      })
      .on("start", onDragStart)
      .on("end", onDragEnd)
      .on("drag", onDragging);
    dragHandler(block as any);
  }, [
    onDragEnd,
    onDragStart,
    onDragging,
    position.current.x,
    position.current.y,
  ]);

  return (
    <g ref={blockRef}>
      <rect
        fill={isDragging ? "#B8D006" : "#B8DEE690"}
        stroke="white"
        width={width}
        height={height}
        x={position.current.x}
        y={position.current.y}
      />
      {snapedAt.map((snap) => (
        <circle
          fill="white"
          key="snapCorner"
          cx={snap.x}
          cy={snap.y}
          r={5}
        ></circle>
      ))}
      <foreignObject
        x={position.current.x}
        y={position.current.y}
        width={width}
        height={height}
      >
        <div style={{ fontSize: "12px", height: "100%", textIndent: "10px" }}>
          {text}
        </div>
      </foreignObject>
    </g>
  );
};
