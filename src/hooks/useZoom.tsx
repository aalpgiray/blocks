import React, { useEffect, useCallback, useMemo } from "react";
import { zoom, select, zoomIdentity, event } from "d3";
export function useZoom(
  setTransform: React.Dispatch<
    React.SetStateAction<{
      x: number;
      y: number;
      k: number;
    }>
  >,
  svgRef: React.MutableRefObject<null>,
  transform: {
    x: number;
    y: number;
    k: number;
  }
) {
  const onZoom = useCallback(() => {
    const transform = event.transform;
    setTransform({
      x: transform.x,
      y: transform.y,
      k: transform.k,
    });
  }, [setTransform]);
  const zooming = useMemo(
    () => zoom<SVGSVGElement, any>().on("zoom", onZoom) as any,
    [onZoom]
  );
  useEffect(() => {
    select(svgRef.current)
      .call(zooming)
      .call(
        zooming.transform,
        zoomIdentity.translate(transform.x, transform.y).scale(transform.k)
      );
  }, [svgRef, transform.k, transform.x, transform.y, zooming]);
}
