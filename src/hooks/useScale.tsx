import { useCallback } from "react";
import { scaleLinear } from "d3";
import { IValue } from "../types/IValue";
export function useScale(
  bound: {
    width: number;
    height: number;
  },
  dataWidth: number
) {
  return useCallback(
    (value: IValue) => {
      return scaleLinear().domain([0, dataWidth]).range([0, bound.width])(
        value
      );
    },
    [bound.width, dataWidth]
  );
}
