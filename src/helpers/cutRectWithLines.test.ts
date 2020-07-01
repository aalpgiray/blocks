import {
  cutRectWithLines,
  findFirstPointOnTheRightSideThatSharesTheSameY,
  isPointIsOnTheRightSide,
  createRectWithPoints,
  isPointIsUnderneath,
  findFirstPointOnUnderneathThatSharesTheSameX,
} from "./cutRectWithLines";
import { PositionTuple } from "../types/PositionTuple";

describe("cutRectWithLines", function () {
  test("returns empty rect object where is no cutter", () => {
    expect(
      cutRectWithLines([
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ])([])
    ).toEqual([]);
  });

  test("returns two rects when there is only one cutter", () => {
    const rect: PositionTuple = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ];

    const cutters: PositionTuple[] = [
      [
        { x: 5, y: 0 },
        { x: 5, y: 10 },
      ],
    ];

    const result = cutRectWithLines(rect)(cutters);

    expect(result).toEqual([
      [
        { x: 0, y: 0 },
        { x: 5, y: 10 },
      ],
      [
        { x: 5, y: 0 },
        { x: 10, y: 10 },
      ],
    ]);
  });

  test("should return two rect", () => {
    const rect: PositionTuple = [
      { x: 1814.0206185567013, y: 373.8144329896907 },
      { x: 1920, y: 494.639175257732 },
    ];

    const cutLines: PositionTuple[] = [
      [
        { y: 290.7113402061856, x: 1868 },
        { y: 542.9613402061856, x: 1868 },
      ],
    ];

    const result = cutRectWithLines(rect)(cutLines);

    const expected: PositionTuple[] = [
      [
        { x: 1814.021, y: 373.814 },
        { x: 1868, y: 494.639 },
      ],
      [
        { x: 1868, y: 373.814 },
        { x: 1920, y: 494.639 },
      ],
    ];

    expect(result).toEqual(expected);
  });
});

describe("createRectWithPoints", () => {
  test("should return one rectangle", () => {
    const startPoint = { x: 0, y: 0 };

    const points = [
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];

    const result = createRectWithPoints(startPoint)(points)();

    expect(result).toEqual([
      [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ],
    ]);
  });

  test("should return two rectangle", () => {
    const startPoint = { x: 0, y: 0 };

    const points = [
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 0 },
      { x: 20, y: 10 },
    ];

    const result = createRectWithPoints(startPoint)(points)();

    expect(result).toEqual([
      [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ],
      [
        { x: 10, y: 0 },
        { x: 20, y: 10 },
      ],
    ]);
  });
});

describe("isPointIsOnTheRightSide", () => {
  test("should return true when point is on the right", () => {
    expect(
      isPointIsOnTheRightSide({ x: 0, y: 0 })({ x: 1, y: 0 })
    ).toBeTruthy();
  });

  test("should return false when point is on the left", () => {
    expect(
      isPointIsOnTheRightSide({ x: 0, y: 0 })({ x: -1, y: 0 })
    ).toBeFalsy();
  });

  test("should return false when point is the same", () => {
    expect(isPointIsOnTheRightSide({ x: 0, y: 0 })({ x: 0, y: 0 })).toBeFalsy();
  });
});

describe("isPointIsUnderneath", () => {
  test("should return true when point is on the right", () => {
    expect(isPointIsUnderneath({ x: 0, y: 0 })({ x: 0, y: 1 })).toBeTruthy();
  });

  test("should return false when point is on the left", () => {
    expect(isPointIsUnderneath({ x: 0, y: 0 })({ x: 0, y: -1 })).toBeFalsy();
  });

  test("should return false when point is the same", () => {
    expect(isPointIsUnderneath({ x: 0, y: 0 })({ x: 0, y: 0 })).toBeFalsy();
  });
});

describe("findClosestPointThatSharesTheSameY", () => {
  const startPoint = { x: 0, y: 0 };

  test("should first point as it is closest", () => {
    const expected = { x: 10, y: 0 };

    const points = [expected, { x: 1, y: 1 }, { x: 10, y: 1 }, { x: 11, y: 0 }];

    const result = findFirstPointOnTheRightSideThatSharesTheSameY(startPoint)(
      points
    );

    expect(result).toEqual(expected);
  });

  test("should work in negative planes as well", () => {
    const startPoint = { x: -20, y: 0 };

    const expected = { x: -11, y: 0 };

    const points = [
      expected,
      { x: -1, y: -1 },
      { x: -10, y: -1 },
      { x: -10, y: 0 },
    ];

    const result = findFirstPointOnTheRightSideThatSharesTheSameY(startPoint)(
      points
    );

    expect(result).toEqual(expected);
  });

  test("should work in when points are crossing from negative plane to positive", () => {
    const expected = { x: 10, y: 0 };

    const points = [
      expected,
      { x: -1, y: -1 },
      { x: -5, y: 0 },
      { x: 0, y: 0 },
    ];

    const result = findFirstPointOnTheRightSideThatSharesTheSameY(startPoint)(
      points
    );

    expect(result).toEqual(expected);
  });
});

describe("findFirstPointOnUnderneathThatSharesTheSamey", () => {
  const startPoint = { y: 0, x: 0 };

  test("should first point as it is closest", () => {
    const eypected = { y: 10, x: 0 };

    const points = [eypected, { y: 1, x: 1 }, { y: 10, x: 1 }, { y: 11, x: 0 }];

    const result = findFirstPointOnUnderneathThatSharesTheSameX(startPoint)(
      points
    );

    expect(result).toEqual(eypected);
  });

  test("should work in negative planes as well", () => {
    const startPoint = { y: -20, x: 0 };

    const eypected = { y: -11, x: 0 };

    const points = [
      eypected,
      { y: -1, x: -1 },
      { y: -10, x: -1 },
      { y: -10, x: 0 },
    ];

    const result = findFirstPointOnUnderneathThatSharesTheSameX(startPoint)(
      points
    );

    expect(result).toEqual(eypected);
  });

  test("should work in when points are crossing from negative plane to positive", () => {
    const eypected = { y: 10, x: 0 };

    const points = [
      eypected,
      { y: -1, x: -1 },
      { y: -5, x: 0 },
      { y: 0, x: 0 },
    ];

    const result = findFirstPointOnUnderneathThatSharesTheSameX(startPoint)(
      points
    );

    expect(result).toEqual(eypected);
  });
});
