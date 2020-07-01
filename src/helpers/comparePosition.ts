import { IPosition } from "../types/IPosition";
export const comparePosition = ({ x: x1, y: y1 }: IPosition) => ({
  x: x2,
  y: y2,
}: IPosition) => {
  return x1 === x2 && y1 === y2;
};
