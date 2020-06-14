import React, {
  FC,
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { zoom, select, zoomIdentity, scaleLinear, min, event, drag } from "d3";

export interface BlocksData {
  x: number;
  y: number;
  width: number;
  height: number;
  value: string;
}

export interface BetterBlocksProps {
  onDataChange: (data: BlocksData[]) => void;
  data: BlocksData[];
  dataWidth: number;
  dataHeigh: number;
}

export const BetterBlocks: FC<BetterBlocksProps> = ({
  data,
  dataHeigh,
  dataWidth,
  onDataChange,
}) => {
  const svgRef = useRef(null);
  const gRef = useRef(null);

  const { bound, ref: divRef, node: div } = useClientBounds();

  const scale = useScale(bound, dataWidth);
  const revertScale = useRevertScale(bound, dataWidth);
  const corners = useCorners(scale, data);

  const { transform, setTransform } = useTransform(
    bound,
    scale,
    dataWidth,
    dataHeigh
  );

  useZoom(setTransform, svgRef, transform);

  const onPositionChange = useCallback(
    (id: string, { x, y }: IPosition) => {
      onDataChange(
        data.map((d) => {
          if (d.value === id) {
            return { ...d, x: revertScale(x), y: revertScale(y) };
          }

          return d;
        })
      );
    },
    [data, onDataChange, revertScale]
  );

  return (
    <div ref={divRef} style={{ height: "100vh", width: "100vw" }}>
      <svg ref={svgRef} width="100%" height="100%">
        <g
          transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}
          ref={gRef}
        >
          {data.map((d) => (
            <Block
              snapPoints={corners}
              onPositionChange={onPositionChange}
              text={d.value.replace(/.+(B.+)_.+/g, "$1")}
              key={d.value}
              id={d.value}
              x={scale(d.x)}
              y={scale(d.y)}
              width={scale(d.width)}
              height={scale(d.height)}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

export interface IPosition {
  x: number;
  y: number;
}

export interface BlockProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  onPositionChange: (id: string, position: IPosition) => void;
  snapPoints?: IPosition[];
}

export const Block: FC<BlockProps> = ({
  x,
  y,
  height,
  text,
  width,
  id,
  snapPoints,
  onPositionChange,
}) => {
  const blockRef = useRef(null);

  const [position, setPosition] = useState<IPosition>({ x, y });
  const [isDragging, setIsDragging] = useState(false);
  const [snapedAt, setSnapedAt] = useState<IPosition[]>([]);
  const checkSnap = useSnaping(snapPoints ?? []);

  useEffect(() => {
    setPosition({ x, y });
  }, [x, y]);

  const onDragging = useCallback(() => {
    const resolution = 1;

    let gridX = round(event.x, resolution),
      gridY = round(event.y, resolution);

    const { snapPositions, snapPoints } = checkSnap({
      height,
      width,
      x: gridX,
      y: gridY,
    });

    setSnapedAt(snapPoints.slice(0, 1));

    onPositionChange(id, {
      x: snapPositions.length > 0 ? snapPositions[0].x : gridX,
      y: snapPositions.length > 0 ? snapPositions[0].y : gridY,
    });
  }, [checkSnap, height, id, onPositionChange, width]);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    setSnapedAt([]);
  }, []);

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const block = select(blockRef.current);

    const dragHandler = drag()
      .subject(function () {
        return { x: position.x, y: position.y };
      })
      .on("start", onDragStart)
      .on("end", onDragEnd)
      .on("drag", onDragging);

    dragHandler(block as any);
  }, [onDragEnd, onDragStart, onDragging, position.x, position.y]);

  return (
    <g ref={blockRef}>
      <rect
        fill={isDragging ? "#B8D006" : "#B8DEE690"}
        stroke="white"
        width={width}
        height={height}
        x={position.x}
        y={position.y}
      />
      {snapedAt.map((snap) => (
        <circle
          fill="white"
          key="snapCorner"
          cx={snap.x}
          cy={snap.y}
          r={5}
        ></circle>
      ))}
      <foreignObject
        x={position.x}
        y={position.y}
        width={width}
        height={height}
      >
        <html>
          <div style={{ fontSize: "12px", height: "100%", textIndent: "10px" }}>
            {text}
          </div>
        </html>
      </foreignObject>
    </g>
  );
};

