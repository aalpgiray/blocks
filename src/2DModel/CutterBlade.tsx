import React, {
  FC,
  useRef,
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
} from "react";
import { round } from "../helpers/round";
import { select, event, drag } from "d3";
import { PositionTuple } from "../types/PositionTuple";

export interface CutterBladeProps {
  id: number;
  position: PositionTuple;
  onPositionChange: (id: number, position: PositionTuple) => void;
}

export const CutterBlade: FC<CutterBladeProps> = ({
  id,
  position: [startPosition, endPosition],
  onPositionChange,
}) => {
  const cutterBladeRef = useRef(null);

  const [position, setPosition] = useState<PositionTuple>([
    startPosition,
    endPosition,
  ]);

  const positionRef = useRef<PositionTuple>([startPosition, endPosition]);

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setPosition([startPosition, endPosition]);
  }, [startPosition, endPosition]);

  const onDragging = useCallback(() => {
    const resolution = 1;

    let gridX = round(event.x, resolution),
      gridY = round(event.y, resolution);

    if (startPosition.x === endPosition.x) {
      setPosition([
        { ...startPosition, x: gridX },
        { ...endPosition, x: gridX },
      ]);
      positionRef.current = [
        { ...startPosition, x: gridX },
        { ...endPosition, x: gridX },
      ];
    } else {
      setPosition([
        { ...startPosition, y: gridY },
        { ...endPosition, y: gridY },
      ]);
      positionRef.current = [
        { ...startPosition, y: gridY },
        { ...endPosition, y: gridY },
      ];
    }
  }, [startPosition, endPosition]);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    onPositionChange(id, positionRef.current);
  }, [id, onPositionChange, positionRef]);

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const block = select(cutterBladeRef.current);
    const dragHandler = drag()
      .subject(function () {
        return { x: position[0].x, y: position[0].y };
      })
      .on("start", onDragStart)
      .on("end", onDragEnd)
      .on("drag", onDragging);
    dragHandler(block as any);
  }, [onDragEnd, onDragStart, onDragging, position]);

  const handlePositionInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (position[0].x === position[1].x) {
        onPositionChange(id, [
          { ...position[0], x: value },
          {
            ...position[1],
            x: value,
          },
        ]);
      } else {
        onPositionChange(id, [
          { ...position[0], y: value },
          {
            ...position[1],
            y: value,
          },
        ]);
      }
    },
    [id, onPositionChange, position]
  );

  return (
    <g>
      <line
        ref={cutterBladeRef}
        x1={position[0].x}
        y1={position[0].y}
        x2={position[1].x}
        y2={position[1].y}
        strokeWidth={6}
        cursor={position[0].x === position[1].x ? "col-resize" : "row-resize"}
        stroke={isDragging ? "#B0D006" : "#B8D006"}
      />
      <foreignObject
        x={position[0].x - (position[0].x === position[1].x ? 20 : -4)}
        y={position[0].y - (position[0].x === position[1].x ? -4 : 11.5)}
        width={50}
        height={50}
      >
        <div
          style={{
            fontSize: "12px",
            height: "100%",
            margin: "2px",
          }}
        >
          <input
            style={{
              textAlign: "center",
              width: "30px",
              background: "#282c34",
              color: "white",
              border: "1px dashed white",
            }}
            onChange={handlePositionInputChange}
            value={
              position[0].x === position[1].x ? position[0].x : position[0].y
            }
          />
        </div>
      </foreignObject>
    </g>
  );
};
