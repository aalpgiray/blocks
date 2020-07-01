import { IPosition } from "../types/IPosition";
import { extractEdges } from "./extractEdges";
import { intersectLineWithLine } from "./intersection";

export const intersectRectWithLine = (rect: [IPosition, IPosition]) => (
  line: [IPosition, IPosition]
) => {
  const rectEdges = extractEdges(rect);

  const intersections = rectEdges
    .flatMap(intersectLineWithLine(line))
    .filter((f) => f) as IPosition[];

  return intersections;
};
