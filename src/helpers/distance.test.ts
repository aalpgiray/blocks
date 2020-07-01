import { compareHorizontalDistance, compareVerticalDistance } from "./distance";
import { IPosition } from "../types/IPosition";

describe("compareHorizontalDistance", () => {
  const startPoint: IPosition = { x: 0, y: 0 };

  test("should return true if point1 is closer then point2", () => {
    expect(
      compareHorizontalDistance(startPoint)({ y: 0, x: 5 })({ y: 0, x: 7 })
    ).toBeTruthy();
  });

  test("should return false if point1 is farther then point2", () => {
    expect(
      compareHorizontalDistance(startPoint)({ y: 0, x: 5 })({ y: 0, x: 4 })
    ).toBeFalsy();
  });

  test("should return true if both plane is negative", () => {
    expect(
      compareHorizontalDistance(startPoint)({ y: 0, x: -4 })({ y: 0, x: -10 })
    ).toBeTruthy();
  });

  test("should return true if point1 is in positive plane and point2 is in negative", () => {
    expect(
      compareHorizontalDistance(startPoint)({ y: 0, x: -4 })({ y: 0, x: -10 })
    ).toBeTruthy();
  });
});

describe("compareVerticalDistance", () => {
  const startPoint: IPosition = { x: 0, y: 0 };

  test("should return true if point1 is closer then point2", () => {
    expect(
      compareVerticalDistance(startPoint)({ x: 0, y: 5 })({ x: 0, y: 7 })
    ).toBeTruthy();
  });

  test("should return false if point1 is farther then point2", () => {
    expect(
      compareVerticalDistance(startPoint)({ x: 0, y: 5 })({ x: 0, y: 4 })
    ).toBeFalsy();
  });

  test("should return true if both plane is negative", () => {
    expect(
      compareVerticalDistance(startPoint)({ x: 0, y: -4 })({ x: 0, y: -10 })
    ).toBeTruthy();
  });

  test("should return true if point1 is in positive plane and point2 is in negative", () => {
    expect(
      compareVerticalDistance(startPoint)({ x: 0, y: -4 })({ x: 0, y: -10 })
    ).toBeTruthy();
  });
});
