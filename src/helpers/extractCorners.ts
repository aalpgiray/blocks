import { IPosition } from "../types/IPosition";
export const extractCorners = (rect: [IPosition, IPosition]): IPosition[] => [
  rect[0],
  { x: rect[1].x, y: rect[0].y },
  rect[1],
  { x: rect[0].x, y: rect[1].y },
];
