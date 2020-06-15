import { IPosition } from "../types/IPosition";
export const checkSnap = (buffer: number) => (blockCorner: IPosition) => (
  snapPoint: IPosition
) =>
  Math.abs(snapPoint.x - blockCorner.x) < buffer &&
  Math.abs(snapPoint.y - blockCorner.y) < buffer;