function useZoom(
  setTransform: React.Dispatch<
    React.SetStateAction<{ x: number; y: number; k: number }>
  >,
  svgRef: React.MutableRefObject<null>,
  transform: { x: number; y: number; k: number }
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

function useTransform(
  bound: { width: number; height: number },
  scale: (value: number | { valueOf(): number }) => number,
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

export function useRevertScale(
  bound: { width: number; height: number },
  dataWidth: number
) {
  return useCallback(
    (
      value:
        | number
        | {
            valueOf(): number;
          }
    ) => {
      return scaleLinear().domain([0, bound.width]).range([0, dataWidth])(
        value
      );
    },
    [bound.width, dataWidth]
  );
}

export function useScale(
  bound: { width: number; height: number },
  dataWidth: number
) {
  return useCallback(
    (
      value:
        | number
        | {
            valueOf(): number;
          }
    ) => {
      return scaleLinear().domain([0, dataWidth]).range([0, bound.width])(
        value
      );
    },
    [bound.width, dataWidth]
  );
}

export function useClientBounds() {
  const [bound, setBound] = useState({ width: 0, height: 0 });
  const [node, setNode] = useState<HTMLElement | null>(null);
  const ref = useCallback((_node: HTMLElement | null) => {
    if (_node !== null) {
      setBound({
        height: _node.clientHeight,
        width: _node.clientWidth,
      });
    }
    setNode(_node);
  }, []);

  useEffect(() => {
    function handleResize() {
      setBound({
        height: node?.clientHeight ?? 0,
        width: node?.clientWidth ?? 0,
      });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [node]);

  return { bound, ref, node };
}

function round(p: number, n: number) {
  return p % n < n / 2 ? p - (p % n) : p + n - (p % n);
}

const useCorners = (
  scale: (
    value:
      | number
      | {
          valueOf(): number;
        }
  ) => number,
  data: BlocksData[]
) => {
  const corners = useMemo(
    () =>
      data.flatMap((d) => [
        { x: scale(d.x), y: scale(d.y) },
        { x: scale(d.x + d.width), y: scale(d.y) },
        { x: scale(d.x), y: scale(d.y + d.height) },
        { x: scale(d.x + d.width), y: scale(d.y + d.height) },
      ]),
    [data, scale]
  );

  return corners;
};

const useSnaping = (snapPoints: IPosition[]) => {
  return ({ height, width, x, y }: Omit<BlocksData, "value">) => {
    const snapBuffer = 5;

    const blockCorners = {
      topLeft: {
        x,
        y,
      },
      topRight: {
        x: x + width,
        y: y,
      },
      bottomLeft: {
        x: x,
        y: y + height,
      },
      bottomRigth: {
        x: x + width,
        y: y + height,
      },
    };

    const topLeftSnap = snapPoints.filter(
      (c) =>
        Math.abs(c.x - blockCorners.topLeft.x) < snapBuffer &&
        Math.abs(c.y - blockCorners.topLeft.y) < snapBuffer
    );

    const topRightSnap = snapPoints.filter(
      (c) =>
        Math.abs(c.x - blockCorners.topRight.x) < snapBuffer &&
        Math.abs(c.y - blockCorners.topRight.y) < snapBuffer
    );

    const bottomLeftSnap = snapPoints.filter(
      (c) =>
        Math.abs(c.x - blockCorners.bottomLeft.x) < snapBuffer &&
        Math.abs(c.y - blockCorners.bottomLeft.y) < snapBuffer
    );

    const bottomRigthSnap = snapPoints.filter(
      (c) =>
        Math.abs(c.x - blockCorners.bottomRigth.x) < snapBuffer &&
        Math.abs(c.y - blockCorners.bottomRigth.y) < snapBuffer
    );

    const snapCircles = [
      ...topLeftSnap,
      ...topRightSnap,
      ...bottomLeftSnap,
      ...bottomRigthSnap,
    ];

    const snaps = [
      ...topLeftSnap,
      ...topRightSnap.map((snap) => ({
        x: snap.x - width,
        y: snap.y,
      })),
      ...bottomLeftSnap.map((snap) => ({
        x: snap.x,
        y: snap.y - height,
      })),
      ...bottomRigthSnap.map((snap) => ({
        x: snap.x - width,
        y: snap.y - height,
      })),
    ];

    return {
      snapPoints: snapCircles,
      snapPositions: snaps,
    };
  };
};
