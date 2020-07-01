import { IPosition } from "../types/IPosition";

/**
 * Compares the horizontal distances between two point acording to startPoint
 * @returns true if point1 is closer or equally distant to point2
 */
export const compareHorizontalDistance = (startPoint: IPosition) => (
  point1: IPosition
) => (point2: IPosition) => {
  const dist = Math.abs(startPoint.x - point1.x);
  const closestDist = point2 ? Math.abs(startPoint.x - point2.x) : dist;
  return dist <= closestDist;
};

/**
 * Compares the vertical distances between two point acording to startPoint
 * @returns true if point1 is closer or equally distant to point2
 */
export const compareVerticalDistance = (startPoint: IPosition) => (
  point1: IPosition
) => (point2: IPosition) => {
  const dist = Math.abs(startPoint.y - point1.y);
  const closestDist = point2 ? Math.abs(startPoint.y - point2.y) : dist;
  return dist <= closestDist;
};
