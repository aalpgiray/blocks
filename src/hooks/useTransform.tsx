import { useEffect, useState } from "react";
import { min } from "d3";
export function useTransform(
  bound: {
    width: number;
    height: number;
  },
  scale: (
    value:
      | number
      | {
          valueOf(): number;
        }
  ) => number,
  dataWidth: number,
  dataHeigh: number
) {
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  useEffect(() => {
    const k =
      min([bound.width / scale(dataWidth), bound.height / scale(dataHeigh)]) ??
      1;
    setTransform({
      x: bound.width / 2 - scale(dataWidth / 2) * k,
      y: bound.height / 2 - scale(dataHeigh / 2) * k,
      k,
    });
  }, [bound.height, bound.width, dataHeigh, dataWidth, scale]);
  return { transform, setTransform };
}
