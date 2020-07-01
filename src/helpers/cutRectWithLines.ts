import { IPosition } from "../types/IPosition";
import { intersectLineWithLine } from "./intersection";
import { intersectRectWithLine } from "./intersectRectWithLine";
import { isPointInRect } from "./isPointInRect";
import { compareHorizontalDistance, compareVerticalDistance } from "./distance";
import { extractCorners } from "./extractCorners";
import { isEmpty } from "lodash";

export const cutRectWithLines = (rect: [IPosition, IPosition]) => (
  cutLines: [IPosition, IPosition][]
) => {
  const rectCorners = extractCorners(rect);

  const rectIntersections = cutLines.flatMap(intersectRectWithLine(rect));

  if (isEmpty(rectIntersections)) {
    return [];
  }

  const lineCrosingsWithinRect = cutLines
    .flatMap((line) => cutLines.map(intersectLineWithLine(line)))
    .filter((line) => line && isPointInRect(rect)(line)) as IPosition[];

  const allCorners: IPosition[] = [
    ...rectCorners,
    ...rectIntersections,
    ...lineCrosingsWithinRect,
  ];

  return createRectWithPoints(rect[0])(allCorners);
};

export const createRectWithPoints = (startPoint: IPosition) => (
  otherPositions: IPosition[]
) => {
  const rects: [IPosition, IPosition][] = [];

  const firstPointOnTheRightSideThatSharesTheSameY = findFirstPointOnTheRightSideThatSharesTheSameY(
    startPoint
  )(otherPositions);

  if (firstPointOnTheRightSideThatSharesTheSameY !== null) {
    const firstPointOnUnderneathThatSharesTheSameX = findFirstPointOnUnderneathThatSharesTheSameX(
      firstPointOnTheRightSideThatSharesTheSameY
    )(otherPositions);

    if (firstPointOnUnderneathThatSharesTheSameX !== null) {
      rects.push([startPoint, firstPointOnUnderneathThatSharesTheSameX]);
    }

    createRectWithPoints(firstPointOnTheRightSideThatSharesTheSameY)(
      otherPositions
    ).forEach((r) => rects.push(r));
  }

  return rects;
};

export const findFirstPointOnTheRightSideThatSharesTheSameY = (
  startPoint: IPosition
) => (otherPositions: IPosition[]): IPosition | null => {
  let closest: IPosition | null = null;

  otherPositions.forEach((p) => {
    if (p.y === startPoint.y) {
      if (
        isPointIsOnTheRightSide(startPoint)(p) &&
        (closest === null || compareHorizontalDistance(startPoint)(p)(closest))
      ) {
        closest = p;
      }
    }
  });

  return closest;
};

export const findFirstPointOnUnderneathThatSharesTheSameX = (
  startPoint: IPosition
) => (otherPositions: IPosition[]): IPosition | null => {
  let closest: IPosition | null = null;

  otherPositions.forEach((p) => {
    if (p.x === startPoint.x) {
      if (
        isPointIsUnderneath(startPoint)(p) &&
        (closest === null || compareVerticalDistance(startPoint)(p)(closest))
      ) {
        closest = p;
      }
    }
  });

  return closest;
};

export const isPointIsOnTheRightSide = (startPoint: IPosition) => (
  point: IPosition
) => {
  return startPoint.x < point.x;
};

export const isPointIsUnderneath = (startPoint: IPosition) => (
  point: IPosition
) => {
  return startPoint.y < point.y;
};
