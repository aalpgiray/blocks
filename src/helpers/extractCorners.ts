import { IPosition } from "../types/IPosition";
import { PositionTuple } from "../types/PositionTuple";
export const extractCorners = (rect: PositionTuple): IPosition[] => [
  rect[0],
  { x: rect[1].x, y: rect[0].y },
  rect[1],
  { x: rect[0].x, y: rect[1].y },
];
