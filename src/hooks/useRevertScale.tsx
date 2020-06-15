import { useCallback } from "react";
import { scaleLinear } from "d3";
import { IValue } from "../types/IValue";
export function useRevertScale(
  bound: {
    width: number;
    height: number;
  },
  dataWidth: number
) {
  return useCallback(
    (value: IValue) => {
      return scaleLinear().domain([0, bound.width]).range([0, dataWidth])(
        value
      );
    },
    [bound.width, dataWidth]
  );
}
