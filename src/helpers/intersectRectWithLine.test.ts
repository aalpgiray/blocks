import { intersectRectWithLine } from "./intersectRectWithLine";
import { IPosition } from "../types/IPosition";

describe("intersectRectWithLine", () => {
  test("should return point array", () => {
    expect(
      intersectRectWithLine([
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ])([
        { x: 10, y: 10 },
        { x: 10, y: 20 },
      ])
    ).toEqual([]);
  });

  test("should return two point when a line cross over it", () => {
    const expected = [
      { x: 5, y: 0 },
      { x: 5, y: 10 },
    ];

    const result = intersectRectWithLine([
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ])([
      { x: 5, y: 0 },
      { x: 5, y: 10 },
    ]);

    console.log(result);

    expect(result).toEqual(expected);
  });

  test("should return a point when a line gets in but not out", () => {
    const expected = [{ x: 5, y: 0 }];

    const result = intersectRectWithLine([
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ])([
      { x: 5, y: 0 },
      { x: 5, y: 5 },
    ]);

    console.log(result);

    expect(result).toEqual(expected);
  });

  test("should return zero points when a line is not crossing over", () => {
    const expected: IPosition[] = [];

    const result = intersectRectWithLine([
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ])([
      { x: 5, y: 11 },
      { x: 5, y: 20 },
    ]);

    console.log(result);

    expect(result).toEqual(expected);
  });
});
