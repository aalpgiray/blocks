import { useMemo } from "react";
import { BlocksData } from "../types/BlocksData";
import { IValue } from "../types/IValue";

export const useDataToSnapPointsConverter = (
  scale: (value: IValue) => number,
  data: BlocksData[]
) => {
  const corners = useMemo(
    () =>
      data.flatMap((d) => [
        { x: scale(d.x), y: scale(d.y), id: d.value },
        { x: scale(d.x + d.width), y: scale(d.y), id: d.value },
        { x: scale(d.x), y: scale(d.y + d.height), id: d.value },
        { x: scale(d.x + d.width), y: scale(d.y + d.height), id: d.value },
      ]),
    [data, scale]
  );
  return corners;
};
