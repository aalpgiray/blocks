import { BlocksData } from "../types/BlocksData";
import { IPosition } from "../types/IPosition";
import { checkSnap } from "../helpers/checkSnap";

export const useSnaping = (snapPoints: IPosition[]) => {
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
      checkSnap(snapBuffer)(blockCorners.topLeft)
    );
    const topRightSnap = snapPoints.filter(
      checkSnap(snapBuffer)(blockCorners.topRight)
    );
    const bottomLeftSnap = snapPoints.filter(
      checkSnap(snapBuffer)(blockCorners.bottomLeft)
    );
    const bottomRigthSnap = snapPoints.filter(
      checkSnap(snapBuffer)(blockCorners.bottomRigth)
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
