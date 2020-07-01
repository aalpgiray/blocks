import { IPosition } from "../types/IPosition";
import { between } from "./between";
import { PositionTuple } from "../types/PositionTuple";

export const isPointInRect = (rect: PositionTuple) => (point: IPosition) => {
  return (
    between(point.x, rect[0].x, rect[1].x) &&
    between(point.y, rect[0].y, rect[1].y)
  );
};
