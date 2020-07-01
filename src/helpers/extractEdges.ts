import { PositionTuple } from "../types/PositionTuple";
export const extractEdges = (rect: PositionTuple): PositionTuple[] => [
  [rect[0], { x: rect[1].x, y: rect[0].y }],
  [{ x: rect[1].x, y: rect[0].y }, rect[1]],
  [rect[1], { x: rect[0].x, y: rect[1].y }],
  [{ x: rect[0].x, y: rect[1].y }, rect[0]],
];
