import { IPosition } from "../types/IPosition";
export const extractEdges = (
  rect: [IPosition, IPosition]
): [
  [
    IPosition,
    {
      x: number;
      y: number;
    }
  ],
  [
    {
      x: number;
      y: number;
    },
    IPosition
  ],
  [
    IPosition,
    {
      x: number;
      y: number;
    }
  ],
  [
    {
      x: number;
      y: number;
    },
    IPosition
  ]
] => [
  [rect[0], { x: rect[1].x, y: rect[0].y }],
  [{ x: rect[1].x, y: rect[0].y }, rect[1]],
  [rect[1], { x: rect[0].x, y: rect[1].y }],
  [{ x: rect[0].x, y: rect[1].y }, rect[0]],
];
