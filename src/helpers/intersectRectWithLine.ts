import { IPosition } from "../types/IPosition";
import { extractEdges } from "./extractEdges";
import { intersectLineWithLine } from "./intersection";
import { PositionTuple } from "../types/PositionTuple";

export const intersectRectWithLine = (rect: PositionTuple) => (
  line: PositionTuple
) => {
  const rectEdges = extractEdges(rect);

  const intersections = rectEdges
    .flatMap(intersectLineWithLine(line))
    .filter((f) => f) as IPosition[];

  return intersections;
};
