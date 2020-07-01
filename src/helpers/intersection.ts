import { IPosition } from "../types/IPosition";
import { eliminateMinusZero } from "./eliminateMinusZero";
import { between } from "./between";

export const intersectLineWithLine = (line1: [IPosition, IPosition]) => (
  line2: [IPosition, IPosition]
) => {
  var x1 = line1[0].x,
    x2 = line1[1].x,
    x3 = line2[0].x,
    x4 = line2[1].x;
  var y1 = line1[0].y,
    y2 = line1[1].y,
    y3 = line2[0].y,
    y4 = line2[1].y;
  var pt_denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  var pt_x_num =
    (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
  var pt_y_num =
    (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);
  if (pt_denom === 0) {
    // parallel
    return;
  } else {
    const x = eliminateMinusZero(pt_x_num / pt_denom);
    const y = eliminateMinusZero(pt_y_num / pt_denom);

    var pt = { x, y };
    if (
      between(pt.x, x1, x2) &&
      between(pt.y, y1, y2) &&
      between(pt.x, x3, x4) &&
      between(pt.y, y3, y4)
    ) {
      return pt;
    } else {
      // not in range
      return;
    }
  }
};
